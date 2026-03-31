package com.simtrade.backend.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.simtrade.backend.entity.AccountBalanceEntity;
import com.simtrade.backend.entity.AccountPositionEntity;
import com.simtrade.backend.entity.Order;
import com.simtrade.backend.entity.OrderReservationEntity;
import com.simtrade.backend.entity.OrderSettlementEntity;
import com.simtrade.backend.entity.SettlementEntryEntity;
import com.simtrade.backend.mapper.AccountBalanceMapper;
import com.simtrade.backend.mapper.AccountPositionMapper;
import com.simtrade.backend.mapper.OrderReservationMapper;
import com.simtrade.backend.mapper.OrderSettlementMapper;
import com.simtrade.backend.mapper.SettlementEntryMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
public class AccountLedgerService {

    private static final Logger log = LoggerFactory.getLogger(AccountLedgerService.class);

    private static final BigDecimal INITIAL_CAPITAL = new BigDecimal("1000000.00");
    private static final int TYPE_BUY = 1;
    private static final int TYPE_SELL = 2;

    private final ConcurrentMap<String, AccountState> accountStore = new ConcurrentHashMap<String, AccountState>();
    private final ConcurrentMap<String, ConcurrentMap<String, PositionState>> positionStore = new ConcurrentHashMap<String, ConcurrentMap<String, PositionState>>();
    private final ConcurrentMap<String, OrderReservation> reservationStore = new ConcurrentHashMap<String, OrderReservation>();
    private final ConcurrentMap<String, OrderSettlementState> orderSettlementStore = new ConcurrentHashMap<String, OrderSettlementState>();
    private final List<SettlementEntry> settlements = Collections.synchronizedList(new ArrayList<SettlementEntry>());

    @Autowired(required = false)
    private AccountBalanceMapper accountBalanceMapper;

    @Autowired(required = false)
    private AccountPositionMapper accountPositionMapper;

    @Autowired(required = false)
    private OrderReservationMapper orderReservationMapper;

    @Autowired(required = false)
    private OrderSettlementMapper orderSettlementMapper;

    @Autowired(required = false)
    private SettlementEntryMapper settlementEntryMapper;

    public synchronized void reserveForPendingOrder(Order order, String orderType, BigDecimal estimatedFee) {
        if (order == null || order.getId() == null || !"LIMIT".equalsIgnoreCase(orderType)) {
            return;
        }
        String userId = safeUser(order);
        int quantity = safeInt(order.getQuantity());
        if (quantity <= 0) {
            return;
        }
        AccountState account = ensureAccountState(userId);
        if (safeInt(order.getType()) == TYPE_BUY) {
            BigDecimal price = money(order.getPrice());
            BigDecimal reserveAmount = price.multiply(new BigDecimal(quantity))
                    .add(money(estimatedFee))
                    .setScale(2, RoundingMode.HALF_UP);
            if (account.availableCash.compareTo(reserveAmount) < 0) {
                throw new IllegalArgumentException("Insufficient cash balance for pending buy order.");
            }
            account.availableCash = money(account.availableCash.subtract(reserveAmount));
            account.frozenCash = money(account.frozenCash.add(reserveAmount));
            persistAccountState(userId, account);

            OrderReservation reservation = OrderReservation.buy(userId, order.getStockCode(), quantity, reserveAmount);
            reservationStore.put(order.getId(), reservation);
            persistReservation(order.getId(), reservation);
            return;
        }

        if (safeInt(order.getType()) == TYPE_SELL) {
            PositionState position = ensurePositionState(userId, order.getStockCode());
            if (position.tradableQuantity < quantity) {
                throw new IllegalArgumentException("Insufficient holdings to sell. Available: " + position.tradableQuantity);
            }
            position.tradableQuantity -= quantity;
            position.frozenQuantity += quantity;
            persistPositionState(userId, order.getStockCode(), position);

            OrderReservation reservation = OrderReservation.sell(userId, order.getStockCode(), quantity);
            reservationStore.put(order.getId(), reservation);
            persistReservation(order.getId(), reservation);
        }
    }

    public synchronized void releaseOnOrderCanceled(Order order, String orderType) {
        if (order == null || order.getId() == null || !"LIMIT".equalsIgnoreCase(orderType)) {
            return;
        }
        OrderReservation reservation = loadAndRemoveReservation(order.getId());
        if (reservation == null) {
            return;
        }
        AccountState account = ensureAccountState(reservation.userId);
        if (reservation.type == TYPE_BUY) {
            account.frozenCash = money(account.frozenCash.subtract(reservation.remainingReservedCash));
            account.availableCash = money(account.availableCash.add(reservation.remainingReservedCash));
            persistAccountState(reservation.userId, account);
            return;
        }

        PositionState position = ensurePositionState(reservation.userId, reservation.stockCode);
        int releaseQty = Math.max(0, reservation.remainingQuantity);
        if (releaseQty > 0) {
            position.frozenQuantity = Math.max(0, position.frozenQuantity - releaseQty);
            position.tradableQuantity += releaseQty;
            persistPositionState(reservation.userId, reservation.stockCode, position);
        }
    }

    public synchronized void onOrderMatched(Order order,
                                            String orderType,
                                            int matchedQuantity,
                                            BigDecimal executionPrice,
                                            BigDecimal totalFee,
                                            LocalDateTime tradeTime,
                                            LocalDate settlementDate) {
        if (order == null || matchedQuantity <= 0 || executionPrice == null) {
            return;
        }
        String userId = safeUser(order);
        AccountState account = ensureAccountState(userId);
        PositionState position = ensurePositionState(userId, order.getStockCode());
        BigDecimal matchedAmount = money(executionPrice.multiply(new BigDecimal(matchedQuantity)));
        BigDecimal fee = money(totalFee);
        OrderReservation reservation = findReservation(order.getId());

        if (safeInt(order.getType()) == TYPE_BUY) {
            BigDecimal actualCost = money(matchedAmount.add(fee));
            if (reservation != null && reservation.type == TYPE_BUY && "LIMIT".equalsIgnoreCase(orderType)) {
                BigDecimal releaseCash = reservation.allocateCash(matchedQuantity);
                account.frozenCash = money(account.frozenCash.subtract(releaseCash));
                BigDecimal refund = releaseCash.subtract(actualCost).setScale(2, RoundingMode.HALF_UP);
                if (refund.compareTo(BigDecimal.ZERO) >= 0) {
                    account.availableCash = money(account.availableCash.add(refund));
                } else {
                    account.availableCash = money(account.availableCash.subtract(refund.abs()));
                }
                if (reservation.remainingQuantity <= 0) {
                    reservationStore.remove(order.getId());
                    deleteReservation(order.getId());
                } else {
                    persistReservation(order.getId(), reservation);
                }
            } else {
                if (account.availableCash.compareTo(actualCost) < 0) {
                    throw new IllegalArgumentException("Insufficient cash balance for matched buy order.");
                }
                account.availableCash = money(account.availableCash.subtract(actualCost));
            }
            position.transitQuantity += matchedQuantity;
            position.totalCost = cost(position.totalCost.add(actualCost));
            persistAccountState(userId, account);
            persistPositionState(userId, order.getStockCode(), position);

            registerSettlementEntry(SettlementEntry.buy(order.getId(), userId, order.getStockCode(), matchedQuantity, settlementDate));
            upsertOrderSettlement(order, matchedQuantity, matchedAmount, fee, settlementDate, tradeTime);
            return;
        }

        if (safeInt(order.getType()) == TYPE_SELL) {
            if (reservation != null && reservation.type == TYPE_SELL && "LIMIT".equalsIgnoreCase(orderType)) {
                int releaseQty = reservation.allocateQuantity(matchedQuantity);
                position.frozenQuantity = Math.max(0, position.frozenQuantity - releaseQty);
                if (reservation.remainingQuantity <= 0) {
                    reservationStore.remove(order.getId());
                    deleteReservation(order.getId());
                } else {
                    persistReservation(order.getId(), reservation);
                }
            } else {
                position.tradableQuantity = Math.max(0, position.tradableQuantity - matchedQuantity);
            }

            int totalQtyBefore = position.totalQuantity();
            if (totalQtyBefore > 0) {
                BigDecimal averageCost = position.totalCost
                        .divide(new BigDecimal(totalQtyBefore), 8, RoundingMode.HALF_UP);
                position.totalCost = cost(position.totalCost.subtract(averageCost.multiply(new BigDecimal(matchedQuantity))));
                if (position.totalQuantity() <= 0) {
                    position.totalCost = BigDecimal.ZERO.setScale(4, RoundingMode.HALF_UP);
                }
            }

            BigDecimal netProceeds = money(matchedAmount.subtract(fee));
            account.transitCash = money(account.transitCash.add(netProceeds));
            persistAccountState(userId, account);
            persistPositionState(userId, order.getStockCode(), position);

            registerSettlementEntry(SettlementEntry.sell(order.getId(), userId, order.getStockCode(), netProceeds, settlementDate));
            upsertOrderSettlement(order, matchedQuantity, matchedAmount, fee, settlementDate, tradeTime);
        }
    }

    public synchronized void processSettlements(LocalDate settlementDate) {
        if (settlementDate == null) {
            return;
        }

        if (persistenceEnabled()) {
            for (SettlementEntry entry : loadDueSettlementEntries(settlementDate)) {
                if (entry == null || entry.settlementDate == null || entry.settlementDate.isAfter(settlementDate)) {
                    continue;
                }
                settleEntry(entry);
                markSettlementEntrySettled(entry.id);
            }
            return;
        }

        for (SettlementEntry entry : settlements) {
            if (entry.settled || entry.settlementDate == null || entry.settlementDate.isAfter(settlementDate)) {
                continue;
            }
            settleEntry(entry);
            entry.settled = true;
        }
    }

    public synchronized AccountSnapshot getAccountSnapshot(String userId) {
        AccountState account = ensureAccountState(userId);
        return new AccountSnapshot(
                safeUser(userId),
                money(account.availableCash),
                money(account.frozenCash),
                money(account.transitCash)
        );
    }

    public synchronized PositionSnapshot getPositionSnapshot(String userId, String stockCode) {
        PositionState position = ensurePositionState(userId, stockCode);
        return toSnapshot(stockCode, position);
    }

    public synchronized Map<String, PositionSnapshot> getPositionSnapshots(String userId) {
        String safeUserId = safeUser(userId);
        ensurePositionsLoadedFromDb(safeUserId);
        ConcurrentMap<String, PositionState> positions = positionStore.get(safeUserId);
        if (positions == null || positions.isEmpty()) {
            return Collections.emptyMap();
        }
        Map<String, PositionSnapshot> result = new LinkedHashMap<String, PositionSnapshot>();
        for (Map.Entry<String, PositionState> entry : positions.entrySet()) {
            PositionSnapshot snapshot = toSnapshot(entry.getKey(), entry.getValue());
            if (snapshot.getTotalQuantity() > 0) {
                result.put(entry.getKey(), snapshot);
            }
        }
        return result;
    }

    public synchronized int getTradableQuantity(String userId, String stockCode) {
        return ensurePositionState(userId, stockCode).tradableQuantity;
    }

    public synchronized boolean hasPositionRecord(String userId, String stockCode) {
        String safeUserId = safeUser(userId);
        String safeStockCode = safeStock(stockCode);
        ensurePositionsLoadedFromDb(safeUserId);
        ConcurrentMap<String, PositionState> positions = positionStore.get(safeUserId);
        if (positions != null && positions.containsKey(safeStockCode)) {
            return true;
        }
        if (!persistenceEnabled()) {
            return false;
        }
        try {
            AccountPositionEntity entity = accountPositionMapper.selectOne(
                    new QueryWrapper<AccountPositionEntity>()
                            .eq("user_id", safeUserId)
                            .eq("stock_code", safeStockCode)
                            .last("LIMIT 1")
            );
            if (entity == null) {
                return false;
            }
            putPositionState(safeUserId, safeStockCode, toPositionState(entity));
            return true;
        } catch (Exception ex) {
            log.warn("Load position record from db failed, fallback to in-memory. userId={}, stockCode={}, reason={}",
                    safeUserId, safeStockCode, ex.getMessage());
            return false;
        }
    }

    public synchronized void seedPosition(String userId, String stockCode, int quantity, BigDecimal averageCost) {
        if (quantity <= 0) {
            return;
        }
        PositionState position = ensurePositionState(userId, stockCode);
        position.tradableQuantity = quantity;
        position.totalCost = cost(money(averageCost).multiply(new BigDecimal(quantity)));
        persistPositionState(userId, stockCode, position);
    }

    public synchronized OrderSettlementSnapshot getOrderSettlementSnapshot(String orderId) {
        if (orderId == null || orderId.trim().isEmpty()) {
            return null;
        }
        String safeOrderId = orderId.trim();
        OrderSettlementState state = orderSettlementStore.get(safeOrderId);
        if (state == null) {
            state = loadOrderSettlementStateFromDb(safeOrderId);
            if (state != null) {
                orderSettlementStore.put(safeOrderId, state);
            }
        }
        if (state == null) {
            return null;
        }
        return new OrderSettlementSnapshot(
                state.orderId,
                state.settlementDate,
                state.settled ? "SETTLED" : "PENDING",
                state.matchedQuantity,
                money(state.matchedAmount),
                money(state.totalFee),
                money(state.netCashFlow),
                state.lastMatchedAt
        );
    }

    private PositionSnapshot toSnapshot(String stockCode, PositionState position) {
        int totalQuantity = position.totalQuantity();
        BigDecimal averageCost = BigDecimal.ZERO.setScale(4, RoundingMode.HALF_UP);
        if (totalQuantity > 0) {
            averageCost = position.totalCost.divide(new BigDecimal(totalQuantity), 4, RoundingMode.HALF_UP);
        }
        return new PositionSnapshot(
                stockCode,
                position.tradableQuantity,
                position.frozenQuantity,
                position.transitQuantity,
                totalQuantity,
                averageCost
        );
    }

    private void upsertOrderSettlement(Order order,
                                       int matchedQuantity,
                                       BigDecimal matchedAmount,
                                       BigDecimal fee,
                                       LocalDate settlementDate,
                                       LocalDateTime tradeTime) {
        if (order == null || order.getId() == null) {
            return;
        }
        OrderSettlementState state = orderSettlementStore.computeIfAbsent(order.getId(), key ->
                new OrderSettlementState(order.getId(), order.getUserId(), order.getStockCode(), settlementDate));
        state.userId = safeUser(order.getUserId());
        state.stockCode = safeStock(order.getStockCode());
        state.settlementDate = settlementDate;
        state.lastMatchedAt = tradeTime;
        state.matchedQuantity += Math.max(0, matchedQuantity);
        state.matchedAmount = money(state.matchedAmount.add(money(matchedAmount)));
        state.totalFee = money(state.totalFee.add(money(fee)));
        BigDecimal signedCash = safeInt(order.getType()) == TYPE_BUY
                ? money(matchedAmount.add(fee)).negate()
                : money(matchedAmount.subtract(fee));
        state.netCashFlow = money(state.netCashFlow.add(signedCash));
        state.settled = false;
        persistOrderSettlement(state);
    }

    private AccountState ensureAccountState(String userId) {
        String safeUserId = safeUser(userId);
        AccountState cached = accountStore.get(safeUserId);
        if (cached != null) {
            return cached;
        }

        AccountState loaded = loadAccountStateFromDb(safeUserId);
        if (loaded != null) {
            accountStore.putIfAbsent(safeUserId, loaded);
            return accountStore.get(safeUserId);
        }

        AccountState created = new AccountState(
                INITIAL_CAPITAL,
                BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP),
                BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP)
        );
        accountStore.putIfAbsent(safeUserId, created);
        persistAccountState(safeUserId, accountStore.get(safeUserId));
        return accountStore.get(safeUserId);
    }

    private PositionState ensurePositionState(String userId, String stockCode) {
        String safeUserId = safeUser(userId);
        String safeStockCode = safeStock(stockCode);
        ConcurrentMap<String, PositionState> userPositions = positionStore.computeIfAbsent(
                safeUserId,
                key -> new ConcurrentHashMap<String, PositionState>()
        );

        PositionState cached = userPositions.get(safeStockCode);
        if (cached != null) {
            return cached;
        }

        PositionState loaded = loadPositionStateFromDb(safeUserId, safeStockCode);
        if (loaded != null) {
            userPositions.putIfAbsent(safeStockCode, loaded);
            return userPositions.get(safeStockCode);
        }

        PositionState created = new PositionState();
        userPositions.putIfAbsent(safeStockCode, created);
        persistPositionState(safeUserId, safeStockCode, userPositions.get(safeStockCode));
        return userPositions.get(safeStockCode);
    }

    private void settleEntry(SettlementEntry entry) {
        AccountState account = ensureAccountState(entry.userId);
        PositionState position = ensurePositionState(entry.userId, entry.stockCode);
        if (entry.type == TYPE_BUY) {
            int quantity = Math.max(0, entry.quantity);
            position.transitQuantity = Math.max(0, position.transitQuantity - quantity);
            position.tradableQuantity += quantity;
            persistPositionState(entry.userId, entry.stockCode, position);
        } else {
            BigDecimal cash = money(entry.cashAmount);
            account.transitCash = money(account.transitCash.subtract(cash));
            account.availableCash = money(account.availableCash.add(cash));
            persistAccountState(entry.userId, account);
        }
        if (entry.orderId != null) {
            markOrderSettlementSettled(entry.orderId);
        }
    }

    private void markOrderSettlementSettled(String orderId) {
        if (orderId == null || orderId.trim().isEmpty()) {
            return;
        }
        String safeOrderId = orderId.trim();
        OrderSettlementState inMemory = orderSettlementStore.get(safeOrderId);
        if (inMemory != null) {
            inMemory.settled = true;
            persistOrderSettlement(inMemory);
            return;
        }
        if (!persistenceEnabled()) {
            return;
        }
        try {
            OrderSettlementEntity entity = orderSettlementMapper.selectById(safeOrderId);
            if (entity == null) {
                return;
            }
            entity.setSettlementStatus("SETTLED");
            entity.setUpdatedAt(LocalDateTime.now());
            orderSettlementMapper.updateById(entity);
            orderSettlementStore.put(safeOrderId, toOrderSettlementState(entity));
        } catch (Exception ex) {
            throw new IllegalStateException("Persist order settlement status failed.", ex);
        }
    }

    private OrderReservation findReservation(String orderId) {
        if (orderId == null || orderId.trim().isEmpty()) {
            return null;
        }
        String safeOrderId = orderId.trim();
        OrderReservation reservation = reservationStore.get(safeOrderId);
        if (reservation != null) {
            return reservation;
        }
        if (!persistenceEnabled()) {
            return null;
        }
        try {
            OrderReservationEntity entity = orderReservationMapper.selectById(safeOrderId);
            if (entity == null) {
                return null;
            }
            OrderReservation loaded = toOrderReservation(entity);
            reservationStore.put(safeOrderId, loaded);
            return loaded;
        } catch (Exception ex) {
            log.warn("Load order reservation from db failed, fallback to in-memory. orderId={}, reason={}", safeOrderId, ex.getMessage());
            return null;
        }
    }

    private OrderReservation loadAndRemoveReservation(String orderId) {
        if (orderId == null || orderId.trim().isEmpty()) {
            return null;
        }
        String safeOrderId = orderId.trim();
        OrderReservation inMemory = reservationStore.remove(safeOrderId);
        if (inMemory != null) {
            deleteReservation(safeOrderId);
            return inMemory;
        }
        if (!persistenceEnabled()) {
            return null;
        }
        try {
            OrderReservationEntity entity = orderReservationMapper.selectById(safeOrderId);
            if (entity == null) {
                return null;
            }
            orderReservationMapper.deleteById(safeOrderId);
            return toOrderReservation(entity);
        } catch (Exception ex) {
            throw new IllegalStateException("Release reservation persistence failed.", ex);
        }
    }

    private void ensurePositionsLoadedFromDb(String userId) {
        if (!persistenceEnabled()) {
            return;
        }
        ConcurrentMap<String, PositionState> cached = positionStore.get(userId);
        if (cached != null && !cached.isEmpty()) {
            return;
        }
        try {
            List<AccountPositionEntity> entities = accountPositionMapper.selectList(
                    new QueryWrapper<AccountPositionEntity>().eq("user_id", userId)
            );
            if (entities == null || entities.isEmpty()) {
                return;
            }
            ConcurrentMap<String, PositionState> userPositions = positionStore.computeIfAbsent(
                    userId,
                    key -> new ConcurrentHashMap<String, PositionState>()
            );
            for (AccountPositionEntity entity : entities) {
                userPositions.put(safeStock(entity.getStockCode()), toPositionState(entity));
            }
        } catch (Exception ex) {
            log.warn("Load positions from db failed, fallback to in-memory. userId={}, reason={}", userId, ex.getMessage());
        }
    }

    private void putPositionState(String userId, String stockCode, PositionState state) {
        positionStore
                .computeIfAbsent(userId, key -> new ConcurrentHashMap<String, PositionState>())
                .put(stockCode, state);
    }

    private AccountState loadAccountStateFromDb(String userId) {
        if (!persistenceEnabled()) {
            return null;
        }
        try {
            AccountBalanceEntity entity = accountBalanceMapper.selectById(userId);
            if (entity == null) {
                return null;
            }
            return toAccountState(entity);
        } catch (Exception ex) {
            log.warn("Load account balance from db failed, fallback to in-memory. userId={}, reason={}", userId, ex.getMessage());
            return null;
        }
    }

    private PositionState loadPositionStateFromDb(String userId, String stockCode) {
        if (!persistenceEnabled()) {
            return null;
        }
        try {
            AccountPositionEntity entity = accountPositionMapper.selectOne(
                    new QueryWrapper<AccountPositionEntity>()
                            .eq("user_id", userId)
                            .eq("stock_code", stockCode)
                            .last("LIMIT 1")
            );
            if (entity == null) {
                return null;
            }
            return toPositionState(entity);
        } catch (Exception ex) {
            log.warn("Load account position from db failed, fallback to in-memory. userId={}, stockCode={}, reason={}",
                    userId, stockCode, ex.getMessage());
            return null;
        }
    }

    private List<SettlementEntry> loadDueSettlementEntries(LocalDate settlementDate) {
        if (!persistenceEnabled()) {
            return Collections.emptyList();
        }
        try {
            List<SettlementEntryEntity> entities = settlementEntryMapper.selectList(
                    new QueryWrapper<SettlementEntryEntity>()
                            .eq("settled", 0)
                            .le("settlement_date", settlementDate)
                            .orderByAsc("id")
            );
            List<SettlementEntry> result = new ArrayList<SettlementEntry>();
            if (entities == null) {
                return result;
            }
            for (SettlementEntryEntity entity : entities) {
                result.add(toSettlementEntry(entity));
            }
            return result;
        } catch (Exception ex) {
            throw new IllegalStateException("Load due settlements failed.", ex);
        }
    }

    private void markSettlementEntrySettled(Long id) {
        if (!persistenceEnabled() || id == null) {
            return;
        }
        try {
            SettlementEntryEntity entity = settlementEntryMapper.selectById(id);
            if (entity == null) {
                return;
            }
            entity.setSettled(1);
            entity.setUpdatedAt(LocalDateTime.now());
            settlementEntryMapper.updateById(entity);
        } catch (Exception ex) {
            throw new IllegalStateException("Persist settlement entry status failed.", ex);
        }
    }

    private void registerSettlementEntry(SettlementEntry entry) {
        if (entry == null) {
            return;
        }
        if (persistenceEnabled()) {
            persistSettlementEntry(entry);
            return;
        }
        settlements.add(entry);
    }

    private void persistSettlementEntry(SettlementEntry entry) {
        if (!persistenceEnabled()) {
            return;
        }
        try {
            LocalDateTime now = LocalDateTime.now();
            SettlementEntryEntity entity = new SettlementEntryEntity();
            entity.setOrderId(entry.orderId);
            entity.setUserId(entry.userId);
            entity.setStockCode(entry.stockCode);
            entity.setType(entry.type);
            entity.setQuantity(entry.quantity);
            entity.setCashAmount(money(entry.cashAmount));
            entity.setSettlementDate(entry.settlementDate);
            entity.setSettled(0);
            entity.setCreatedAt(now);
            entity.setUpdatedAt(now);
            settlementEntryMapper.insert(entity);
            entry.id = entity.getId();
        } catch (Exception ex) {
            throw new IllegalStateException("Persist settlement entry failed.", ex);
        }
    }

    private void persistAccountState(String userId, AccountState state) {
        if (!persistenceEnabled() || userId == null || userId.trim().isEmpty() || state == null) {
            return;
        }
        try {
            LocalDateTime now = LocalDateTime.now();
            AccountBalanceEntity entity = accountBalanceMapper.selectById(userId);
            if (entity == null) {
                entity = new AccountBalanceEntity();
                entity.setUserId(userId);
                entity.setCreatedAt(now);
            }
            entity.setAvailableCash(money(state.availableCash));
            entity.setFrozenCash(money(state.frozenCash));
            entity.setTransitCash(money(state.transitCash));
            entity.setUpdatedAt(now);
            if (accountBalanceMapper.selectById(userId) == null) {
                accountBalanceMapper.insert(entity);
            } else {
                accountBalanceMapper.updateById(entity);
            }
        } catch (Exception ex) {
            throw new IllegalStateException("Persist account balance failed.", ex);
        }
    }

    private void persistPositionState(String userId, String stockCode, PositionState state) {
        if (!persistenceEnabled() || state == null) {
            return;
        }
        try {
            LocalDateTime now = LocalDateTime.now();
            AccountPositionEntity entity = accountPositionMapper.selectOne(
                    new QueryWrapper<AccountPositionEntity>()
                            .eq("user_id", userId)
                            .eq("stock_code", stockCode)
                            .last("LIMIT 1")
            );
            if (entity == null) {
                entity = new AccountPositionEntity();
                entity.setUserId(userId);
                entity.setStockCode(stockCode);
                entity.setCreatedAt(now);
            }
            entity.setTradableQuantity(state.tradableQuantity);
            entity.setFrozenQuantity(state.frozenQuantity);
            entity.setTransitQuantity(state.transitQuantity);
            entity.setTotalCost(cost(state.totalCost));
            entity.setUpdatedAt(now);
            if (entity.getId() == null) {
                accountPositionMapper.insert(entity);
            } else {
                accountPositionMapper.updateById(entity);
            }
        } catch (Exception ex) {
            throw new IllegalStateException("Persist account position failed.", ex);
        }
    }

    private void persistReservation(String orderId, OrderReservation reservation) {
        if (!persistenceEnabled() || orderId == null || reservation == null) {
            return;
        }
        try {
            LocalDateTime now = LocalDateTime.now();
            OrderReservationEntity entity = orderReservationMapper.selectById(orderId);
            if (entity == null) {
                entity = new OrderReservationEntity();
                entity.setOrderId(orderId);
                entity.setCreatedAt(now);
            }
            entity.setUserId(reservation.userId);
            entity.setStockCode(reservation.stockCode);
            entity.setType(reservation.type);
            entity.setRemainingQuantity(reservation.remainingQuantity);
            entity.setRemainingReservedCash(money(reservation.remainingReservedCash));
            entity.setUpdatedAt(now);
            if (orderReservationMapper.selectById(orderId) == null) {
                orderReservationMapper.insert(entity);
            } else {
                orderReservationMapper.updateById(entity);
            }
        } catch (Exception ex) {
            throw new IllegalStateException("Persist order reservation failed.", ex);
        }
    }

    private void deleteReservation(String orderId) {
        if (!persistenceEnabled() || orderId == null || orderId.trim().isEmpty()) {
            return;
        }
        try {
            orderReservationMapper.deleteById(orderId.trim());
        } catch (Exception ex) {
            throw new IllegalStateException("Delete order reservation failed.", ex);
        }
    }

    private void persistOrderSettlement(OrderSettlementState state) {
        if (!persistenceEnabled() || state == null || state.orderId == null) {
            return;
        }
        try {
            LocalDateTime now = LocalDateTime.now();
            OrderSettlementEntity entity = orderSettlementMapper.selectById(state.orderId);
            if (entity == null) {
                entity = new OrderSettlementEntity();
                entity.setOrderId(state.orderId);
                entity.setCreatedAt(now);
            }
            entity.setUserId(state.userId);
            entity.setStockCode(state.stockCode);
            entity.setSettlementDate(state.settlementDate);
            entity.setSettlementStatus(state.settled ? "SETTLED" : "PENDING");
            entity.setMatchedQuantity(state.matchedQuantity);
            entity.setMatchedAmount(money(state.matchedAmount));
            entity.setTotalFee(money(state.totalFee));
            entity.setNetCashFlow(money(state.netCashFlow));
            entity.setLastMatchedAt(state.lastMatchedAt);
            entity.setUpdatedAt(now);
            if (orderSettlementMapper.selectById(state.orderId) == null) {
                orderSettlementMapper.insert(entity);
            } else {
                orderSettlementMapper.updateById(entity);
            }
        } catch (Exception ex) {
            throw new IllegalStateException("Persist order settlement failed.", ex);
        }
    }

    private OrderSettlementState loadOrderSettlementStateFromDb(String orderId) {
        if (!persistenceEnabled()) {
            return null;
        }
        try {
            OrderSettlementEntity entity = orderSettlementMapper.selectById(orderId);
            if (entity == null) {
                return null;
            }
            return toOrderSettlementState(entity);
        } catch (Exception ex) {
            log.warn("Load order settlement from db failed, fallback to in-memory. orderId={}, reason={}", orderId, ex.getMessage());
            return null;
        }
    }

    private AccountState toAccountState(AccountBalanceEntity entity) {
        if (entity == null) {
            return null;
        }
        return new AccountState(
                money(entity.getAvailableCash()),
                money(entity.getFrozenCash()),
                money(entity.getTransitCash())
        );
    }

    private PositionState toPositionState(AccountPositionEntity entity) {
        PositionState state = new PositionState();
        if (entity == null) {
            return state;
        }
        state.tradableQuantity = safeInt(entity.getTradableQuantity());
        state.frozenQuantity = safeInt(entity.getFrozenQuantity());
        state.transitQuantity = safeInt(entity.getTransitQuantity());
        state.totalCost = cost(entity.getTotalCost());
        return state;
    }

    private OrderReservation toOrderReservation(OrderReservationEntity entity) {
        if (entity == null) {
            return null;
        }
        return new OrderReservation(
                safeUser(entity.getUserId()),
                safeStock(entity.getStockCode()),
                safeInt(entity.getType()),
                safeInt(entity.getRemainingQuantity()),
                money(entity.getRemainingReservedCash())
        );
    }

    private OrderSettlementState toOrderSettlementState(OrderSettlementEntity entity) {
        if (entity == null) {
            return null;
        }
        OrderSettlementState state = new OrderSettlementState(
                entity.getOrderId(),
                entity.getUserId(),
                entity.getStockCode(),
                entity.getSettlementDate()
        );
        state.matchedQuantity = safeInt(entity.getMatchedQuantity());
        state.matchedAmount = money(entity.getMatchedAmount());
        state.totalFee = money(entity.getTotalFee());
        state.netCashFlow = money(entity.getNetCashFlow());
        state.lastMatchedAt = entity.getLastMatchedAt();
        state.settled = "SETTLED".equalsIgnoreCase(entity.getSettlementStatus());
        return state;
    }

    private SettlementEntry toSettlementEntry(SettlementEntryEntity entity) {
        if (entity == null) {
            return null;
        }
        return new SettlementEntry(
                entity.getId(),
                entity.getOrderId(),
                safeUser(entity.getUserId()),
                safeStock(entity.getStockCode()),
                safeInt(entity.getType()),
                safeInt(entity.getQuantity()),
                money(entity.getCashAmount()),
                entity.getSettlementDate(),
                safeInt(entity.getSettled()) == 1
        );
    }

    private boolean persistenceEnabled() {
        return accountBalanceMapper != null
                && accountPositionMapper != null
                && orderReservationMapper != null
                && orderSettlementMapper != null
                && settlementEntryMapper != null;
    }

    private String safeUser(Order order) {
        return safeUser(order == null ? null : order.getUserId());
    }

    private String safeUser(String userId) {
        return userId == null ? "" : userId.trim();
    }

    private String safeStock(String stockCode) {
        return stockCode == null ? "" : stockCode.trim();
    }

    private int safeInt(Integer value) {
        return value == null ? 0 : value;
    }

    private BigDecimal money(BigDecimal value) {
        return (value == null ? BigDecimal.ZERO : value).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal cost(BigDecimal value) {
        return (value == null ? BigDecimal.ZERO : value).setScale(4, RoundingMode.HALF_UP);
    }

    public static class AccountSnapshot {
        private final String userId;
        private final BigDecimal availableCash;
        private final BigDecimal frozenCash;
        private final BigDecimal transitCash;

        public AccountSnapshot(String userId, BigDecimal availableCash, BigDecimal frozenCash, BigDecimal transitCash) {
            this.userId = userId;
            this.availableCash = availableCash;
            this.frozenCash = frozenCash;
            this.transitCash = transitCash;
        }

        public String getUserId() {
            return userId;
        }

        public BigDecimal getAvailableCash() {
            return availableCash;
        }

        public BigDecimal getFrozenCash() {
            return frozenCash;
        }

        public BigDecimal getTransitCash() {
            return transitCash;
        }
    }

    public static class PositionSnapshot {
        private final String stockCode;
        private final int tradableQuantity;
        private final int frozenQuantity;
        private final int transitQuantity;
        private final int totalQuantity;
        private final BigDecimal averageCost;

        public PositionSnapshot(String stockCode,
                                int tradableQuantity,
                                int frozenQuantity,
                                int transitQuantity,
                                int totalQuantity,
                                BigDecimal averageCost) {
            this.stockCode = stockCode;
            this.tradableQuantity = tradableQuantity;
            this.frozenQuantity = frozenQuantity;
            this.transitQuantity = transitQuantity;
            this.totalQuantity = totalQuantity;
            this.averageCost = averageCost;
        }

        public String getStockCode() {
            return stockCode;
        }

        public int getTradableQuantity() {
            return tradableQuantity;
        }

        public int getFrozenQuantity() {
            return frozenQuantity;
        }

        public int getTransitQuantity() {
            return transitQuantity;
        }

        public int getTotalQuantity() {
            return totalQuantity;
        }

        public BigDecimal getAverageCost() {
            return averageCost;
        }
    }

    public static class OrderSettlementSnapshot {
        private final String orderId;
        private final LocalDate settlementDate;
        private final String settlementStatus;
        private final int matchedQuantity;
        private final BigDecimal matchedAmount;
        private final BigDecimal totalFee;
        private final BigDecimal netCashFlow;
        private final LocalDateTime lastMatchedAt;

        public OrderSettlementSnapshot(String orderId,
                                       LocalDate settlementDate,
                                       String settlementStatus,
                                       int matchedQuantity,
                                       BigDecimal matchedAmount,
                                       BigDecimal totalFee,
                                       BigDecimal netCashFlow,
                                       LocalDateTime lastMatchedAt) {
            this.orderId = orderId;
            this.settlementDate = settlementDate;
            this.settlementStatus = settlementStatus;
            this.matchedQuantity = matchedQuantity;
            this.matchedAmount = matchedAmount;
            this.totalFee = totalFee;
            this.netCashFlow = netCashFlow;
            this.lastMatchedAt = lastMatchedAt;
        }

        public String getOrderId() {
            return orderId;
        }

        public LocalDate getSettlementDate() {
            return settlementDate;
        }

        public String getSettlementStatus() {
            return settlementStatus;
        }

        public int getMatchedQuantity() {
            return matchedQuantity;
        }

        public BigDecimal getMatchedAmount() {
            return matchedAmount;
        }

        public BigDecimal getTotalFee() {
            return totalFee;
        }

        public BigDecimal getNetCashFlow() {
            return netCashFlow;
        }

        public LocalDateTime getLastMatchedAt() {
            return lastMatchedAt;
        }
    }

    private static class AccountState {
        private BigDecimal availableCash;
        private BigDecimal frozenCash;
        private BigDecimal transitCash;

        private AccountState(BigDecimal availableCash, BigDecimal frozenCash, BigDecimal transitCash) {
            this.availableCash = availableCash;
            this.frozenCash = frozenCash;
            this.transitCash = transitCash;
        }
    }

    private static class PositionState {
        private int tradableQuantity = 0;
        private int frozenQuantity = 0;
        private int transitQuantity = 0;
        private BigDecimal totalCost = BigDecimal.ZERO.setScale(4, RoundingMode.HALF_UP);

        private int totalQuantity() {
            return Math.max(0, tradableQuantity + frozenQuantity + transitQuantity);
        }
    }

    private static class OrderReservation {
        private final String userId;
        private final String stockCode;
        private final int type;
        private int remainingQuantity;
        private BigDecimal remainingReservedCash;

        private OrderReservation(String userId, String stockCode, int type, int remainingQuantity, BigDecimal remainingReservedCash) {
            this.userId = userId;
            this.stockCode = stockCode;
            this.type = type;
            this.remainingQuantity = remainingQuantity;
            this.remainingReservedCash = remainingReservedCash;
        }

        private static OrderReservation buy(String userId, String stockCode, int quantity, BigDecimal reservedCash) {
            return new OrderReservation(userId, stockCode, TYPE_BUY, quantity, reservedCash);
        }

        private static OrderReservation sell(String userId, String stockCode, int quantity) {
            return new OrderReservation(userId, stockCode, TYPE_SELL, quantity, BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
        }

        private BigDecimal allocateCash(int matchedQuantity) {
            if (remainingQuantity <= 0 || matchedQuantity <= 0) {
                return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
            }
            int actualMatched = Math.min(remainingQuantity, matchedQuantity);
            BigDecimal releaseCash = remainingReservedCash
                    .multiply(new BigDecimal(actualMatched))
                    .divide(new BigDecimal(remainingQuantity), 2, RoundingMode.HALF_UP);
            remainingQuantity -= actualMatched;
            remainingReservedCash = remainingReservedCash.subtract(releaseCash).setScale(2, RoundingMode.HALF_UP);
            if (remainingQuantity <= 0) {
                BigDecimal tail = remainingReservedCash;
                remainingReservedCash = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
                releaseCash = releaseCash.add(tail).setScale(2, RoundingMode.HALF_UP);
            }
            return releaseCash;
        }

        private int allocateQuantity(int matchedQuantity) {
            if (remainingQuantity <= 0 || matchedQuantity <= 0) {
                return 0;
            }
            int actualMatched = Math.min(remainingQuantity, matchedQuantity);
            remainingQuantity -= actualMatched;
            return actualMatched;
        }
    }

    private static class SettlementEntry {
        private Long id;
        private final String orderId;
        private final String userId;
        private final String stockCode;
        private final int type;
        private final int quantity;
        private final BigDecimal cashAmount;
        private final LocalDate settlementDate;
        private boolean settled;

        private SettlementEntry(Long id,
                                String orderId,
                                String userId,
                                String stockCode,
                                int type,
                                int quantity,
                                BigDecimal cashAmount,
                                LocalDate settlementDate,
                                boolean settled) {
            this.id = id;
            this.orderId = orderId;
            this.userId = userId;
            this.stockCode = stockCode;
            this.type = type;
            this.quantity = quantity;
            this.cashAmount = cashAmount;
            this.settlementDate = settlementDate;
            this.settled = settled;
        }

        private static SettlementEntry buy(String orderId, String userId, String stockCode, int quantity, LocalDate settlementDate) {
            return new SettlementEntry(
                    null,
                    orderId,
                    userId,
                    stockCode,
                    TYPE_BUY,
                    quantity,
                    BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP),
                    settlementDate,
                    false
            );
        }

        private static SettlementEntry sell(String orderId, String userId, String stockCode, BigDecimal cashAmount, LocalDate settlementDate) {
            return new SettlementEntry(
                    null,
                    orderId,
                    userId,
                    stockCode,
                    TYPE_SELL,
                    0,
                    cashAmount,
                    settlementDate,
                    false
            );
        }
    }

    private static class OrderSettlementState {
        private final String orderId;
        private String userId;
        private String stockCode;
        private LocalDate settlementDate;
        private int matchedQuantity;
        private BigDecimal matchedAmount = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        private BigDecimal totalFee = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        private BigDecimal netCashFlow = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        private LocalDateTime lastMatchedAt;
        private boolean settled;

        private OrderSettlementState(String orderId, String userId, String stockCode, LocalDate settlementDate) {
            this.orderId = orderId;
            this.userId = userId == null ? "" : userId.trim();
            this.stockCode = stockCode == null ? "" : stockCode.trim();
            this.settlementDate = settlementDate;
            this.matchedQuantity = 0;
            this.lastMatchedAt = null;
            this.settled = false;
        }
    }
}

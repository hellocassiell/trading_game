package com.simtrade.backend.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.simtrade.backend.dto.MarketData;
import com.simtrade.backend.entity.Order;
import com.simtrade.backend.service.FeeCalculator;
import com.simtrade.backend.service.MatchingService;
import com.simtrade.backend.service.OrderService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Comparator;

@Slf4j
@Service
public class MatchingServiceImpl implements MatchingService {

    @Autowired
    private OrderService orderService;

    @Autowired
    private FeeCalculator feeCalculator;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void matchOrders(MarketData marketData) {
        String stockCode = marketData.getStockCode();
        
        // Fetch all pending and partially filled orders for this stock
        List<Order> orders = orderService.list(new QueryWrapper<Order>()
                .eq("stock_code", stockCode)
                .in("status", 0, 1) // 0: Pending, 1: Partial Filled
                .orderByAsc("create_time")); // Time priority

        if (orders == null || orders.isEmpty()) {
            return;
        }

        // 1. Process Buy Orders (matching against asks)
        List<MarketData.Level> asks = marketData.getAsks();
        if (asks != null && !asks.isEmpty()) {
            asks.sort(Comparator.comparing(MarketData.Level::getPrice)); // Lowest ask first
            
            for (Order order : orders) {
                if (order.getType() != 1) continue; // Only Buy Orders
                
                for (MarketData.Level ask : asks) {
                    if (ask.getVolume() <= 0) continue;
                    
                    // Buy price >= Ask price (Can match)
                    if (order.getPrice().compareTo(ask.getPrice()) >= 0) {
                        int remainingQty = order.getQuantity() - order.getFilledQuantity();
                        int matchQty = Math.min(remainingQty, ask.getVolume());
                        
                        if (matchQty > 0) {
                            executeTrade(order, ask.getPrice(), matchQty);
                            ask.setVolume(ask.getVolume() - matchQty);
                        }
                        
                        if (order.getStatus() == 2) { // Fully filled
                            break;
                        }
                    } else {
                        // Ask prices are sorted ascending, so if this one is higher than buy price, next will be too
                        break;
                    }
                }
            }
        }

        // 2. Process Sell Orders (matching against bids)
        List<MarketData.Level> bids = marketData.getBids();
        if (bids != null && !bids.isEmpty()) {
            bids.sort((a, b) -> b.getPrice().compareTo(a.getPrice())); // Highest bid first
            
            for (Order order : orders) {
                if (order.getType() != 2) continue; // Only Sell Orders
                
                for (MarketData.Level bid : bids) {
                    if (bid.getVolume() <= 0) continue;
                    
                    // Sell price <= Bid price (Can match)
                    if (order.getPrice().compareTo(bid.getPrice()) <= 0) {
                        int remainingQty = order.getQuantity() - order.getFilledQuantity();
                        int matchQty = Math.min(remainingQty, bid.getVolume());
                        
                        if (matchQty > 0) {
                            executeTrade(order, bid.getPrice(), matchQty);
                            bid.setVolume(bid.getVolume() - matchQty);
                        }
                        
                        if (order.getStatus() == 2) { // Fully filled
                            break;
                        }
                    } else {
                        // Bid prices are sorted descending, so if this one is lower than sell price, next will be too
                        break;
                    }
                }
            }
        }
    }

    private void executeTrade(Order order, BigDecimal execPrice, int matchQty) {
        BigDecimal currentAvgPrice = order.getFilledAvgPrice() == null ? BigDecimal.ZERO : order.getFilledAvgPrice();
        int currentFilledQty = order.getFilledQuantity() == null ? 0 : order.getFilledQuantity();
        
        BigDecimal totalOldValue = currentAvgPrice.multiply(new BigDecimal(currentFilledQty));
        BigDecimal matchValue = execPrice.multiply(new BigDecimal(matchQty));
        
        int newFilledQty = currentFilledQty + matchQty;
        BigDecimal newAvgPrice = totalOldValue.add(matchValue).divide(new BigDecimal(newFilledQty), 4, RoundingMode.HALF_UP);
        
        order.setFilledQuantity(newFilledQty);
        order.setFilledAvgPrice(newAvgPrice);
        order.setUpdateTime(LocalDateTime.now());
        
        if (newFilledQty >= order.getQuantity()) {
            order.setStatus(2); // Filled
        } else {
            order.setStatus(1); // Partial Filled
        }

        // Update Order in DB
        try {
            orderService.updateById(order);
        } catch (Exception e) {
            log.error("Mock updating order: {}", order);
        }

        // Calculate Fees
        // Mock lotSize as 100 for now to compute lots
        int lots = matchQty / 100 == 0 ? 1 : matchQty / 100;
        boolean isBuy = (order.getType() == 1);
        BigDecimal totalFee = feeCalculator.calculateTotalFee(matchValue, isBuy, lots);

        // Calculate Settlement Date (T+2)
        // Note: For HK stocks, it is T+2 working days. Here we simplify by just adding 2 days.
        LocalDateTime settlementDate = LocalDateTime.now().plusDays(2);
        
        log.info("Order Matched: ID={}, Stock={}, Type={}, ExecPrice={}, Qty={}, Fee={}, SettlementDate={}", 
                order.getId(), order.getStockCode(), order.getType(), execPrice, matchQty, totalFee, settlementDate);
        
        // (Optional) Here we would update user's account balance, positions, and create Trade/Transaction records.
        // E.g. deduct money (for buy) or add money (for sell) + fees
    }
}
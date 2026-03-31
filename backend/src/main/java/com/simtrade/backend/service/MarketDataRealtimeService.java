package com.simtrade.backend.service;

import com.simtrade.backend.dto.MarketData;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
public class MarketDataRealtimeService {

    private static final ZoneId HK_ZONE = ZoneId.of("Asia/Hong_Kong");
    private static final long SSE_TIMEOUT_MS = 30L * 60L * 1000L;

    private final AtomicLong sequence = new AtomicLong(0L);
    private final ConcurrentMap<String, QuoteSnapshot> latestByStock = new ConcurrentHashMap<String, QuoteSnapshot>();
    private final ConcurrentMap<String, ConcurrentMap<String, SseEmitter>> subscribersByStock = new ConcurrentHashMap<String, ConcurrentMap<String, SseEmitter>>();

    public QuoteSnapshot publish(MarketData marketData) {
        if (marketData == null || marketData.getStockCode() == null || marketData.getStockCode().trim().isEmpty()) {
            return null;
        }
        String stockCode = normalizeStockCode(marketData.getStockCode());
        long incomingTimestamp = resolveTimestamp(marketData.getTimestamp());
        QuoteSnapshot previous = latestByStock.get(stockCode);
        if (previous != null && incomingTimestamp <= previous.sourceTimestamp) {
            return null;
        }
        QuoteSnapshot snapshot = buildSnapshot(stockCode, marketData, incomingTimestamp);
        latestByStock.put(stockCode, snapshot);
        broadcast(snapshot);
        return snapshot;
    }

    public QuoteSnapshot getLatestSnapshot(String stockCode) {
        if (stockCode == null || stockCode.trim().isEmpty()) {
            return null;
        }
        return latestByStock.get(normalizeStockCode(stockCode));
    }

    public SseEmitter subscribe(String stockCode) {
        String normalized = normalizeStockCode(stockCode);
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MS);
        String emitterId = UUID.randomUUID().toString();
        subscribersByStock
                .computeIfAbsent(normalized, key -> new ConcurrentHashMap<String, SseEmitter>())
                .put(emitterId, emitter);

        emitter.onCompletion(() -> unsubscribe(normalized, emitterId));
        emitter.onTimeout(() -> unsubscribe(normalized, emitterId));
        emitter.onError(error -> unsubscribe(normalized, emitterId));

        QuoteSnapshot latest = latestByStock.get(normalized);
        if (latest != null) {
            sendSnapshot(emitter, latest);
        }
        return emitter;
    }

    public void unsubscribe(String stockCode, String emitterId) {
        ConcurrentMap<String, SseEmitter> emitters = subscribersByStock.get(stockCode);
        if (emitters == null) {
            return;
        }
        emitters.remove(emitterId);
        if (emitters.isEmpty()) {
            subscribersByStock.remove(stockCode);
        }
    }

    private void broadcast(QuoteSnapshot snapshot) {
        if (snapshot == null) {
            return;
        }
        ConcurrentMap<String, SseEmitter> emitters = subscribersByStock.get(snapshot.stockCode);
        if (emitters == null || emitters.isEmpty()) {
            return;
        }
        List<String> stale = new ArrayList<String>();
        for (Map.Entry<String, SseEmitter> entry : emitters.entrySet()) {
            try {
                sendSnapshot(entry.getValue(), snapshot);
            } catch (Exception ex) {
                stale.add(entry.getKey());
            }
        }
        for (String emitterId : stale) {
            unsubscribe(snapshot.stockCode, emitterId);
        }
    }

    private void sendSnapshot(SseEmitter emitter, QuoteSnapshot snapshot) {
        try {
            emitter.send(SseEmitter.event()
                    .name("quote")
                    .data(snapshot));
        } catch (Exception ex) {
            emitter.complete();
            throw new RuntimeException(ex);
        }
    }

    private QuoteSnapshot buildSnapshot(String stockCode, MarketData marketData, long timestamp) {
        List<DepthLevel> asks = toLevels(marketData.getAsks(), true);
        List<DepthLevel> bids = toLevels(marketData.getBids(), false);
        BigDecimal nominalPrice = marketData.getNominalPrice();
        BigDecimal lastPrice = marketData.getLastPrice();
        long seq = sequence.incrementAndGet();
        LocalDateTime updatedAt = toUpdatedAt(timestamp);
        return new QuoteSnapshot(stockCode, nominalPrice, lastPrice, asks, bids, updatedAt, seq, timestamp);
    }

    private List<DepthLevel> toLevels(List<MarketData.Level> levels, boolean askSide) {
        if (levels == null || levels.isEmpty()) {
            return Collections.emptyList();
        }
        Comparator<DepthLevel> comparator = askSide
                ? Comparator.comparing(DepthLevel::getPrice)
                : (a, b) -> b.getPrice().compareTo(a.getPrice());
        return levels.stream()
                .filter(level -> level != null && level.getPrice() != null && level.getVolume() != null)
                .map(level -> new DepthLevel(level.getPrice(), Math.max(0, level.getVolume())))
                .sorted(comparator)
                .limit(10)
                .collect(Collectors.toList());
    }

    private LocalDateTime toUpdatedAt(long timestamp) {
        return LocalDateTime.ofInstant(Instant.ofEpochMilli(timestamp), HK_ZONE);
    }

    private long resolveTimestamp(Long timestamp) {
        if (timestamp == null || timestamp <= 0L) {
            return Instant.now().toEpochMilli();
        }
        return timestamp;
    }

    private String normalizeStockCode(String stockCode) {
        String raw = stockCode == null ? "" : stockCode.trim().toUpperCase();
        raw = raw.endsWith(".HK") ? raw.substring(0, raw.length() - 3) : raw;
        if (raw.matches("\\d{4}")) {
            return "0" + raw;
        }
        return raw;
    }

    public static class QuoteSnapshot {
        private final String stockCode;
        private final BigDecimal nominalPrice;
        private final BigDecimal lastPrice;
        private final List<DepthLevel> asks;
        private final List<DepthLevel> bids;
        private final LocalDateTime updatedAt;
        private final long sequence;
        private final long sourceTimestamp;

        public QuoteSnapshot(String stockCode,
                             BigDecimal nominalPrice,
                             BigDecimal lastPrice,
                             List<DepthLevel> asks,
                             List<DepthLevel> bids,
                             LocalDateTime updatedAt,
                             long sequence,
                             long sourceTimestamp) {
            this.stockCode = stockCode;
            this.nominalPrice = nominalPrice;
            this.lastPrice = lastPrice;
            this.asks = asks;
            this.bids = bids;
            this.updatedAt = updatedAt;
            this.sequence = sequence;
            this.sourceTimestamp = sourceTimestamp;
        }

        public String getStockCode() {
            return stockCode;
        }

        public BigDecimal getNominalPrice() {
            return nominalPrice;
        }

        public BigDecimal getLastPrice() {
            return lastPrice;
        }

        public List<DepthLevel> getAsks() {
            return asks;
        }

        public List<DepthLevel> getBids() {
            return bids;
        }

        public LocalDateTime getUpdatedAt() {
            return updatedAt;
        }

        public long getSequence() {
            return sequence;
        }

        public long getSourceTimestamp() {
            return sourceTimestamp;
        }
    }

    public static class DepthLevel {
        private final BigDecimal price;
        private final int volume;

        public DepthLevel(BigDecimal price, int volume) {
            this.price = price;
            this.volume = volume;
        }

        public BigDecimal getPrice() {
            return price;
        }

        public int getVolume() {
            return volume;
        }
    }
}

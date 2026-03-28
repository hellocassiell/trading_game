package com.simtrade.backend.service;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MockDataService {

    private static final Map<String, StockMeta> STOCK_META_MAP;

    static {
        Map<String, StockMeta> map = new HashMap<String, StockMeta>();
        map.put("00700", new StockMeta("00700", "腾讯控股", 100, new BigDecimal("300.00"), new BigDecimal("297.20"), false));
        map.put("0388", new StockMeta("0388", "香港交易所", 100, new BigDecimal("290.00"), new BigDecimal("288.00"), false));
        map.put("02800", new StockMeta("02800", "盈富基金", 500, new BigDecimal("19.80"), new BigDecimal("19.65"), false));
        map.put("09988", new StockMeta("09988", "阿里巴巴-SW", 100, new BigDecimal("70.00"), new BigDecimal("71.25"), false));
        STOCK_META_MAP = Collections.unmodifiableMap(map);
    }

    private String normalizeStockCode(String stockCode) {
        if (stockCode == null) {
            return "";
        }
        return stockCode.endsWith(".HK") ? stockCode.substring(0, stockCode.length() - 3) : stockCode;
    }

    // Mock current market price for ±20 ticks check
    public BigDecimal getCurrentPrice(String stockCode) {
        StockMeta meta = STOCK_META_MAP.get(normalizeStockCode(stockCode));
        if (meta == null) {
            return new BigDecimal("10.00");
        }
        return meta.currentPrice;
    }

    // Mock lot size for the stock
    public Integer getLotSize(String stockCode) {
        StockMeta meta = STOCK_META_MAP.get(normalizeStockCode(stockCode));
        if (meta == null) {
            return 500;
        }
        return meta.lotSize;
    }

    // Mock tick size based on HKEX rules (simplified)
    public BigDecimal getTickSize(BigDecimal price) {
        if (price.compareTo(new BigDecimal("0.25")) <= 0) return new BigDecimal("0.001");
        if (price.compareTo(new BigDecimal("0.50")) <= 0) return new BigDecimal("0.005");
        if (price.compareTo(new BigDecimal("10.00")) <= 0) return new BigDecimal("0.01");
        if (price.compareTo(new BigDecimal("20.00")) <= 0) return new BigDecimal("0.02");
        if (price.compareTo(new BigDecimal("100.00")) <= 0) return new BigDecimal("0.05");
        if (price.compareTo(new BigDecimal("200.00")) <= 0) return new BigDecimal("0.10");
        if (price.compareTo(new BigDecimal("500.00")) <= 0) return new BigDecimal("0.20");
        if (price.compareTo(new BigDecimal("1000.00")) <= 0) return new BigDecimal("0.50");
        return new BigDecimal("1.00");
    }

    public String getStockName(String stockCode) {
        String normalized = normalizeStockCode(stockCode);
        StockMeta meta = STOCK_META_MAP.get(normalized);
        return meta == null ? normalized : meta.stockName;
    }

    public BigDecimal getPrevClose(String stockCode) {
        StockMeta meta = STOCK_META_MAP.get(normalizeStockCode(stockCode));
        if (meta == null) {
            return getCurrentPrice(stockCode);
        }
        return meta.prevClose;
    }

    public boolean isSupportedStock(String stockCode) {
        return STOCK_META_MAP.containsKey(normalizeStockCode(stockCode));
    }

    public boolean isSuspended(String stockCode) {
        StockMeta meta = STOCK_META_MAP.get(normalizeStockCode(stockCode));
        return meta != null && meta.suspended;
    }

    public List<Map<String, Object>> searchStocks(String keyword) {
        String safeKeyword = keyword == null ? "" : keyword.trim();
        String lowerKeyword = safeKeyword.toLowerCase();
        List<Map<String, Object>> results = new ArrayList<Map<String, Object>>();
        for (StockMeta meta : STOCK_META_MAP.values()) {
            String name = meta.stockName == null ? "" : meta.stockName;
            String code = meta.stockCode == null ? "" : meta.stockCode;
            boolean matched = safeKeyword.isEmpty()
                    || code.contains(safeKeyword)
                    || name.contains(safeKeyword)
                    || name.toLowerCase().contains(lowerKeyword);
            if (!matched) {
                continue;
            }

            BigDecimal change = meta.currentPrice.subtract(meta.prevClose).setScale(2, RoundingMode.HALF_UP);
            BigDecimal changePercent;
            if (meta.prevClose.compareTo(BigDecimal.ZERO) == 0) {
                changePercent = BigDecimal.ZERO;
            } else {
                changePercent = change
                        .divide(meta.prevClose, 4, RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100"))
                        .setScale(2, RoundingMode.HALF_UP);
            }

            Map<String, Object> item = new HashMap<String, Object>();
            item.put("stockCode", meta.stockCode);
            item.put("stockName", meta.stockName);
            item.put("currentPrice", meta.currentPrice);
            item.put("changeAmount", change);
            item.put("changePercent", changePercent);
            item.put("lotSize", meta.lotSize);
            item.put("suspended", meta.suspended);
            results.add(item);
        }
        return results;
    }

    private static class StockMeta {
        private final String stockCode;
        private final String stockName;
        private final Integer lotSize;
        private final BigDecimal currentPrice;
        private final BigDecimal prevClose;
        private final boolean suspended;

        private StockMeta(String stockCode, String stockName, Integer lotSize,
                          BigDecimal currentPrice, BigDecimal prevClose, boolean suspended) {
            this.stockCode = stockCode;
            this.stockName = stockName;
            this.lotSize = lotSize;
            this.currentPrice = currentPrice;
            this.prevClose = prevClose;
            this.suspended = suspended;
        }
    }
}

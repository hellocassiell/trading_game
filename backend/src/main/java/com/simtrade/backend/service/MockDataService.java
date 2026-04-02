package com.simtrade.backend.service;

import com.simtrade.backend.common.LanguageSupport;
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

        // 恒生指数成份股
        map.put("00700", new StockMeta(
                "00700",
                "騰訊控股",
                "腾讯控股",
                "Tencent Holdings",
                100,
                new BigDecimal("300.00"),
                new BigDecimal("297.20"),
                false
        ));
        map.put("00005", new StockMeta(
                "00005",
                "滙豐控股",
                "汇丰控股",
                "HSBC Holdings",
                400,
                new BigDecimal("65.00"),
                new BigDecimal("64.50"),
                false
        ));
        map.put("00388", new StockMeta(
                "00388",
                "香港交易所",
                "香港交易所",
                "Hong Kong Exchanges",
                100,
                new BigDecimal("290.00"),
                new BigDecimal("288.00"),
                false
        ));
        map.put("00941", new StockMeta(
                "00941",
                "中國移動",
                "中国移动",
                "China Mobile",
                500,
                new BigDecimal("75.00"),
                new BigDecimal("74.30"),
                false
        ));
        map.put("00388", new StockMeta(
                "00388",
                "香港交易所",
                "香港交易所",
                "Hong Kong Exchanges",
                100,
                new BigDecimal("290.00"),
                new BigDecimal("288.00"),
                false
        ));

        // 恒生中国企业指数成份股
        map.put("09988", new StockMeta(
                "09988",
                "阿里巴巴-SW",
                "阿里巴巴-SW",
                "Alibaba-SW",
                100,
                new BigDecimal("70.00"),
                new BigDecimal("71.25"),
                false
        ));
        map.put("09999", new StockMeta(
                "09999",
                "網易-S",
                "网易-S",
                "NetEase-S",
                100,
                new BigDecimal("150.00"),
                new BigDecimal("148.50"),
                false
        ));
        map.put("03690", new StockMeta(
                "03690",
                "美團-W",
                "美团-W",
                "Meituan-W",
                100,
                new BigDecimal("120.00"),
                new BigDecimal("118.80"),
                false
        ));
        map.put("09988", new StockMeta(
                "09988",
                "阿里巴巴-SW",
                "阿里巴巴-SW",
                "Alibaba-SW",
                100,
                new BigDecimal("70.00"),
                new BigDecimal("71.25"),
                false
        ));

        // ETF
        map.put("02800", new StockMeta(
                "02800",
                "盈富基金",
                "盈富基金",
                "Tracker Fund of Hong Kong",
                500,
                new BigDecimal("19.80"),
                new BigDecimal("19.65"),
                false
        ));
        map.put("03000", new StockMeta(
                "03000",
                "恒生指數ETF",
                "恒生指数ETF",
                "Hang Seng Index ETF",
                100,
                new BigDecimal("18.50"),
                new BigDecimal("18.35"),
                false
        ));

        // 其他蓝筹股
        map.put("01113", new StockMeta(
                "01113",
                "長江基建集團",
                "长江基建集团",
                "CK Infrastructure",
                500,
                new BigDecimal("55.00"),
                new BigDecimal("54.60"),
                false
        ));
        map.put("00001", new StockMeta(
                "00001",
                "長和",
                "长和",
                "CK Hutchison",
                500,
                new BigDecimal("48.00"),
                new BigDecimal("47.70"),
                false
        ));
        map.put("00011", new StockMeta(
                "00011",
                "恒生銀行",
                "恒生银行",
                "Hang Seng Bank",
                100,
                new BigDecimal("110.00"),
                new BigDecimal("109.20"),
                false
        ));
        map.put("00016", new StockMeta(
                "00016",
                "新鴻基地產",
                "新鸿基地产",
                "Sun Hung Kai Properties",
                100,
                new BigDecimal("95.00"),
                new BigDecimal("94.10"),
                false
        ));
        map.put("00027", new StockMeta(
                "00027",
                "銀河娛樂",
                "银河娱乐",
                "Galaxy Entertainment",
                1000,
                new BigDecimal("45.00"),
                new BigDecimal("44.55"),
                false
        ));

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
        return getStockName(stockCode, LanguageSupport.DEFAULT_LANG);
    }

    public String getStockName(String stockCode, String language) {
        String normalized = normalizeStockCode(stockCode);
        StockMeta meta = STOCK_META_MAP.get(normalized);
        if (meta == null) {
            return normalized;
        }
        return meta.name(language);
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

    public List<Map<String, Object>> searchStocks(String keyword, String language) {
        String safeKeyword = keyword == null ? "" : keyword.trim();
        String lowerKeyword = safeKeyword.toLowerCase();
        List<Map<String, Object>> results = new ArrayList<Map<String, Object>>();
        for (StockMeta meta : STOCK_META_MAP.values()) {
            String code = meta.stockCode == null ? "" : meta.stockCode;
            boolean matched = safeKeyword.isEmpty()
                    || code.contains(safeKeyword)
                    || meta.matchName(safeKeyword, lowerKeyword);
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
            item.put("stockName", meta.name(language));
            item.put("currentPrice", meta.currentPrice);
            item.put("changeAmount", change);
            item.put("changePercent", changePercent);
            item.put("lotSize", meta.lotSize);
            item.put("suspended", meta.suspended);
            results.add(item);
        }
        return results;
    }

    public List<Map<String, Object>> searchStocks(String keyword) {
        return searchStocks(keyword, LanguageSupport.DEFAULT_LANG);
    }

    private static class StockMeta {
        private final String stockCode;
        private final String stockNameZhHant;
        private final String stockNameZhHans;
        private final String stockNameEn;
        private final Integer lotSize;
        private final BigDecimal currentPrice;
        private final BigDecimal prevClose;
        private final boolean suspended;

        private StockMeta(String stockCode,
                          String stockNameZhHant,
                          String stockNameZhHans,
                          String stockNameEn,
                          Integer lotSize,
                          BigDecimal currentPrice,
                          BigDecimal prevClose,
                          boolean suspended) {
            this.stockCode = stockCode;
            this.stockNameZhHant = stockNameZhHant;
            this.stockNameZhHans = stockNameZhHans;
            this.stockNameEn = stockNameEn;
            this.lotSize = lotSize;
            this.currentPrice = currentPrice;
            this.prevClose = prevClose;
            this.suspended = suspended;
        }

        private String name(String language) {
            return LanguageSupport.text(language, stockNameZhHant, stockNameZhHans, stockNameEn);
        }

        private boolean matchName(String rawKeyword, String lowerKeyword) {
            return stockNameZhHant.contains(rawKeyword)
                    || stockNameZhHans.contains(rawKeyword)
                    || stockNameEn.toLowerCase().contains(lowerKeyword);
        }
    }
}

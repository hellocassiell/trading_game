package com.simtrade.backend.controller;

import com.simtrade.backend.common.LanguageSupport;
import com.simtrade.backend.common.Result;
import com.simtrade.backend.dto.MarketData;
import com.simtrade.backend.service.MarketDataRealtimeService;
import com.simtrade.backend.service.MatchingService;
import com.simtrade.backend.service.ViewQueryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/trade")
public class TradeV1Controller {

    @Autowired
    private ViewQueryService viewQueryService;

    @Autowired
    private MarketDataRealtimeService marketDataRealtimeService;

    @Autowired
    private MatchingService matchingService;

    @GetMapping("/search")
    public Result<Map<String, Object>> search(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestHeader(value = "X-Lang", required = false) String headerLang,
            @RequestParam(value = "lang", required = false) String queryLang,
            @RequestHeader(value = "Accept-Language", required = false) String acceptLang) {
        String language = LanguageSupport.determineLanguage(headerLang, queryLang, acceptLang);
        return Result.success(viewQueryService.searchTradeTargets(keyword, language));
    }

    @GetMapping("/quote/{stockCode}")
    public Result<Map<String, Object>> quote(
            @PathVariable("stockCode") String stockCode,
            @RequestHeader(value = "X-Lang", required = false) String headerLang,
            @RequestParam(value = "lang", required = false) String queryLang,
            @RequestHeader(value = "Accept-Language", required = false) String acceptLang) {
        String language = LanguageSupport.determineLanguage(headerLang, queryLang, acceptLang);
        return Result.success(viewQueryService.buildTradeQuote(stockCode, language));
    }

    @GetMapping(value = "/quote/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamQuote(
            @RequestParam("stockCode") String stockCode,
            @RequestParam(value = "lang", required = false) String queryLang) {
        return marketDataRealtimeService.subscribe(stockCode);
    }

    @PostMapping("/quote/debug-push")
    public Result<Map<String, Object>> debugPushQuote(
            @RequestBody MarketData marketData,
            @RequestParam(value = "forceMatch", defaultValue = "false") boolean forceMatch) {
        MarketDataRealtimeService.QuoteSnapshot snapshot = marketDataRealtimeService.publish(marketData);
        boolean accepted = snapshot != null;
        if (accepted) {
            matchingService.matchOrders(marketData, forceMatch);
        }
        Map<String, Object> data = new LinkedHashMap<String, Object>();
        data.put("accepted", accepted);
        data.put("forceMatch", forceMatch);
        if (!accepted) {
            data.put("reason", "STALE_MARKET_DATA");
        }
        data.put("stockCode", marketData == null ? null : marketData.getStockCode());
        data.put("updatedAt", LocalDateTime.now().toString());
        return Result.success(data);
    }
}

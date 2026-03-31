package com.simtrade.backend.controller;

import com.simtrade.backend.common.LanguageSupport;
import com.simtrade.backend.common.Result;
import com.simtrade.backend.service.ViewQueryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/leaderboard")
public class LeaderboardV1Controller {

    @Autowired
    private ViewQueryService viewQueryService;

    @GetMapping("/star-traders")
    public Result<Map<String, Object>> starTraders(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader(value = "X-Lang", required = false) String headerLang,
            @RequestParam(value = "lang", required = false) String queryLang,
            @RequestHeader(value = "Accept-Language", required = false) String acceptLang) {
        String language = LanguageSupport.determineLanguage(headerLang, queryLang, acceptLang);
        return Result.success(viewQueryService.buildStarTradersLeaderboard(userId, language));
    }

    @GetMapping("/top-holdings")
    public Result<Map<String, Object>> topHoldings(
            @RequestHeader(value = "X-Lang", required = false) String headerLang,
            @RequestParam(value = "lang", required = false) String queryLang,
            @RequestHeader(value = "Accept-Language", required = false) String acceptLang) {
        String language = LanguageSupport.determineLanguage(headerLang, queryLang, acceptLang);
        return Result.success(viewQueryService.buildTopHoldingsLeaderboard(language));
    }

    @GetMapping("/top-turnover")
    public Result<Map<String, Object>> topTurnover(
            @RequestHeader(value = "X-Lang", required = false) String headerLang,
            @RequestParam(value = "lang", required = false) String queryLang,
            @RequestHeader(value = "Accept-Language", required = false) String acceptLang) {
        String language = LanguageSupport.determineLanguage(headerLang, queryLang, acceptLang);
        return Result.success(viewQueryService.buildTopTurnoverLeaderboard(language));
    }

    @GetMapping("/top-loser-holdings")
    public Result<Map<String, Object>> topLoserHoldings(
            @RequestHeader(value = "X-Lang", required = false) String headerLang,
            @RequestParam(value = "lang", required = false) String queryLang,
            @RequestHeader(value = "Accept-Language", required = false) String acceptLang) {
        String language = LanguageSupport.determineLanguage(headerLang, queryLang, acceptLang);
        return Result.success(viewQueryService.buildTopLoserHoldingsLeaderboard(language));
    }

    @GetMapping("/rankings")
    public Result<Map<String, Object>> rankings(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam(value = "page", defaultValue = "1") Integer page,
            @RequestParam(value = "pageSize", defaultValue = "20") Integer pageSize,
            @RequestHeader(value = "X-Lang", required = false) String headerLang,
            @RequestParam(value = "lang", required = false) String queryLang,
            @RequestHeader(value = "Accept-Language", required = false) String acceptLang) {
        String language = LanguageSupport.determineLanguage(headerLang, queryLang, acceptLang);
        return Result.success(viewQueryService.buildRankingsLeaderboard(userId, page, pageSize, language));
    }
}

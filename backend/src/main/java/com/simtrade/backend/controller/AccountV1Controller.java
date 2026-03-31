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
@RequestMapping("/api/v1/account")
public class AccountV1Controller {

    @Autowired
    private ViewQueryService viewQueryService;

    @GetMapping("/profile")
    public Result<Map<String, Object>> profile(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader(value = "X-Lang", required = false) String headerLang,
            @RequestParam(value = "lang", required = false) String queryLang,
            @RequestHeader(value = "Accept-Language", required = false) String acceptLang) {
        String language = LanguageSupport.determineLanguage(headerLang, queryLang, acceptLang);
        return Result.success(viewQueryService.buildAccountProfile(userId, language));
    }

    @GetMapping("/positions")
    public Result<Map<String, Object>> positions(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader(value = "X-Lang", required = false) String headerLang,
            @RequestParam(value = "lang", required = false) String queryLang,
            @RequestHeader(value = "Accept-Language", required = false) String acceptLang) {
        String language = LanguageSupport.determineLanguage(headerLang, queryLang, acceptLang);
        return Result.success(viewQueryService.buildAccountPositions(userId, language));
    }

    @GetMapping("/asset-trend")
    public Result<Map<String, Object>> assetTrend(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam(value = "range", required = false) String range,
            @RequestHeader(value = "X-Lang", required = false) String headerLang,
            @RequestParam(value = "lang", required = false) String queryLang,
            @RequestHeader(value = "Accept-Language", required = false) String acceptLang) {
        String language = LanguageSupport.determineLanguage(headerLang, queryLang, acceptLang);
        return Result.success(viewQueryService.buildAccountAssetTrend(userId, range, language));
    }
}

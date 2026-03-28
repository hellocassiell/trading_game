package com.simtrade.backend.controller;

import com.simtrade.backend.common.Result;
import com.simtrade.backend.service.ViewQueryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/trade")
public class TradeV1Controller {

    @Autowired
    private ViewQueryService viewQueryService;

    @GetMapping("/search")
    public Result<Map<String, Object>> search(
            @RequestParam(value = "keyword", required = false) String keyword) {
        return Result.success(viewQueryService.searchTradeTargets(keyword));
    }

    @GetMapping("/quote/{stockCode}")
    public Result<Map<String, Object>> quote(
            @PathVariable("stockCode") String stockCode) {
        return Result.success(viewQueryService.buildTradeQuote(stockCode));
    }
}

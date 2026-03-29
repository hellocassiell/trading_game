package com.simtrade.backend.controller;

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
            @RequestHeader(value = "X-User-Id", defaultValue = "u_10001") String userId) {
        return Result.success(viewQueryService.buildStarTradersLeaderboard(userId));
    }

    @GetMapping("/top-holdings")
    public Result<Map<String, Object>> topHoldings() {
        return Result.success(viewQueryService.buildTopHoldingsLeaderboard());
    }

    @GetMapping("/top-turnover")
    public Result<Map<String, Object>> topTurnover() {
        return Result.success(viewQueryService.buildTopTurnoverLeaderboard());
    }

    @GetMapping("/rankings")
    public Result<Map<String, Object>> rankings(
            @RequestHeader(value = "X-User-Id", defaultValue = "u_10001") String userId,
            @RequestParam(value = "page", defaultValue = "1") Integer page,
            @RequestParam(value = "pageSize", defaultValue = "20") Integer pageSize) {
        return Result.success(viewQueryService.buildRankingsLeaderboard(userId, page, pageSize));
    }
}

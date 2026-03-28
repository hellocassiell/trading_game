package com.simtrade.backend.controller;

import com.simtrade.backend.common.Result;
import com.simtrade.backend.service.ViewQueryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/home")
public class HomeV1Controller {

    @Autowired
    private ViewQueryService viewQueryService;

    @GetMapping("/overview")
    public Result<Map<String, Object>> overview(
            @RequestHeader(value = "X-User-Id", defaultValue = "u_10001") String userId) {
        return Result.success(viewQueryService.buildHomeOverview(userId));
    }
}

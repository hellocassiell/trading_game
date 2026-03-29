package com.simtrade.backend.controller;

import com.simtrade.backend.common.Result;
import com.simtrade.backend.dto.AuthSendCodeRequest;
import com.simtrade.backend.dto.AuthSessionResponse;
import com.simtrade.backend.dto.AuthVerifyCodeRequest;
import com.simtrade.backend.dto.AuthProfileRequest;
import com.simtrade.backend.service.AuthService;
import com.simtrade.backend.service.UserProfileService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1/auth")
@Validated
public class AuthV1Controller {

    private final AuthService authService;
    private final UserProfileService userProfileService;

    public AuthV1Controller(AuthService authService, UserProfileService userProfileService) {
        this.authService = authService;
        this.userProfileService = userProfileService;
    }

    @PostMapping("/send-code")
    public Result<Void> sendCode(@Valid @RequestBody AuthSendCodeRequest request) {
        authService.sendCode(request.getPhone());
        return Result.success(null);
    }

    @PostMapping("/verify-code")
    public Result<AuthSessionResponse> verifyCode(@Valid @RequestBody AuthVerifyCodeRequest request) {
        return Result.success(authService.verifyCode(request.getPhone(), request.getCode()));
    }

    @PostMapping("/profile")
    public Result<Void> completeProfile(
            @RequestHeader(value = "X-User-Id") String userId,
            @Valid @RequestBody AuthProfileRequest request) {
        userProfileService.upsertProfile(userId, request.getNickname(), request.getAvatarId());
        return Result.success(null);
    }
}

package com.simtrade.backend.controller;

import com.simtrade.backend.common.LanguageSupport;
import com.simtrade.backend.common.Result;
import com.simtrade.backend.dto.AuthSendCodeRequest;
import com.simtrade.backend.dto.AuthSessionResponse;
import com.simtrade.backend.dto.AuthVerifyCodeRequest;
import com.simtrade.backend.dto.AuthProfileRequest;
import com.simtrade.backend.service.AuthService;
import com.simtrade.backend.service.AvatarStorageService;
import com.simtrade.backend.service.UserProfileService;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.core.io.UrlResource;
import org.springframework.core.io.Resource;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/v1/auth")
@Validated
public class AuthV1Controller {

    private final AuthService authService;
    private final UserProfileService userProfileService;
    private final AvatarStorageService avatarStorageService;

    public AuthV1Controller(
            AuthService authService,
            UserProfileService userProfileService,
            AvatarStorageService avatarStorageService) {
        this.authService = authService;
        this.userProfileService = userProfileService;
        this.avatarStorageService = avatarStorageService;
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

    @GetMapping("/session")
    public Result<Map<String, Object>> session(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Lang", required = false) String headerLang,
            @RequestParam(value = "lang", required = false) String queryLang,
            @RequestHeader(value = "Accept-Language", required = false) String acceptLang) {
        String language = LanguageSupport.determineLanguage(headerLang, queryLang, acceptLang);
        String safeUserId = userId == null ? "" : userId.trim();
        boolean loggedIn = !safeUserId.isEmpty();

        Map<String, Object> data = new LinkedHashMap<String, Object>();
        data.put("loggedIn", loggedIn);
        data.put("userId", loggedIn ? safeUserId : null);
        data.put("phone", loggedIn ? userProfileService.getPhone(safeUserId) : null);
        data.put("profileCompleted", loggedIn && userProfileService.hasCompletedProfile(safeUserId));
        data.put("accountStatus", loggedIn ? "ACTIVE" : null);
        data.put("lang", language);
        return Result.success(data);
    }

    @PostMapping("/profile")
    public Result<Void> completeProfile(
            @RequestHeader(value = "X-User-Id") String userId,
            @Valid @RequestBody AuthProfileRequest request) {
        String normalizedAvatarId = avatarStorageService.normalizeProfileAvatarId(request.getAvatarId());
        userProfileService.upsertProfile(userId, request.getNickname(), normalizedAvatarId);
        return Result.success(null);
    }

    @PostMapping(value = "/avatar-upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Result<Map<String, Object>> uploadAvatar(
            @RequestHeader(value = "X-User-Id") String userId,
            @RequestPart("file") MultipartFile file) {
        String avatarId = avatarStorageService.storeUploadedAvatar(userId, file);
        Map<String, Object> data = new LinkedHashMap<String, Object>();
        data.put("avatarId", avatarId);
        data.put("avatarUrl", avatarId);
        data.put("avatarVersion", avatarStorageService.currentAvatarVersion());
        return Result.success(data);
    }

    @GetMapping("/avatar-files/{filename:.+}")
    public ResponseEntity<Resource> getUploadedAvatar(@PathVariable("filename") String filename) throws Exception {
        Path path = avatarStorageService.resolveUploadedAvatarPath(filename);
        UrlResource resource = new UrlResource(path.toUri());
        String contentType = Files.probeContentType(path);
        if (contentType == null || contentType.trim().isEmpty()) {
            contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .cacheControl(CacheControl.maxAge(7, TimeUnit.DAYS))
                .body(resource);
    }
}

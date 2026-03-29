package com.simtrade.backend.service.impl;

import com.simtrade.backend.dto.AuthSessionResponse;
import com.simtrade.backend.service.AuthService;
import com.simtrade.backend.service.UserProfileService;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class AuthServiceImpl implements AuthService {

    private static final int EXPIRE_MINUTES = 5;
    private static final int RESEND_INTERVAL_SECONDS = 60;
    private static final int CODE_LENGTH = 6;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final Map<String, CodeEntry> codeStore = new ConcurrentHashMap<>();
    private final UserProfileService userProfileService;

    public AuthServiceImpl(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @Override
    public void sendCode(String phone) {
        CodeEntry latest = codeStore.get(phone);
        if (latest != null && !latest.isExpired() && !latest.canResend()) {
            long waitSeconds = RESEND_INTERVAL_SECONDS - latest.secondsSinceSend();
            throw new IllegalArgumentException("发送过于频繁，请稍后再试（" + waitSeconds + "s）");
        }
        String code = generateCode();
        Instant expireAt = Instant.now().plus(EXPIRE_MINUTES, ChronoUnit.MINUTES);
        codeStore.put(phone, new CodeEntry(code, expireAt, Instant.now()));
        // 在本地联调阶段，直接把验证码打印到日志方便手动验证。
        System.out.printf("[auth] sendCode phone=%s code=%s expireAt=%s%n", phone, code, expireAt);
    }

    @Override
    public AuthSessionResponse verifyCode(String phone, String code) {
        CodeEntry entry = codeStore.get(phone);
        if (entry == null || entry.isExpired()) {
            throw new IllegalArgumentException("验证码已失效，请重新获取");
        }
        if (!entry.code.equals(code)) {
            throw new IllegalArgumentException("验证码不正确");
        }
        codeStore.remove(phone);
        // 简单生成一个本地 token，生产环境应替换为 JWT 或会话管理。
        String token = generateToken(phone);
        String userId = getDemoUserId(phone);
        userProfileService.bindPhoneToUser(phone, userId);
        return new AuthSessionResponse(userId, phone, token);
    }

    private String generateCode() {
        int bound = (int) Math.pow(10, CODE_LENGTH);
        int min = (int) Math.pow(10, CODE_LENGTH - 1);
        int value = ThreadLocalRandom.current().nextInt(bound - min) + min;
        return String.valueOf(value);
    }

    private String generateToken(String phone) {
        return phone + "-" + RANDOM.nextLong();
    }

    private String getDemoUserId(String phone) {
        // 暂时返回固定前缀 + 手机尾号，方便前端展示。
        String tail = phone.length() > 4 ? phone.substring(phone.length() - 4) : phone;
        return "u_" + tail;
    }

    private static class CodeEntry {
        private final String code;
        private final Instant expireAt;
        private final Instant sentAt;

        CodeEntry(String code, Instant expireAt, Instant sentAt) {
            this.code = code;
            this.expireAt = expireAt;
            this.sentAt = sentAt;
        }

        boolean isExpired() {
            return Instant.now().isAfter(expireAt);
        }

        boolean canResend() {
            return secondsSinceSend() >= RESEND_INTERVAL_SECONDS;
        }

        long secondsSinceSend() {
            return ChronoUnit.SECONDS.between(sentAt, Instant.now());
        }
    }
}

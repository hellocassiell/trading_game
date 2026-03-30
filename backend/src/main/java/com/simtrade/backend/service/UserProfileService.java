package com.simtrade.backend.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UserProfileService {

    private final Map<String, UserProfile> profileStore = new ConcurrentHashMap<>();
    private final Map<String, String> phoneToUserIdStore = new ConcurrentHashMap<>();

    public void bindPhoneToUser(String phone, String userId) {
        if (isBlank(phone) || isBlank(userId)) {
            return;
        }
        phoneToUserIdStore.put(phone.trim(), userId.trim());
    }

    public void upsertProfile(String userId, String nickname, String avatarId) {
        if (isBlank(userId)) {
            throw new IllegalArgumentException("User ID cannot be blank.");
        }
        String safeUserId = userId.trim();
        UserProfile profile = profileStore.getOrDefault(safeUserId, new UserProfile());
        if (!isBlank(nickname)) {
            profile.nickname = nickname.trim();
        }
        if (!isBlank(avatarId)) {
            profile.avatarId = avatarId.trim();
        }
        profile.updatedAt = Instant.now().toString();
        profileStore.put(safeUserId, profile);
    }

    public String getNickname(String userId) {
        UserProfile profile = profileStore.get(normalizeKey(userId));
        return profile == null ? null : profile.nickname;
    }

    public String getAvatarId(String userId) {
        UserProfile profile = profileStore.get(normalizeKey(userId));
        return profile == null ? null : profile.avatarId;
    }

    public boolean hasCompletedProfile(String userId) {
        UserProfile profile = profileStore.get(normalizeKey(userId));
        if (profile == null) {
            return false;
        }
        return !isBlank(profile.nickname) && !isBlank(profile.avatarId);
    }

    public String getPhone(String userId) {
        String safeUserId = normalizeKey(userId);
        if (safeUserId == null) {
            return null;
        }
        for (Map.Entry<String, String> entry : phoneToUserIdStore.entrySet()) {
            if (safeUserId.equals(entry.getValue())) {
                return entry.getKey();
            }
        }
        return null;
    }

    private String normalizeKey(String value) {
        if (isBlank(value)) {
            return null;
        }
        return value.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private static class UserProfile {
        private String nickname;
        private String avatarId;
        private String updatedAt;
    }
}

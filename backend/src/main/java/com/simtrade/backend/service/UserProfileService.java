package com.simtrade.backend.service;

import com.simtrade.backend.entity.UserProfileEntity;
import com.simtrade.backend.mapper.UserProfileMapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class UserProfileService {

    private static final Logger log = LoggerFactory.getLogger(UserProfileService.class);
    private static final String AUTO_NICKNAME_PREFIX = "参赛者";
    private static final int AUTO_NICKNAME_SUFFIX_BOUND = 10000;

    private final UserProfileMapper userProfileMapper;
    private final Map<String, UserProfile> profileStore = new ConcurrentHashMap<>();
    private final Map<String, String> phoneToUserIdStore = new ConcurrentHashMap<>();

    @Value("${app.user-profile.db-strict-mode:false}")
    private boolean dbStrictMode = false;

    public UserProfileService(@Autowired(required = false) UserProfileMapper userProfileMapper) {
        this.userProfileMapper = userProfileMapper;
    }

    public void bindPhoneToUser(String phone, String userId) {
        if (isBlank(phone) || isBlank(userId)) {
            return;
        }
        String safePhone = phone.trim();
        String safeUserId = userId.trim();
        phoneToUserIdStore.put(safePhone, safeUserId);
        UserProfile profile = profileStore.getOrDefault(safeUserId, new UserProfile());
        if (profile.createdAt == null) {
            profile.createdAt = LocalDateTime.now();
        }
        profile.phone = safePhone;
        profile.updatedAt = LocalDateTime.now();
        profileStore.put(safeUserId, profile);
        upsertDbProfile(safeUserId, dbProfile -> dbProfile.setPhone(safePhone));
    }

    public void upsertProfile(String userId, String nickname, String avatarId) {
        if (isBlank(userId)) {
            throw new IllegalArgumentException("User ID cannot be blank.");
        }
        String safeUserId = userId.trim();
        UserProfile profile = profileStore.getOrDefault(safeUserId, new UserProfile());
        if (profile.createdAt == null) {
            profile.createdAt = LocalDateTime.now();
        }
        if (!isBlank(nickname)) {
            profile.nickname = nickname.trim();
        }
        if (!isBlank(avatarId)) {
            profile.avatarId = avatarId.trim();
        }
        profile.updatedAt = LocalDateTime.now();
        profileStore.put(safeUserId, profile);

        upsertDbProfile(safeUserId, dbProfile -> {
            if (!isBlank(nickname)) {
                dbProfile.setNickname(nickname.trim());
            }
            if (!isBlank(avatarId)) {
                dbProfile.setAvatarId(avatarId.trim());
            }
        });
    }

    public String ensureAutoNickname(String userId) {
        String safeUserId = normalizeKey(userId);
        if (safeUserId == null) {
            throw new IllegalArgumentException("User ID cannot be blank.");
        }
        String existing = getNickname(safeUserId);
        if (!isBlank(existing)) {
            return existing.trim();
        }

        synchronized (this) {
            String latestExisting = getNickname(safeUserId);
            if (!isBlank(latestExisting)) {
                return latestExisting.trim();
            }

            int start = ThreadLocalRandom.current().nextInt(AUTO_NICKNAME_SUFFIX_BOUND);
            for (int offset = 0; offset < AUTO_NICKNAME_SUFFIX_BOUND; offset++) {
                int value = (start + offset) % AUTO_NICKNAME_SUFFIX_BOUND;
                String candidate = AUTO_NICKNAME_PREFIX + String.format("%04d", value);
                if (isNicknameTakenByOtherUser(candidate, safeUserId)) {
                    continue;
                }
                upsertProfile(safeUserId, candidate, null);
                return candidate;
            }
        }

        throw new IllegalStateException("Failed to allocate default nickname.");
    }

    public String getNickname(String userId) {
        String safeUserId = normalizeKey(userId);
        if (safeUserId == null) {
            return null;
        }
        UserProfileEntity dbProfile = selectDbProfile(safeUserId);
        if (dbProfile != null && !isBlank(dbProfile.getNickname())) {
            return dbProfile.getNickname().trim();
        }
        UserProfile profile = profileStore.get(safeUserId);
        return profile == null ? null : profile.nickname;
    }

    public String getAvatarId(String userId) {
        String safeUserId = normalizeKey(userId);
        if (safeUserId == null) {
            return null;
        }
        UserProfileEntity dbProfile = selectDbProfile(safeUserId);
        if (dbProfile != null && !isBlank(dbProfile.getAvatarId())) {
            return dbProfile.getAvatarId().trim();
        }
        UserProfile profile = profileStore.get(safeUserId);
        return profile == null ? null : profile.avatarId;
    }

    public boolean hasCompletedProfile(String userId) {
        String safeUserId = normalizeKey(userId);
        if (safeUserId == null) {
            return false;
        }
        UserProfileEntity dbProfile = selectDbProfile(safeUserId);
        if (dbProfile != null) {
            return !isBlank(dbProfile.getNickname()) && !isBlank(dbProfile.getAvatarId());
        }
        UserProfile profile = profileStore.get(safeUserId);
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
        UserProfileEntity dbProfile = selectDbProfile(safeUserId);
        if (dbProfile != null && !isBlank(dbProfile.getPhone())) {
            return dbProfile.getPhone().trim();
        }
        for (Map.Entry<String, String> entry : phoneToUserIdStore.entrySet()) {
            if (safeUserId.equals(entry.getValue())) {
                return entry.getKey();
            }
        }
        UserProfile profile = profileStore.get(safeUserId);
        if (profile != null && !isBlank(profile.phone)) {
            return profile.phone;
        }
        return null;
    }

    public String findUserIdByPhone(String phone) {
        String safePhone = normalizeKey(phone);
        if (safePhone == null) {
            return null;
        }
        String memoryUserId = phoneToUserIdStore.get(safePhone);
        if (!isBlank(memoryUserId)) {
            return memoryUserId.trim();
        }
        if (userProfileMapper != null) {
            try {
                UserProfileEntity entity = userProfileMapper.selectOne(new QueryWrapper<UserProfileEntity>()
                        .eq("phone", safePhone)
                        .last("LIMIT 1"));
                if (entity != null && !isBlank(entity.getUserId())) {
                    return entity.getUserId().trim();
                }
            } catch (Exception ex) {
                if (dbStrictMode) {
                    throw new IllegalStateException("Load user profile by phone failed.", ex);
                }
                log.warn("Load user profile by phone from db failed, fallback to in-memory. phone={}, reason={}", safePhone, ex.getMessage());
            }
        }
        for (Map.Entry<String, UserProfile> entry : profileStore.entrySet()) {
            UserProfile profile = entry.getValue();
            if (profile != null && safePhone.equals(normalizeKey(profile.phone))) {
                return normalizeKey(entry.getKey());
            }
        }
        return null;
    }

    public List<CompletedProfile> listCompletedProfiles() {
        Map<String, CompletedProfile> profileMap = new LinkedHashMap<>();

        if (userProfileMapper != null) {
            try {
                List<UserProfileEntity> dbProfiles = userProfileMapper.selectList(null);
                if (dbProfiles != null) {
                    for (UserProfileEntity dbProfile : dbProfiles) {
                        if (dbProfile == null || !isLeaderboardEligibleProfile(dbProfile.getNickname())) {
                            continue;
                        }
                        String safeUserId = normalizeKey(dbProfile.getUserId());
                        if (safeUserId == null) {
                            continue;
                        }
                        profileMap.put(safeUserId, new CompletedProfile(safeUserId, dbProfile.getCreatedAt()));
                    }
                }
            } catch (Exception ex) {
                if (dbStrictMode) {
                    throw new IllegalStateException("Load completed user profiles failed.", ex);
                }
                log.warn("Load completed user profiles from db failed, fallback to in-memory. reason={}", ex.getMessage());
            }
        }

        for (Map.Entry<String, UserProfile> entry : profileStore.entrySet()) {
            String safeUserId = normalizeKey(entry.getKey());
            UserProfile profile = entry.getValue();
            if (safeUserId == null || profile == null || !isLeaderboardEligibleProfile(profile.nickname)) {
                continue;
            }
            CompletedProfile existing = profileMap.get(safeUserId);
            if (existing == null || existing.getCreatedAt() == null) {
                profileMap.put(safeUserId, new CompletedProfile(safeUserId, profile.createdAt));
            }
        }

        List<CompletedProfile> profiles = new ArrayList<>(profileMap.values());
        profiles.sort((left, right) -> {
            LocalDateTime leftCreatedAt = left == null ? null : left.getCreatedAt();
            LocalDateTime rightCreatedAt = right == null ? null : right.getCreatedAt();
            if (leftCreatedAt != null && rightCreatedAt != null) {
                int compareCreatedAt = leftCreatedAt.compareTo(rightCreatedAt);
                if (compareCreatedAt != 0) {
                    return compareCreatedAt;
                }
            } else if (leftCreatedAt != null) {
                return -1;
            } else if (rightCreatedAt != null) {
                return 1;
            }
            String leftUserId = left == null ? "" : left.getUserId();
            String rightUserId = right == null ? "" : right.getUserId();
            return leftUserId.compareTo(rightUserId);
        });
        return profiles;
    }

    private String normalizeKey(String value) {
        if (isBlank(value)) {
            return null;
        }
        return value.trim();
    }

    private boolean isLeaderboardEligibleProfile(String nickname) {
        return !isBlank(nickname);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private UserProfileEntity selectDbProfile(String userId) {
        if (userProfileMapper == null) {
            return null;
        }
        try {
            return userProfileMapper.selectById(userId);
        } catch (Exception ex) {
            if (dbStrictMode) {
                throw new IllegalStateException("Load user profile failed.", ex);
            }
            log.warn("Load user profile from db failed, fallback to in-memory. userId={}, reason={}", userId, ex.getMessage());
            return null;
        }
    }

    private boolean isNicknameTakenByOtherUser(String nickname, String excludeUserId) {
        if (isBlank(nickname)) {
            return false;
        }
        String safeNickname = nickname.trim();
        String safeExcludeUserId = normalizeKey(excludeUserId);

        if (userProfileMapper != null) {
            try {
                QueryWrapper<UserProfileEntity> query = new QueryWrapper<UserProfileEntity>()
                        .eq("nickname", safeNickname)
                        .last("LIMIT 1");
                if (safeExcludeUserId != null) {
                    query.ne("user_id", safeExcludeUserId);
                }
                UserProfileEntity matched = userProfileMapper.selectOne(query);
                if (matched != null && !safeNickname.equals(normalizeKey(matched.getNickname()))) {
                    log.warn("Nickname query returned inconsistent data. nickname={}, userId={}", safeNickname, matched.getUserId());
                }
                if (matched != null) {
                    return true;
                }
            } catch (Exception ex) {
                if (dbStrictMode) {
                    throw new IllegalStateException("Check nickname uniqueness failed.", ex);
                }
                log.warn("Check nickname uniqueness from db failed, fallback to in-memory. nickname={}, reason={}", safeNickname, ex.getMessage());
            }
        }

        for (Map.Entry<String, UserProfile> entry : profileStore.entrySet()) {
            String currentUserId = normalizeKey(entry.getKey());
            if (currentUserId == null || currentUserId.equals(safeExcludeUserId)) {
                continue;
            }
            UserProfile profile = entry.getValue();
            if (profile == null || isBlank(profile.nickname)) {
                continue;
            }
            if (safeNickname.equals(profile.nickname.trim())) {
                return true;
            }
        }
        return false;
    }

    private void upsertDbProfile(String userId, java.util.function.Consumer<UserProfileEntity> mutator) {
        if (userProfileMapper == null) {
            return;
        }
        try {
            UserProfileEntity existing = userProfileMapper.selectById(userId);
            LocalDateTime now = LocalDateTime.now();
            if (existing == null) {
                UserProfileEntity created = new UserProfileEntity();
                created.setUserId(userId);
                created.setCreatedAt(now);
                created.setUpdatedAt(now);
                mutator.accept(created);
                userProfileMapper.insert(created);
                return;
            }
            mutator.accept(existing);
            existing.setUpdatedAt(now);
            userProfileMapper.updateById(existing);
        } catch (Exception ex) {
            if (dbStrictMode) {
                throw new IllegalStateException("Persist user profile failed.", ex);
            }
            log.warn("Persist user profile to db failed, fallback to in-memory. userId={}, reason={}", userId, ex.getMessage());
        }
    }

    private static class UserProfile {
        private LocalDateTime createdAt;
        private String phone;
        private String nickname;
        private String avatarId;
        private LocalDateTime updatedAt;
    }

    public static class CompletedProfile {
        private final String userId;
        private final LocalDateTime createdAt;

        public CompletedProfile(String userId, LocalDateTime createdAt) {
            this.userId = userId;
            this.createdAt = createdAt;
        }

        public String getUserId() {
            return userId;
        }

        public LocalDateTime getCreatedAt() {
            return createdAt;
        }
    }
}

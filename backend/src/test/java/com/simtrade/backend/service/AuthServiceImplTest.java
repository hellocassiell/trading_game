package com.simtrade.backend.service;

import com.simtrade.backend.dto.AuthSessionResponse;
import com.simtrade.backend.entity.UserProfileEntity;
import com.simtrade.backend.mapper.UserProfileMapper;
import com.simtrade.backend.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;

class AuthServiceImplTest {

    @Test
    void verifyCode_shouldGenerateDifferentUserIdsForDifferentPhonesWithSameTail() {
        UserProfileMapper mapper = Mockito.mock(UserProfileMapper.class);
        UserProfileService userProfileService = new UserProfileService(mapper);
        AuthServiceImpl authService = new AuthServiceImpl(userProfileService);

        String firstCode = issueCode(authService, "91234567");
        String secondCode = issueCode(authService, "93234567");

        AuthSessionResponse first = authService.verifyCode("91234567", firstCode);
        AuthSessionResponse second = authService.verifyCode("93234567", secondCode);

        Assertions.assertNotEquals(first.getUserId(), second.getUserId());
    }

    @Test
    void verifyCode_shouldReuseExistingUserIdForSamePhone() {
        UserProfileMapper mapper = Mockito.mock(UserProfileMapper.class);
        UserProfileEntity existing = new UserProfileEntity();
        existing.setUserId("u_existing_1001");
        existing.setPhone("91234567");
        existing.setNickname("Alpha");
        existing.setAvatarId("a1");
        Mockito.when(mapper.selectOne(Mockito.any())).thenReturn(existing);
        Mockito.when(mapper.selectById("u_existing_1001")).thenReturn(existing);

        UserProfileService userProfileService = new UserProfileService(mapper);
        AuthServiceImpl authService = new AuthServiceImpl(userProfileService);

        String code = issueCode(authService, "91234567");
        AuthSessionResponse result = authService.verifyCode("91234567", code);

        Assertions.assertEquals("u_existing_1001", result.getUserId());
        Assertions.assertTrue(result.isProfileCompleted());
    }

    @Test
    void verifyCode_shouldAssignUniqueAutoNicknameWhenProfileNotCompleted() {
        UserProfileService userProfileService = new UserProfileService(null);
        AuthServiceImpl authService = new AuthServiceImpl(userProfileService);
        Set<String> nicknames = new HashSet<>();

        for (int i = 0; i < 80; i++) {
            String phone = String.format("9%07d", i);
            String code = issueCode(authService, phone);
            AuthSessionResponse result = authService.verifyCode(phone, code);
            String nickname = userProfileService.getNickname(result.getUserId());

            Assertions.assertFalse(result.isProfileCompleted());
            Assertions.assertTrue(nickname.matches("参赛者\\d{4}"));
            Assertions.assertTrue(nicknames.add(nickname), "Auto nickname duplicated: " + nickname);
        }
    }

    @Test
    void verifyCode_shouldAllowOverrideAutoNickname() {
        UserProfileService userProfileService = new UserProfileService(null);
        AuthServiceImpl authService = new AuthServiceImpl(userProfileService);

        String code = issueCode(authService, "95555555");
        AuthSessionResponse result = authService.verifyCode("95555555", code);
        Assertions.assertTrue(userProfileService.getNickname(result.getUserId()).matches("参赛者\\d{4}"));

        userProfileService.upsertProfile(result.getUserId(), "参赛者9001", null);
        Assertions.assertEquals("参赛者9001", userProfileService.getNickname(result.getUserId()));
    }

    @SuppressWarnings("unchecked")
    private String issueCode(AuthServiceImpl authService, String phone) {
        authService.sendCode(phone);
        Map<String, Object> codeStore = (Map<String, Object>) ReflectionTestUtils.getField(authService, "codeStore");
        Object codeEntry = codeStore.get(phone);
        return (String) ReflectionTestUtils.getField(codeEntry, "code");
    }
}

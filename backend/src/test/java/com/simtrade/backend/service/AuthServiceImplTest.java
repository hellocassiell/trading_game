package com.simtrade.backend.service;

import com.simtrade.backend.dto.AuthSessionResponse;
import com.simtrade.backend.entity.UserProfileEntity;
import com.simtrade.backend.mapper.UserProfileMapper;
import com.simtrade.backend.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Map;

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

    @SuppressWarnings("unchecked")
    private String issueCode(AuthServiceImpl authService, String phone) {
        authService.sendCode(phone);
        Map<String, Object> codeStore = (Map<String, Object>) ReflectionTestUtils.getField(authService, "codeStore");
        Object codeEntry = codeStore.get(phone);
        return (String) ReflectionTestUtils.getField(codeEntry, "code");
    }
}

package com.simtrade.backend.service;

import com.simtrade.backend.entity.UserProfileEntity;
import com.simtrade.backend.mapper.UserProfileMapper;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

class UserProfileServiceTest {

    @Test
    void upsertProfile_shouldPersistToDatabaseWhenMapperAvailable() {
        UserProfileMapper mapper = Mockito.mock(UserProfileMapper.class);
        UserProfileService service = new UserProfileService(mapper);

        Mockito.when(mapper.selectById("u_1001"))
                .thenReturn(null)
                .thenReturn(buildProfile("u_1001", "张三", "a1", "91234567"));

        service.upsertProfile("u_1001", "张三", "a1");

        ArgumentCaptor<UserProfileEntity> insertCaptor = ArgumentCaptor.forClass(UserProfileEntity.class);
        Mockito.verify(mapper).insert(insertCaptor.capture());
        Assertions.assertEquals("u_1001", insertCaptor.getValue().getUserId());
        Assertions.assertEquals("张三", insertCaptor.getValue().getNickname());
        Assertions.assertEquals("a1", insertCaptor.getValue().getAvatarId());

        Assertions.assertEquals("张三", service.getNickname("u_1001"));
        Assertions.assertEquals("a1", service.getAvatarId("u_1001"));
        Assertions.assertTrue(service.hasCompletedProfile("u_1001"));
    }

    @Test
    void bindPhoneToUser_shouldUpdatePhoneInDatabase() {
        UserProfileMapper mapper = Mockito.mock(UserProfileMapper.class);
        UserProfileService service = new UserProfileService(mapper);
        UserProfileEntity existing = buildProfile("u_2001", "李四", "a2", null);

        Mockito.when(mapper.selectById("u_2001"))
                .thenReturn(existing)
                .thenReturn(buildProfile("u_2001", "李四", "a2", "92345678"));

        service.bindPhoneToUser("92345678", "u_2001");

        ArgumentCaptor<UserProfileEntity> updateCaptor = ArgumentCaptor.forClass(UserProfileEntity.class);
        Mockito.verify(mapper).updateById(updateCaptor.capture());
        Assertions.assertEquals("92345678", updateCaptor.getValue().getPhone());
        Assertions.assertEquals("92345678", service.getPhone("u_2001"));
    }

    @Test
    void shouldFallbackToMemoryWhenDatabaseFails() {
        UserProfileMapper mapper = Mockito.mock(UserProfileMapper.class);
        UserProfileService service = new UserProfileService(mapper);
        Mockito.when(mapper.selectById("u_3001")).thenThrow(new RuntimeException("db down"));

        service.bindPhoneToUser("93456789", "u_3001");
        service.upsertProfile("u_3001", "王五", "a3");

        Assertions.assertEquals("王五", service.getNickname("u_3001"));
        Assertions.assertEquals("a3", service.getAvatarId("u_3001"));
        Assertions.assertEquals("93456789", service.getPhone("u_3001"));
        Assertions.assertTrue(service.hasCompletedProfile("u_3001"));
    }

    @Test
    void listCompletedProfiles_shouldReturnCompletedUsersFromDatabaseAndMemory() {
        UserProfileMapper mapper = Mockito.mock(UserProfileMapper.class);
        UserProfileService service = new UserProfileService(mapper);

        UserProfileEntity dbCompleted = buildProfile("u_4001", "Alpha", "a1", "91234567");
        dbCompleted.setCreatedAt(LocalDateTime.of(2026, 3, 29, 9, 0));
        UserProfileEntity dbIncomplete = buildProfile("u_4002", "Beta", null, "92345678");
        dbIncomplete.setCreatedAt(LocalDateTime.of(2026, 3, 30, 9, 0));

        Mockito.when(mapper.selectList(null)).thenReturn(Arrays.asList(dbCompleted, dbIncomplete));

        service.bindPhoneToUser("93456789", "u_4003");
        service.upsertProfile("u_4003", "Gamma", "a3");

        List<UserProfileService.CompletedProfile> completedProfiles = service.listCompletedProfiles();

        Assertions.assertEquals(2, completedProfiles.size());
        Assertions.assertEquals("u_4001", completedProfiles.get(0).getUserId());
        Assertions.assertEquals("u_4003", completedProfiles.get(1).getUserId());
    }

    @Test
    void getNickname_whenDbReadFailsAndStrictModeEnabled_shouldThrow() {
        UserProfileMapper mapper = Mockito.mock(UserProfileMapper.class);
        UserProfileService service = new UserProfileService(mapper);
        ReflectionTestUtils.setField(service, "dbStrictMode", true);

        Mockito.when(mapper.selectById("u_strict_02"))
                .thenThrow(new RuntimeException("db down"));

        IllegalStateException ex = Assertions.assertThrows(
                IllegalStateException.class,
                () -> service.getNickname("u_strict_02")
        );
        Assertions.assertTrue(ex.getMessage().contains("Load user profile failed."));
    }

    @Test
    void findUserIdByPhone_whenDbReadFailsAndStrictModeEnabled_shouldThrow() {
        UserProfileMapper mapper = Mockito.mock(UserProfileMapper.class);
        UserProfileService service = new UserProfileService(mapper);
        ReflectionTestUtils.setField(service, "dbStrictMode", true);

        Mockito.when(mapper.selectOne(Mockito.any()))
                .thenThrow(new RuntimeException("db down"));

        IllegalStateException ex = Assertions.assertThrows(
                IllegalStateException.class,
                () -> service.findUserIdByPhone("91234567")
        );
        Assertions.assertTrue(ex.getMessage().contains("Load user profile by phone failed."));
    }

    @Test
    void listCompletedProfiles_whenDbReadFailsAndStrictModeEnabled_shouldThrow() {
        UserProfileMapper mapper = Mockito.mock(UserProfileMapper.class);
        UserProfileService service = new UserProfileService(mapper);
        ReflectionTestUtils.setField(service, "dbStrictMode", true);

        Mockito.when(mapper.selectList(null))
                .thenThrow(new RuntimeException("db down"));

        IllegalStateException ex = Assertions.assertThrows(
                IllegalStateException.class,
                service::listCompletedProfiles
        );
        Assertions.assertTrue(ex.getMessage().contains("Load completed user profiles failed."));
    }

    @Test
    void upsertProfile_whenDbWriteFailsAndStrictModeEnabled_shouldThrow() {
        UserProfileMapper mapper = Mockito.mock(UserProfileMapper.class);
        UserProfileService service = new UserProfileService(mapper);
        ReflectionTestUtils.setField(service, "dbStrictMode", true);

        Mockito.when(mapper.selectById("u_strict_write_01")).thenReturn(null);
        Mockito.doThrow(new RuntimeException("db down"))
                .when(mapper).insert(Mockito.any(UserProfileEntity.class));

        IllegalStateException ex = Assertions.assertThrows(
                IllegalStateException.class,
                () -> service.upsertProfile("u_strict_write_01", "严格模式", "a1")
        );
        Assertions.assertTrue(ex.getMessage().contains("Persist user profile failed."));
    }

    private UserProfileEntity buildProfile(String userId, String nickname, String avatarId, String phone) {
        UserProfileEntity profile = new UserProfileEntity();
        profile.setUserId(userId);
        profile.setNickname(nickname);
        profile.setAvatarId(avatarId);
        profile.setPhone(phone);
        return profile;
    }
}

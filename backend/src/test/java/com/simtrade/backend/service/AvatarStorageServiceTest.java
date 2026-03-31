package com.simtrade.backend.service;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;

class AvatarStorageServiceTest {

    @Test
    void normalizeProfileAvatarId_shouldAcceptPresetAndUploadedPath() {
        AvatarStorageService service = new AvatarStorageService("target/test-avatar-store-1");

        Assertions.assertEquals("a1", service.normalizeProfileAvatarId("a1"));
        Assertions.assertEquals(
                "/api/v1/auth/avatar-files/u_1001_001.png",
                service.normalizeProfileAvatarId("/api/v1/auth/avatar-files/u_1001_001.png")
        );
    }

    @Test
    void normalizeProfileAvatarId_shouldRejectUnknownValue() {
        AvatarStorageService service = new AvatarStorageService("target/test-avatar-store-2");

        Assertions.assertThrows(
                IllegalArgumentException.class,
                () -> service.normalizeProfileAvatarId("remote-avatar")
        );
    }

    @Test
    void storeUploadedAvatar_shouldPersistFile() throws Exception {
        Path tempDir = Files.createTempDirectory("avatar-store-test");
        AvatarStorageService service = new AvatarStorageService(tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "avatar.png",
                "image/png",
                new byte[]{1, 2, 3, 4, 5}
        );

        String avatarId = service.storeUploadedAvatar("u_3001", file);

        Assertions.assertTrue(avatarId.startsWith("/api/v1/auth/avatar-files/"));
        String filename = avatarId.substring("/api/v1/auth/avatar-files/".length());
        Path storedFile = service.resolveUploadedAvatarPath(filename);
        Assertions.assertTrue(Files.exists(storedFile));
        Assertions.assertTrue(Files.size(storedFile) > 0);
    }
}

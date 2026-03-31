package com.simtrade.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class AvatarStorageService {

    private static final Set<String> PRESET_AVATAR_IDS = new HashSet<String>(Arrays.asList("a1", "a2", "a3", "a4", "a5", "a6"));
    private static final Set<String> ALLOWED_CONTENT_TYPES = new HashSet<String>(Arrays.asList(
            "image/png",
            "image/jpeg",
            "image/webp",
            "image/gif"
    ));
    private static final Pattern STORED_AVATAR_PATH = Pattern.compile("^/api/v1/auth/avatar-files/[A-Za-z0-9._-]+$");
    private static final Pattern SAFE_FILENAME = Pattern.compile("^[A-Za-z0-9._-]+$");
    private static final long MAX_UPLOAD_SIZE_BYTES = 2L * 1024L * 1024L;
    private static final int AVATAR_VERSION = 1;

    private final Path uploadDir;

    public AvatarStorageService(@Value("${app.avatar.upload-dir:uploads/avatars}") String uploadDir) {
        Path safePath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(safePath);
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to initialize avatar upload directory.", ex);
        }
        this.uploadDir = safePath;
    }

    public String normalizeProfileAvatarId(String avatarId) {
        if (avatarId == null || avatarId.trim().isEmpty()) {
            throw new IllegalArgumentException("Avatar is required.");
        }
        String raw = avatarId.trim();
        if (PRESET_AVATAR_IDS.contains(raw)) {
            return raw;
        }
        if (raw.startsWith("/avatars/")) {
            return raw;
        }
        if (STORED_AVATAR_PATH.matcher(raw).matches()) {
            return raw;
        }
        throw new IllegalArgumentException("Unsupported avatar identifier.");
    }

    public String storeUploadedAvatar(String userId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Avatar file is required.");
        }
        if (file.getSize() > MAX_UPLOAD_SIZE_BYTES) {
            throw new IllegalArgumentException("Avatar file size must be <= 2MB.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new IllegalArgumentException("Unsupported avatar format. Please upload PNG/JPG/WEBP/GIF.");
        }

        String safeUserId = normalizeUserId(userId);
        String extension = extensionByContentType(contentType);
        String filename = safeUserId + "_" + Instant.now().toEpochMilli() + "_" + UUID.randomUUID().toString().substring(0, 8) + extension;
        Path destination = uploadDir.resolve(filename).normalize();
        if (!destination.startsWith(uploadDir)) {
            throw new IllegalArgumentException("Invalid avatar file path.");
        }
        try {
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new IllegalArgumentException("Failed to store avatar file.");
        }
        return "/api/v1/auth/avatar-files/" + filename;
    }

    public Path resolveUploadedAvatarPath(String filename) {
        if (filename == null || filename.trim().isEmpty() || !SAFE_FILENAME.matcher(filename).matches()) {
            throw new IllegalArgumentException("Invalid avatar filename.");
        }
        Path path = uploadDir.resolve(filename).normalize();
        if (!path.startsWith(uploadDir)) {
            throw new IllegalArgumentException("Invalid avatar filename.");
        }
        if (!Files.exists(path)) {
            throw new IllegalArgumentException("Avatar file not found.");
        }
        return path;
    }

    public String resolveAvatarForView(String avatarId) {
        if (avatarId == null || avatarId.trim().isEmpty()) {
            return "/avatars/default.svg";
        }
        String raw = avatarId.trim();
        if (PRESET_AVATAR_IDS.contains(raw)) {
            return "/avatars/" + raw + ".svg";
        }
        if (raw.startsWith("/avatars/")) {
            return raw;
        }
        if (STORED_AVATAR_PATH.matcher(raw).matches()) {
            return raw;
        }
        return "/avatars/default.svg";
    }

    public int currentAvatarVersion() {
        return AVATAR_VERSION;
    }

    private String normalizeUserId(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            return "user";
        }
        return userId.trim().replaceAll("[^A-Za-z0-9_-]", "_");
    }

    private String extensionByContentType(String contentType) {
        String normalized = contentType.toLowerCase(Locale.ROOT);
        if ("image/png".equals(normalized)) {
            return ".png";
        }
        if ("image/jpeg".equals(normalized)) {
            return ".jpg";
        }
        if ("image/webp".equals(normalized)) {
            return ".webp";
        }
        if ("image/gif".equals(normalized)) {
            return ".gif";
        }
        return ".img";
    }
}

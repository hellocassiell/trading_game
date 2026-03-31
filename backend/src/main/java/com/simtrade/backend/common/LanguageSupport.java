package com.simtrade.backend.common;

import java.util.Arrays;
import java.util.List;

public final class LanguageSupport {

    public static final String DEFAULT_LANG = "zh-Hant";
    public static final String LANG_ZH_HANT = "zh-Hant";
    public static final String LANG_ZH_HANS = "zh-Hans";
    public static final String LANG_EN = "en";
    private static final List<String> SUPPORTED_LANGS = Arrays.asList("zh-Hant", "zh-Hans", "en");

    private LanguageSupport() {}

    public static String determineLanguage(String headerLang, String queryLang, String acceptLang) {
        String normalized = normalizeLang(headerLang);
        if (normalized != null) {
            return normalized;
        }
        normalized = normalizeLang(queryLang);
        if (normalized != null) {
            return normalized;
        }
        normalized = matchAcceptLanguage(acceptLang);
        if (normalized != null) {
            return normalized;
        }
        return DEFAULT_LANG;
    }

    public static String normalizeOrDefault(String candidate) {
        String normalized = normalizeLang(candidate);
        return normalized == null ? DEFAULT_LANG : normalized;
    }

    public static boolean isEnglish(String language) {
        return LANG_EN.equalsIgnoreCase(normalizeOrDefault(language));
    }

    public static boolean isSimplifiedChinese(String language) {
        return LANG_ZH_HANS.equalsIgnoreCase(normalizeOrDefault(language));
    }

    public static boolean isTraditionalChinese(String language) {
        return LANG_ZH_HANT.equalsIgnoreCase(normalizeOrDefault(language));
    }

    public static String text(String language, String zhHant, String zhHans, String en) {
        String normalized = normalizeOrDefault(language);
        if (LANG_EN.equalsIgnoreCase(normalized)) {
            return en;
        }
        if (LANG_ZH_HANS.equalsIgnoreCase(normalized)) {
            return zhHans;
        }
        return zhHant;
    }

    private static String normalizeLang(String candidate) {
        if (candidate == null) {
            return null;
        }
        String trimmed = candidate.trim();
        for (String supported : SUPPORTED_LANGS) {
            if (supported.equalsIgnoreCase(trimmed)) {
                return supported;
            }
        }
        return null;
    }

    private static String matchAcceptLanguage(String acceptLanguage) {
        if (acceptLanguage == null) {
            return null;
        }
        String lower = acceptLanguage.toLowerCase();
        if (lower.contains("zh-hant") || lower.contains("zh-tw") || lower.contains("zh-hk")) {
            return LANG_ZH_HANT;
        }
        if (lower.contains("zh-hans") || lower.contains("zh-cn")) {
            return LANG_ZH_HANS;
        }
        if (lower.contains("en")) {
            return LANG_EN;
        }
        return null;
    }
}

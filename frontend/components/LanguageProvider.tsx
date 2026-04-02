"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AppLanguage,
  DEFAULT_LANGUAGE,
  LANGUAGE_LABELS,
  normalizeAppLanguage,
  translate,
  writeStoredLanguage,
} from "../lib/locale";

type LanguageContextValue = {
  language: AppLanguage;
  setLanguage: (next: AppLanguage) => void;
  t: (key: string) => string;
  languageLabel: string;
  options: readonly { value: AppLanguage; label: string }[];
  languageReady: boolean;  // 新增：语言状态是否已就绪
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  children,
  initialLanguage = DEFAULT_LANGUAGE,
}: {
  children: ReactNode;
  initialLanguage?: AppLanguage;
}) {
  const searchParams = useSearchParams();
  const [storedLanguage, setStoredLanguage] = useState<AppLanguage>(initialLanguage);
  const queryLanguage = normalizeAppLanguage(searchParams.get("lang"));
  const language = queryLanguage ?? storedLanguage;
  const languageReady = true;

  useEffect(() => {
    writeStoredLanguage(language);
    document.documentElement.lang = language;
  }, [language, languageReady]);

  const value = useMemo<LanguageContextValue>(() => {
    return {
      language,
      setLanguage: (next) => setStoredLanguage(next),
      t: (key: string) => translate(language, key),
      languageLabel: LANGUAGE_LABELS[language] ?? LANGUAGE_LABELS[DEFAULT_LANGUAGE],
      options: Object.keys(LANGUAGE_LABELS).map((value) => ({
        value: value as AppLanguage,
        label: LANGUAGE_LABELS[value as AppLanguage],
      })),
      languageReady,
    };
  }, [language, languageReady]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}

export function useTranslation() {
  return useLanguage().t;
}

export function useLanguageOptions() {
  return useLanguage().options;
}

export function useLanguageLabel() {
  return useLanguage().languageLabel;
}

export function useLanguageReady() {
  return useLanguage().languageReady;
}

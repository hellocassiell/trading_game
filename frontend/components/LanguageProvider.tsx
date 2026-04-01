"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import {
  AppLanguage,
  DEFAULT_LANGUAGE,
  LANGUAGE_LABELS,
  SUPPORTED_LANGUAGES,
  detectBrowserLanguage,
  readStoredLanguage,
  translate,
  writeStoredLanguage,
} from "../lib/locale";

type LanguageContextValue = {
  language: AppLanguage;
  setLanguage: (next: AppLanguage) => void;
  t: (key: string) => string;
  languageLabel: string;
  options: readonly { value: AppLanguage; label: string }[];
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    const stored = readStoredLanguage();
    return stored !== DEFAULT_LANGUAGE ? stored : detectBrowserLanguage();
  });

  useEffect(() => {
    writeStoredLanguage(language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => {
    return {
      language,
      setLanguage: (next) => setLanguageState(next),
      t: (key: string) => translate(language, key),
      languageLabel: LANGUAGE_LABELS[language] ?? LANGUAGE_LABELS[DEFAULT_LANGUAGE],
      options: SUPPORTED_LANGUAGES.map((value) => ({ value, label: LANGUAGE_LABELS[value] })),
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
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

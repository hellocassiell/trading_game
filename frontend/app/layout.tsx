import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";

import AppFrame from "../components/AppFrame";
import { TradeModalProvider } from "../components/TradeModal";
import { LanguageProvider } from "../components/LanguageProvider";
import { AUTH_SESSION_COOKIE_KEY, hasAuthSessionCookie } from "../lib/auth-session";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  normalizeAppLanguage,
} from "../lib/locale";
import "./globals.css";

export const metadata: Metadata = {
  title: "智财投资大赛2026",
  description: "港股模拟交易移动端高保真原型",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#f38b1b",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  const cookieStore = await cookies();
  const initialLanguage =
    normalizeAppLanguage(cookieStore.get(LANGUAGE_STORAGE_KEY)?.value) ?? DEFAULT_LANGUAGE;
  const initialLoggedIn = hasAuthSessionCookie(cookieStore.get(AUTH_SESSION_COOKIE_KEY)?.value);

  return (
    <html lang={initialLanguage}>
      <body className="min-h-screen antialiased">
        <LanguageProvider initialLanguage={initialLanguage}>
          <TradeModalProvider>
            <AppFrame initialLoggedIn={initialLoggedIn}>{children}</AppFrame>
          </TradeModalProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

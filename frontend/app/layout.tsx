import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import AppFrame from "../components/AppFrame";
import { TradeModalProvider } from "../components/TradeModal";
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

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">
        <TradeModalProvider>
          <AppFrame>{children}</AppFrame>
        </TradeModalProvider>
      </body>
    </html>
  );
}

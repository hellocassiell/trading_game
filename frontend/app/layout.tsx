import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import BottomNav from "../components/BottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "智财美股投资大赛",
  description: "移动端 H5 模拟交易应用",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#2563eb",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-slate-100 text-slate-900 antialiased">
        <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-[#f3f6fb] shadow-none md:overflow-hidden md:shadow-xl">
          <main className="min-h-0 flex-1 overflow-y-auto pb-24 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {children}
          </main>

          <BottomNav />
        </div>
      </body>
    </html>
  );
}

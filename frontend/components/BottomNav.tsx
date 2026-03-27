"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  ChartCandlestick,
  House,
  Medal,
  UserRound,
} from "lucide-react";

const navItems = [
  {
    label: "主页",
    href: "/",
    icon: House,
  },
  {
    label: "个人",
    href: "/profile",
    icon: UserRound,
  },
  {
    label: "排行",
    href: "/ranking",
    icon: Medal,
  },
  {
    label: "助手",
    href: "/assistant",
    icon: Bot,
  },
  {
    label: "交易",
    href: "/trade",
    icon: ChartCandlestick,
  },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  if (
    pathname.startsWith("/assistant") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/guest") ||
    pathname.startsWith("/trade") ||
    pathname.startsWith("/market")
  ) {
    return null;
  }

  const activeHref = (() => {
    if (
      pathname.startsWith("/profile") ||
      pathname.startsWith("/positions") ||
      pathname.startsWith("/records")
    ) {
      return "/profile";
    }
    if (pathname.startsWith("/ranking")) {
      return "/ranking";
    }
    if (pathname.startsWith("/assistant")) {
      return "/assistant";
    }
    if (pathname.startsWith("/trade")) {
      return "/trade";
    }
    if (pathname.startsWith("/market")) {
      return "/";
    }
    return "/";
  })();

  return (
    <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 pb-[env(safe-area-inset-bottom)]">
      <div className="overflow-hidden border-t border-[#dce5f4] bg-white/98 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur md:rounded-t-[18px] md:border md:border-b-0">
        <ul className="grid h-[60px] grid-cols-5 items-center px-1">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = href === activeHref;
            const isTrade = label === "交易";
            const itemColor = isActive ? "text-[#2b5ce5]" : "text-slate-400";

            return (
              <li key={label} className="flex justify-center">
                <Link
                  href={href}
                  className={
                    isTrade
                      ? `flex h-8 min-w-[56px] items-center justify-center rounded-full px-3 text-[11px] font-semibold text-white shadow-[0_8px_18px_rgba(43,92,229,0.3)] ${
                          isActive ? "bg-[#1e4fd7]" : "bg-[#2b5ce5]"
                        }`
                      : `relative flex h-full flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition ${itemColor}`
                  }
                >
                  {isTrade ? (
                    <span>{label}</span>
                  ) : (
                    <>
                      {isActive ? (
                        <span className="absolute top-[6px] h-1 w-1 rounded-full bg-[#2b5ce5]" />
                      ) : null}
                      <Icon
                        className="h-[18px] w-[18px]"
                        strokeWidth={isActive ? 2.2 : 1.9}
                      />
                      <span>{label}</span>
                    </>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

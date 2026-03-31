"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ClipboardList, House, Menu, UserRound } from "lucide-react";

import { readAuthSession } from "../lib/adapters/auth";
import { useTranslation } from "../components/LanguageProvider";
import { useTradeModal } from "./TradeModal";

const navItems = [
  { href: "/", icon: House, labelKey: "nav.home" },
  { href: "/profile", icon: UserRound, labelKey: "nav.profile" },
  { href: "/records", icon: ClipboardList, labelKey: "nav.records" },
  { href: "/more", icon: Menu, labelKey: "nav.more" },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { openTrade } = useTradeModal();
  const t = useTranslation();

  const activeHref = (() => {
    if (pathname.startsWith("/profile")) {
      return "/profile";
    }
    if (pathname.startsWith("/records")) {
      return "/records";
    }
    if (pathname.startsWith("/more")) {
      return "/more";
    }
    return "/";
  })();

  function isLoggedIn() {
    const session = readAuthSession();
    return Boolean(session?.userId || session?.phone);
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30">
      <div className="mx-auto w-full max-w-[430px]">
        <div className="relative overflow-visible border-t border-[rgba(238,223,206,0.96)] bg-[linear-gradient(180deg,rgba(255,255,255,0.99)_0%,rgba(255,250,244,0.99)_100%)] px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-1.5 shadow-[0_-8px_20px_rgba(171,86,0,0.08)] backdrop-blur">
          <div className="grid grid-cols-5 items-end gap-1">
            {navItems.map(({ labelKey, href, icon: Icon }) => {
              const label = t(labelKey);
              const isActive = activeHref === href;

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={(event) => {
                    const requiresLogin = href === "/profile" || href === "/records" || href === "/more";
                    if (requiresLogin && !isLoggedIn()) {
                      event.preventDefault();
                      router.push("/guest");
                    }
                  }}
                  className={`nav-item flex flex-col items-center justify-center gap-0.5 rounded-[12px] px-1 text-label transition-all ${
                    isActive
                      ? "bg-[linear-gradient(180deg,var(--app-orange-soft),#ffffff)] text-[var(--app-orange-dark)] shadow-[0_10px_20px_rgba(243,139,27,0.12)]"
                      : "text-[var(--app-nav-muted)]"
                  }`}
                >
                  <span
                    className={`h-0.5 w-4 rounded-full transition-opacity ${
                      isActive
                        ? "bg-[var(--app-orange)] opacity-100"
                        : "opacity-0"
                    }`}
                  />
                  <Icon
                    className="h-[17px] w-[17px]"
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                  <span>{label}</span>
                </Link>
              );
            })}

            <button
              type="button"
              onClick={() => {
                if (!isLoggedIn()) {
                  router.push("/guest");
                  return;
                }
                openTrade();
              }}
              className="flex h-12 mb-1 w-full items-center justify-center rounded-full bg-[linear-gradient(180deg,#ffb55c_0%,var(--app-orange)_58%,var(--app-orange-dark)_100%)] px-1 text-label font-black tracking-[0.08em] text-white shadow-[0_8px_14px_rgba(243,139,27,0.24)] transition-transform active:scale-[0.98]"
            >
              <span>{t("nav.trade")}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

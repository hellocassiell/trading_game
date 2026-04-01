"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { readAuthSession } from "../lib/adapters/auth";
import BottomNav from "./BottomNav";

type AppFrameProps = {
  children: ReactNode;
};

function shouldHideBottomNav(pathname: string) {
  return (
    pathname.startsWith("/guest") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/assistant") ||
    pathname.startsWith("/market") ||
    pathname.startsWith("/trade/")
  );
}

function isPublicRoute(pathname: string) {
  return pathname === "/guest" || pathname.startsWith("/auth");
}

export default function AppFrame({ children }: AppFrameProps) {
  const pathname = usePathname();
  const router = useRouter();
  const hideBottomNav = shouldHideBottomNav(pathname);
  const publicRoute = isPublicRoute(pathname);
  const session = readAuthSession();
  const loggedIn = Boolean(session?.userId || session?.phone);

  useEffect(() => {
    if (!publicRoute && !loggedIn) {
      router.replace("/guest");
    }
  }, [loggedIn, publicRoute, router]);

  if (!publicRoute && !loggedIn) {
    return null;
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col overflow-x-hidden bg-transparent">
      <main
        className={`min-h-0 flex-1 overflow-x-hidden overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          hideBottomNav ? "" : "pb-[calc(env(safe-area-inset-bottom)_+_92px)]"
        }`}
      >
        {children}
      </main>
      {!hideBottomNav ? <BottomNav /> : null}
    </div>
  );
}

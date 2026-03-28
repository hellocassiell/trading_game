"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import BottomNav from "./BottomNav";

type AppFrameProps = {
  children: ReactNode;
};

function shouldHideBottomNav(pathname: string) {
  return (
    pathname.startsWith("/guest") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/assistant") ||
    pathname.startsWith("/market")
  );
}

export default function AppFrame({ children }: AppFrameProps) {
  const pathname = usePathname();
  const hideBottomNav = shouldHideBottomNav(pathname);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col overflow-x-hidden bg-transparent">
      <main
        className={`min-h-0 flex-1 overflow-x-hidden overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          hideBottomNav ? "" : "pb-[calc(env(safe-area-inset-bottom)_+_88px)]"
        }`}
      >
        {children}
      </main>
      {!hideBottomNav ? <BottomNav /> : null}
    </div>
  );
}

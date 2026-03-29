import type { ReactNode } from "react";

type AppScreenProps = {
  children: ReactNode;
  className?: string;
};

export default function AppScreen({
  children,
  className = "",
}: AppScreenProps) {
  return (
    <div
      className={`min-h-full bg-transparent px-[var(--app-gutter)] pb-4 pt-[max(env(safe-area-inset-top),0px)] text-[var(--app-text)] ${className}`}
    >
      {children}
    </div>
  );
}

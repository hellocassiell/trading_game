import type { ReactNode } from "react";

type SurfaceCardProps = {
  children: ReactNode;
  className?: string;
  padded?: boolean;
  tone?: "soft" | "flat";
};

export default function SurfaceCard({
  children,
  className = "",
  padded = true,
  tone = "soft",
}: SurfaceCardProps) {
  const toneClass =
    tone === "flat"
      ? "border border-[var(--app-border)] bg-[var(--app-card)] shadow-[0_8px_18px_rgba(171,86,0,0.05)]"
      : "app-panel";

  return (
    <div
      className={`${toneClass} overflow-hidden rounded-[12px] ${
        padded ? "px-4 py-3.5" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

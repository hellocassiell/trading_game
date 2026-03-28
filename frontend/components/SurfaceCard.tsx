import type { ReactNode } from "react";

type SurfaceCardProps = {
  children: ReactNode;
  className?: string;
  padded?: boolean;
};

export default function SurfaceCard({
  children,
  className = "",
  padded = true,
}: SurfaceCardProps) {
  return (
    <div
      className={`app-panel overflow-hidden rounded-[16px] ${
        padded ? "px-4 py-3.5" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

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
      className={`rounded-[4px] border border-[#dce5f4] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${
        padded ? "px-2.5 py-2" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

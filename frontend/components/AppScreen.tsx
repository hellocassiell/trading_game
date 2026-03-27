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
    <div className={`space-y-2 bg-[#f5f7fb] text-[#4b5563] ${className}`}>
      {children}
    </div>
  );
}

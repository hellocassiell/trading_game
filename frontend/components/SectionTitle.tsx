import Link from "next/link";
import { ChevronRight } from "lucide-react";

type SectionTitleProps = {
  title: string;
  href?: string;
  actionLabel?: string;
};

export default function SectionTitle({
  title,
  href,
  actionLabel,
}: SectionTitleProps) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--app-orange)]" />
        <h2 className="text-[13px] font-bold tracking-[0.01em] text-[#4a576a]">
          {title}
        </h2>
      </div>
      {href && actionLabel ? (
        <Link
          href={href}
          className="inline-flex items-center gap-0.5 text-[10px] font-medium text-[var(--app-orange-dark)]"
        >
          {actionLabel}
          <ChevronRight className="h-3 w-3" />
        </Link>
      ) : null}
    </div>
  );
}

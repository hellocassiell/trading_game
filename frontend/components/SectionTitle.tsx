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
    <div className="mb-2.5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[var(--app-orange)]" />
        <h2 className="text-title tracking-[0.01em] text-[#3a2718]">
          {title}
        </h2>
      </div>
      {href && actionLabel ? (
        <Link
          href={href}
          className="inline-flex items-center gap-0.5 text-label text-[var(--app-orange-dark)]"
        >
          {actionLabel}
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}

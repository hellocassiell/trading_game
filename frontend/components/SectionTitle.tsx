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
    <div className="mb-1.5 flex items-center justify-between px-0.5">
      <h2 className="text-[11px] font-semibold text-[#4b5563]">{title}</h2>
      {href && actionLabel ? (
        <Link
          href={href}
          className="flex items-center gap-0.5 text-[9px] font-medium text-[#75a0ff]"
        >
          {actionLabel}
          <ChevronRight className="h-3 w-3" />
        </Link>
      ) : null}
    </div>
  );
}

import Link from "next/link";

type TabItem = {
  label: string;
  active?: boolean;
  href?: string;
};

type SubTabsProps = {
  tabs: TabItem[];
  variant?: "pill" | "underline";
  className?: string;
};

export default function SubTabs({
  tabs,
  variant = "pill",
  className = "",
}: SubTabsProps) {
  if (variant === "underline") {
    return (
      <div className={`app-scrollbar-hide flex items-center gap-5 overflow-x-auto pb-1 ${className}`}>
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            href={tab.href ?? "#"}
            className={`relative shrink-0 pb-2 text-[12px] font-medium ${
              tab.active ? "text-[var(--app-orange-dark)]" : "text-[var(--app-text-muted)]"
            }`}
          >
            {tab.label}
            {tab.active ? (
              <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-[var(--app-orange)]" />
            ) : null}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className={`app-scrollbar-hide flex flex-nowrap items-center gap-1.5 overflow-x-auto ${className}`}>
      {tabs.map((tab) => (
        <Link
          key={tab.label}
          href={tab.href ?? "#"}
          className={`shrink-0 rounded-full border px-3 py-1 text-[10px] font-medium transition ${
            tab.active
              ? "border-[rgba(243,139,27,0.22)] bg-[var(--app-orange-soft)] text-[var(--app-orange-dark)]"
              : "border-[#f1e8dd] bg-[#fffaf4] text-[var(--app-text-muted)]"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}

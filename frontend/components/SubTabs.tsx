type TabItem = {
  label: string;
  active?: boolean;
};

export default function SubTabs({ tabs }: { tabs: TabItem[] }) {
  return (
    <div className="flex items-center gap-1 text-[8px]">
      {tabs.map((tab) => (
        <button
          key={tab.label}
          type="button"
          className={
            tab.active
              ? "rounded-full bg-[#edf4ff] px-2 py-0.5 font-semibold text-[#4976e8]"
              : "rounded-full bg-[#f3f5f9] px-2 py-0.5 text-[#9aa4b3]"
          }
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

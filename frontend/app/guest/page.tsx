import Link from "next/link";
import AppScreen from "../../components/AppScreen";
import { getGuestLandingViewModel } from "../../lib/adapters/auth";

export default function GuestPage() {
  const viewModel = getGuestLandingViewModel();

  return (
    <AppScreen className="!px-0 !pb-0">
      <div className="min-h-[100dvh] bg-[linear-gradient(180deg,#ffeedf_0%,#ffe2c7_52%,#ffd5a8_100%)] text-[#2c1c0d]">
        <div className="px-4 pb-10 pt-[max(env(safe-area-inset-top),14px)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black tracking-[0.3em] text-[#b36a1c]">
              {viewModel.brand}
            </span>
            <span className="text-[11px] font-semibold text-[#b36a1c]">{viewModel.sponsor}</span>
          </div>
          <div className="mt-4 space-y-1">
            <p className="text-[13px] font-semibold uppercase tracking-[0.25em] text-[#b36a1c]">
              港股模拟交易大赛
            </p>
            <h1 className="text-[28px] font-black leading-tight text-[#2a1a10]">
              {viewModel.heroTitle}
            </h1>
            <p className="text-[14px] font-semibold text-[#5d4531]">{viewModel.heroSubtitle}</p>
            <p className="text-[11px] leading-relaxed text-[#7f6751]">{viewModel.heroDescription}</p>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {viewModel.stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[18px] bg-white/80 px-4 py-3 text-center shadow-[0_14px_28px_rgba(243,139,27,0.18)]"
              >
                <p className="text-[10px] font-black tracking-[0.2em] text-[#c39254]">
                  {stat.label}
                </p>
                <p className="mt-2 text-[20px] font-black leading-none text-[#2a1b12]">
                  {stat.value}
                </p>
                <p className="mt-1 text-[10px] text-[#8b6e51]">{stat.note}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {viewModel.summaryHighlights.map((item) => (
              <div
                key={item.label}
                className="rounded-[18px] bg-[#fff3e5] px-4 py-3 shadow-[0_12px_28px_rgba(255,140,26,0.2)]"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#b36a1c]">
                  {item.label}
                </p>
                <p className="mt-1 text-[18px] font-black text-[#2c1c0d]">{item.value}</p>
                <p className="text-[11px] text-[#6d553b]">{item.sub}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            {viewModel.features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-[16px] border border-[#f2d8b3] bg-white/80 px-4 py-3 text-sm text-[#4f3d2d]"
              >
                <p className="text-[12px] font-black text-[#3c2c21]">{feature.title}</p>
                <p className="text-[11px] text-[#6d553b]">{feature.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href={viewModel.primaryAction.href}
              className="inline-flex items-center justify-center rounded-full bg-[var(--app-orange)] px-6 py-3 text-[15px] font-black text-white shadow-[0_16px_28px_rgba(255,140,26,0.28)]"
            >
              {viewModel.primaryAction.label}
            </Link>
            <Link
              href={viewModel.secondaryAction.href}
              className="inline-flex items-center justify-center rounded-full border border-[#f1dec7] bg-white px-6 py-3 text-[13px] font-semibold text-[#b36a1c]"
            >
              {viewModel.secondaryAction.label}
            </Link>
          </div>
        </div>

        <div className="border-t border-[#f2dec6] px-4 py-4 text-[10px] text-[#9a8a78]">
          {viewModel.footnote}
        </div>
      </div>
    </AppScreen>
  );
}

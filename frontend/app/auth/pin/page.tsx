import AppScreen from "../../../components/AppScreen";
import { getAuthPinViewModel } from "../../../lib/adapters/auth";

export default function AuthPinPage() {
  const viewModel = getAuthPinViewModel();

  return (
    <AppScreen className="!px-0 !pb-0">
      <div className="min-h-[100dvh] bg-[linear-gradient(180deg,#fff7ec_0%,#ffe8cf_60%,#ffd5a8_100%)] text-[#2f1f12]">
        <div className="px-4 pb-10 pt-[max(env(safe-area-inset-top),14px)] text-center">
          <p className="text-[12px] font-black uppercase tracking-[0.3em] text-[#c9781a]">验证身份</p>
          <h1 className="mt-2 text-[24px] font-black text-[#2c1a10]">{viewModel.title}</h1>
          <p className="mt-2 text-[13px] leading-relaxed text-[#5c4734]">{viewModel.description}</p>

          <div className="mx-auto mt-6 flex max-w-[300px] items-center justify-between gap-2 text-[22px] font-black text-[#2f1f12]">
            {Array.from({ length: 6 }).map((_, index) => (
              <span
                key={index}
                className="inline-flex h-16 w-12 items-center justify-center rounded-[12px] border border-dashed border-[#f0d7ba] bg-white"
              >
                -
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              className="rounded-[16px] bg-[var(--app-orange)] px-4 py-3 text-[15px] font-black text-white shadow-[0_14px_28px_rgba(255,140,26,0.26)]"
            >
              提交验证码
            </button>
            <button
              type="button"
              className="rounded-[16px] border border-[#f0d7ba] bg-white px-4 py-3 text-[14px] font-semibold text-[#c9781a]"
            >
              {viewModel.timerLabel}
            </button>
          </div>

          <p className="mt-6 text-[11px] text-[#7f6751]">{viewModel.supportInfo}</p>
        </div>
      </div>
    </AppScreen>
  );
}

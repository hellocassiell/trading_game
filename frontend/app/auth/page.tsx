import AppScreen from "../../components/AppScreen";
import { getAuthEntryViewModel } from "../../lib/adapters/auth";

export default function AuthPage() {
  const viewModel = getAuthEntryViewModel();

  return (
    <AppScreen className="!px-0 !pb-0">
      <div className="min-h-[100dvh] bg-[linear-gradient(180deg,#fffaef_0%,#ffe6d2_48%,#ffd0a6_100%)] text-[#2f1f12]">
        <div className="px-4 pb-10 pt-[max(env(safe-area-inset-top),14px)]">
          <div className="space-y-2">
            <p className="text-[12px] font-black tracking-[0.4em] text-[#c57b28]">
              手机号登录
            </p>
            <div>
              <h1 className="text-[26px] font-black leading-tight text-[#2c1a10]">
                {viewModel.heroTitle}
              </h1>
              <p className="text-[15px] font-semibold text-[#5c432c]">
                {viewModel.heroSubtitle}
              </p>
            </div>
            <p className="text-[12px] leading-relaxed text-[#6b5441]">
              {viewModel.description}
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <label className="text-[11px] font-black uppercase tracking-[0.4em] text-[#b57b2a]">
              香港手机号码
            </label>
            <input
              type="tel"
              placeholder={viewModel.phoneHint}
              className="w-full rounded-[16px] border border-[#f0dfc6] bg-white/80 px-4 py-3 text-[16px] font-semibold text-[#2f1f12] outline-none placeholder:text-[#c2a57f]"
            />
            <button
              type="button"
              className="w-full rounded-[16px] bg-[var(--app-orange)] px-4 py-3 text-[15px] font-black text-white shadow-[0_14px_28px_rgba(255,140,26,0.28)]"
            >
              发送验证码
            </button>
          </div>

          <div className="mt-6 space-y-2 rounded-[18px] bg-white/80 px-4 py-4 shadow-[0_18px_30px_rgba(97,61,24,0.12)]">
            <p className="text-[12px] font-black text-[#b36a1c]">参赛特权</p>
            <ul className="mt-2 space-y-1 text-[11px] leading-relaxed text-[#645544]">
              {viewModel.benefits.map((benefit) => (
                <li key={benefit} className="flex gap-2">
                  <span className="text-[10px] font-black text-[#ef7c00]">·</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-4 text-[10px] text-[#9e8f7b]">{viewModel.footer}</p>
        </div>
      </div>
    </AppScreen>
  );
}

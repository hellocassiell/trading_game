import AppScreen from "../../../components/AppScreen";
import { getInviteViewModel } from "../../../lib/adapters/auth";

export default function AuthInvitePage() {
  const viewModel = getInviteViewModel();

  return (
    <AppScreen className="!px-0 !pb-0">
      <div className="min-h-[100dvh] bg-[linear-gradient(180deg,#fff8ed_0%,#ffe6cc_55%,#ffd1a6_100%)] text-[#241810]">
        <div className="px-4 pb-10 pt-[max(env(safe-area-inset-top),14px)]">
          <div className="space-y-3">
            <p className="text-[12px] font-black uppercase tracking-[0.3em] text-[#c9781a]">
              邀请朋友
            </p>
            <h1 className="text-[26px] font-black text-[#2c1a10]">{viewModel.heroTitle}</h1>
            <p className="text-[15px] font-semibold text-[#5c4531]">{viewModel.heroSubtitle}</p>
            <p className="text-[12px] text-[#6e5842] leading-relaxed">{viewModel.footer}</p>
          </div>

          <div className="mt-6 space-y-3 rounded-[20px] border border-[#f2dec5] bg-white/90 px-4 py-4 shadow-[0_16px_28px_rgba(82,50,25,0.12)]">
            {viewModel.perks.map((perk) => (
              <div key={perk.label} className="flex items-start gap-3">
                <span className="text-[14px] font-black text-[#ef7c00]">★</span>
                <div>
                  <p className="text-[12px] font-black text-[#2f1f12]">{perk.label}</p>
                  <p className="text-[11px] text-[#6d553b]">{perk.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2 rounded-[20px] bg-white/90 px-4 py-4 shadow-[0_16px_28px_rgba(82,50,25,0.08)]">
            <p className="text-[12px] font-black uppercase tracking-[0.3em] text-[#c9781a]">
              共享步驟
            </p>
            <div className="space-y-2 text-[13px] text-[#3c2c21]">
              {viewModel.steps.map((step, index) => (
                <div key={step} className="flex gap-3">
                  <span className="text-[13px] font-black text-[#ef7c00]">{index + 1}.</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#c9781a]">
              专属邀请码
            </p>
            <div className="flex items-center justify-between rounded-[16px] bg-white px-4 py-3 shadow-[0_12px_28px_rgba(255,140,26,0.18)]">
              <span className="text-[18px] font-black text-[#2c1a10]">{viewModel.shareCode}</span>
              <button
                type="button"
                className="rounded-full border border-[#ef7c00] px-4 py-1 text-[11px] font-black text-[#ef7c00]"
              >
                复制邀请码
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppScreen>
  );
}

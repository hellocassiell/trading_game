"use client";

import Link from "next/link";
import { useSyncExternalStore, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CirclePlay, Gift, ScrollText, X } from "lucide-react";
import AppScreen from "../../components/AppScreen";
import {
  getGuestLandingViewModel,
  getBlockedViewModel,
  readAuthSession,
} from "../../lib/adapters/auth";
import {
  getGuestInfoModalViewModels,
  resolveGuestInfoModalFromQuery,
  type GuestInfoModalKey,
} from "../../lib/adapters/guest-info";
import { byLanguage } from "../../lib/locale";
import { useLanguage } from "../../components/LanguageProvider";

function subscribeToClientRender() {
  return () => {};
}

function GuestInfoIcon({ modalKey }: { modalKey: GuestInfoModalKey }) {
  if (modalKey === "seasonPrize") {
    return <Gift className="h-4 w-4" />;
  }
  if (modalKey === "videoIntro") {
    return <CirclePlay className="h-4 w-4" />;
  }
  return <ScrollText className="h-4 w-4" />;
}

export default function GuestPage() {
  const searchParams = useSearchParams();
  const isClient = useSyncExternalStore(subscribeToClientRender, () => true, () => false);
  const { language } = useLanguage();
  const viewModel = getGuestLandingViewModel(language);
  const blockedViewModel = getBlockedViewModel(language);
  const guestInfoModals = getGuestInfoModalViewModels(language);
  const copy = byLanguage(language, {
    "zh-Hant": {
      continueGame: "繼續比賽",
      identified: "已識別參賽者",
      close: "關閉",
      eventLabel: "港股模擬交易活動",
    },
    "zh-Hans": {
      continueGame: "继续比赛",
      identified: "已识别参赛者",
      close: "关闭",
      eventLabel: "港股模拟交易活动",
    },
    en: {
      continueGame: "Continue",
      identified: "Recognized player",
      close: "Close",
      eventLabel: "HK Stock Trading Event",
    },
  });
  const session = isClient ? readAuthSession() : null;
  const modal = isClient ? searchParams.get("modal") : null;
  const [blockedOverride, setBlockedOverride] = useState<boolean | null>(null);
  const [activeInfoModalOverride, setActiveInfoModalOverride] = useState<GuestInfoModalKey | null | undefined>(undefined);
  const showBlocked = blockedOverride ?? (modal === "blocked");
  const activeInfoModal =
    activeInfoModalOverride === undefined
      ? resolveGuestInfoModalFromQuery(modal)
      : activeInfoModalOverride;

  const primaryAction = session
    ? { label: copy.continueGame, href: "/" }
    : viewModel.primaryAction;
  const activeModalViewModel = activeInfoModal ? guestInfoModals[activeInfoModal] : null;

  return (
    <AppScreen className="!px-0 !pb-0">
      <div className="relative min-h-[100dvh] overflow-hidden bg-[linear-gradient(180deg,#fff9f2_0%,#fff0dd_48%,#ffe8c8_100%)]">
        <div className="pointer-events-none absolute left-[-140px] top-[-84px] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(255,174,66,0.36)_0%,rgba(255,174,66,0)_72%)]" />
        <div className="pointer-events-none absolute right-[-120px] top-[82px] h-[270px] w-[270px] rounded-full bg-[radial-gradient(circle,rgba(255,145,34,0.24)_0%,rgba(255,145,34,0)_72%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-[130px] h-[240px] bg-[linear-gradient(180deg,rgba(255,190,119,0.22)_0%,rgba(255,190,119,0)_100%)]" />
        <div className="pointer-events-none absolute left-[30px] top-[108px] h-4 w-4 rounded-full bg-[#ffb25a]/70" />
        <div className="pointer-events-none absolute right-[46px] top-[152px] h-2.5 w-2.5 rounded-full bg-[#ffcb8d]/80" />

        <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-[max(env(safe-area-inset-top),24px)]">
          <div className="relative mx-auto mt-1 w-full max-w-[304px] rounded-[34px_34px_44px_26px] bg-[linear-gradient(180deg,#fffdf8_0%,#fff4e8_100%)] p-3 shadow-[0_22px_44px_rgba(152,91,20,0.12)]">
            <div className="pointer-events-none absolute -left-5 top-5 h-20 w-20 rounded-full bg-[#ffd79f]/55 blur-[1px]" />
            <div className="pointer-events-none absolute -right-4 bottom-5 h-14 w-14 rounded-[38%] bg-[#ffd29a]/50" />

            <div className="relative h-[184px] overflow-hidden rounded-[26px_30px_34px_24px] bg-[linear-gradient(140deg,#ffe2bb_0%,#ffb760_46%,#f08a09_100%)]">
              <div className="absolute -right-16 -top-14 h-44 w-44 rounded-[42%] border border-white/30 bg-white/25" />
              <div className="absolute -left-16 top-12 h-40 w-40 rounded-full bg-white/20" />
              <div className="absolute left-[86px] top-[122px] h-[2px] w-[132px] rotate-[-13deg] border-t-2 border-dashed border-white/65" />
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full opacity-95"
                viewBox="0 0 304 184"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="guest-road" x1="18" y1="162" x2="286" y2="120" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FFEFD2" />
                    <stop offset="1" stopColor="#FFD69B" />
                  </linearGradient>
                  <linearGradient id="guest-phone" x1="221" y1="38" x2="281" y2="126" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FFFDF5" />
                    <stop offset="1" stopColor="#FFE4BA" />
                  </linearGradient>
                </defs>

                <path
                  d="M18 160C49 141 69 132 99 135C127 137 139 122 161 114C182 106 193 118 212 114C239 109 255 91 288 79"
                  stroke="rgba(255,255,255,0.72)"
                  strokeWidth="2.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="4 6"
                />
                <path
                  d="M14 170C58 151 87 140 121 145C156 150 174 139 205 134C237 129 262 136 292 123"
                  stroke="url(#guest-road)"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                <path
                  d="M24 166C38 156 47 155 63 157"
                  stroke="#F5A338"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                <g transform="translate(221 33) rotate(12)">
                  <rect x="2" y="4" width="56" height="96" rx="14" fill="rgba(120,66,12,0.22)" />
                  <rect width="56" height="96" rx="14" fill="url(#guest-phone)" />
                  <rect x="7" y="11" width="42" height="62" rx="10" fill="rgba(255,177,81,0.5)" />
                  <rect x="22" y="79" width="12" height="4" rx="2" fill="#F4B063" />
                  <path
                    d="M34 27C40 22 47 28 44 34C41 38 37 41 34 47C30 41 26 38 25 33C23 27 29 22 34 27Z"
                    fill="#FFEFD6"
                  />
                </g>

                <g transform="translate(52 56)">
                  <path d="M14 2C20 2 24 6 24 12V18C24 28 17 34 8 34C-2 34 -8 28 -8 18V12C-8 6 -4 2 2 2H14Z" fill="#FFD451" />
                  <rect x="-1" y="34" width="18" height="8" rx="4" fill="#FFE29D" />
                  <rect x="-7" y="42" width="30" height="6" rx="3" fill="#E48214" />
                  <circle cx="-16" cy="10" r="7" fill="#FFEFCF" />
                  <circle cx="32" cy="12" r="7" fill="#FFEFCF" />
                </g>

                <g transform="translate(20 120)">
                  <circle cx="10" cy="8" r="6" fill="#FFE6C0" />
                  <rect x="6" y="14" width="8" height="16" rx="4" fill="#2A5EB0" />
                  <rect x="4" y="28" width="4" height="10" rx="2" fill="#1E4A8C" />
                  <rect x="12" y="28" width="4" height="10" rx="2" fill="#1E4A8C" />
                  <path d="M14 16L24 12L25 16L16 20Z" fill="#FF6961" />
                  <circle cx="26" cy="14" r="3" fill="#FFD772" />
                </g>

                <g transform="translate(252 120)">
                  <circle cx="8" cy="8" r="6" fill="#FFE6C0" />
                  <rect x="4" y="14" width="8" height="16" rx="4" fill="#2EA2A0" />
                  <rect x="2" y="28" width="4" height="10" rx="2" fill="#1E7A79" />
                  <rect x="10" y="28" width="4" height="10" rx="2" fill="#1E7A79" />
                  <rect x="14" y="18" width="14" height="10" rx="5" fill="#FFF3D6" />
                  <circle cx="21" cy="23" r="2" fill="#F38B11" />
                </g>

                <g transform="translate(170 136)">
                  <circle cx="12" cy="12" r="12" fill="#FFEED3" />
                  <circle cx="12" cy="12" r="7.5" fill="none" stroke="#F4931D" strokeWidth="3" />
                  <circle cx="12" cy="12" r="2.8" fill="#F4931D" />
                </g>

                <path
                  d="M128 164L138 159L136 170L147 165"
                  stroke="#FFF8E9"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M183 54L186 59L192 60L187 64L188 70L183 67L178 70L179 64L174 60L180 59L183 54Z" fill="#FFD574" />
                <circle cx="197" cy="75" r="4.5" fill="#FFE7B7" />
                <circle cx="178" cy="80" r="3.5" fill="#FFEFD3" />
                <circle cx="101" cy="154" r="3.5" fill="#FFECCB" />
                <circle cx="112" cy="148" r="2.5" fill="#FFD587" />
              </svg>

              <div className="absolute left-5 top-8 w-[112px] rotate-[-11deg] rounded-[24px] bg-[#fff8ee]/92 p-3 shadow-[0_14px_24px_rgba(122,64,8,0.18)]">
                <p className="text-[10px] font-bold tracking-[0.12em] text-[#ab640b]">HK STOCK</p>
                <p className="mt-1 text-[24px] font-black leading-none text-[#ea7f00]">20</p>
                <p className="mt-1 text-[11px] font-semibold text-[#97591a]">TOP RANK</p>
              </div>

              <div className="absolute right-5 top-8 w-[152px] rotate-[8deg] rounded-[24px] bg-white/95 p-3 shadow-[0_14px_22px_rgba(132,72,12,0.16)]">
                <p className="text-[10px] font-bold tracking-[0.08em] text-[#a6855c]">SIMULATED ASSET</p>
                <p className="mt-1 text-[18px] font-black leading-none text-[#311f10]">HK$ 1,000,000</p>
                <div className="mt-2 h-1.5 w-full rounded-full bg-[#f8e5cf]">
                  <span className="block h-full w-[72%] rounded-full bg-[linear-gradient(90deg,#ffb350_0%,#f4860f_100%)]" />
                </div>
              </div>

              <div className="absolute bottom-4 left-5 inline-flex h-8 items-center rounded-full bg-white/90 px-3 text-[11px] font-bold text-[#8f560f]">
                {copy.eventLabel}
              </div>
              <div className="absolute bottom-3 right-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#fff6e9] text-[16px] text-[#de7f0e] shadow-[0_8px_18px_rgba(141,76,10,0.18)]">
                ★
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="inline-flex items-center rounded-full border border-[#f5d9b3] bg-[#fff5e9] px-3 py-1 text-[11px] font-black tracking-[0.14em] text-[#bb7014]">
              {viewModel.primaryBrand}
              <span className="mx-2 text-[#c79865]">×</span>
              <span>{viewModel.partnerBrand}</span>
            </p>
            <h1 className="mt-3 whitespace-pre-line text-[28px] font-extrabold leading-[1.15] text-[#2b1a0f]">
              {viewModel.competition}
            </h1>
          </div>

          <div className="mx-auto mt-6 w-full max-w-[302px] rounded-[24px] border border-[#f0d6b3] bg-white/90 px-4 py-4 text-center shadow-[0_16px_36px_rgba(155,96,27,0.12)]">
            <p className="text-[12px] font-black tracking-[0.16em] text-[#ba7218]">{viewModel.prizeLabel}</p>
            <p className="mt-2 text-[32px] font-black leading-none text-[#ef8612]">{viewModel.prizeAmount}</p>
            <p className="mt-2 text-[12px] font-medium text-[#9f7c54]">{viewModel.prizeSponsor}</p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {viewModel.quickActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => setActiveInfoModalOverride(action.modalKey)}
                className="group inline-flex h-12 items-center gap-2 rounded-[16px] border border-[#efd8bb] bg-white/92 px-3 text-left shadow-[0_10px_20px_rgba(122,75,17,0.06)]"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#fff0d9] text-[#d47a00]">
                  <GuestInfoIcon modalKey={action.modalKey} />
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-[#573618]">{action.label}</span>
                <span className="text-[15px] font-black text-[#d2872d] transition-transform group-active:translate-x-0.5">›</span>
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Link
              href={primaryAction.href}
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#f6b46f] bg-[linear-gradient(90deg,#f59a35_0%,#ef7c00_100%)] text-[16px] font-black text-white shadow-[0_16px_30px_rgba(239,124,0,0.32)]"
            >
              {primaryAction.label}
            </Link>
            <button
              type="button"
              onClick={() => setActiveInfoModalOverride(viewModel.rulesAction.modalKey)}
              className="mx-auto inline-flex h-10 items-center justify-center rounded-full border border-[#f1d7b4] bg-[#fff7ec] px-4 text-[13px] font-bold text-[#875428]"
            >
              {viewModel.rulesAction.label}
            </button>
          </div>

          {session ? (
            <p className="mt-3 text-center text-[12px] font-medium text-[#94795a]">
              {copy.identified} {session.nickname}
            </p>
          ) : null}

          <div className="mt-auto border-t border-[#efd9bc] pt-5 text-[11px] text-[#a2896b]">
            <div className="flex items-center justify-between gap-3">
              <p>{viewModel.footerLeft}</p>
              <p>{viewModel.footerRight}</p>
            </div>
          </div>
        </div>

        {showBlocked ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(20,20,20,0.4)] px-6">
            <div className="w-full max-w-[324px] rounded-[20px] bg-[#f7f7f7] px-5 py-7 shadow-[0_24px_44px_rgba(18,18,18,0.28)]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ffe5c7] text-[29px]">
                ⛔
              </div>
              <p className="mt-4 text-center text-[26px] font-semibold">{blockedViewModel.title}</p>
              <p className="mt-2 text-center text-[16px] leading-[1.5] text-[#666]">{blockedViewModel.description}</p>
              <button
                type="button"
                onClick={() => setBlockedOverride(false)}
                className="mt-7 flex w-full items-center justify-center rounded-[14px] bg-[linear-gradient(90deg,#f49d38_0%,#ee7d00_100%)] px-4 py-3 text-[16px] font-semibold text-white shadow-[0_12px_24px_rgba(230,129,20,0.26)]"
              >
                {blockedViewModel.actionLabel}
              </button>
            </div>
          </div>
        ) : null}

        {activeModalViewModel ? (
          <div
            className="fixed inset-0 z-[60] flex items-end justify-center bg-[rgba(20,20,20,0.42)] px-4 pb-[max(env(safe-area-inset-bottom),16px)] pt-10 sm:items-center"
            onClick={() => setActiveInfoModalOverride(null)}
          >
            <div
              className="pointer-events-auto relative z-[61] w-full max-w-[360px] overflow-hidden rounded-[28px] bg-[#fffaf4] shadow-[0_28px_60px_rgba(41,24,6,0.28)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="relative overflow-hidden bg-[linear-gradient(180deg,#ffb660_0%,#ff9829_62%,#df7700_100%)] px-5 pb-5 pt-5 text-white">
                <div className="pointer-events-none absolute -right-8 top-3 h-24 w-24 rounded-full bg-white/12" />
                <div className="pointer-events-none absolute -left-6 bottom-2 h-16 w-16 rounded-full bg-[#ffd08b]/30" />
                <button
                  type="button"
                  onClick={() => setActiveInfoModalOverride(null)}
                  className="absolute right-4 top-4 z-[62] flex h-8 w-8 items-center justify-center rounded-full bg-white/14 text-white active:bg-white/20"
                  aria-label={copy.close}
                >
                  <X className="h-4 w-4" />
                </button>

                <p className="relative text-[11px] font-black tracking-[0.18em] text-[#ffe8c0]">
                  {activeModalViewModel.eyebrow}
                </p>
                <h2 className="relative mt-2 pr-10 text-[24px] font-black leading-[1.15]">
                  {activeModalViewModel.title}
                </h2>
                <p className="relative mt-2 text-[14px] leading-[1.5] text-[#fff3dd]">
                  {activeModalViewModel.description}
                </p>
              </div>

              <div className="max-h-[68vh] overflow-y-auto px-5 pb-5 pt-4">
                <div className="rounded-[18px] border border-[#ffe2b8] bg-[linear-gradient(180deg,#fff7ec_0%,#fff1dd_100%)] px-4 py-3 text-[14px] font-bold leading-[1.5] text-[#ae6200]">
                  {activeModalViewModel.accent}
                </div>

                <div className="mt-4 space-y-3">
                  {activeModalViewModel.sections.map((section) => (
                    <section
                      key={section.title}
                      className="rounded-[18px] border border-[#f3e7d9] bg-white px-4 py-3 shadow-[0_10px_20px_rgba(120,78,18,0.04)]"
                    >
                      <h3 className="text-[15px] font-black text-[#4a2b11]">{section.title}</h3>
                      {section.accentRows?.length ? (
                        <div className="mt-2 space-y-2">
                          {section.accentRows.map((row) => (
                            <p
                              key={row}
                              className="rounded-[12px] bg-[#fff3df] px-3 py-2 text-[13px] font-bold leading-[1.45] text-[#b66600]"
                            >
                              {row}
                            </p>
                          ))}
                        </div>
                      ) : null}
                      {section.rows?.length ? (
                        <div className="mt-2 space-y-2">
                          {section.rows.map((row) => (
                            <div key={row} className="flex items-start gap-2">
                              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#f48d22]" />
                              <p className="text-[13px] leading-[1.5] text-[#6b5641]">{row}</p>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </section>
                  ))}
                </div>

                <p className="mt-4 text-[12px] leading-[1.5] text-[#9c8974]">
                  {activeModalViewModel.footerHint}
                </p>

                <button
                  type="button"
                  onClick={() => setActiveInfoModalOverride(null)}
                  className="relative z-[62] mt-5 flex h-11 w-full items-center justify-center rounded-full bg-[linear-gradient(90deg,#f48d22_0%,#ef7c00_100%)] text-[15px] font-black text-white shadow-[0_12px_24px_rgba(255,136,26,0.2)]"
                >
                  {activeModalViewModel.closeLabel}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AppScreen>
  );
}

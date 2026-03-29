"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AppScreen from "../../components/AppScreen";
import {
  getGuestLandingViewModel,
  getBlockedViewModel,
  readAuthSession,
  type AuthSession,
} from "../../lib/adapters/auth";

export default function GuestPage() {
  const viewModel = getGuestLandingViewModel();
  const blockedViewModel = getBlockedViewModel();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [showBlocked, setShowBlocked] = useState(false);

  useEffect(() => {
    setSession(readAuthSession());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    setShowBlocked(params.get("modal") === "blocked");
  }, []);

  const primaryAction = session
    ? { label: "继续比赛", href: "/" }
    : viewModel.primaryAction;

  return (
    <AppScreen className="!px-0 !pb-0">
      <div className="relative min-h-[100dvh] overflow-hidden bg-[#f3f3f3]">
        <div className="absolute inset-x-0 top-0 h-[270px] bg-[linear-gradient(180deg,#f7fbff_0%,#dff2ff_55%,#f3f3f3_100%)]" />
        <div className="absolute left-[-18px] top-[116px] h-[168px] w-[460px] rotate-[10deg] rounded-[48%] bg-[linear-gradient(90deg,rgba(255,156,47,0.26),rgba(255,196,132,0.08))]" />
        <div className="absolute left-4 top-[88px] h-5 w-5 rounded-full bg-[#ff9d3f]" />
        <div className="absolute left-[72px] top-[148px] h-3 w-3 rounded-full bg-[#ffbc71]" />
        <div className="absolute right-8 top-[78px] h-7 w-7 rounded-[10px] border border-[#f6cda2] bg-white/70" />

        <div className="relative flex min-h-[100dvh] flex-col px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-[max(env(safe-area-inset-top),26px)]">
          <div className="mx-auto mt-2 h-[206px] w-[240px] rounded-[26px] border border-[#f0ddca] bg-[linear-gradient(180deg,#fffdf8_0%,#f6f4ef_100%)] shadow-[0_20px_34px_rgba(147,104,46,0.08)]">
            <div className="relative h-full w-full overflow-hidden rounded-[26px]">
              <div className="absolute left-[-8px] top-[14px] h-[120px] w-[120px] rounded-full bg-[#ffd9a8]/70" />
              <div className="absolute right-[-30px] top-[20px] h-[136px] w-[136px] rounded-full bg-[#ffe9ce]/85" />
              <div className="absolute left-[24px] top-[40px] h-[100px] w-[82px] rounded-[16px] bg-[linear-gradient(180deg,#ffc87c_0%,#ff9d3f_100%)]" />
              <div className="absolute left-[94px] top-[62px] h-[76px] w-[120px] rounded-[18px] border border-[#f3dac2] bg-white" />
              <div className="absolute left-[110px] top-[46px] h-[32px] w-[32px] rounded-full bg-[#ffb059] text-center text-[18px] leading-[32px]">
                🏆
              </div>
              <div className="absolute bottom-[22px] left-[30px] h-[38px] w-[38px] rounded-full bg-[#fff3e3] text-center text-[20px] leading-[38px]">
                👤
              </div>
              <div className="absolute bottom-[26px] right-[38px] h-[34px] w-[34px] rounded-full bg-[#ffe9ce] text-center text-[19px] leading-[34px]">
                🎯
              </div>
            </div>
          </div>

          <div className="mt-5 text-center">
            <p className="text-[17px] font-black tracking-[0.08em] text-[#de8e2d]">
              {viewModel.primaryBrand}
              <span className="mx-2 text-[12px] font-medium text-[#7a8897]">x</span>
              <span className="text-[17px] text-[#eb7f00]">{viewModel.partnerBrand}</span>
            </p>
            <h1 className="mt-1 whitespace-pre-line text-[24px] font-extrabold leading-[1.2] text-[#1f1f1f]">
              {viewModel.competition}
            </h1>
          </div>

          <div className="mx-auto mt-6 w-full max-w-[286px] rounded-[24px] border border-[#efdfca] bg-white px-4 py-4 text-center shadow-[0_16px_30px_rgba(157,119,68,0.1)]">
            <p className="text-[21px] font-bold text-[#dd8820]">♛</p>
            <p className="mt-1 text-[13px] font-semibold tracking-[0.04em] text-[#4f647f]">
              {viewModel.prizeLabel}
            </p>
            <p className="mt-1 text-[28px] font-black leading-none text-[#f2941d]">
              {viewModel.prizeAmount}
            </p>
            <p className="mt-1 text-[12px] text-[#89929f]">{viewModel.prizeSponsor}</p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {viewModel.quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="inline-flex h-9 items-center justify-center rounded-full border border-[#ede2d0] bg-white text-[13px] font-semibold text-[#4a6785]"
              >
                {action.label}
              </Link>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Link
              href={primaryAction.href}
              className="inline-flex h-12 items-center justify-center rounded-full bg-[linear-gradient(90deg,#f48d22_0%,#ef7c00_100%)] text-[16px] font-bold text-white shadow-[0_14px_30px_rgba(255,136,26,0.28)]"
            >
              {primaryAction.label}
            </Link>
            <Link
              href={viewModel.rulesAction.href}
              className="mx-auto inline-flex items-center justify-center text-[13px] font-semibold text-[#4f6784]"
            >
              {viewModel.rulesAction.label}
            </Link>
          </div>

          {session ? (
            <p className="mt-3 text-center text-[12px] text-[#8a8a8a]">
              已识别参赛者 {session.nickname}
            </p>
          ) : null}

          <div className="mt-auto flex items-end justify-between pt-10 text-[12px] text-[#a7a7a7]">
            <p>{viewModel.footerLeft}</p>
            <p>{viewModel.footerRight}</p>
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
                onClick={() => setShowBlocked(false)}
                className="mt-7 flex w-full items-center justify-center rounded-[14px] bg-[linear-gradient(90deg,#f49d38_0%,#ee7d00_100%)] px-4 py-3 text-[16px] font-semibold text-white shadow-[0_12px_24px_rgba(230,129,20,0.26)]"
              >
                {blockedViewModel.actionLabel}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </AppScreen>
  );
}

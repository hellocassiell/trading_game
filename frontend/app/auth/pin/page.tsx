"use client";

import Link from "next/link";
import AppScreen from "../../../components/AppScreen";
import { useLanguage } from "../../../components/LanguageProvider";
import { getAuthPinViewModel } from "../../../lib/adapters/auth";
import { byLanguage } from "../../../lib/locale";

export default function AuthPinPage() {
  const { language } = useLanguage();
  const viewModel = getAuthPinViewModel(language);
  const copy = byLanguage(language, {
    "zh-Hant": { close: "關閉" },
    "zh-Hans": { close: "关闭" },
    en: { close: "Close" },
  });

  return (
    <AppScreen className="!px-0 !pb-0">
      <div className="min-h-[100dvh] bg-[#f1f1f1] text-[#1e1e1e]">
        <div className="flex min-h-[100dvh] flex-col px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-[max(env(safe-area-inset-top),18px)]">
          <div className="flex justify-end">
            <Link
              href={viewModel.closeHref}
              aria-label={copy.close}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[19px] leading-none text-[#282828]"
            >
              ×
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="relative h-[360px] w-[300px]">
              <div className="absolute inset-[16px] rounded-full border border-[#e2cbac]" />
              <div className="absolute inset-[52px] rounded-full bg-[#edd8bf]/40" />

              <Link
                href={viewModel.centerAction.href}
                className="absolute inset-[76px] flex items-center justify-center rounded-full bg-[linear-gradient(180deg,#ffb057_0%,#f18a1b_100%)] text-center shadow-[0_20px_36px_rgba(229,132,44,0.24)]"
              >
                <span className="whitespace-pre-line text-[16px] font-medium leading-[1.3] text-white">
                  {viewModel.centerAction.label}
                </span>
              </Link>

              <div className="absolute left-0 top-[70px] flex h-[66px] w-[66px] items-center justify-center rounded-full bg-[#ffd9a9] text-[28px] shadow-[0_10px_18px_rgba(224,143,61,0.18)]">
                {viewModel.orbitItems[0]?.icon}
              </div>
              <div className="absolute right-0 top-[84px] flex h-[66px] w-[66px] items-center justify-center rounded-full bg-[#ffe8cb] text-[27px] font-semibold text-[#d68734] shadow-[0_10px_18px_rgba(224,143,61,0.16)]">
                {viewModel.orbitItems[1]?.icon}
              </div>
              <div className="absolute bottom-[18px] left-[26px] flex h-[66px] w-[66px] items-center justify-center rounded-full bg-[#ffecd3] text-[27px] text-[#d08c4a] shadow-[0_10px_18px_rgba(224,143,61,0.12)]">
                {viewModel.orbitItems[2]?.icon}
              </div>
              <div className="absolute bottom-[18px] right-[18px] flex h-[66px] w-[66px] items-center justify-center rounded-full bg-[#ffe6c5] text-[24px] shadow-[0_10px_18px_rgba(224,143,61,0.15)]">
                {viewModel.orbitItems[3]?.icon}
              </div>
              <div className="absolute left-[42px] top-[146px] h-[14px] w-[14px] rounded-full bg-[#f7c767]" />
              <div className="absolute right-[56px] top-[102px] h-[14px] w-[14px] rounded-full bg-[#cfb8e4]" />
              <div className="absolute right-[26px] top-[206px] h-[14px] w-[14px] rounded-full bg-[#64d7bb]" />
            </div>
          </div>

          <div className="pb-2 text-center text-[11px] text-[#8f8f8f]">{viewModel.footer}</div>
        </div>
      </div>
    </AppScreen>
  );
}

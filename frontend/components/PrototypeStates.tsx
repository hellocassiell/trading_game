"use client";

import type { ChangeEvent, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronRight, Smartphone, X } from "lucide-react";

import AppScreen from "./AppScreen";
import TradeTicketCard from "./TradeTicketCard";

type TradeProduct = {
  symbol: string;
  company: string;
  sub: string;
  price: string;
  change: string;
  holdingValue?: string;
  cash?: string;
  quantity?: string;
  defaultQuantity?: string;
  settlementTotal?: string;
};

function AuthViewport({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <AppScreen className="!min-h-[100dvh] !px-0 !pt-0 !pb-0">
      <div
        className={`flex min-h-[100dvh] w-full flex-col bg-[linear-gradient(180deg,#fffaf4_0%,#fff1de_52%,#ffe7c3_100%)] ${className}`}
      >
        {children}
      </div>
    </AppScreen>
  );
}

function AuthTopBar({
  title,
  closeHref,
}: {
  title: string;
  closeHref: string;
}) {
  return (
    <div className="flex items-center justify-between px-4 pb-3 pt-[max(env(safe-area-inset-top),14px)] text-[#5c4120]">
      <p className="text-[13px] font-black">{title}</p>
      <Link href={closeHref} className="text-[var(--app-orange-dark)]" aria-label="关闭">
        <X className="h-5 w-5" />
      </Link>
    </div>
  );
}

function PromoIllustration() {
  return (
    <div className="relative h-[228px] overflow-hidden rounded-b-[28px] bg-[linear-gradient(180deg,#ffb55c_0%,#f38b1b_45%,#cf6d00_100%)]">
      <div className="absolute left-0 right-0 top-0 flex items-center justify-between px-4 pb-2 pt-4 text-white">
        <div className="flex items-center gap-1 text-[12px] font-black tracking-[0.06em]">
          <span>AASTOCKS</span>
          <ChevronRight className="h-3 w-3" />
        </div>
        <div className="flex items-center gap-2 text-white/85">
          <div className="h-4 w-4 rounded-full border border-white/60" />
          <div className="h-4 w-4 rounded-sm border border-white/60" />
        </div>
      </div>
      <div className="absolute left-4 top-16 h-[88px] w-[116px] rounded-[18px] bg-[linear-gradient(155deg,#fff0d7,#ffc778)] shadow-[0_18px_32px_rgba(243,139,27,0.18)]" />
      <div className="absolute left-[66px] top-24 h-10 w-[90px] rounded-[12px] bg-white/70 shadow-[0_10px_18px_rgba(255,255,255,0.3)]" />
      <div className="absolute right-6 top-16 h-[96px] w-[70px] rounded-[16px] bg-[linear-gradient(180deg,#ffd56c,#f58f44)] shadow-[0_18px_28px_rgba(245,143,68,0.24)]" />
      <div className="absolute right-[18px] top-[44px] h-14 w-[52px] rounded-[10px] bg-[#ffbd7a]/25" />
      <div className="absolute right-[30px] top-[54px] h-[34px] w-[30px] rounded-[8px] bg-white/80" />
      <div className="absolute left-6 top-20 h-4 w-4 rounded-full bg-[#f7a643]" />
      <div className="absolute left-[26px] top-[140px] h-5 w-5 rounded-full bg-[#22c55e]" />
      <div className="absolute left-[88px] top-[82px] h-5 w-5 rounded-full bg-[#f59e0b]" />
      <div className="absolute left-[98px] top-[140px] h-3 w-16 rounded-full bg-[#ffc870]" />
      <div className="absolute left-[104px] top-[151px] h-2.5 w-12 rounded-full bg-[#ffe0ab]" />
      <div className="absolute bottom-[22px] left-5 h-8 w-8 rounded-full bg-white shadow-[0_10px_20px_rgba(243,139,27,0.14)]" />
      <div className="absolute bottom-[28px] left-10 h-1.5 w-14 rotate-[18deg] rounded-full bg-[#ffba66]" />
      <div className="absolute bottom-[18px] right-[68px] h-10 w-10 rounded-full border-[3px] border-white bg-[#f38b1b] shadow-[0_12px_18px_rgba(243,139,27,0.24)]" />
      <div className="absolute bottom-[22px] right-[56px] h-4 w-4 rounded-full bg-[#ffb347]" />
      <div className="absolute bottom-[26px] right-[20px] h-14 w-14 rounded-full bg-[#fff1de]" />
    </div>
  );
}

function NumericPad({
  onDigit,
  onDelete,
}: {
  onDigit?: (key: string) => void;
  onDelete?: () => void;
}) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

  return (
    <div className="overflow-hidden border-t border-[#ead9c5] bg-[#f6e3cf]">
      <div className="grid grid-cols-3">
        {keys.map((key, index) => (
          <button
            type="button"
            key={`${key}-${index}`}
            onClick={() => {
              if (!key) {
                return;
              }
              if (key === "⌫") {
                onDelete?.();
                return;
              }
              onDigit?.(key);
            }}
            className="flex h-12 items-center justify-center border-r border-t border-[#eddcc8] bg-[#fffaf4] text-[17px] font-medium text-[#4b5563] last:border-r-0 [&:nth-child(3n)]:border-r-0 [&:nth-child(-n+3)]:border-t-0"
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  );
}

export function GuestLandingPreview() {
  return (
    <AuthViewport>
      <PromoIllustration />
      <div className="flex flex-1 flex-col px-4 pb-[max(env(safe-area-inset-bottom),20px)] pt-5 text-center">
        <p className="text-[12px] font-bold tracking-[0.08em] text-[#b2895f]">
          CITI x AASTOCKS
        </p>
        <h2 className="mt-2 text-[25px] font-extrabold leading-tight text-[#4a5568]">
          智财投资大赛 2020
        </h2>
        <p className="mt-3 text-[11px] leading-relaxed text-[#8e7a63]">
          初始模拟资金 1,000,000 港元，参与港股模拟投资比赛
        </p>

        <div className="mt-5 rounded-[18px] bg-white/88 px-4 py-3 shadow-[0_14px_24px_rgba(171,86,0,0.08)]">
          <p className="text-[19px] font-black text-[var(--app-orange)]">
            $1,000,000 初始模拟资金
          </p>
          <p className="mt-1 text-[10px] text-[#b18b62]">立即登记参加比赛</p>
        </div>

        <div className="mt-5 flex justify-center gap-6">
          <button className="flex items-center gap-1 text-[11px] font-bold text-[#4f5d73]">
            <span className="text-orange-400">🎁</span>
            本季奖品
          </button>
          <button className="flex items-center gap-1 text-[11px] font-bold text-[#4f5d73]">
            <span className="text-orange-400">🎬</span>
            影片介绍
          </button>
        </div>

        <Link
          href="/auth"
          className="mt-8 flex h-12 items-center justify-center rounded-full bg-[var(--app-orange)] text-[14px] font-bold text-white shadow-[0_16px_28px_rgba(255,140,26,0.24)] transition-transform active:scale-95"
        >
          手机号码注册 / 登录
        </Link>

        <div className="pt-5">
          <Link href="/more" className="text-[11px] font-bold text-[var(--app-orange-dark)] hover:underline">
            比赛规则
          </Link>
        </div>

        <div className="mt-auto pt-10">
          <p className="text-[9px] font-medium uppercase tracking-widest text-[#cbd5e1]">
            © 2020 AASTOCKS.com LIMITED. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </AuthViewport>
  );
}

export function AuthOrbitPreview() {
  const router = useRouter();

  return (
    <AuthViewport>
      <AuthTopBar title="注册 / 登录" closeHref="/guest" />
      <div className="flex flex-1 flex-col px-4 pb-[max(env(safe-area-inset-bottom),24px)] pt-5 text-center">
        <div className="relative mx-auto aspect-square w-full max-w-[280px]">
          <div className="absolute inset-4 rounded-full border border-[#f6dcc0]" />
          <div className="absolute inset-11 rounded-full border border-[#fae8d3]" />
          <button
            type="button"
            onClick={() => router.push("/auth/pin")}
            className="absolute inset-[76px] flex items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_24%,#ffcf8a,#f38b1b_72%)] px-4 text-center shadow-[0_22px_40px_rgba(243,139,27,0.28)] transition-transform active:scale-[0.98]"
            aria-label="手机号码注册登录"
          >
            <span className="whitespace-nowrap text-[13px] font-black tracking-[0.02em] text-white">
              手机号码注册/登录
            </span>
          </button>

          <div className="absolute left-[20px] top-[84px] flex h-11 w-11 items-center justify-center rounded-full bg-[#fff0d8] text-[var(--app-orange-dark)] shadow-[0_12px_22px_rgba(243,139,27,0.18)]">
            <Smartphone className="h-5 w-5" />
          </div>
          <div className="absolute right-[18px] top-[92px] flex h-11 w-11 items-center justify-center rounded-full bg-[#fff0d9] text-[14px] font-semibold text-[var(--app-orange-dark)] shadow-[0_10px_20px_rgba(243,139,27,0.12)]">
            S
          </div>
          <div className="absolute bottom-[26px] left-[56px] flex h-11 w-11 items-center justify-center rounded-full bg-[#fff4e3] text-[var(--app-orange-dark)] shadow-[0_10px_20px_rgba(243,139,27,0.12)]">
            ☁
          </div>
          <div className="absolute bottom-[28px] right-[44px] flex h-11 w-11 items-center justify-center rounded-full bg-[#fff4e3] text-[var(--app-orange-dark)] shadow-[0_10px_20px_rgba(243,139,27,0.12)]">
            ▣
          </div>
        </div>

        <p className="mt-4 whitespace-nowrap text-[15px] font-black text-[#4a5568]">
          手机号码注册/登录
        </p>
        <p className="mt-2 text-[11px] text-[#9f8568]">点击中间圆形按钮，进入号码验证流程</p>

        <div className="mt-6 rounded-[24px] bg-white/82 px-4 py-4 shadow-[0_16px_28px_rgba(171,86,0,0.08)]">
          <p className="text-[12px] font-black text-[#4a5568]">快速建立比赛角色</p>
          <p className="mt-2 text-[11px] leading-relaxed text-[#9f8568]">
            使用手机号完成验证后，即可设置头像、昵称并进入橙色主题交易首页。
          </p>
        </div>

        <div className="mt-auto pt-6">
          <p className="text-[10px] font-semibold tracking-[0.08em] text-[#c49a6d]">
            TAP THE CENTER BUTTON TO CONTINUE
          </p>
        </div>
      </div>
    </AuthViewport>
  );
}

export function AuthPinPreview() {
  const router = useRouter();
  const [phone, setPhone] = useState("91234567");
  const [code, setCode] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const isReady = phone.length >= 8 && code.length >= 4 && agreed;

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCountdown((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [countdown]);

  const canSendCode = phone.length >= 8 && countdown === 0;

  return (
    <AuthViewport>
      <AuthTopBar title="手机号码注册 / 登录" closeHref="/auth?modal=leave" />

      <div className="flex flex-1 flex-col px-4 pb-[max(env(safe-area-inset-bottom),24px)] pt-3">
        <div className="rounded-[24px] bg-white/92 px-4 py-5 shadow-[0_18px_34px_rgba(171,86,0,0.08)]">
          <h2 className="text-center text-[17px] font-black text-[#4f5d73]">手机号码注册 / 登录</h2>
          <p className="mt-2 text-center text-[11px] text-[#a48360]">请输入手机号并完成短信验证码验证</p>

          <div className="mt-5 space-y-3">
            <div className="rounded-[18px] border border-[#efdcc7] bg-[#fffaf4] px-4 py-3 text-left">
              <p className="text-[10px] font-semibold text-[#b08d68]">手机号码</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="rounded-full bg-[#fff1de] px-2 py-1 text-[10px] font-bold text-[var(--app-orange-dark)]">
                  +852
                </span>
                <input
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value.replace(/\D/g, "").slice(0, 11))
                  }
                  inputMode="numeric"
                  placeholder="请输入手机号"
                  className="min-w-0 flex-1 bg-transparent text-[15px] font-black tracking-[0.08em] text-[#4f5d73] outline-none placeholder:text-[#d0b089]"
                />
              </div>
            </div>

            <div className="rounded-[18px] border border-[#efdcc7] bg-[#fffaf4] px-4 py-3 text-left">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold text-[#b08d68]">短信验证码</p>
                  <input
                    value={code}
                    onChange={(event) =>
                      setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    inputMode="numeric"
                    placeholder="请输入验证码"
                    className="mt-2 w-full bg-transparent text-[15px] font-black tracking-[0.2em] text-[#4f5d73] outline-none placeholder:tracking-normal placeholder:text-[#d0b089]"
                  />
                </div>
                <button
                  type="button"
                  disabled={!canSendCode}
                  onClick={() => {
                    if (!canSendCode) {
                      return;
                    }
                    setCountdown(60);
                  }}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold text-white shadow-[0_8px_16px_rgba(255,140,26,0.16)] ${
                    canSendCode ? "bg-[var(--app-orange)]" : "bg-[#e7d3bd]"
                  }`}
                >
                  {countdown > 0 ? `${countdown}s` : "获取验证码"}
                </button>
              </div>
            </div>
          </div>

        </div>

        <label className="mt-4 flex items-start gap-2 text-[10px] leading-relaxed text-[#9a866d]">
          <button
            type="button"
            onClick={() => setAgreed((current) => !current)}
            className={`mt-[1px] flex h-4 w-4 items-center justify-center rounded-[4px] border ${
              agreed
                ? "border-[#f0b56b] bg-[#fff1de] text-[var(--app-orange-dark)]"
                : "border-[#dcc8b3] bg-white text-transparent"
            }`}
            aria-label="同意条款"
          >
            <Check className="h-3 w-3" />
          </button>
          <span>本人已阅读及同意有关条款及细则</span>
        </label>

        <button
          type="button"
          disabled={!isReady}
          onClick={() => {
            if (isReady) {
              router.push("/auth/invite");
            }
          }}
          className={`mt-auto flex h-12 w-full items-center justify-center rounded-full text-[14px] font-semibold text-white ${
            isReady
              ? "bg-[var(--app-orange)] shadow-[0_12px_24px_rgba(255,140,26,0.18)]"
              : "bg-[#f2d8b8]"
          }`}
        >
          下一步
        </button>
      </div>
    </AuthViewport>
  );
}

export function InviteFriendsPreview() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const avatars = [
    "from-[#ffd9bf] to-[#ffb476]",
    "from-[#ffe3ea] to-[#ff9191]",
    "from-[#fff0d8] to-[#ff9b45]",
    "from-[#ffeabf] to-[#ffc941]",
    "from-[#ffe7cf] to-[#f59e0b]",
    "from-[#ffe2c0] to-[#ff7d33]",
  ];
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(0);
  const [nickname, setNickname] = useState("Joey Cheung");
  const [customAvatarPreview, setCustomAvatarPreview] = useState<string | null>(null);
  const hasAvatar = selectedAvatar !== null || !!customAvatarPreview;

  const handleCustomAvatar = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCustomAvatarPreview(typeof reader.result === "string" ? reader.result : null);
      setSelectedAvatar(null);
    };
    reader.readAsDataURL(file);
  };

  return (
    <AuthViewport>
      <AuthTopBar title="创建角色" closeHref="/auth/pin" />
      <div className="flex flex-1 flex-col px-4 pb-[max(env(safe-area-inset-bottom),24px)] pt-4 text-center">
        <h2 className="text-[17px] font-black text-[#4f5d73]">选择头像</h2>
        <div className="mt-5 grid grid-cols-3 gap-x-5 gap-y-4">
          {avatars.map((tone, index) => (
            <button
              type="button"
              key={tone}
              onClick={() => {
                setSelectedAvatar(index);
                setCustomAvatarPreview(null);
              }}
              className="flex flex-col items-center"
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${tone} text-[14px] font-semibold text-white shadow-[0_10px_20px_rgba(15,23,42,0.08)] ring-2 ring-offset-2 ring-offset-[#fff2e1] ${
                  selectedAvatar === index ? "ring-[var(--app-orange)]" : "ring-transparent"
                }`}
              >
                {String.fromCharCode(65 + index)}
              </div>
              <span
                className={`mt-2 h-1.5 w-6 rounded-full ${
                  selectedAvatar === index ? "bg-[var(--app-orange)]" : "bg-transparent"
                }`}
              />
            </button>
          ))}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCustomAvatar}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mx-auto mt-5 flex flex-col items-center"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff1de] text-[23px] text-[var(--app-orange-dark)] shadow-[0_10px_20px_rgba(171,86,0,0.08)]">
            +
          </div>
          <span className="mt-2 text-[10px] font-semibold text-[#b08d68]">
            上传头像
          </span>
        </button>
        <p className="mt-4 text-[11px] text-[#b08d68]">输入昵称</p>
        <input
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          className="mx-auto mt-2 h-11 w-full rounded-full border border-[#efdcc7] bg-white px-4 text-center text-[13px] font-semibold text-[#4f5d73] outline-none"
          placeholder="请输入昵称"
        />
        <button
          type="button"
          disabled={!nickname.trim() || !hasAvatar}
          onClick={() => {
            if (nickname.trim() && hasAvatar) {
              router.push("/");
            }
          }}
          className={`mt-auto inline-flex h-11 w-full items-center justify-center rounded-full text-[13px] font-semibold ${
            nickname.trim() && hasAvatar
              ? "bg-[var(--app-orange)] text-white shadow-[0_12px_24px_rgba(255,140,26,0.18)]"
              : "bg-[#f3e2cf] text-[#c0a68b]"
          }`}
        >
          确定
        </button>
      </div>
    </AuthViewport>
  );
}

export function LeaveConfirmPreview() {
  return (
    <AuthViewport className="relative">
      <div className="pointer-events-none opacity-45">
        <AuthPinPreview />
      </div>

      <div className="absolute inset-0 flex items-center justify-center bg-[rgba(36,45,61,0.34)] px-5">
        <div className="w-full max-w-[280px] rounded-[18px] bg-white px-5 py-5 shadow-[0_24px_48px_rgba(15,23,42,0.22)]">
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#fff1de] text-[11px] font-semibold text-[var(--app-orange-dark)]">
              i
            </span>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-[#4f5d73]">确认终止登入流程？</p>
              <p className="mt-1 text-[10px] leading-relaxed text-[#9aa4b3]">
                已输入的资料将不会保留。
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <Link
              href="/auth/pin"
              className="flex h-10 items-center justify-center rounded-full bg-[#f7af57] text-[11px] font-semibold text-white shadow-[0_8px_16px_rgba(255,140,26,0.14)]"
            >
              取消
            </Link>
            <Link
              href="/guest"
              className="flex h-10 items-center justify-center rounded-full bg-[var(--app-orange)] text-[11px] font-semibold text-white shadow-[0_8px_16px_rgba(255,140,26,0.16)]"
            >
              离开
            </Link>
          </div>
        </div>
      </div>
    </AuthViewport>
  );
}

export function AccountBlockedPreview() {
  return (
    <AuthViewport className="relative">
      <div className="pointer-events-none opacity-40">
        <GuestLandingPreview />
      </div>

      <div className="absolute inset-0 flex items-center justify-center bg-[rgba(36,45,61,0.36)] px-5">
        <div className="w-full max-w-[280px] rounded-[18px] bg-white px-5 py-5 shadow-[0_24px_48px_rgba(15,23,42,0.2)]">
          <div className="relative mx-auto h-[108px] w-[140px] overflow-hidden rounded-[14px] bg-[linear-gradient(160deg,#fff7eb,#ffe7c3)]">
            <div className="absolute left-6 top-7 h-12 w-12 rounded-full bg-[#ffedd5]" />
            <div className="absolute left-[30px] top-[24px] h-9 w-9 rounded-full bg-[#f6b26b]" />
            <div className="absolute right-8 top-6 h-16 w-12 rounded-[12px] bg-[#ffb978]/20" />
            <div className="absolute right-[34px] top-[18px] h-12 w-10 rounded-[10px] bg-[#f38b1b]" />
            <div className="absolute right-[40px] top-[32px] h-6 w-6 rounded-md bg-white/90" />
          </div>
          <p className="mt-3 text-center text-[13px] font-semibold text-[#4f5d73]">
            抱歉，因阁下违反了模拟投资大赛规则
          </p>
          <p className="mt-1 text-center text-[10px] leading-relaxed text-[#9aa4b3]">
            您的比赛资格已被取消，请联络活动主办方查询。
          </p>
          <Link
            href="/guest"
            className="mt-5 flex h-10 items-center justify-center rounded-full bg-[var(--app-orange)] text-[11px] font-semibold text-white"
          >
            关闭
          </Link>
        </div>
      </div>
    </AuthViewport>
  );
}

function ModalShell({
  children,
  product,
}: {
  children: ReactNode;
  product: TradeProduct;
}) {
  return (
    <AppScreen className="relative">
      <div className="pointer-events-none mx-auto w-full max-w-[320px] opacity-40">
        <TradeTicketCard product={product} />
      </div>

      <div className="absolute inset-0 flex items-center justify-center bg-[rgba(36,45,61,0.3)] px-4">
        <div className="relative w-full max-w-[282px] rounded-[12px] bg-white px-4 py-4 shadow-[0_24px_48px_rgba(15,23,42,0.24)]">
          {children}
        </div>
      </div>
    </AppScreen>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span className="text-[10px] text-[#aab3c0]">{label}</span>
      <span className="text-right text-[11px] font-semibold text-[#4f5d73]">{value}</span>
    </>
  );
}

export function TradeConfirmPreview({
  product,
  title,
}: {
  product: TradeProduct;
  title: string;
}) {
  const quantity = product.quantity ?? product.defaultQuantity ?? "10";
  const cash = product.cash ?? product.settlementTotal ?? "1,335.80";

  return (
    <ModalShell product={product}>
      <h2 className="text-center text-[13px] font-semibold text-[#4f5d73]">{title}</h2>
      <div className="mt-3 grid grid-cols-[1fr_auto] gap-x-3 gap-y-2.5">
        <DetailRow label="买入 / 卖出" value="买入" />
        <DetailRow label="代码" value={product.symbol} />
        <DetailRow label="价格" value={product.price} />
        <DetailRow label="数量" value={quantity} />
        <DetailRow label="估算金额" value={`${cash} 港元`} />
      </div>
      <p className="mt-3 text-center text-[9px] leading-relaxed text-[#aab3c0]">
        {title.includes("下一") ? "交易指示将于下一交易日执行" : "交易指示有效至本日收市"}
      </p>
      <div className="mt-4 flex gap-2">
        <Link
          href="/more"
          className="flex-1 rounded-full border border-[#efdcc7] bg-white py-1.5 text-center text-[11px] font-semibold text-[#6f7c8f]"
        >
          更改
        </Link>
        <Link
          href="/"
          className="flex-1 rounded-full bg-[var(--app-orange)] py-1.5 text-center text-[11px] font-semibold text-white shadow-[0_8px_16px_rgba(255,140,26,0.18)]"
        >
          确认
        </Link>
      </div>
    </ModalShell>
  );
}

export function TradeDetailPreview({ product }: { product: TradeProduct }) {
  const cash = product.cash ?? product.settlementTotal ?? "1,335.80";

  return (
    <ModalShell product={product}>
      <Link
        href="/"
        className="absolute right-5 top-5 text-[#98a5b9]"
        aria-label="关闭"
      >
        <X className="h-4 w-4" />
      </Link>
      <h2 className="text-center text-[13px] font-semibold text-[#4f5d73]">交易详情</h2>
      <div className="mt-3 grid grid-cols-[1fr_auto] gap-x-3 gap-y-2">
        <DetailRow label="买入 / 卖出" value="买入" />
        <DetailRow label="代码" value={product.symbol} />
        <DetailRow label="成交均价" value={product.price} />
        <DetailRow label="已成交数量" value="10" />
        <DetailRow label="总值" value={`${cash} 港元`} />
      </div>
      <div className="mt-4 space-y-2">
        <Link
          href="/more"
          className="flex h-8 items-center justify-center rounded-full border border-[var(--app-orange-soft)] bg-white text-[11px] font-semibold text-[var(--app-orange)]"
        >
          更改订单
        </Link>
        <Link
          href="/records"
          className="flex h-8 w-full items-center justify-center rounded-full border border-[var(--app-orange-soft)] bg-white text-[11px] font-semibold text-[var(--app-orange)]"
        >
          取消订单
        </Link>
        <Link
          href="/"
          className="flex h-8 items-center justify-center rounded-full bg-[var(--app-orange-soft)] text-[11px] font-semibold text-[var(--app-orange)]"
        >
          返回主画面
        </Link>
      </div>
    </ModalShell>
  );
}

export function TradeEditPreview({ product }: { product: TradeProduct }) {
  return (
    <ModalShell product={product}>
      <h2 className="text-center text-[13px] font-semibold text-[#4f5d73]">更改订单</h2>
      <div className="mt-3 grid grid-cols-[1fr_auto] gap-x-3 gap-y-2">
        <DetailRow label="买入 / 卖出" value="买入" />
        <DetailRow label="代码" value={product.symbol} />
        <DetailRow label="数量" value="10" />
        <DetailRow label="价格" value={product.price} />
        <DetailRow label="已成交" value="61" />
      </div>
      <div className="mt-4 flex gap-2">
        <Link
          href="/records"
          className="flex-1 rounded-full border border-[#efdcc7] bg-white py-1.5 text-center text-[11px] font-semibold text-[#6f7c8f]"
        >
          取消
        </Link>
        <Link
          href="/"
          className="flex-1 rounded-full bg-[var(--app-orange)] py-1.5 text-center text-[11px] font-semibold text-white shadow-[0_8px_16px_rgba(255,140,26,0.18)]"
        >
          确定
        </Link>
      </div>
    </ModalShell>
  );
}

export function TradeSuccessPreview({ product }: { product: TradeProduct }) {
  return (
    <ModalShell product={product}>
      <div className="flex justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e9f8ef] text-[var(--app-green)] shadow-[0_10px_20px_rgba(38,178,106,0.12)]">
          <Check className="h-6 w-6" />
        </div>
      </div>
      <h2 className="mt-3 text-center text-[14px] font-semibold text-[#4f5d73]">提交成功</h2>
      <div className="mt-4 space-y-2">
        <Link
          href="/records"
          className="flex h-8 items-center justify-center rounded-full border border-[var(--app-orange-soft)] bg-white text-[11px] font-semibold text-[var(--app-orange)]"
        >
          查看交易状况
        </Link>
        <Link
          href="/"
          className="flex h-8 items-center justify-center rounded-full border border-[var(--app-orange-soft)] bg-white text-[11px] font-semibold text-[var(--app-orange)]"
        >
          再次交易
        </Link>
        <Link
          href="/"
          className="flex h-8 items-center justify-center rounded-full border border-[var(--app-orange-soft)] bg-white text-[11px] font-semibold text-[var(--app-orange)]"
        >
          返回 AASTOCKS 查看报价
        </Link>
        <Link
          href="/"
          className="flex h-8 items-center justify-center rounded-full bg-[var(--app-orange-soft)] text-[11px] font-semibold text-[var(--app-orange)]"
        >
          返回主页
        </Link>
      </div>
    </ModalShell>
  );
}

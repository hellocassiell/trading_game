"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppScreen from "../../components/AppScreen";
import {
  clearAuthDraft,
  createAuthSession,
  getAuthEntryViewModel,
  requestAuthCode,
  verifyAuthCodeAndCreateSession,
} from "../../lib/adapters/auth";
import { tradingApiClient } from "../../lib/api";

export default function AuthPage() {
  const router = useRouter();
  const viewModel = getAuthEntryViewModel();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [helperMessage, setHelperMessage] = useState("");
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const digits = phone.replace(/\D/g, "");
  const normalizedPhone = digits.slice(0, 8);
  const normalizedCode = code.replace(/\D/g, "").slice(0, 6);
  const canProceed = normalizedPhone.length === 8 && normalizedCode.length === 6 && agreed;
  const canSendCode = normalizedPhone.length === 8 && countdown === 0;
  const formattedPhone = useMemo(() => {
    if (normalizedPhone.length <= 4) {
      return normalizedPhone;
    }

    return `${normalizedPhone.slice(0, 4)} ${normalizedPhone.slice(4)}`;
  }, [normalizedPhone]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    setShowLeaveConfirm(params.get("modal") === "leave");
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCountdown((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [countdown]);

  function updatePhone(nextValue: string) {
    setPhone(nextValue.replace(/\D/g, "").slice(0, 8));
    if (errorMessage) {
      setErrorMessage("");
    }
    if (helperMessage) {
      setHelperMessage("");
    }
  }

  function updateCode(nextValue: string) {
    setCode(nextValue.replace(/\D/g, "").slice(0, 6));
    if (errorMessage) {
      setErrorMessage("");
    }
  }

  async function handleSendCode() {
    if (normalizedPhone.length !== 8) {
      setErrorMessage(viewModel.invalidPhoneMessage);
      return;
    }
    try {
      setIsSending(true);
      setErrorMessage("");
      await requestAuthCode(normalizedPhone);
      setHelperMessage(viewModel.codeSentMessage);
      setCountdown(60);
    } catch (error) {
      const message = error instanceof Error ? error.message : "验证码发送失败，请稍后再试";
      setErrorMessage(message);
    } finally {
      setIsSending(false);
    }
  }

  async function handleNext() {
    if (normalizedPhone.length !== 8) {
      setErrorMessage(viewModel.invalidPhoneMessage);
      return;
    }
    if (normalizedCode.length !== 6) {
      setErrorMessage(viewModel.invalidCodeMessage);
      return;
    }
    if (!agreed) {
      setErrorMessage(viewModel.uncheckedAgreementMessage);
      return;
    }
    try {
      setIsVerifying(true);
      setErrorMessage("");
      const session = await verifyAuthCodeAndCreateSession(normalizedPhone, normalizedCode);
      // 先把后端返回的基础信息写入 session，头像和昵称在下一步补齐。
      createAuthSession({
        phone: normalizedPhone,
        nickname: "",
        avatarId: "",
        loggedInAt: new Date().toISOString(),
        userId: session.userId,
        token: session.token,
      });
      if (session.profileCompleted) {
        const account = await tradingApiClient.getAccountAssets(session.userId);
        createAuthSession({
          phone: normalizedPhone,
          nickname: account.nickname ?? "",
          avatarId: account.avatar ?? "",
          loggedInAt: new Date().toISOString(),
          userId: session.userId,
          token: session.token,
        });
        clearAuthDraft();
        router.push("/");
      } else {
        router.push("/auth/invite");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "验证码校验失败，请稍后再试";
      setErrorMessage(message);
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <AppScreen className="!px-0 !pb-0">
      <div className="min-h-[100dvh] bg-[#f1f1f1] text-[#191919]">
        <div className="px-6 pb-[max(env(safe-area-inset-bottom),20px)] pt-[max(env(safe-area-inset-top),20px)]">
          <div className="relative flex items-center justify-center">
            <h1 className="text-[18px] font-semibold text-[#151515]">{viewModel.title}</h1>
            <button
              type="button"
              onClick={() => setShowLeaveConfirm(true)}
              aria-label="关闭"
              className="absolute right-0 top-1 inline-flex h-9 w-9 items-center justify-center rounded-full text-[28px] leading-none text-[#212121]"
            >
              ×
            </button>
          </div>

          <p className="mt-8 text-center text-[15px] text-[#686868]">{viewModel.description}</p>

          <div className="mt-10 border-b border-[#7db2fb] pb-3">
            <div className="flex items-center gap-3 text-[#212121]">
              <span className="text-[18px]">📱</span>
              <span className="text-[18px]">{viewModel.countryCode}</span>
              <span className="text-[18px] text-[#989898]">⌄</span>
              <input
                type="tel"
                inputMode="numeric"
                value={formattedPhone}
                onChange={(event) => updatePhone(event.target.value)}
                placeholder={viewModel.phonePlaceholder}
                className="min-w-0 flex-1 bg-transparent text-[18px] tracking-[0.02em] text-[#1e1e1e] outline-none placeholder:text-[#8b8b8b]"
              />
            </div>
          </div>

          <div className="mt-8 border-b border-[#d7d7d7] pb-3">
            <div className="flex items-center gap-3 text-[#212121]">
              <span className="text-[16px]">✉️</span>
              <input
                type="tel"
                inputMode="numeric"
                value={normalizedCode}
                onChange={(event) => updateCode(event.target.value)}
                placeholder={viewModel.codePlaceholder}
                className="min-w-0 flex-1 bg-transparent text-[28px] tracking-[0.2em] text-[#1e1e1e] outline-none placeholder:text-[#8b8b8b]"
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={!canSendCode || isSending}
                className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition ${
                  canSendCode
                    ? "bg-[linear-gradient(90deg,#f39a31_0%,#ee7e00_100%)] text-white shadow-[0_10px_20px_rgba(229,132,44,0.24)]"
                    : "bg-[#ebebeb] text-[#9d9d9d]"
                }`}
              >
                {isSending
                  ? "发送中..."
                  : countdown > 0
                  ? `${countdown}s`
                  : helperMessage
                    ? viewModel.resendCodeLabel
                    : viewModel.sendCodeLabel}
              </button>
            </div>
          </div>

          <label className="mt-8 flex items-center justify-center gap-3 text-[14px] text-[#777777]">
            <span
              className={`inline-flex h-6 w-6 items-center justify-center rounded-sm border text-[14px] ${
                agreed
                  ? "border-[#e69334] bg-[#fff1de] text-[#e2801d]"
                  : "border-[#c7c7c7] bg-[#f7f7f7] text-transparent"
              }`}
            >
              ✓
            </span>
            <input
              type="checkbox"
              checked={agreed}
              onChange={(event) => {
                setAgreed(event.target.checked);
                if (errorMessage) {
                  setErrorMessage("");
                }
              }}
              className="sr-only"
            />
            <span>
              {viewModel.agreementPrefix}
              <span className="text-[#ef7c00]">{viewModel.agreementLinkLabel}</span>
            </span>
          </label>

          <div className="mt-16 flex justify-center">
            <button
              type="button"
              onClick={handleNext}
              disabled={isVerifying || !canProceed}
              className={`h-14 w-[220px] rounded-full text-[18px] font-medium text-white transition ${
                canProceed && !isVerifying
                  ? "bg-[linear-gradient(90deg,#f39a31_0%,#ee7e00_100%)] shadow-[0_14px_28px_rgba(229,132,44,0.28)]"
                  : "bg-[#d8d8d8]"
              }`}
            >
              {isVerifying ? "验证中..." : viewModel.nextLabel}
            </button>
          </div>

          {errorMessage ? (
            <p className="mt-4 text-center text-[13px] text-[#c04127]">{errorMessage}</p>
          ) : helperMessage ? (
            <p className="mt-4 text-center text-[13px] text-[#5c8d4a]">{helperMessage}</p>
          ) : null}
        </div>

        {showLeaveConfirm ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(23,23,23,0.36)] px-6">
            <div className="w-full max-w-[330px] rounded-[20px] bg-[#f7f7f7] px-5 py-6 shadow-[0_24px_44px_rgba(28,28,28,0.28)]">
              <h2 className="text-center text-[26px] font-semibold">确认离开注册流程？</h2>
              <p className="mt-3 text-center text-[16px] leading-[1.5] text-[#666]">
                已输入资料将不会保留，离开后需要重新输入。
              </p>
              <div className="mt-7 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShowLeaveConfirm(false)}
                  className="rounded-[14px] border border-[#e1e1e1] bg-white px-4 py-3 text-center text-[16px] font-medium text-[#575757]"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearAuthDraft();
                    router.push("/guest");
                  }}
                  className="rounded-[14px] bg-[linear-gradient(90deg,#f49d38_0%,#ee7d00_100%)] px-4 py-3 text-center text-[16px] font-semibold text-white shadow-[0_12px_24px_rgba(230,129,20,0.26)]"
                >
                  离开
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AppScreen>
  );
}

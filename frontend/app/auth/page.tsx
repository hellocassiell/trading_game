"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppScreen from "../../components/AppScreen";
import {
  clearAuthDraft,
  createAuthSession,
  getAuthEntryViewModel,
  getLeaveConfirmViewModel,
  requestAuthCode,
  verifyAuthCodeAndCreateSession,
} from "../../lib/adapters/auth";
import { useLanguage } from "../../components/LanguageProvider";
import { byLanguage } from "../../lib/locale";
import { tradingApiClient } from "../../lib/api";

export default function AuthPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const viewModel = getAuthEntryViewModel(language);
  const leaveConfirmViewModel = getLeaveConfirmViewModel(language);
  const copy = byLanguage(language, {
    "zh-Hant": {
      close: "關閉",
      sending: "發送中...",
      verifying: "驗證中...",
      sendCodeFailed: "驗證碼發送失敗，請稍後再試",
      verifyFailed: "驗證碼校驗失敗，請稍後再試",
    },
    "zh-Hans": {
      close: "关闭",
      sending: "发送中...",
      verifying: "验证中...",
      sendCodeFailed: "验证码发送失败，请稍后再试",
      verifyFailed: "验证码校验失败，请稍后再试",
    },
    en: {
      close: "Close",
      sending: "Sending...",
      verifying: "Verifying...",
      sendCodeFailed: "Failed to send verification code. Please try again later.",
      verifyFailed: "Verification failed. Please try again later.",
    },
  });
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [helperMessage, setHelperMessage] = useState("");
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
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
      const message = error instanceof Error ? error.message : copy.sendCodeFailed;
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
      // Persist base session first; avatar and nickname are completed on the next step.
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
      const message = error instanceof Error ? error.message : copy.verifyFailed;
      setErrorMessage(message);
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <AppScreen className="!px-0 !pb-0">
      <div className="min-h-[100dvh] bg-[#f1f1f1] text-[#191919]">
        <div className="px-6 pb-[max(env(safe-area-inset-bottom),20px)] pt-[max(env(safe-area-inset-top),20px)]">
          <div className="relative flex h-9 items-center justify-center">
            <h1 className="text-[18px] font-semibold text-[#151515]">{viewModel.title}</h1>
            <button
              type="button"
              onClick={() => setShowLeaveConfirm(true)}
              aria-label={copy.close}
              className="absolute right-0 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[28px] leading-none text-[#212121]"
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
                  ? copy.sending
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
              <button
                type="button"
                onClick={() => setShowTermsDialog(true)}
                className="text-[#ef7c00] underline"
              >
                {viewModel.agreementLinkLabel}
              </button>
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
              {isVerifying ? copy.verifying : viewModel.nextLabel}
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
              <h2 className="text-center text-[26px] font-semibold">{leaveConfirmViewModel.title}</h2>
              <p className="mt-3 text-center text-[16px] leading-[1.5] text-[#666]">
                {leaveConfirmViewModel.description}
              </p>
              <div className="mt-7 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShowLeaveConfirm(false)}
                  className="rounded-[14px] border border-[#e1e1e1] bg-white px-4 py-3 text-center text-[16px] font-medium text-[#575757]"
                >
                  {leaveConfirmViewModel.cancelLabel}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearAuthDraft();
                    router.push("/guest");
                  }}
                  className="rounded-[14px] bg-[linear-gradient(90deg,#f49d38_0%,#ee7d00_100%)] px-4 py-3 text-center text-[16px] font-semibold text-white shadow-[0_12px_24px_rgba(230,129,20,0.26)]"
                >
                  {leaveConfirmViewModel.leaveLabel}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {showTermsDialog ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(23,23,23,0.36)] px-6">
            <div className="max-h-[80vh] w-full max-w-[330px] overflow-hidden rounded-[20px] bg-white shadow-[0_24px_44px_rgba(28,28,28,0.28)]">
              <div className="border-b border-[#f0f0f0] px-5 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-[18px] font-semibold text-[#151515]">
                    {language === "zh-Hant" ? "條款與細則" : language === "zh-Hans" ? "条款与细则" : "Terms & Conditions"}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowTermsDialog(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[24px] text-[#999]"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
                <div className="space-y-4 text-[14px] leading-[1.6] text-[#333]">
                  {language === "zh-Hant" ? (
                    <>
                      <h3 className="font-semibold">1. 比賽規則</h3>
                      <p>本港股模擬交易比賽由主辦方舉辦，旨在為參賽者提供高仿真的港股交易體驗。每位參賽者將獲得 1,000,000 港元虛擬資金進行交易。</p>

                      <h3 className="font-semibold">2. 交易規則</h3>
                      <p>• 交易時段：香港交易日 09:30-12:00、13:00-16:00</p>
                      <p>• 僅支持限價盤和市價盤</p>
                      <p>• 必須按手交易，不支持碎股</p>
                      <p>• 單日買入上限：20 筆</p>
                      <p>• 限價盤輪候上限：每賬戶最多 5 個</p>
                      <p>• 結算週期：T+2 營業日</p>

                      <h3 className="font-semibold">3. 費用說明</h3>
                      <p>每筆交易將收取以下費用：</p>
                      <p>• 經紀佣金：成交金額的 0.25%，最低 HK$100</p>
                      <p>• 交易處理費（僅買入）：每手 HK$2.5，範圍 HK$30-200</p>
                      <p>• 印花稅：成交金額的 0.1%，最低 HK$1</p>
                      <p>• 交易徵費：成交金額的 0.003%</p>
                      <p>• 交易費：成交金額的 0.005%</p>

                      <h3 className="font-semibold">4. 風險聲明</h3>
                      <p>本比賽為模擬交易，所有資金均為虛擬資金，不涉及真實金錢交易。比賽結果僅供參考，不構成任何投資建議。參賽者應理性參與，不得利用比賽進行任何違法活動。</p>

                      <h3 className="font-semibold">5. 個人資料</h3>
                      <p>主辦方將按照個人資料私隱條例保護參賽者的個人資料，僅用於比賽相關用途，不會向第三方披露。</p>

                      <h3 className="font-semibold">6. 免責聲明</h3>
                      <p>主辦方保留隨時修改比賽規則的權利，恕不另行通知。如對比賽規則有任何疑問，請聯繫主辦方。</p>
                    </>
                  ) : language === "zh-Hans" ? (
                    <>
                      <h3 className="font-semibold">1. 比赛规则</h3>
                      <p>本港股模拟交易比赛由主办方举办，旨在为参赛者提供高仿真的港股交易体验。每位参赛者将获得 1,000,000 港元虚拟资金进行交易。</p>

                      <h3 className="font-semibold">2. 交易规则</h3>
                      <p>• 交易时段：香港交易日 09:30-12:00、13:00-16:00</p>
                      <p>• 仅支持限价盘和市价盘</p>
                      <p>• 必须按手交易，不支持碎股</p>
                      <p>• 单日买入上限：20 笔</p>
                      <p>• 限价盘轮候上限：每账户最多 5 个</p>
                      <p>• 结算周期：T+2 营业日</p>

                      <h3 className="font-semibold">3. 费用说明</h3>
                      <p>每笔交易将收取以下费用：</p>
                      <p>• 经纪佣金：成交金额的 0.25%，最低 HK$100</p>
                      <p>• 交易处理费（仅买入）：每手 HK$2.5，范围 HK$30-200</p>
                      <p>• 印花税：成交金额的 0.1%，最低 HK$1</p>
                      <p>• 交易征费：成交金额的 0.003%</p>
                      <p>• 交易费：成交金额的 0.005%</p>

                      <h3 className="font-semibold">4. 风险声明</h3>
                      <p>本比赛为模拟交易，所有资金均为虚拟资金，不涉及真实金钱交易。比赛结果仅供参考，不构成任何投资建议。参赛者应理性参与，不得利用比赛进行任何违法活动。</p>

                      <h3 className="font-semibold">5. 个人资料</h3>
                      <p>主办方将按照个人资料隐私条例保护参赛者的个人资料，仅用于比赛相关用途，不会向第三方披露。</p>

                      <h3 className="font-semibold">6. 免责声明</h3>
                      <p>主办方保留随时修改比赛规则的权利，恕不另行通知。如对比赛规则有任何疑问，请联系主办方。</p>
                    </>
                  ) : (
                    <>
                      <h3 className="font-semibold">1. Competition Rules</h3>
                      <p>This HK stock simulation trading competition is organized by the organizer to provide participants with a realistic HK stock trading experience. Each participant will receive HK$1,000,000 in virtual funds for trading.</p>

                      <h3 className="font-semibold">2. Trading Rules</h3>
                      <p>• Trading Hours: HK trading days 09:30-12:00, 13:00-16:00</p>
                      <p>• Only limit orders and market orders are supported</p>
                      <p>• Must trade in lots, odd lots not allowed</p>
                      <p>• Daily buy limit: 20 orders</p>
                      <p>• Pending limit order limit: Maximum 5 per account</p>
                      <p>• Settlement cycle: T+2 business days</p>

                      <h3 className="font-semibold">3. Fee Schedule</h3>
                      <p>Each transaction will incur the following fees:</p>
                      <p>• Brokerage commission: 0.25% of transaction amount, minimum HK$100</p>
                      <p>• Trading processing fee (buy only): HK$2.5 per lot, range HK$30-200</p>
                      <p>• Stamp duty: 0.1% of transaction amount, minimum HK$1</p>
                      <p>• Trading levy: 0.003% of transaction amount</p>
                      <p>• Trading fee: 0.005% of transaction amount</p>

                      <h3 className="font-semibold">4. Risk Disclosure</h3>
                      <p>This competition is a simulation trading, all funds are virtual funds, and do not involve real money transactions. Competition results are for reference only and do not constitute any investment advice. Participants should participate rationally and must not use the competition for any illegal activities.</p>

                      <h3 className="font-semibold">5. Personal Data</h3>
                      <p>The organizer will protect the personal data of participants in accordance with the Personal Data Privacy Ordinance, and will only use it for competition-related purposes and will not disclose it to third parties.</p>

                      <h3 className="font-semibold">6. Disclaimer</h3>
                      <p>The organizer reserves the right to modify the competition rules at any time without notice. If you have any questions about the competition rules, please contact the organizer.</p>
                    </>
                  )}
                </div>
              </div>
              <div className="border-t border-[#f0f0f0] px-5 py-4">
                <button
                  type="button"
                  onClick={() => setShowTermsDialog(false)}
                  className="w-full rounded-[14px] bg-[linear-gradient(90deg,#f49d38_0%,#ee7d00_100%)] py-3 text-center text-[16px] font-semibold text-white shadow-[0_12px_24px_rgba(230,129,20,0.26)]"
                >
                  {language === "zh-Hant" ? "我已知曉" : language === "zh-Hans" ? "我已知晓" : "I Understand"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AppScreen>
  );
}

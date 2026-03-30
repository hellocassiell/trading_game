"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppScreen from "../../../components/AppScreen";
import {
  clearAuthDraft,
  createAuthSession,
  getInviteViewModel,
  readAuthDraft,
  readAuthSession,
  saveAuthDraft,
  submitRegistrationProfile,
} from "../../../lib/adapters/auth";

export default function AuthInvitePage() {
  const router = useRouter();
  const viewModel = getInviteViewModel();
  const [selectedAvatarId, setSelectedAvatarId] = useState("");
  const [nickname, setNickname] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const trimmedNickname = nickname.trim();
  const canConfirm = Boolean(selectedAvatarId && trimmedNickname);

  useEffect(() => {
    const session = readAuthSession();
    if (!session?.userId) {
      router.replace("/auth");
      return;
    }
    const draft = readAuthDraft();
    if (draft.avatarId) {
      setSelectedAvatarId(draft.avatarId);
    }
    if (draft.nickname) {
      setNickname(draft.nickname);
    }
    saveAuthDraft({ step: "invite" });
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    setShowLeaveConfirm(params.get("modal") === "leave");
  }, []);

  async function handleConfirm() {
    if (!selectedAvatarId) {
      setErrorMessage(viewModel.emptyAvatarMessage);
      return;
    }
    if (!trimmedNickname) {
      setErrorMessage(viewModel.emptyNicknameMessage);
      return;
    }
    const prevSession = readAuthSession();
    const userId = prevSession?.userId;
    if (!userId) {
      setErrorMessage("登录会话已失效，请重新获取验证码");
      return;
    }
    setSubmitting(true);
    try {
      await submitRegistrationProfile({
        userId,
        nickname: trimmedNickname,
        avatarId: selectedAvatarId,
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "保存注册资料失败，请稍后再试");
      setSubmitting(false);
      return;
    }
    createAuthSession({
      phone: prevSession?.phone ?? "",
      nickname: trimmedNickname,
      avatarId: selectedAvatarId,
      loggedInAt: new Date().toISOString(),
      userId,
      token: prevSession?.token,
    });
    saveAuthDraft({
      avatarId: selectedAvatarId,
      nickname: trimmedNickname,
      step: "invite",
    });
    setErrorMessage("");
    setSubmitting(false);
    router.push("/");
  }

  return (
    <AppScreen className="!px-0 !pb-0">
      <div className="min-h-[100dvh] bg-[#f1f1f1] text-[#1f1f1f]">
        <div className="px-6 pb-[max(env(safe-area-inset-bottom),24px)] pt-[max(env(safe-area-inset-top),18px)]">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowLeaveConfirm(true)}
              aria-label="关闭"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#8d8d8d] text-[18px] leading-none text-white"
            >
              ×
            </button>
          </div>

          <h1 className="mt-16 text-center text-[36px] font-medium">{viewModel.title}</h1>
          <p className="mt-3 text-center text-[14px] text-[#8f8f8f]">{viewModel.pageDescription}</p>

          <div className="mx-auto mt-12 grid max-w-[330px] grid-cols-3 gap-x-4 gap-y-5">
            {viewModel.avatars.map((avatar) => {
              const isSelected = selectedAvatarId === avatar.id;
              return (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => {
                    setSelectedAvatarId(avatar.id);
                    saveAuthDraft({ avatarId: avatar.id, step: "invite" });
                    if (errorMessage) {
                      setErrorMessage("");
                    }
                  }}
                  aria-label={avatar.label}
                  className={`flex aspect-square items-center justify-center rounded-full border text-[36px] transition ${
                    isSelected
                      ? "border-[#e68114] bg-[#fff0dd] shadow-[0_12px_24px_rgba(230,129,20,0.24)]"
                      : "border-[#d2d2d2] bg-[#ece3d5]"
                  }`}
                >
                  {avatar.emoji}
                </button>
              );
            })}
          </div>

          <div className="mt-7 flex justify-center">
            <button
              type="button"
              onClick={() => {
                setSelectedAvatarId("upload");
                saveAuthDraft({ avatarId: "upload", step: "invite" });
                if (errorMessage) {
                  setErrorMessage("");
                }
              }}
              className={`inline-flex h-[86px] w-[86px] items-center justify-center rounded-full text-[40px] leading-none transition ${
                selectedAvatarId === "upload"
                  ? "bg-[#ffe8cc] text-[#df7e10]"
                  : "bg-[#e5e5e5] text-[#787878]"
              }`}
              aria-label="上传头像"
            >
              {viewModel.uploadLabel}
            </button>
          </div>

          <div className="mt-14">
            <input
              value={nickname}
              onChange={(event) => {
                const nextNickname = event.target.value.slice(0, 20);
                setNickname(nextNickname);
                saveAuthDraft({ nickname: nextNickname, step: "invite" });
                if (errorMessage) {
                  setErrorMessage("");
                }
              }}
              placeholder={viewModel.nicknamePlaceholder}
              className="w-full border-b border-[#d4d4d4] bg-transparent pb-3 text-center text-[33px] text-[#1f1f1f] outline-none placeholder:text-[#9d9d9d]"
            />
          </div>
          <p className="mt-3 text-center text-[12px] text-[#9b9b9b]">{viewModel.nicknameHelper}</p>

          <p className="mt-8 text-[13px] leading-[1.5] text-[#9b9b9b]">{viewModel.helperText}</p>

          {errorMessage ? (
            <p className="mt-3 text-center text-[13px] text-[#c44127]">{errorMessage}</p>
          ) : (
            <div className="mt-3 h-[34px]" />
          )}

          <div className="mt-2 flex justify-center">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!canConfirm || submitting}
              className={`h-14 w-full rounded-full text-[18px] font-medium transition ${
                canConfirm && !submitting
                  ? "bg-[linear-gradient(90deg,#f39a31_0%,#ee7e00_100%)] text-white shadow-[0_14px_26px_rgba(229,132,44,0.24)]"
                  : "bg-[#e4e4e4] text-[#bababa]"
              }`}
            >
              {submitting ? "提交中..." : viewModel.confirmLabel}
            </button>
          </div>
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

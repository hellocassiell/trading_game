import { completeAuthProfile, sendAuthCode, verifyAuthCode } from "../api";
import { appMeta } from "../mock-data";

const AUTH_DRAFT_KEY = "trading-game.auth-draft";
const AUTH_SESSION_KEY = "trading-game.auth-session";

export type GuestLandingViewModel = {
  primaryBrand: string;
  partnerBrand: string;
  competition: string;
  prizeLabel: string;
  prizeAmount: string;
  prizeSponsor: string;
  quickActions: { label: string; href: string }[];
  primaryAction: { label: string; href: string };
  rulesAction: { label: string; href: string };
  footerLeft: string;
  footerRight: string;
};

export type AuthEntryViewModel = {
  title: string;
  description: string;
  countryCode: string;
  phonePlaceholder: string;
  codePlaceholder: string;
  agreementPrefix: string;
  agreementLinkLabel: string;
  sendCodeLabel: string;
  resendCodeLabel: string;
  nextLabel: string;
  invalidPhoneMessage: string;
  invalidCodeMessage: string;
  uncheckedAgreementMessage: string;
  codeSentMessage: string;
};

export type AuthPinViewModel = {
  closeHref: string;
  centerAction: { label: string; href: string };
  orbitItems: { label: string; icon: string }[];
  footer: string;
};

export type LeaveConfirmViewModel = {
  title: string;
  description: string;
  cancelLabel: string;
  leaveLabel: string;
  cancelHref: string;
  leaveHref: string;
};

export type InviteViewModel = {
  title: string;
  avatars: { id: string; emoji: string; label: string }[];
  uploadLabel: string;
  nicknamePlaceholder: string;
  helperText: string;
  confirmLabel: string;
  emptyNicknameMessage: string;
  emptyAvatarMessage: string;
  nicknameHelper: string;
  pageDescription: string;
};

export type AuthDraft = {
  phone?: string;
  code?: string;
  agreed?: boolean;
  avatarId?: string;
  nickname?: string;
  step?: "pin" | "form" | "invite";
};

export type AuthSession = {
  userId?: string;
  phone: string;
  nickname: string;
  avatarId: string;
  loggedInAt: string;
  token?: string;
};

export type BlockedViewModel = {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
};

export function getGuestLandingViewModel(): GuestLandingViewModel {
  return {
    primaryBrand: "CITI",
    partnerBrand: appMeta.brand,
    competition: "智财投资大赛\n2020",
    prizeLabel: "冠军可获得现金奖",
    prizeAmount: "HK$50,000",
    prizeSponsor: "由 Citi 赞助",
    quickActions: [
      { label: "本季奖品", href: "/more" },
      { label: "影片介绍", href: "/more" },
    ],
    primaryAction: { label: "手机号注册/登入", href: "/auth/pin" },
    rulesAction: { label: "比赛规则", href: "/more" },
    footerLeft: `${appMeta.brand}.com LIMITED`,
    footerRight: "All Rights Reserved",
  };
}

export function getAuthEntryViewModel(): AuthEntryViewModel {
  return {
    title: "手机号注册/登入",
    description: "将发送验证码到以下输入的手机号",
    countryCode: "+852",
    phonePlaceholder: "9123 4567",
    codePlaceholder: "输入验证码",
    agreementPrefix: "本人已阅读及同意有关",
    agreementLinkLabel: "条款及细则",
    sendCodeLabel: "获取验证码",
    resendCodeLabel: "重新获取",
    nextLabel: "下一步",
    invalidPhoneMessage: "请输入有效的香港手机号码",
    invalidCodeMessage: "请输入 6 位验证码",
    uncheckedAgreementMessage: "请先同意条款及细则",
    codeSentMessage: "验证码已发送到该手机号，请留意短信。",
  };
}

export function getAuthPinViewModel(): AuthPinViewModel {
  return {
    closeHref: "/guest",
    centerAction: { label: "手机号\n注册/登入", href: "/auth" },
    orbitItems: [
      { label: "手机", icon: "📱" },
      { label: "服务", icon: "S" },
      { label: "云端", icon: "☁" },
      { label: "桌面", icon: "🖥" },
    ],
    footer: "Market+ Mobile Login  AASTOCKS.com LIMITED",
  };
}

export function getLeaveConfirmViewModel(): LeaveConfirmViewModel {
  return {
    title: "确认离开注册流程？",
    description: "已输入资料将不会保留，离开后需要重新输入。",
    cancelLabel: "取消",
    leaveLabel: "离开",
    cancelHref: "/auth",
    leaveHref: "/guest",
  };
}

export function getInviteViewModel(): InviteViewModel {
  return {
    title: "选择头像",
    avatars: [
      { id: "a1", emoji: "👨", label: "头像 1" },
      { id: "a2", emoji: "👧", label: "头像 2" },
      { id: "a3", emoji: "🧢", label: "头像 3" },
      { id: "a4", emoji: "👱‍♀️", label: "头像 4" },
      { id: "a5", emoji: "👨‍🏫", label: "头像 5" },
      { id: "a6", emoji: "👩", label: "头像 6" },
    ],
    uploadLabel: "+",
    nicknamePlaceholder: "输入昵称",
    helperText: "阁下上载之头像将于本大赛平台排行榜及/或有关推广活动展示，阁下可随时更新头像。",
    confirmLabel: "确定",
    emptyNicknameMessage: "请输入昵称",
    emptyAvatarMessage: "请选择头像",
    nicknameHelper: "昵称将用于排行榜与个人主页展示",
    pageDescription: "完成头像与昵称设置后即可进入比赛主页",
  };
}

export function getBlockedViewModel(): BlockedViewModel {
  return {
    title: "账户被封锁",
    description: "系统检测到异常交易行为，当前参赛资格已暂停。请联系主办方查询。",
    actionLabel: "关闭",
    actionHref: "/guest",
  };
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readAuthDraft(): AuthDraft {
  if (!canUseStorage()) {
    return {};
  }

  try {
    const rawValue = window.localStorage.getItem(AUTH_DRAFT_KEY);
    return rawValue ? (JSON.parse(rawValue) as AuthDraft) : {};
  } catch {
    return {};
  }
}

export function saveAuthDraft(nextDraft: AuthDraft) {
  if (!canUseStorage()) {
    return;
  }

  const mergedDraft = {
    ...readAuthDraft(),
    ...nextDraft,
  };
  window.localStorage.setItem(AUTH_DRAFT_KEY, JSON.stringify(mergedDraft));
}

export function clearAuthDraft() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(AUTH_DRAFT_KEY);
}

export function readAuthSession(): AuthSession | null {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(AUTH_SESSION_KEY);
    return rawValue ? (JSON.parse(rawValue) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function createAuthSession(session: AuthSession) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

export function clearAuthSession() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(AUTH_SESSION_KEY);
}

export async function requestAuthCode(phone: string) {
  await sendAuthCode(phone);
}

export async function verifyAuthCodeAndCreateSession(phone: string, code: string) {
  const result = await verifyAuthCode(phone, code);
  return result;
}

export async function submitRegistrationProfile(input: {
  userId: string;
  nickname: string;
  avatarId: string;
}) {
  await completeAuthProfile(input);
}

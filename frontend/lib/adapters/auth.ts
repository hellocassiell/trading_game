import { completeAuthProfile, sendAuthCode, uploadAuthAvatar, verifyAuthCode } from "../api";
import { appMeta } from "../app-meta";
import { AppLanguage, byLanguage, DEFAULT_LANGUAGE } from "../locale";
import type { GuestInfoModalKey } from "./guest-info";

const AUTH_DRAFT_KEY = "trading-game.auth-draft";
const AUTH_SESSION_KEY = "trading-game.auth-session";

export type GuestLandingViewModel = {
  primaryBrand: string;
  partnerBrand: string;
  competition: string;
  prizeLabel: string;
  prizeAmount: string;
  prizeSponsor: string;
  quickActions: { label: string; modalKey: GuestInfoModalKey }[];
  primaryAction: { label: string; href: string };
  rulesAction: { label: string; modalKey: GuestInfoModalKey };
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
  avatars: { id: string; src: string; label: string }[];
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

function resolveLanguage(language?: AppLanguage): AppLanguage {
  return language ?? DEFAULT_LANGUAGE;
}

export function getGuestLandingViewModel(language?: AppLanguage): GuestLandingViewModel {
  const resolvedLanguage = resolveLanguage(language);
  const copy = byLanguage(resolvedLanguage, {
    "zh-Hant": {
      competition: "智財投資大賽\n2026",
      prizeLabel: "冠軍可獲得現金獎",
      prizeSponsor: "由 Citi 贊助",
      seasonPrize: "本季獎品",
      video: "影片介紹",
      login: "手機號註冊/登入",
      rules: "比賽規則",
    },
    "zh-Hans": {
      competition: "智财投资大赛\n2026",
      prizeLabel: "冠军可获得现金奖",
      prizeSponsor: "由 Citi 赞助",
      seasonPrize: "本季奖品",
      video: "影片介绍",
      login: "手机号注册/登入",
      rules: "比赛规则",
    },
    en: {
      competition: "Trading Game\n2026",
      prizeLabel: "Champion Cash Prize",
      prizeSponsor: "Sponsored by Citi",
      seasonPrize: "Season Prizes",
      video: "Video Intro",
      login: "Phone Sign In",
      rules: "Competition Rules",
    },
  });

  return {
    primaryBrand: "CITI",
    partnerBrand: appMeta.brand,
    competition: copy.competition,
    prizeLabel: copy.prizeLabel,
    prizeAmount: "HK$1,000,000",
    prizeSponsor: copy.prizeSponsor,
    quickActions: [
      { label: copy.seasonPrize, modalKey: "seasonPrize" },
      { label: copy.video, modalKey: "videoIntro" },
    ],
    primaryAction: { label: copy.login, href: "/auth/pin" },
    rulesAction: { label: copy.rules, modalKey: "competitionRules" },
    footerLeft: `${appMeta.brand}.com LIMITED`,
    footerRight: "All Rights Reserved",
  };
}

export function getAuthEntryViewModel(language?: AppLanguage): AuthEntryViewModel {
  const resolvedLanguage = resolveLanguage(language);
  const copy = byLanguage(resolvedLanguage, {
    "zh-Hant": {
      title: "手機號註冊/登入",
      description: "將發送驗證碼到以下輸入的手機號",
      codePlaceholder: "輸入驗證碼",
      agreementPrefix: "本人已閱讀及同意有關",
      agreementLinkLabel: "條款及細則",
      sendCodeLabel: "獲取驗證碼",
      resendCodeLabel: "重新獲取",
      nextLabel: "下一步",
      invalidPhoneMessage: "請輸入有效的香港手機號碼",
      invalidCodeMessage: "請輸入 6 位驗證碼",
      uncheckedAgreementMessage: "請先同意條款及細則",
      codeSentMessage: "驗證碼已發送到該手機號，請留意短信。",
    },
    "zh-Hans": {
      title: "手机号注册/登入",
      description: "将发送验证码到以下输入的手机号",
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
    },
    en: {
      title: "Phone Sign In",
      description: "A verification code will be sent to this phone number.",
      codePlaceholder: "Enter code",
      agreementPrefix: "I have read and agree to the",
      agreementLinkLabel: "Terms and Conditions",
      sendCodeLabel: "Send Code",
      resendCodeLabel: "Resend",
      nextLabel: "Next",
      invalidPhoneMessage: "Please enter a valid HK phone number",
      invalidCodeMessage: "Please enter a 6-digit code",
      uncheckedAgreementMessage: "Please agree to the terms first",
      codeSentMessage: "Verification code sent. Please check your SMS.",
    },
  });

  return {
    title: copy.title,
    description: copy.description,
    countryCode: "+852",
    phonePlaceholder: "9123 4567",
    codePlaceholder: copy.codePlaceholder,
    agreementPrefix: copy.agreementPrefix,
    agreementLinkLabel: copy.agreementLinkLabel,
    sendCodeLabel: copy.sendCodeLabel,
    resendCodeLabel: copy.resendCodeLabel,
    nextLabel: copy.nextLabel,
    invalidPhoneMessage: copy.invalidPhoneMessage,
    invalidCodeMessage: copy.invalidCodeMessage,
    uncheckedAgreementMessage: copy.uncheckedAgreementMessage,
    codeSentMessage: copy.codeSentMessage,
  };
}

export function getAuthPinViewModel(language?: AppLanguage): AuthPinViewModel {
  const resolvedLanguage = resolveLanguage(language);
  const copy = byLanguage(resolvedLanguage, {
    "zh-Hant": { centerAction: "手機號\n註冊/登入", phone: "手機", service: "服務", cloud: "雲端", desktop: "桌面" },
    "zh-Hans": { centerAction: "手机号\n注册/登入", phone: "手机", service: "服务", cloud: "云端", desktop: "桌面" },
    en: { centerAction: "Phone\nSign In", phone: "Phone", service: "Service", cloud: "Cloud", desktop: "Desktop" },
  });

  return {
    closeHref: "/guest",
    centerAction: { label: copy.centerAction, href: "/auth" },
    orbitItems: [
      { label: copy.phone, icon: "📱" },
      { label: copy.service, icon: "S" },
      { label: copy.cloud, icon: "☁" },
      { label: copy.desktop, icon: "🖥" },
    ],
    footer: "Market+ Mobile Login  AASTOCKS.com LIMITED",
  };
}

export function getLeaveConfirmViewModel(language?: AppLanguage): LeaveConfirmViewModel {
  const resolvedLanguage = resolveLanguage(language);
  const copy = byLanguage(resolvedLanguage, {
    "zh-Hant": {
      title: "確認離開註冊流程？",
      description: "已輸入資料將不會保留，離開後需要重新輸入。",
      cancelLabel: "取消",
      leaveLabel: "離開",
    },
    "zh-Hans": {
      title: "确认离开注册流程？",
      description: "已输入资料将不会保留，离开后需要重新输入。",
      cancelLabel: "取消",
      leaveLabel: "离开",
    },
    en: {
      title: "Leave registration?",
      description: "Entered data will not be kept. You need to re-enter after leaving.",
      cancelLabel: "Cancel",
      leaveLabel: "Leave",
    },
  });

  return {
    title: copy.title,
    description: copy.description,
    cancelLabel: copy.cancelLabel,
    leaveLabel: copy.leaveLabel,
    cancelHref: "/auth",
    leaveHref: "/guest",
  };
}

export function getInviteViewModel(language?: AppLanguage): InviteViewModel {
  const resolvedLanguage = resolveLanguage(language);
  const copy = byLanguage(resolvedLanguage, {
    "zh-Hant": {
      title: "選擇頭像",
      nicknamePlaceholder: "輸入暱稱",
      helperText: "閣下上載之頭像將於本大賽平台排行榜及/或有關推廣活動展示，閣下可隨時更新頭像。",
      confirmLabel: "確定",
      emptyNicknameMessage: "請輸入暱稱",
      emptyAvatarMessage: "請選擇頭像",
      nicknameHelper: "暱稱最多 8 個字，將用於排行榜與個人主頁展示",
      pageDescription: "完成頭像與暱稱設置後即可進入比賽主頁",
      avatar: "頭像",
    },
    "zh-Hans": {
      title: "选择头像",
      nicknamePlaceholder: "输入昵称",
      helperText: "阁下上载之头像将于本大赛平台排行榜及/或有关推广活动展示，阁下可随时更新头像。",
      confirmLabel: "确定",
      emptyNicknameMessage: "请输入昵称",
      emptyAvatarMessage: "请选择头像",
      nicknameHelper: "昵称最多 8 个字，将用于排行榜与个人主页展示",
      pageDescription: "完成头像与昵称设置后即可进入比赛主页",
      avatar: "头像",
    },
    en: {
      title: "Choose Avatar",
      nicknamePlaceholder: "Enter nickname",
      helperText: "Your avatar may appear on rankings and related promotion pages. You can update it anytime.",
      confirmLabel: "Confirm",
      emptyNicknameMessage: "Please enter a nickname",
      emptyAvatarMessage: "Please choose an avatar",
      nicknameHelper: "Nickname max 8 chars, shown on ranking and profile pages",
      pageDescription: "Complete avatar and nickname setup to enter home",
      avatar: "Avatar",
    },
  });

  return {
    title: copy.title,
    avatars: [
      { id: "a1", src: "/avatars/a1.svg", label: `${copy.avatar} 1` },
      { id: "a2", src: "/avatars/a2.svg", label: `${copy.avatar} 2` },
      { id: "a3", src: "/avatars/a3.svg", label: `${copy.avatar} 3` },
      { id: "a4", src: "/avatars/a4.svg", label: `${copy.avatar} 4` },
      { id: "a5", src: "/avatars/a5.svg", label: `${copy.avatar} 5` },
      { id: "a6", src: "/avatars/a6.svg", label: `${copy.avatar} 6` },
    ],
    uploadLabel: "+",
    nicknamePlaceholder: copy.nicknamePlaceholder,
    helperText: copy.helperText,
    confirmLabel: copy.confirmLabel,
    emptyNicknameMessage: copy.emptyNicknameMessage,
    emptyAvatarMessage: copy.emptyAvatarMessage,
    nicknameHelper: copy.nicknameHelper,
    pageDescription: copy.pageDescription,
  };
}

export function getBlockedViewModel(language?: AppLanguage): BlockedViewModel {
  const resolvedLanguage = resolveLanguage(language);
  const copy = byLanguage(resolvedLanguage, {
    "zh-Hant": {
      title: "帳戶被封鎖",
      description: "系統檢測到異常交易行為，當前參賽資格已暫停。請聯絡主辦方查詢。",
      actionLabel: "關閉",
    },
    "zh-Hans": {
      title: "账户被封锁",
      description: "系统检测到异常交易行为，当前参赛资格已暂停。请联系主办方查询。",
      actionLabel: "关闭",
    },
    en: {
      title: "Account Blocked",
      description: "Abnormal trading behavior was detected. Competition access is suspended. Contact organizer for details.",
      actionLabel: "Close",
    },
  });

  return {
    title: copy.title,
    description: copy.description,
    actionLabel: copy.actionLabel,
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

export async function uploadRegistrationAvatar(input: { userId: string; file: File }) {
  return uploadAuthAvatar(input.userId, input.file);
}

import { appMeta, homeStats, summaryStats } from "../mock-data";

export type GuestLandingViewModel = {
  brand: string;
  sponsor: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  stats: typeof homeStats;
  summaryHighlights: typeof summaryStats;
  features: { title: string; detail: string }[];
  primaryAction: { label: string; href: string };
  secondaryAction: { label: string; href: string };
  footnote: string;
};

export type AuthEntryViewModel = {
  heroTitle: string;
  heroSubtitle: string;
  description: string;
  phoneHint: string;
  benefits: string[];
  footer: string;
};

export type AuthPinViewModel = {
  title: string;
  description: string;
  timerLabel: string;
  supportInfo: string;
};

export type LeaveConfirmViewModel = {
  title: string;
  description: string;
  actionLabel: string;
};

export type InviteViewModel = {
  heroTitle: string;
  heroSubtitle: string;
  perks: { label: string; detail: string }[];
  steps: string[];
  shareCode: string;
  footer: string;
};

export type BlockedViewModel = {
  title: string;
  description: string;
  actionLabel: string;
};

export function getGuestLandingViewModel(): GuestLandingViewModel {
  return {
    brand: appMeta.brand,
    sponsor: appMeta.sponsor,
    heroTitle: "登入/注册",
    heroSubtitle: "高仿港股模拟体验",
    heroDescription:
      "港股模擬交易大赛使用港币报价、限价/市价、T+2 结算，让你用实况数据练习真实策略。",
    stats: homeStats,
    summaryHighlights: summaryStats,
    features: [
      { title: "环节还原港股", detail: "按手交易、限价价位、港股代码和晨会提醒。" },
      { title: "全天候导航", detail: "即时排行榜、十大成交与星级参赛者，一屏掌握。" },
      { title: "手快有, 先登先选", detail: "20 次买入限制、T+2 结算与首日模拟券，策略更清晰。" },
    ],
    primaryAction: { label: "手机号码注册 / 登录", href: "/auth" },
    secondaryAction: { label: "阅读比赛规则", href: "/more" },
    footnote: `© ${new Date().getFullYear()} ${appMeta.brand}. All rights reserved.`,
  };
}

export function getAuthEntryViewModel(): AuthEntryViewModel {
  return {
    heroTitle: "参赛者登陆",
    heroSubtitle: "连接港股赛场",
    description: "请输入您在赛事中登记的香港手机号，系统会透过一次性验证码确认身份。",
    phoneHint: "例如 9123 4567",
    benefits: [
      "每个账号保留 1,000,000 HKD 初始模拟资金",
      "每组每日 20 次买入上限、卖出不限，贴近港股规则",
      "交易指示自动执行于下一个交易日，配合 T+2 结算",
    ],
    footer: "输入号码即代表同意赛事规则与个人资料收集章程。",
  };
}

export function getAuthPinViewModel(): AuthPinViewModel {
  return {
    title: "输入验证码",
    description: "我们已发出 6 位数验证码，30 秒内有效。若未收到，可选择重新发送。",
    timerLabel: "重新发送 00:28",
    supportInfo: "可致电 3123 4040 查询注册协助。",
  };
}

export function getLeaveConfirmViewModel(): LeaveConfirmViewModel {
  return {
    title: "确认离开注册流程？",
    description:
      "离开后您将暂时无法享用模拟资金与实时数据，重新进入需再次验证号码。",
    actionLabel: "继续注册",
  };
}

export function getInviteViewModel(): InviteViewModel {
  return {
    heroTitle: "邀请朋友",
    heroSubtitle: "共同练港股，领取电商红包",
    perks: [
      { label: "成功邀请", detail: "双方各获得 HK$50 虚拟加码券。" },
      { label: "榜单曝光", detail: "邀请排行榜将计入参赛者总积分。" },
    ],
    steps: [
      "复制专属邀请码至剪贴簿",
      "将邀请码分享至微信 / WhatsApp / LMS",
      "对方以该号码注册，即可双方拿奖励",
    ],
    shareCode: "INV-2026-0728",
    footer: "每位参赛者最多可邀请 5 名朋友。",
  };
}

export function getBlockedViewModel(): BlockedViewModel {
  return {
    title: "账户已被封锁",
    description:
      "检测到账号存在异常交易或违规样式，赛事资格已暂停。请联系主办方说明。",
    actionLabel: "返回未登录首页",
  };
}

export type GuestInfoModalKey = "seasonPrize" | "videoIntro" | "competitionRules";

export const GUEST_INFO_MODAL_KEYS: GuestInfoModalKey[] = [
  "seasonPrize",
  "videoIntro",
  "competitionRules",
];

const GUEST_INFO_MODAL_QUERY_MAP = {
  "season-prize": "seasonPrize",
  "video-intro": "videoIntro",
  "competition-rules": "competitionRules",
} as const satisfies Record<string, GuestInfoModalKey>;

export function isGuestInfoModalParam(value: string | null | undefined): value is keyof typeof GUEST_INFO_MODAL_QUERY_MAP {
  if (!value) {
    return false;
  }
  return value in GUEST_INFO_MODAL_QUERY_MAP;
}

export function resolveGuestInfoModalFromQuery(value: string | null | undefined): GuestInfoModalKey | null {
  if (!isGuestInfoModalParam(value)) {
    return null;
  }
  return GUEST_INFO_MODAL_QUERY_MAP[value];
}

type AppLanguage = "zh-Hant" | "zh-Hans" | "en";

export type GuestInfoModalSection = {
  title: string;
  rows?: string[];
  accentRows?: string[];
};

export type GuestInfoModalViewModel = {
  title: string;
  eyebrow: string;
  description: string;
  accent: string;
  sections: GuestInfoModalSection[];
  footerHint: string;
  closeLabel: string;
};

function byLanguage<T>(lang: AppLanguage, values: Record<AppLanguage, T>): T {
  return values[lang] ?? values["zh-Hant"];
}

export function getGuestInfoModalViewModels(
  language: AppLanguage
): Record<GuestInfoModalKey, GuestInfoModalViewModel> {
  return {
    seasonPrize: byLanguage(language, {
      "zh-Hant": {
        title: "本季獎品",
        eyebrow: "SEASON REWARDS",
        description: "完成註冊後即可參與本季港股模擬投資賽，依最終排行榜派發活動獎勵。",
        accent: "總值超過 HK$1,000,000 模擬資金與活動獎勵",
        sections: [
          {
            title: "榜單獎勵",
            accentRows: ["冠軍：現金獎與活動榮譽", "亞軍：品牌禮遇與活動獎品", "季軍：精選體驗獎勵"],
          },
          {
            title: "參與資格",
            rows: [
              "完成頭像與暱稱設定後視為正式參賽者",
              "榜單以比賽截止時的總資產與規則校驗結果為準",
              "主辦方可按活動公告調整最終獎項描述與發放安排",
            ],
          },
        ],
        footerHint: "實際獎項與發放時間以活動頁最新公告為準。",
        closeLabel: "知道了",
      },
      "zh-Hans": {
        title: "本季奖品",
        eyebrow: "SEASON REWARDS",
        description: "完成注册后即可参与本季港股模拟投资赛，依最终排行榜派发活动奖励。",
        accent: "总值超过 HK$1,000,000 模拟资金与活动奖励",
        sections: [
          {
            title: "榜单奖励",
            accentRows: ["冠军：现金奖与活动荣誉", "亚军：品牌礼遇与活动奖品", "季军：精选体验奖励"],
          },
          {
            title: "参与资格",
            rows: [
              "完成头像与昵称设置后视为正式参赛者",
              "榜单以比赛截止时的总资产与规则校验结果为准",
              "主办方可按活动公告调整最终奖项描述与发放安排",
            ],
          },
        ],
        footerHint: "实际奖项与发放时间以活动页最新公告为准。",
        closeLabel: "知道了",
      },
      en: {
        title: "Season Prizes",
        eyebrow: "SEASON REWARDS",
        description: "Complete sign-up to join the HK stock simulation season and compete for event rewards based on the final ranking.",
        accent: "Over HK$1,000,000 in virtual capital and campaign rewards",
        sections: [
          {
            title: "Ranking Rewards",
            accentRows: [
              "Champion: cash prize and event honor",
              "Runner-up: brand privilege and event gifts",
              "3rd Place: curated experience rewards",
            ],
          },
          {
            title: "Eligibility",
            rows: [
              "Players become official participants after avatar and nickname setup",
              "Final ranking is based on total assets and rule validation at season close",
              "Organizers may refine reward wording and distribution details in campaign notices",
            ],
          },
        ],
        footerHint: "Final rewards and fulfillment schedule follow the latest campaign notice.",
        closeLabel: "Got it",
      },
    }),
    videoIntro: byLanguage(language, {
      "zh-Hant": {
        title: "影片介紹",
        eyebrow: "VIDEO INTRO",
        description: "3 分鐘快速掌握比賽玩法、港股交易特色與榜單晉級重點。",
        accent: "建議首次參賽者先看完再開始註冊",
        sections: [
          {
            title: "影片看點",
            rows: [
              "如何使用 1,000,000 HKD 模擬資金建立港股持倉",
              "如何查看即時報價、買賣盤與排行榜變動",
              "如何在交易時段內完成下單、撤單與持倉觀察",
            ],
          },
          {
            title: "觀看提示",
            accentRows: ["影片長度：約 03:00", "語言：粵語 / 普通話字幕 / 英文字幕"],
          },
        ],
        footerHint: "正式影片上線後可由活動公告或更多頁補充入口。",
        closeLabel: "知道了",
      },
      "zh-Hans": {
        title: "影片介绍",
        eyebrow: "VIDEO INTRO",
        description: "3 分钟快速掌握比赛玩法、港股交易特色与榜单晋级重点。",
        accent: "建议首次参赛者先看完再开始注册",
        sections: [
          {
            title: "影片看点",
            rows: [
              "如何使用 1,000,000 HKD 模拟资金建立港股持仓",
              "如何查看实时报价、买卖盘与排行榜变动",
              "如何在交易时段内完成下单、撤单与持仓观察",
            ],
          },
          {
            title: "观看提示",
            accentRows: ["影片长度：约 03:00", "语言：粤语 / 普通话字幕 / 英文字幕"],
          },
        ],
        footerHint: "正式影片上线后可由活动公告或更多页补充入口。",
        closeLabel: "知道了",
      },
      en: {
        title: "Video Intro",
        eyebrow: "VIDEO INTRO",
        description: "A quick 3-minute walkthrough of the game flow, HK stock trading traits, and ranking progression.",
        accent: "Recommended before first-time registration",
        sections: [
          {
            title: "What You'll Learn",
            rows: [
              "How to deploy HK$1,000,000 in virtual capital for HK stock positions",
              "How to read live quotes, order book updates, and ranking changes",
              "How to place, amend, cancel, and review orders during market hours",
            ],
          },
          {
            title: "Viewing Notes",
            accentRows: ["Length: around 03:00", "Language: Cantonese with Chinese and English subtitles"],
          },
        ],
        footerHint: "A direct video entry can be added later when the final asset is ready.",
        closeLabel: "Got it",
      },
    }),
    competitionRules: byLanguage(language, {
      "zh-Hant": {
        title: "比賽規則",
        eyebrow: "COMPETITION RULES",
        description: "所有交易均採用港股模擬規則，名次依資產與規則合規情況統一計算。",
        accent: "請在下單前先確認交易時段、手數與價格限制",
        sections: [
          {
            title: "交易時段",
            rows: [
              "僅限香港交易日 09:30-12:00、13:00-16:00",
              "不支援競價時段交易",
              "停牌股票只可取消未成交掛單，不能新增買賣",
            ],
          },
          {
            title: "下單限制",
            rows: [
              "僅支援限價盤與市價盤",
              "必須按手交易，不接受碎股",
              "每位參賽者單日最多買入 20 筆，賣出不限",
              "每個帳戶最多 5 個排隊中的限價單",
            ],
          },
          {
            title: "成交與結算",
            accentRows: [
              "限價需在當前按盤價上下 20 個價位內",
              "撮合價格以當時按盤價為準",
              "股票交收採用 T+2 營業日",
            ],
          },
        ],
        footerHint: "完整費用與活動細則以正式活動公告與 PRD 約定為準。",
        closeLabel: "知道了",
      },
      "zh-Hans": {
        title: "比赛规则",
        eyebrow: "COMPETITION RULES",
        description: "所有交易均采用港股模拟规则，名次依资产与规则合规情况统一计算。",
        accent: "请在下单前先确认交易时段、手数与价格限制",
        sections: [
          {
            title: "交易时段",
            rows: [
              "仅限香港交易日 09:30-12:00、13:00-16:00",
              "不支持竞价时段交易",
              "停牌股票只可取消未成交挂单，不能新增买卖",
            ],
          },
          {
            title: "下单限制",
            rows: [
              "仅支持限价盘与市价盘",
              "必须按手交易，不接受碎股",
              "每位参赛者单日最多买入 20 笔，卖出不限",
              "每个账户最多 5 个排队中的限价单",
            ],
          },
          {
            title: "成交与结算",
            accentRows: [
              "限价需在当前按盘价上下 20 个价位内",
              "撮合价格以当时按盘价为准",
              "股票交收采用 T+2 营业日",
            ],
          },
        ],
        footerHint: "完整费用与活动细则以正式活动公告与 PRD 约定为准。",
        closeLabel: "知道了",
      },
      en: {
        title: "Competition Rules",
        eyebrow: "COMPETITION RULES",
        description: "All trades follow HK stock simulation rules, and rankings are calculated from asset performance plus rule compliance.",
        accent: "Check trading hours, lot size, and price bounds before placing an order",
        sections: [
          {
            title: "Trading Hours",
            rows: [
              "HK trading days only: 09:30-12:00, 13:00-16:00",
              "Auction sessions are not supported",
              "Suspended stocks may only cancel pending orders and cannot accept new trades",
            ],
          },
          {
            title: "Order Limits",
            rows: [
              "Only limit and market orders are supported",
              "Orders must be placed in board lots with no odd lots",
              "Each player may place up to 20 buy orders per day; sells are unlimited",
              "Each account may queue up to 5 pending limit orders",
            ],
          },
          {
            title: "Matching & Settlement",
            accentRows: [
              "Limit prices must stay within 20 ticks of the current nominal price",
              "Matched price follows the current nominal price",
              "Settlement follows T+2 business days",
            ],
          },
        ],
        footerHint: "Full fee details and campaign terms follow the official notice and PRD.",
        closeLabel: "Got it",
      },
    }),
  };
}

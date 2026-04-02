type AppLanguage = "zh-Hant" | "zh-Hans" | "en";

export function getRealtimeQuoteCopy(language: AppLanguage) {
  const values = {
    "zh-Hant": {
      back: "返回",
      connection: {
        live: "實時連接",
        connecting: "連接中",
        disconnected: "已斷開",
      },
      loading: "加載實時報價中...",
      loadErrorTitle: "行情加載失敗",
      loadErrorFallback: "載入報價失敗",
      bidDepthTitle: "買盤（Bid）",
      askDepthTitle: "賣盤（Ask）",
      updatedAtPrefix: "更新時間",
      loadingName: "載入中...",
      marketNoteTitle: "行情說明",
      marketNoteBody: "當前頁已接入實時推送，買賣盤與最新價會隨行情消息刷新。若連接中斷，將保留最後一次快照。",
      sourcePrefix: "來源",
      sequencePrefix: "序列",
      emptyDepthTitle: "暫無盤口數據",
      emptyDepthHint: "等待行情推送後將自動顯示買賣盤變化",
    },
    "zh-Hans": {
      back: "返回",
      connection: {
        live: "实时连接",
        connecting: "连接中",
        disconnected: "已断开",
      },
      loading: "加载实时报价中...",
      loadErrorTitle: "行情加载失败",
      loadErrorFallback: "载入报价失败",
      bidDepthTitle: "买盘（Bid）",
      askDepthTitle: "卖盘（Ask）",
      updatedAtPrefix: "更新时间",
      loadingName: "载入中...",
      marketNoteTitle: "行情说明",
      marketNoteBody: "当前页已接入实时推送，买卖盘与最新价会随行情消息刷新。若连接中断，将保留最后一次快照。",
      sourcePrefix: "来源",
      sequencePrefix: "序列",
      emptyDepthTitle: "暂无盘口数据",
      emptyDepthHint: "等待行情推送后将自动显示买卖盘变化",
    },
    en: {
      back: "Back",
      connection: {
        live: "Live",
        connecting: "Connecting",
        disconnected: "Disconnected",
      },
      loading: "Loading realtime quote...",
      loadErrorTitle: "Quote unavailable",
      loadErrorFallback: "Unable to load quote",
      bidDepthTitle: "Bid",
      askDepthTitle: "Ask",
      updatedAtPrefix: "Updated",
      loadingName: "Loading...",
      marketNoteTitle: "Market note",
      marketNoteBody: "This page is connected to realtime updates. Order book depth and the latest price refresh as market messages arrive. If the stream disconnects, the latest snapshot remains visible.",
      sourcePrefix: "Source",
      sequencePrefix: "Sequence",
      emptyDepthTitle: "No depth data yet",
      emptyDepthHint: "Bid and ask levels will appear automatically after the next market update.",
    },
  };

  return values[language] ?? values["zh-Hant"];
}

export const MAX_LEADERBOARD_ROWS = 100;

export type RawLeaderboardRow = {
  rank: number;
  rankMovement: "UP" | "DOWN" | "SAME";
  nickname: string;
  avatar?: string;
  totalAssets: number;
  changePercent: number;
  isCurrentUser?: boolean;
};

export type LeaderboardListRow = {
  rank: string;
  movement: "up" | "down" | "flat";
  name: string;
  avatar?: string;
  amount: string;
  gain: string;
  isCurrentUser: boolean;
};

function formatNumber(value: number, fractionDigits = 2) {
  return Number(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

function formatPercent(value: number) {
  const safe = Number(value ?? 0);
  const sign = safe > 0 ? "+" : "";
  return `${sign}${safe.toFixed(2)}%`;
}

function mapMovement(rankMovement: RawLeaderboardRow["rankMovement"]): LeaderboardListRow["movement"] {
  if (rankMovement === "UP") {
    return "up";
  }
  if (rankMovement === "DOWN") {
    return "down";
  }
  return "flat";
}

export function mapLeaderboardRows(
  rows: RawLeaderboardRow[],
  limit = MAX_LEADERBOARD_ROWS
): LeaderboardListRow[] {
  return rows.slice(0, limit).map((item) => ({
    rank: String(item.rank),
    movement: mapMovement(item.rankMovement),
    name: item.nickname,
    ...(item.avatar ? { avatar: item.avatar } : {}),
    amount: `HK$${formatNumber(item.totalAssets, 2)}`,
    gain: formatPercent(item.changePercent),
    isCurrentUser: Boolean(item.isCurrentUser),
  }));
}

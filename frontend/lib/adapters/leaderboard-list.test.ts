import test from "node:test";
import assert from "node:assert/strict";

import {
  MAX_LEADERBOARD_ROWS,
  mapLeaderboardRows,
} from "./leaderboard-list.ts";

test("mapLeaderboardRows limits the ranking list to 100 entries", () => {
  const rows = Array.from({ length: 105 }, (_, index) => ({
    rank: index + 1,
    rankMovement: "SAME" as const,
    nickname: `参赛者${index + 1}`,
    totalAssets: 1_000_000 + index,
    changePercent: index / 10,
    isCurrentUser: index === 99,
  }));

  const mapped = mapLeaderboardRows(rows);

  assert.equal(mapped.length, MAX_LEADERBOARD_ROWS);
  assert.equal(mapped[0]?.rank, "1");
  assert.equal(mapped.at(-1)?.rank, "100");
  assert.equal(mapped.at(-1)?.isCurrentUser, true);
});

test("mapLeaderboardRows keeps movement and asset formatting stable", () => {
  const mapped = mapLeaderboardRows([
    {
      rank: 7,
      rankMovement: "UP" as const,
      nickname: "小明",
      totalAssets: 1234567.8,
      changePercent: 4.56,
      isCurrentUser: false,
    },
    {
      rank: 8,
      rankMovement: "DOWN" as const,
      nickname: "小美",
      totalAssets: 1000000,
      changePercent: -1.23,
      isCurrentUser: true,
    },
  ]);

  assert.deepEqual(mapped, [
    {
      rank: "7",
      movement: "up",
      name: "小明",
      amount: "HK$1,234,567.80",
      gain: "+4.56%",
      isCurrentUser: false,
    },
    {
      rank: "8",
      movement: "down",
      name: "小美",
      amount: "HK$1,000,000.00",
      gain: "-1.23%",
      isCurrentUser: true,
    },
  ]);
});

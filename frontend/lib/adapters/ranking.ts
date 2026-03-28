import {
  starParticipants,
  topHoldings,
  topVolume,
  topVolumeSell,
} from "../mock-data";
import type { ViewStatus } from "../api/types";

export type RankingPageData = {
  status: ViewStatus;
  starParticipants: typeof starParticipants;
};

export type TopVolumePageData = {
  status: ViewStatus;
  buyRows: typeof topVolume;
  sellRows: typeof topVolumeSell;
  updatedAt: string;
};

export type TopHoldingsPageData = {
  status: ViewStatus;
  rows: typeof topHoldings;
  updatedAt: string;
};

export function getRankingPageData(): RankingPageData {
  return {
    status: "success",
    starParticipants,
  };
}

export function getTopVolumePageData(): TopVolumePageData {
  return {
    status: "success",
    buyRows: topVolume,
    sellRows: topVolumeSell,
    updatedAt: "2021/04/21 22:00 HKT",
  };
}

export function getTopHoldingsPageData(): TopHoldingsPageData {
  return {
    status: "success",
    rows: topHoldings,
    updatedAt: "2021/04/21 22:00 HKT",
  };
}


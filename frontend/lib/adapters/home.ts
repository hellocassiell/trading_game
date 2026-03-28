import {
  appMeta,
  homeEventStats,
  homeHoldingCloud,
  homeRankingRows,
  homeStarParticipants,
  homeSummaryCard,
  homeVolumeSnapshot,
  homeWeeklyFlyers,
} from "../mock-data";
import type { ViewStatus } from "../api/types";

export type HomePageData = {
  status: ViewStatus;
  appMeta: typeof appMeta;
  eventStats: typeof homeEventStats;
  summaryCard: typeof homeSummaryCard;
  starParticipants: typeof homeStarParticipants;
  holdingCloud: typeof homeHoldingCloud;
  volumeSnapshot: typeof homeVolumeSnapshot;
  weeklyFlyers: typeof homeWeeklyFlyers;
  rankingRows: typeof homeRankingRows;
};

export function getHomePageData(): HomePageData {
  return {
    status: "success",
    appMeta,
    eventStats: homeEventStats,
    summaryCard: homeSummaryCard,
    starParticipants: homeStarParticipants,
    holdingCloud: homeHoldingCloud,
    volumeSnapshot: homeVolumeSnapshot,
    weeklyFlyers: homeWeeklyFlyers,
    rankingRows: homeRankingRows,
  };
}


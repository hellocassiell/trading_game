import {
  appMeta,
  homeEventStats,
  homeEventStatsUpdatedAt,
  homeHoldingCloud,
  homeHoldingCloudUpdatedAt,
  homeRankingRows,
  homeRankingUpdatedAt,
  homeStarParticipants,
  homeSummaryCard,
  homeVolumeSnapshot,
  homeVolumeSnapshotUpdatedAt,
  homeWeeklyFlyers,
} from "../mock-data";
import type { ViewStatus } from "../api/types";

export type HomePageData = {
  status: ViewStatus;
  appMeta: typeof appMeta;
  eventStats: typeof homeEventStats;
  eventStatsUpdatedAt: typeof homeEventStatsUpdatedAt;
  summaryCard: typeof homeSummaryCard;
  starParticipants: typeof homeStarParticipants;
  holdingCloud: typeof homeHoldingCloud;
  holdingCloudUpdatedAt: typeof homeHoldingCloudUpdatedAt;
  volumeSnapshot: typeof homeVolumeSnapshot;
  volumeSnapshotUpdatedAt: typeof homeVolumeSnapshotUpdatedAt;
  weeklyFlyers: typeof homeWeeklyFlyers;
  rankingRows: typeof homeRankingRows;
  rankingUpdatedAt: typeof homeRankingUpdatedAt;
};

export function getHomePageData(): HomePageData {
  return {
    status: "success",
    appMeta,
    eventStats: homeEventStats,
    eventStatsUpdatedAt: homeEventStatsUpdatedAt,
    summaryCard: homeSummaryCard,
    starParticipants: homeStarParticipants,
    holdingCloud: homeHoldingCloud,
    holdingCloudUpdatedAt: homeHoldingCloudUpdatedAt,
    volumeSnapshot: homeVolumeSnapshot,
    volumeSnapshotUpdatedAt: homeVolumeSnapshotUpdatedAt,
    weeklyFlyers: homeWeeklyFlyers,
    rankingRows: homeRankingRows,
    rankingUpdatedAt: homeRankingUpdatedAt,
  };
}

import AppScreen from "../../../components/AppScreen";
import MarketTable from "../../../components/MarketTable";
import ScreenTopBar from "../../../components/ScreenTopBar";
import { topVolume } from "../../../lib/mock-data";

export default function TopVolumePage() {
  return (
    <AppScreen>
      <ScreenTopBar title="今日10大成交美股" showBack backHref="/" />
      <MarketTable
        headerLeft="10大美股"
        headerRight="成交金额"
        rows={topVolume.map((item) => ({
          symbol: item.symbol,
          name: item.name,
          value: item.price,
          delta: item.delta,
        }))}
      />
    </AppScreen>
  );
}

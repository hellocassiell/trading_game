import AppScreen from "../../../components/AppScreen";
import MarketTable from "../../../components/MarketTable";
import ScreenTopBar from "../../../components/ScreenTopBar";
import { topHoldings } from "../../../lib/mock-data";

export default function TopHoldingsPage() {
  return (
    <AppScreen>
      <ScreenTopBar title="参赛者20大美股持仓" showBack backHref="/" />
      <MarketTable
        headerLeft="参赛者20大美股持仓"
        headerRight="持仓金额"
        rows={topHoldings.map((item) => ({
          symbol: item.symbol,
          name: item.name,
          value: item.value,
          delta: item.delta,
        }))}
      />
    </AppScreen>
  );
}

import AppScreen from "../../../components/AppScreen";
import MarketTable from "../../../components/MarketTable";
import ScreenTopBar from "../../../components/ScreenTopBar";
import { loserHoldings } from "../../../lib/mock-data";

export default function TopLoserHoldingsPage() {
  return (
    <AppScreen>
      <ScreenTopBar
        title="参赛者20大失败持仓"
        showBack
        backHref="/"
        compact
        hideSubtitle
        hideMetaRow
        hideTrailing
      />
      <MarketTable
        headerLeft="参赛者20大失败持仓"
        headerRight="跌幅金额"
        negative
        rows={loserHoldings.map((item) => ({
          symbol: item.symbol,
          name: item.name,
          value: item.loss,
          delta: item.delta,
        }))}
      />
    </AppScreen>
  );
}

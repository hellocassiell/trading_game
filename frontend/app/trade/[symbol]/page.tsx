import AppScreen from "../../../components/AppScreen";
import TradeTicketCard from "../../../components/TradeTicketCard";
import { getTradeProductViewModel } from "../../../lib/adapters/trade";

type TradeDetailPageProps = {
  params: Promise<{ symbol: string }>;
};

export default async function TradeDetailPage({
  params,
}: TradeDetailPageProps) {
  const { symbol } = await params;
  const product = getTradeProductViewModel(symbol);

  return (
    <AppScreen className="!px-0 !pb-0">
      <TradeTicketCard product={product} />
    </AppScreen>
  );
}

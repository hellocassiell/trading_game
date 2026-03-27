import AppScreen from "../../../components/AppScreen";
import TradeTicketCard from "../../../components/TradeTicketCard";
import { tradeProducts, type TradeSymbol } from "../../../lib/mock-data";

type TradeDetailPageProps = {
  params: Promise<{ symbol: string }>;
};

export default async function TradeDetailPage({
  params,
}: TradeDetailPageProps) {
  const { symbol } = await params;
  const upperSymbol = symbol.toUpperCase() as TradeSymbol;
  const product = tradeProducts[upperSymbol] ?? {
    symbol: upperSymbol,
    company: `${upperSymbol} 模拟交易`,
    sub: "#USSTOCKS",
    price: "133.480",
    change: "-0.10 (0.075%)",
    holdingValue: "1,912,735.00",
    cash: "1,335,800",
    quantity: "10",
  };

  return (
    <AppScreen>
      <TradeTicketCard product={product} />
    </AppScreen>
  );
}

import TradeTicketCard from "../../../../components/TradeTicketCard";
import { getTradeProductViewModel } from "../../../../lib/adapters/trade";

type TradeValidityPageProps = {
  params: Promise<{ symbol: string }>;
};

export default async function TradeValidityPage({
  params,
}: TradeValidityPageProps) {
  const { symbol } = await params;
  const product = await getTradeProductViewModel(symbol);

  return (
    <TradeTicketCard
      product={product}
      initialStage="confirm"
      validityMode="today"
      confirmTitleOverride="确认指示（有效至本日收市）"
    />
  );
}

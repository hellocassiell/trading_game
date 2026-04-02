import TradeTicketCard from "../../../../components/TradeTicketCard";
import { getTradeProductViewModel } from "../../../../lib/adapters/trade";

type TradeEditPageProps = {
  params: Promise<{ symbol: string }>;
};

export default async function TradeEditPage({ params }: TradeEditPageProps) {
  const { symbol } = await params;
  const product = await getTradeProductViewModel(symbol);

  return (
    <TradeTicketCard
      product={product}
      variant="order"
      initialStage="ticket"
      orderStatus="PENDING"
    />
  );
}

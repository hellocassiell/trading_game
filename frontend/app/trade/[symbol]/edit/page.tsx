import TradeTicketCard from "../../../../components/TradeTicketCard";

type TradeEditPageProps = {
  params: Promise<{ symbol: string }>;
};

export default async function TradeEditPage({ params }: TradeEditPageProps) {
  const { symbol } = await params;

  return (
    <TradeTicketCard
      symbol={symbol}
      variant="order"
      initialStage="ticket"
      orderStatus="PENDING"
    />
  );
}

import TradeTicketCard from "../../../../components/TradeTicketCard";

type TradeSuccessPageProps = {
  params: Promise<{ symbol: string }>;
};

export default async function TradeSuccessPage({
  params,
}: TradeSuccessPageProps) {
  const { symbol } = await params;

  return <TradeTicketCard symbol={symbol} initialStage="success" />;
}

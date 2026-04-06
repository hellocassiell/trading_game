import TradeTicketCard from "../../../../components/TradeTicketCard";

type TradeValidityPageProps = {
  params: Promise<{ symbol: string }>;
};

export default async function TradeValidityPage({
  params,
}: TradeValidityPageProps) {
  const { symbol } = await params;

  return (
    <TradeTicketCard
      symbol={symbol}
      initialStage="confirm"
      validityMode="today"
      confirmTitleOverride="确认指示（有效至本日收市）"
    />
  );
}

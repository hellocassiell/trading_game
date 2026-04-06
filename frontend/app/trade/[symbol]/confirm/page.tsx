import TradeTicketCard from "../../../../components/TradeTicketCard";

type TradeConfirmPageProps = {
  params: Promise<{ symbol: string }>;
};

export default async function TradeConfirmPage({
  params,
}: TradeConfirmPageProps) {
  const { symbol } = await params;

  return (
    <TradeTicketCard
      symbol={symbol}
      initialStage="confirm"
      validityMode="nextDay"
      confirmTitleOverride="确认指示（下一交易日执行）"
    />
  );
}

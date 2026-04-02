import TradeTicketCard from "../../../../components/TradeTicketCard";
import { getTradeProductViewModel } from "../../../../lib/adapters/trade";

type TradeConfirmPageProps = {
  params: Promise<{ symbol: string }>;
};

export default async function TradeConfirmPage({
  params,
}: TradeConfirmPageProps) {
  const { symbol } = await params;
  const product = await getTradeProductViewModel(symbol);

  return (
    <TradeTicketCard
      product={product}
      initialStage="confirm"
      validityMode="nextDay"
      confirmTitleOverride="确认指示（下一交易日执行）"
    />
  );
}

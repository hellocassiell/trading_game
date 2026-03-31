import { TradeConfirmPreview } from "../../../../components/PrototypeStates";
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
    <TradeConfirmPreview
      product={product}
      title="确认指示（下一交易日执行）"
    />
  );
}

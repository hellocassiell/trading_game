import { TradeSuccessPreview } from "../../../../components/PrototypeStates";
import { getTradeProductViewModel } from "../../../../lib/adapters/trade";

type TradeSuccessPageProps = {
  params: Promise<{ symbol: string }>;
};

export default async function TradeSuccessPage({
  params,
}: TradeSuccessPageProps) {
  const { symbol } = await params;
  const product = await getTradeProductViewModel(symbol);

  return <TradeSuccessPreview product={product} />;
}

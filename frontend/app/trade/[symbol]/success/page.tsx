import { TradeSuccessPreview } from "../../../../components/PrototypeStates";
import { getTradeProductViewModel } from "../../../../lib/adapters/trade";

type TradeSuccessPageProps = {
  params: Promise<{ symbol: string }>;
};

export default async function TradeSuccessPage({
  params,
}: TradeSuccessPageProps) {
  const { symbol } = await params;

  return <TradeSuccessPreview product={getTradeProductViewModel(symbol)} />;
}

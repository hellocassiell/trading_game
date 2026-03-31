import { TradeEditPreview } from "../../../../components/PrototypeStates";
import { getTradeProductViewModel } from "../../../../lib/adapters/trade";

type TradeEditPageProps = {
  params: Promise<{ symbol: string }>;
};

export default async function TradeEditPage({ params }: TradeEditPageProps) {
  const { symbol } = await params;
  const product = await getTradeProductViewModel(symbol);

  return <TradeEditPreview product={product} />;
}

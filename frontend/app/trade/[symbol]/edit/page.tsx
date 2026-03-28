import { TradeEditPreview } from "../../../../components/PrototypeStates";
import { getTradeProductViewModel } from "../../../../lib/adapters/trade";

type TradeEditPageProps = {
  params: Promise<{ symbol: string }>;
};

export default async function TradeEditPage({ params }: TradeEditPageProps) {
  const { symbol } = await params;

  return <TradeEditPreview product={getTradeProductViewModel(symbol)} />;
}

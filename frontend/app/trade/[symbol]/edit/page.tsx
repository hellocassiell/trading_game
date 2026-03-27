import { TradeEditPreview } from "../../../../components/PrototypeStates";
import { getTradeProduct } from "../../../../lib/mock-data";

type TradeEditPageProps = {
  params: Promise<{ symbol: string }>;
};

export default async function TradeEditPage({ params }: TradeEditPageProps) {
  const { symbol } = await params;

  return <TradeEditPreview product={getTradeProduct(symbol)} />;
}

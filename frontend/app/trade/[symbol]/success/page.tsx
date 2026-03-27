import { TradeSuccessPreview } from "../../../../components/PrototypeStates";
import { getTradeProduct } from "../../../../lib/mock-data";

type TradeSuccessPageProps = {
  params: Promise<{ symbol: string }>;
};

export default async function TradeSuccessPage({
  params,
}: TradeSuccessPageProps) {
  const { symbol } = await params;

  return <TradeSuccessPreview product={getTradeProduct(symbol)} />;
}

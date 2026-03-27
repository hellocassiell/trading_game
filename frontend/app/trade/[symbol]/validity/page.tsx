import { TradeConfirmPreview } from "../../../../components/PrototypeStates";
import { getTradeProduct } from "../../../../lib/mock-data";

type TradeValidityPageProps = {
  params: Promise<{ symbol: string }>;
};

export default async function TradeValidityPage({
  params,
}: TradeValidityPageProps) {
  const { symbol } = await params;

  return <TradeConfirmPreview product={getTradeProduct(symbol)} title="确认指示（有效至本日收市）" />;
}

import { TradeConfirmPreview } from "../../../../components/PrototypeStates";
import { getTradeProduct } from "../../../../lib/mock-data";

type TradeConfirmPageProps = {
  params: Promise<{ symbol: string }>;
};

export default async function TradeConfirmPage({
  params,
}: TradeConfirmPageProps) {
  const { symbol } = await params;

  return <TradeConfirmPreview product={getTradeProduct(symbol)} title="确认指示（下一交易日执行）" />;
}

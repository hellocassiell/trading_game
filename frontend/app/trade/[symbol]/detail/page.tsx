import { TradeDetailPreview } from "../../../../components/PrototypeStates";
import { getTradeProductViewModel } from "../../../../lib/adapters/trade";

type TradeDetailPreviewPageProps = {
  params: Promise<{ symbol: string }>;
};

export default async function TradeDetailPreviewPage({
  params,
}: TradeDetailPreviewPageProps) {
  const { symbol } = await params;

  return <TradeDetailPreview product={getTradeProductViewModel(symbol)} />;
}

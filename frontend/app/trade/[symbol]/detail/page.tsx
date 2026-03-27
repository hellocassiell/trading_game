import { TradeDetailPreview } from "../../../../components/PrototypeStates";
import { getTradeProduct } from "../../../../lib/mock-data";

type TradeDetailPreviewPageProps = {
  params: Promise<{ symbol: string }>;
};

export default async function TradeDetailPreviewPage({
  params,
}: TradeDetailPreviewPageProps) {
  const { symbol } = await params;

  return <TradeDetailPreview product={getTradeProduct(symbol)} />;
}

import RealtimeQuoteDetail from "../../../../components/RealtimeQuoteDetail";

type TradeDetailPreviewPageProps = {
  params: Promise<{ symbol: string }>;
};

export default async function TradeDetailPreviewPage({
  params,
}: TradeDetailPreviewPageProps) {
  const { symbol } = await params;

  return <RealtimeQuoteDetail symbol={symbol} />;
}

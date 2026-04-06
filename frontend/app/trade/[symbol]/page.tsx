import AppScreen from "../../../components/AppScreen";
import TradeTicketCard from "../../../components/TradeTicketCard";

type TradeDetailPageProps = {
  params: Promise<{ symbol: string }>;
};

export default async function TradeDetailPage({
  params,
}: TradeDetailPageProps) {
  const { symbol } = await params;

  return (
    <AppScreen className="!px-0 !pb-0">
      <TradeTicketCard symbol={symbol} />
    </AppScreen>
  );
}

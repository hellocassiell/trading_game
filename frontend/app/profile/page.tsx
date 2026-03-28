import AppScreen from "../../components/AppScreen";
import ProfileSummaryCard from "../../components/ProfileSummaryCard";
import { TradeTrigger } from "../../components/TradeModal";
import { positions } from "../../lib/mock-data";

function formatMarketValue(price: string, quantity: string) {
  const parsedPrice = Number(price.replace(/,/g, ""));
  const parsedQuantity = Number(quantity.replace(/,/g, ""));

  if (Number.isNaN(parsedPrice) || Number.isNaN(parsedQuantity)) {
    return "--";
  }

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(parsedPrice * parsedQuantity);
}

function withHkdPrefix(value: string) {
  return `HK$ ${value}`;
}

export default function ProfilePage() {
  return (
    <AppScreen className="!px-0 !pb-[calc(env(safe-area-inset-bottom)+82px)]">
      <div className="min-h-full bg-white">
        <ProfileSummaryCard />

        <div className="bg-white px-4 pb-4">
          <div className="divide-y divide-[#eee4d7]">
            {positions.map((item) => (
              <TradeTrigger
                key={item.symbol}
                symbol={item.symbol}
                className="block py-2.5 active:bg-[#fffaf3]"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_128px] items-stretch gap-2.5">
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2 whitespace-nowrap">
                      <p className="text-[17px] font-black leading-none text-[#2e3136]">{item.symbol}</p>
                      <p className="truncate text-[14px] font-bold text-[#40444b]">{item.name}</p>
                    </div>

                    <div className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-2.5 gap-y-0.5 text-[10.5px] leading-4.5">
                      <span className="text-[#9f9589]">持股量</span>
                      <span className="font-black text-[#5a4a39] whitespace-nowrap">{item.quantity}</span>
                      <span className="text-[#9f9589]">持股(可交易)</span>
                      <span className="font-black text-[#5a4a39] whitespace-nowrap">{item.available}</span>
                      <span className="text-[#9f9589]">平均价</span>
                      <span className="font-black text-[#5a4a39] whitespace-nowrap">{withHkdPrefix(item.averagePrice)}</span>
                      <span className="text-[#9f9589]">赚蚀*</span>
                      <span className={`font-black whitespace-nowrap ${item.positive ? "text-[#22b26a]" : "text-[#ee5b62]"}`}>
                        {withHkdPrefix(item.pnl)} ({item.pct})
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between rounded-[16px] bg-[linear-gradient(180deg,#fff9f0,#fff0dd)] px-2.5 py-2.5 text-right shadow-[inset_0_0_0_1px_rgba(241,225,204,0.9)]">
                    <div>
                      <p className="text-[9.5px] font-semibold text-[#9f9589]">现价</p>
                      <p className={`mt-0.5 whitespace-nowrap text-[13px] font-black leading-none ${item.positive ? "text-[#22b26a]" : "text-[#ee5b62]"}`}>
                        {item.positive ? "▲ " : "▼ "}
                        {withHkdPrefix(item.currentPrice)}
                      </p>
                    </div>

                    <div className="mt-2">
                      <p className="text-[9.5px] font-semibold text-[#9f9589]">参考市值</p>
                      <p className="mt-0.5 whitespace-nowrap text-[13px] font-black leading-none text-[#5a4a39]">
                        HK$ {formatMarketValue(item.currentPrice, item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              </TradeTrigger>
            ))}
          </div>

          <p className="mt-3 text-[11px] text-[#b9a692]">更新于 2021/04/21 22:00 HKT</p>
          <p className="mt-1 text-[10px] text-[#c4b19b]">* 赚蚀以平均买入价与现价港元估计</p>
        </div>
      </div>
    </AppScreen>
  );
}

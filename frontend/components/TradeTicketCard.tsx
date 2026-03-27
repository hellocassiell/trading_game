import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";

import SurfaceCard from "./SurfaceCard";

type TradeTicketCardProps = {
  product: {
    symbol: string;
    company: string;
    sub: string;
    price: string;
    change: string;
    holdingValue: string;
    cash: string;
    quantity: string;
  };
};

export default function TradeTicketCard({ product }: TradeTicketCardProps) {
  return (
    <SurfaceCard padded={false} className="overflow-hidden">
      <div className="flex items-center justify-between bg-[#4e79e8] px-2.5 py-2 text-white">
        <div className="text-[9px] font-semibold tracking-[0.04em]">AASTOCKS</div>
        <X className="h-3.5 w-3.5 text-blue-100" />
      </div>

      <div className="border-b border-[#eaf0fa] px-2.5 py-1.5">
        <div className="flex items-center justify-between gap-2 text-[9px]">
          <span className="font-semibold text-[#606f86]">
            智财模拟美股投资大赛2020
          </span>
          <span className="text-[#8a94a6]">比赛介绍</span>
        </div>
      </div>

      <div className="px-2.5 py-2">
        <div className="rounded-[4px] border border-[#edf1f8] bg-white px-2 py-2">
          <div className="grid grid-cols-[1fr_auto] items-center">
            <div>
              <p className="text-[8px] text-[#9aa4b3]">今日投资余额</p>
              <p className="text-[10px] font-semibold text-[#5f6c80]">
                {product.holdingValue}
              </p>
            </div>
            <div className="rounded-[4px] border border-[#e6edf8] px-2 py-1 text-[8px] text-[#7c8798]">
              {product.symbol}
            </div>
          </div>

          <div className="mt-3 text-center">
            <p className="text-[17px] font-bold leading-tight text-[#313f55]">
              {product.company}
            </p>
            <p className="mt-1 text-[8px] text-[#aab3c0]">{product.sub}</p>
            <p className="mt-2 text-[18px] font-bold text-[#ef4444]">
              {product.price}
            </p>
            <p className="text-[10px] font-semibold text-[#ef4444]">
              ▼ {product.change}
            </p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-[8px]">
            <button
              type="button"
              className="rounded-full border border-[#b8d1ff] bg-[#edf4ff] py-1.5 font-semibold text-[#2b5ce5]"
            >
              买入
            </button>
            <button
              type="button"
              className="rounded-full border border-[#e6edf8] bg-white py-1.5 text-[#adb7c5]"
            >
              卖出
            </button>
          </div>

          <div className="mt-3 space-y-2">
            <div className="grid grid-cols-[56px_1fr_24px] items-center gap-2">
              <span className="text-[8px] text-[#adb7c5]">价格</span>
              <div className="rounded-[4px] border border-[#e6edf8] px-2 py-1 text-[10px] text-[#5f6c80]">
                {product.price}
              </div>
              <button
                type="button"
                className="flex h-5 w-5 items-center justify-center rounded-full border border-[#d7e6ff] text-[#2b5ce5]"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            <div className="grid grid-cols-[56px_24px_1fr_24px] items-center gap-2">
              <span className="text-[8px] text-[#adb7c5]">数量</span>
              <button
                type="button"
                className="flex h-5 w-5 items-center justify-center rounded-full border border-[#d7e6ff] text-[#2b5ce5]"
              >
                <Minus className="h-3 w-3" />
              </button>
              <div className="rounded-[4px] border border-[#e6edf8] px-2 py-1 text-center text-[10px] text-[#5f6c80]">
                {product.quantity}
              </div>
              <button
                type="button"
                className="flex h-5 w-5 items-center justify-center rounded-full border border-[#d7e6ff] text-[#2b5ce5]"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>

          <div className="mt-3 rounded-[4px] bg-[#fbfdff] px-2 py-1.5">
            <div className="flex items-center justify-between text-[8px] text-[#adb7c5]">
              <span>估计金额</span>
              <span>{product.cash} 美元</span>
            </div>
          </div>

          <button
            type="button"
            className="mt-3 w-full rounded-full bg-[#1664ff] py-2 text-[10px] font-semibold text-white shadow-[0_10px_18px_rgba(22,100,255,0.24)]"
          >
            提交
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between text-[8px]">
          <Link href="/assistant" className="text-[#75a0ff]">
            猜想列表
          </Link>
          <div className="flex gap-2">
            <Link href="/trade/AAPL" className="text-[#75a0ff]">
              AAPL
            </Link>
            <Link href="/trade/CHKP" className="text-[#75a0ff]">
              CHKP
            </Link>
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}

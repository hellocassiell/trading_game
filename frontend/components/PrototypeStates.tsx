import Link from "next/link";
import { Check, ChevronRight, Smartphone, X } from "lucide-react";

import AppScreen from "./AppScreen";
import ScreenTopBar from "./ScreenTopBar";
import SurfaceCard from "./SurfaceCard";
import TradeTicketCard from "./TradeTicketCard";

type TradeProduct = {
  symbol: string;
  company: string;
  sub: string;
  price: string;
  change: string;
  holdingValue: string;
  cash: string;
  quantity: string;
};

function NumericPad() {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "⌫"];

  return (
    <div className="mt-3 overflow-hidden rounded-[4px] border border-[#d6dce8] bg-[#eef1f6]">
      <div className="grid grid-cols-3">
        {keys.map((key) => (
          <div
            key={key}
            className="flex h-9 items-center justify-center border-r border-t border-[#d9dfe8] bg-white text-[11px] font-medium text-[#4b5563] last:border-r-0 [&:nth-child(3n)]:border-r-0 [&:nth-child(-n+3)]:border-t-0"
          >
            {key}
          </div>
        ))}
      </div>
    </div>
  );
}

function PromoIllustration() {
  return (
    <div className="relative h-[140px] overflow-hidden rounded-[10px] bg-[linear-gradient(160deg,#f0fbff_0%,#ddf1ff_38%,#ffffff_100%)]">
      <div className="absolute left-5 top-7 h-16 w-24 rounded-[14px] bg-[linear-gradient(160deg,#d9f4ff,#8ed2ff)] shadow-[0_12px_24px_rgba(89,180,255,0.22)]" />
      <div className="absolute right-6 top-4 h-24 w-16 rounded-[12px] bg-[linear-gradient(180deg,#fbbf24,#f97316)] shadow-[0_14px_24px_rgba(249,115,22,0.25)]" />
      <div className="absolute right-10 top-9 h-12 w-10 rounded-[8px] bg-white/80" />
      <div className="absolute left-20 top-16 h-2 w-14 rounded-full bg-[#65b6ff]" />
      <div className="absolute left-[86px] top-[74px] h-2 w-10 rounded-full bg-[#b3ddff]" />
      <div className="absolute left-11 top-10 h-3 w-3 rounded-full bg-[#7c3aed]" />
      <div className="absolute left-14 top-[62px] h-4 w-4 rounded-full bg-[#22c55e]" />
      <div className="absolute left-24 top-[34px] h-5 w-5 rounded-full bg-[#f59e0b]" />
      <div className="absolute bottom-6 right-20 h-8 w-8 rounded-full border-2 border-white bg-[#4f79e8]" />
      <div className="absolute bottom-5 left-8 h-6 w-6 rounded-full bg-white shadow-[0_10px_20px_rgba(79,121,232,0.14)]" />
      <div className="absolute bottom-10 left-12 h-1 w-12 rotate-[18deg] rounded-full bg-[#9ad4ff]" />
    </div>
  );
}

export function GuestLandingPreview() {
  return (
    <AppScreen>
      <ScreenTopBar title="未登入版面" showBack backHref="/" />
      <SurfaceCard>
        <div className="px-1 py-1">
          <PromoIllustration />
          <div className="mt-3 text-center">
            <p className="text-[10px] font-semibold tracking-[0.08em] text-[#7b8aa2]">
              CITI x AASTOCKS
            </p>
            <h2 className="mt-1 text-[18px] font-bold text-[#4f5d73]">
              智财投资大赛 2020
            </h2>
            <div className="mx-auto mt-2 inline-flex items-center rounded-full border border-[#ffd59a] bg-[#fff7ea] px-4 py-1">
              <span className="text-[9px] font-semibold text-[#f59e0b]">奖金</span>
              <span className="ml-2 text-[18px] font-extrabold text-[#f59e0b]">$50,000</span>
            </div>
            <div className="mt-2 flex justify-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ef4444]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#f59e0b]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#3b82f6]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
            </div>
            <Link
              href="/auth"
              className="mt-4 flex h-10 items-center justify-center rounded-full bg-[#2b5ce5] text-[11px] font-semibold text-white shadow-[0_12px_24px_rgba(43,92,229,0.24)]"
            >
              手机号码注册 / 登录
            </Link>
            <p className="mt-2 text-[9px] text-[#75a0ff]">比赛细则</p>
          </div>
        </div>
      </SurfaceCard>
    </AppScreen>
  );
}

export function AuthOrbitPreview() {
  return (
    <AppScreen>
      <ScreenTopBar title="注册 / 登录流程" showBack backHref="/guest" />
      <SurfaceCard className="py-6">
        <div className="relative mx-auto h-[260px] w-[260px]">
          <div className="absolute inset-6 rounded-full border border-[#d9ebff]" />
          <div className="absolute inset-12 rounded-full border border-[#cce3ff]" />
          <div className="absolute inset-[72px] rounded-full bg-[radial-gradient(circle_at_30%_20%,#8fd1ff,#4f79e8_70%)] shadow-[0_18px_36px_rgba(79,121,232,0.28)]" />
          <div className="absolute inset-[72px] flex items-center justify-center px-8 text-center text-[13px] font-semibold leading-snug text-white">
            手机号码
            <br />
            注册 / 登录
          </div>

          <div className="absolute left-[20px] top-[86px] flex h-10 w-10 items-center justify-center rounded-full bg-[#8fe3df] text-[#1f7c78] shadow-[0_10px_20px_rgba(143,227,223,0.35)]">
            <Smartphone className="h-5 w-5" />
          </div>
          <div className="absolute right-[22px] top-[92px] flex h-10 w-10 items-center justify-center rounded-full bg-[#d8f2ff] text-[#4f79e8] shadow-[0_10px_20px_rgba(79,121,232,0.12)]">
            S
          </div>
          <div className="absolute bottom-[28px] left-[58px] flex h-10 w-10 items-center justify-center rounded-full bg-[#dff7ff] text-[#4f79e8] shadow-[0_10px_20px_rgba(79,121,232,0.12)]">
            ☁
          </div>
          <div className="absolute bottom-[30px] right-[48px] flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f2ff] text-[#4f79e8] shadow-[0_10px_20px_rgba(79,121,232,0.12)]">
            ▣
          </div>
        </div>

        <Link
          href="/auth/pin"
          className="mx-auto mt-1 flex w-[180px] items-center justify-center gap-1 rounded-full bg-[#edf4ff] px-4 py-2 text-[10px] font-semibold text-[#4976e8]"
        >
          进入号码验证
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </SurfaceCard>
    </AppScreen>
  );
}

export function AuthPinPreview() {
  return (
    <AppScreen>
      <ScreenTopBar title="手机号码注册 / 登录" showBack backHref="/auth" compact />
      <SurfaceCard>
        <div className="px-1">
          <h2 className="text-center text-[12px] font-semibold text-[#4f5d73]">
            手机号码注册 / 登录
          </h2>
          <p className="mt-1 text-center text-[9px] text-[#aab3c0]">
            请按游戏中填写你的手机号码
          </p>

          <div className="mt-4 rounded-[4px] border border-[#d9e4f7] px-2 py-2">
            <div className="flex items-center gap-2 text-[10px] text-[#5f6c80]">
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-[2px] border border-[#7da4ff] bg-[#edf4ff] text-[9px] text-[#4976e8]">
                ✓
              </span>
              <span>+852</span>
              <span className="h-px flex-1 bg-[#dbe5f5]" />
              <span>9123 4567</span>
            </div>
          </div>

          <label className="mt-3 flex items-start gap-2 text-[8px] leading-relaxed text-[#9aa4b3]">
            <span className="mt-[1px] h-3 w-3 rounded-[2px] border border-[#ccd7ea]" />
            <span>本人已阅读及同意隐私政策、游戏规则和活动条款。</span>
          </label>

          <Link
            href="/auth/invite"
            className="mt-3 flex h-9 items-center justify-center rounded-full bg-[#2b5ce5] text-[10px] font-semibold text-white shadow-[0_12px_24px_rgba(43,92,229,0.2)]"
          >
            下一步
          </Link>

          <NumericPad />
        </div>
      </SurfaceCard>
    </AppScreen>
  );
}

export function InviteFriendsPreview() {
  const avatars = [
    "from-[#ffd9bf] to-[#ffb476]",
    "from-[#ffe3ea] to-[#ff9191]",
    "from-[#d7ecff] to-[#5aabff]",
    "from-[#ffeabf] to-[#ffc941]",
    "from-[#e5ffd2] to-[#84c764]",
    "from-[#f0ddff] to-[#be7bff]",
  ];

  return (
    <AppScreen>
      <ScreenTopBar title="邀请朋友" showBack backHref="/auth/pin" compact />
      <SurfaceCard className="py-5">
        <div className="px-1 text-center">
          <div className="mx-auto h-2 w-2 rounded-full bg-[#98a5b9]" />
          <h2 className="mt-5 text-[12px] font-semibold text-[#4f5d73]">邀请朋友</h2>
          <div className="mt-5 grid grid-cols-3 gap-x-5 gap-y-4">
            {avatars.map((tone, index) => (
              <div key={tone} className="flex flex-col items-center">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${tone} text-[12px] font-semibold text-white shadow-[0_10px_20px_rgba(15,23,42,0.08)]`}
                >
                  {String.fromCharCode(65 + index)}
                </div>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f7fb] text-[20px] text-[#9aa4b3]">
            +
          </div>
          <p className="mt-3 text-[9px] text-[#8f99a8]">输入号码</p>
          <div className="mx-auto mt-2 h-8 w-[180px] rounded-full bg-[#f5f7fb]" />
          <button
            type="button"
            className="mt-3 inline-flex items-center justify-center rounded-full bg-[#f3f5f9] px-8 py-2 text-[10px] font-medium text-[#c0c7d2]"
          >
            确定
          </button>
        </div>
      </SurfaceCard>
    </AppScreen>
  );
}

function ModalShell({
  children,
  product,
}: {
  children: React.ReactNode;
  product: TradeProduct;
}) {
  return (
    <AppScreen className="relative">
      <div className="pointer-events-none opacity-40">
        <TradeTicketCard product={product} />
      </div>

      <div className="absolute inset-0 flex items-center justify-center bg-[rgba(36,45,61,0.26)] px-4">
        <div className="w-full max-w-[280px] rounded-[10px] bg-white px-4 py-4 shadow-[0_24px_48px_rgba(15,23,42,0.24)]">
          {children}
        </div>
      </div>
    </AppScreen>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span className="text-[9px] text-[#aab3c0]">{label}</span>
      <span className="text-right text-[10px] font-semibold text-[#4f5d73]">{value}</span>
    </>
  );
}

export function TradeConfirmPreview({
  product,
  title,
}: {
  product: TradeProduct;
  title: string;
}) {
  return (
    <ModalShell product={product}>
      <h2 className="text-center text-[12px] font-semibold text-[#4f5d73]">{title}</h2>
      <div className="mt-3 grid grid-cols-[1fr_auto] gap-x-3 gap-y-2">
        <DetailRow label="买入 / 卖出" value="买入" />
        <DetailRow label="代码" value={product.symbol} />
        <DetailRow label="价格" value={product.price} />
        <DetailRow label="数量" value={product.quantity} />
        <DetailRow label="估算金额" value={`${product.cash} 美元`} />
      </div>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          className="flex-1 rounded-full border border-[#d7e6ff] bg-white py-1.5 text-[10px] font-semibold text-[#6f7c8f]"
        >
          取消
        </button>
        <button
          type="button"
          className="flex-1 rounded-full bg-[#2b5ce5] py-1.5 text-[10px] font-semibold text-white"
        >
          确认
        </button>
      </div>
    </ModalShell>
  );
}

export function TradeDetailPreview({ product }: { product: TradeProduct }) {
  return (
    <ModalShell product={product}>
      <button
        type="button"
        className="absolute right-5 top-5 text-[#98a5b9]"
        aria-label="关闭"
      >
        <X className="h-4 w-4" />
      </button>
      <h2 className="text-center text-[12px] font-semibold text-[#4f5d73]">交易详情</h2>
      <div className="mt-3 grid grid-cols-[1fr_auto] gap-x-3 gap-y-2">
        <DetailRow label="买入 / 卖出" value="买入" />
        <DetailRow label="代码" value={product.symbol} />
        <DetailRow label="成交均价" value={product.price} />
        <DetailRow label="已成交数量" value="10" />
        <DetailRow label="总值" value={`${product.cash} 美元`} />
      </div>
      <div className="mt-4 space-y-2">
        <Link
          href={`/trade/${product.symbol}/edit`}
          className="flex h-8 items-center justify-center rounded-full border border-[#d7e6ff] bg-white text-[10px] font-semibold text-[#4976e8]"
        >
          更改订单
        </Link>
        <button
          type="button"
          className="flex h-8 w-full items-center justify-center rounded-full border border-[#d7e6ff] bg-white text-[10px] font-semibold text-[#4976e8]"
        >
          再次交易
        </button>
        <Link
          href={`/trade/${product.symbol}/success`}
          className="flex h-8 items-center justify-center rounded-full bg-[#edf4ff] text-[10px] font-semibold text-[#4976e8]"
        >
          返回主画面
        </Link>
      </div>
    </ModalShell>
  );
}

export function TradeEditPreview({ product }: { product: TradeProduct }) {
  return (
    <ModalShell product={product}>
      <h2 className="text-center text-[12px] font-semibold text-[#4f5d73]">更改订单</h2>
      <div className="mt-3 grid grid-cols-[1fr_auto] gap-x-3 gap-y-2">
        <DetailRow label="买入 / 卖出" value="买入" />
        <DetailRow label="代码" value={product.symbol} />
        <DetailRow label="数量" value="10" />
        <DetailRow label="价格" value={product.price} />
        <DetailRow label="已成交" value="61" />
      </div>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          className="flex-1 rounded-full border border-[#d7e6ff] bg-white py-1.5 text-[10px] font-semibold text-[#6f7c8f]"
        >
          取消
        </button>
        <button
          type="button"
          className="flex-1 rounded-full bg-[#2b5ce5] py-1.5 text-[10px] font-semibold text-white"
        >
          确定
        </button>
      </div>
    </ModalShell>
  );
}

export function TradeSuccessPreview({ product }: { product: TradeProduct }) {
  return (
    <ModalShell product={product}>
      <div className="flex justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#edf6ff] text-[#2b5ce5]">
          <Check className="h-6 w-6" />
        </div>
      </div>
      <h2 className="mt-3 text-center text-[13px] font-semibold text-[#4f5d73]">提交成功</h2>
      <div className="mt-4 space-y-2">
        <Link
          href="/positions"
          className="flex h-8 items-center justify-center rounded-full border border-[#d7e6ff] bg-white text-[10px] font-semibold text-[#4976e8]"
        >
          查看交易状况
        </Link>
        <Link
          href={`/trade/${product.symbol}`}
          className="flex h-8 items-center justify-center rounded-full border border-[#d7e6ff] bg-white text-[10px] font-semibold text-[#4976e8]"
        >
          再次交易
        </Link>
        <Link
          href="/ranking"
          className="flex h-8 items-center justify-center rounded-full border border-[#d7e6ff] bg-white text-[10px] font-semibold text-[#4976e8]"
        >
          浏览 AASTOCKS 排行榜
        </Link>
        <Link
          href="/"
          className="flex h-8 items-center justify-center rounded-full bg-[#edf4ff] text-[10px] font-semibold text-[#4976e8]"
        >
          返回主页
        </Link>
      </div>
    </ModalShell>
  );
}

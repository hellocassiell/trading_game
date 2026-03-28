import Link from "next/link";
import AppScreen from "../../../components/AppScreen";
import { getBlockedViewModel } from "../../../lib/adapters/auth";

export default function AuthBlockedPage() {
  const viewModel = getBlockedViewModel();

  return (
    <AppScreen className="!px-0 !pb-0">
      <div className="min-h-[100dvh] bg-[linear-gradient(180deg,#fff8ed_0%,#ffeadd_55%,#ffd7be_100%)] text-[#2f1f12]">
        <div className="flex min-h-full flex-col items-center justify-center px-4 pb-[max(env(safe-area-inset-bottom),18px)] pt-[max(env(safe-area-inset-top),14px)]">
          <div className="w-full max-w-[320px] rounded-[22px] bg-white px-4 py-6 shadow-[0_18px_34px_rgba(60,34,15,0.14)]">
            <p className="text-[14px] font-black text-[#c9781a]">{viewModel.title}</p>
            <p className="mt-2 text-[12px] leading-relaxed text-[#5f5043]">{viewModel.description}</p>
            <Link
              href="/guest"
              className="mt-6 flex items-center justify-center rounded-[16px] bg-[var(--app-orange)] px-4 py-3 text-[15px] font-black text-white shadow-[0_12px_24px_rgba(255,140,26,0.28)]"
            >
              {viewModel.actionLabel}
            </Link>
          </div>
        </div>
      </div>
    </AppScreen>
  );
}

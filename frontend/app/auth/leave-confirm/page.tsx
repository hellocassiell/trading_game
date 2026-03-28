import Link from "next/link";
import AppScreen from "../../../components/AppScreen";
import { getLeaveConfirmViewModel } from "../../../lib/adapters/auth";

export default function AuthLeaveConfirmPage() {
  const viewModel = getLeaveConfirmViewModel();

  return (
    <AppScreen className="!px-0 !pb-0">
      <div className="min-h-[100dvh] bg-[linear-gradient(180deg,#fff5ed_0%,#ffe4cd_60%,#ffd0a9_100%)] text-[#2f1f12]">
        <div className="flex min-h-full flex-col items-center justify-center px-4 pb-[max(env(safe-area-inset-bottom),18px)] pt-[max(env(safe-area-inset-top),14px)]">
          <div className="w-full max-w-[340px] rounded-[22px] bg-white px-4 py-6 shadow-[0_18px_34px_rgba(60,34,15,0.12)]">
            <p className="text-[14px] font-black text-[#c9781a]">{viewModel.title}</p>
            <p className="mt-2 text-[13px] text-[#5c4c3c]">{viewModel.description}</p>

            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/auth"
                className="rounded-[16px] bg-[var(--app-orange)] px-4 py-3 text-center text-[15px] font-black text-white shadow-[0_12px_24px_rgba(255,140,26,0.26)]"
              >
                {viewModel.actionLabel}
              </Link>
              <Link
                href="/guest"
                className="rounded-[16px] border border-[#f1dec6] px-4 py-3 text-center text-[14px] font-semibold text-[#b36a1c]"
              >
                离开
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppScreen>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { AlertCircle, CreditCard, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { plans } from "@/lib/data";

interface InsufficientCreditsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: string;
  requiredCredits?: number;
  currentCredits?: number;
}

export function InsufficientCreditsDialog({
  open,
  onOpenChange,
  message,
  requiredCredits,
  currentCredits,
}: InsufficientCreditsDialogProps) {
  const router = useRouter();

  // Check if credits are 0 (free credits exhausted)
  const isZeroCredits = currentCredits === 0;

  // Get Explorer plan
  const explorerPlan = plans.find((p) => p.nameEn === "Explorer");

  const handleGoToPlans = () => {
    onOpenChange(false);
    router.push("/dashboard/billing");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-950 border-white/10 text-white p-0 overflow-hidden max-w-md sm:max-w-lg gap-0 sm:rounded-3xl">
        {/* Header Section */}
        <div className="relative px-4 pt-12 pb-4 pr-12 bg-linear-to-b from-slate-900 to-slate-950 overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-red-500/10 blur-[60px] rounded-full pointer-events-none" />
          <div className="absolute -top-16 -left-16 w-48 h-48 bg-orange-500/10 blur-[60px] rounded-full pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-red-400 via-orange-400 to-yellow-500" />

          <DialogHeader className="relative z-10 pt-0 pr-0">
            <div className="flex flex-col items-center text-center space-y-2.5 pt-2">
              {/* Icon Container */}
              <div className="relative group">
                <div className="absolute inset-0 bg-linear-to-br from-red-400 to-orange-500 blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 rounded-full" />
                <div className="relative h-14 w-14 flex items-center justify-center rounded-xl bg-linear-to-br from-slate-800 to-slate-900 border border-white/10 shadow-2xl shadow-black/50">
                  <AlertCircle className="h-7 w-7 text-red-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]" />
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <DialogTitle className="text-lg font-bold text-white mb-0.5">
                  {isZeroCredits ? "اعتبار رایگانتون تموم شده" : "اعتبار ناکافی"}
                </DialogTitle>
                <DialogDescription className="text-slate-400 text-xs max-w-xs mx-auto leading-relaxed">
                  {isZeroCredits
                    ? "ولی نذار خلاقیتت از بین بره"
                    : "برای ادامه، نیاز به اعتبار بیشتر دارید"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Body Section */}
        <div className="px-5 pb-4 bg-slate-950 space-y-3.5">
          {isZeroCredits ? (
            <>
              {/* Explorer Plan Card - Only shown when credits are 0 */}
              {explorerPlan && (
                <div className="rounded-xl border border-yellow-400/30 bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-pink-500/10 p-4 shadow-[0_0_30px_rgba(251,191,36,0.2)]">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-pink-500/20 flex-shrink-0">
                      <Sparkles className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-white">
                        {explorerPlan.name}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {explorerPlan.tagline}
                      </p>
                    </div>
                  </div>
                  <div className="mb-3">
                    <p className="text-2xl font-black text-white">
                      {explorerPlan.price} {explorerPlan.currency}
                    </p>
                  </div>
                  <ul className="mb-3 space-y-1.5">
                    {explorerPlan.highlights
                      .filter((feature) =>
                        [
                          "۲۰۰ اعتبار",
                          "متن به تصویر",
                          "تصویر به تصویر",
                          "تصویر به ویدیو (بهترین مدل ویدیو دنیا)",
                        ].includes(feature)
                      )
                      .map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-1.5 text-xs text-slate-300"
                        >
                          <span className="text-emerald-400 mt-0.5">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {/* Info Note */}
              <div className="rounded-lg bg-yellow-500/5 border border-yellow-500/10 p-2.5">
                <p className="text-xs text-yellow-500/80 text-center leading-relaxed">
                  💡 با خرید پلن کاوشگر، اعتبار خود را افزایش دهید و به خلاقیت ادامه دهید
                </p>
              </div>

              {/* Footer Actions */}
              <div className="space-y-2 pt-2">
                <Button
                  onClick={handleGoToPlans}
                  className="w-full h-10 text-sm font-bold bg-linear-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg shadow-orange-500/20 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                >
                  <CreditCard className="h-4 w-4 ml-2" />
                  مشاهده پلن کاوشگر
                </Button>

                <Button
                  onClick={() => onOpenChange(false)}
                  variant="ghost"
                  className="w-full h-8 text-xs text-slate-400 hover:text-white hover:bg-white/5 rounded-xl"
                >
                  بستن
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Message */}
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                <p className="text-sm text-red-400 text-center leading-relaxed">
                  {message ||
                    (requiredCredits && currentCredits !== undefined
                      ? `برای این عملیات به ${requiredCredits} اعتبار نیاز دارید. شما ${currentCredits} اعتبار دارید.`
                      : "اعتبار شما برای انجام این عملیات کافی نیست.")}
                </p>
              </div>

              {/* Credit Info */}
              {requiredCredits !== undefined && currentCredits !== undefined && (
                <div className="flex items-center justify-between rounded-lg bg-slate-900/50 border border-white/5 p-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-slate-400" />
                    <span className="text-xs text-slate-400">اعتبار مورد نیاز:</span>
                  </div>
                  <span className="text-sm font-bold text-white">
                    {requiredCredits.toLocaleString("fa-IR")}
                  </span>
                </div>
              )}

              {/* Info Note */}
              <div className="rounded-lg bg-yellow-500/5 border border-yellow-500/10 p-2.5">
                <p className="text-xs text-yellow-500/80 text-center leading-relaxed">
                  💡 می‌توانید با خرید پلن یا اعتبار اضافی، اعتبار خود را افزایش دهید
                </p>
              </div>

              {/* Footer Actions */}
              <div className="space-y-2 pt-2">
                <Button
                  onClick={handleGoToPlans}
                  className="w-full h-10 text-sm font-bold bg-linear-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg shadow-orange-500/20 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                >
                  <CreditCard className="h-4 w-4 ml-2" />
                  مشاهده پلن‌ها و خرید اعتبار
                </Button>

                <Button
                  onClick={() => onOpenChange(false)}
                  variant="ghost"
                  className="w-full h-8 text-xs text-slate-400 hover:text-white hover:bg-white/5 rounded-xl"
                >
                  بستن
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

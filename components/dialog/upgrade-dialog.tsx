"use client";

import {
  Check,
  XCircle as Close,
  Sparkles,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Plan {
  name: string;
  nameEn: string;
  price: string;
  currency: string;
  tagline: string;
  highlights: string[];
  icon: React.ComponentType<{ className?: string }>;
}

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPlan: string | null;
  plans: Plan[];
  onPurchase: () => void;
  isPurchasing: boolean;
}

export function UpgradeDialog({
  open,
  onOpenChange,
  selectedPlan,
  plans,
  onPurchase,
  isPurchasing,
}: UpgradeDialogProps) {
  if (!selectedPlan) return null;

  const planDetails = plans.find((p) => p.name === selectedPlan);
  const Icon = planDetails?.icon || Sparkles;

  if (!planDetails) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-950 border-white/10 text-white p-0 overflow-hidden max-w-md sm:max-w-lg gap-0 sm:rounded-3xl max-h-[90vh] overflow-y-auto sm:max-h-none sm:overflow-visible">
        {/* Header Section with Gradient */}
        <div className="relative px-4 pt-12 pb-4 pr-12 bg-linear-to-b from-slate-900 to-slate-950 overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-yellow-500/10 blur-[60px] rounded-full pointer-events-none" />
          <div className="absolute -top-16 -left-16 w-48 h-48 bg-orange-500/10 blur-[60px] rounded-full pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-yellow-400 via-orange-400 to-pink-500" />

          <DialogHeader className="relative z-10 pt-0 pr-0">
            <div className="flex flex-col items-center text-center space-y-2.5 pt-2">
              {/* Icon Container */}
              <div className="relative group">
                <div className="absolute inset-0 bg-linear-to-br from-yellow-400 to-orange-500 blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 rounded-full" />
                <div className="relative h-14 w-14 flex items-center justify-center rounded-xl bg-linear-to-br from-slate-800 to-slate-900 border border-white/10 shadow-2xl shadow-black/50">
                  <Icon className="h-7 w-7 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.3)]" />
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <DialogTitle className="text-lg font-bold text-white mb-0.5">
                  ارتقا به پلن {selectedPlan}
                </DialogTitle>
                <DialogDescription className="text-slate-400 text-xs max-w-xs mx-auto leading-relaxed">
                  {planDetails.tagline}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Body Section */}
        <div className="px-5 pb-4 bg-slate-950 space-y-3.5">
          {/* Price Display */}
          <div className="relative -mt-2.5 mx-auto max-w-sm rounded-xl border border-white/5 bg-white/2 p-2.5 text-center backdrop-blur-sm">
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-2xl font-black text-white tracking-tight drop-shadow-sm">
                {planDetails.price}
              </span>
              <span className="text-sm text-slate-400 font-medium">
                {planDetails.currency}
              </span>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 px-1">
              <ShieldCheck className="h-3.5 w-3.5 text-yellow-400" />
              <h4 className="text-xs font-medium text-white/90">
                ویژگی‌های این پلن:
              </h4>
            </div>

            <div className="grid gap-1.5 relative">
              {/* Line connecting items */}
              <div className="absolute right-4 top-1.5 bottom-1.5 w-px bg-linear-to-b from-white/10 via-white/5 to-transparent" />

              {planDetails.highlights.map((feature, idx) => {
                const isNoStorage = feature.includes("بدون نگهداری");
                return (
                  <div
                    key={idx}
                    className="relative flex items-start gap-2.5 group"
                  >
                    {/* Indicator Dot/Icon */}
                    <div
                      className={cn(
                        "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-colors duration-300",
                        isNoStorage
                          ? "border-red-500/20 bg-red-500/10 group-hover:border-red-500/30"
                          : "border-emerald-500/20 bg-emerald-500/10 group-hover:border-emerald-500/30"
                      )}
                    >
                      {isNoStorage ? (
                        <Close className="h-3 w-3 text-red-400" />
                      ) : (
                        <Check className="h-3 w-3 text-emerald-400" />
                      )}
                    </div>

                    {/* Text */}
                    <span className="py-0.5 text-xs text-slate-300 group-hover:text-slate-200 transition-colors">
                      {feature}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Note */}
          <div className="rounded-lg bg-yellow-500/5 border border-yellow-500/10 p-2.5">
            <p className="text-xs text-yellow-500/80 text-center leading-relaxed">
              توجه: پلن شما بلافاصله پس از پرداخت فعال خواهد شد.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="space-y-2">
            <Button
              onClick={onPurchase}
              disabled={isPurchasing}
              className="w-full h-10 text-sm font-bold bg-linear-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg shadow-orange-500/20 rounded-xl transition-all duration-300 hover:scale-[1.02] disabled:hover:scale-100 disabled:opacity-70"
            >
              {isPurchasing ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  در حال پردازش...
                </>
              ) : (
                "تایید و پرداخت"
              )}
            </Button>

            <Button
              onClick={() => onOpenChange(false)}
              disabled={isPurchasing}
              variant="ghost"
              className="w-full h-8 text-xs text-slate-400 hover:text-white hover:bg-white/5 rounded-xl"
            >
              انصراف
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

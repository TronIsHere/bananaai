"use client";

import { useState, useMemo } from "react";
import {
  CreditCard,
  Calendar,
  Download,
  Check,
  XCircle as Close,
  Zap,
  Crown,
  Sparkles,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { plans as landingPlans } from "@/lib/data";
import { useUser } from "@/hooks/use-user";
import { getPlanNamePersian, getPlanNameEnglish } from "@/lib/utils";

interface BillingHistoryItem {
  id: string;
  date: string;
  amount: number;
  plan: string;
  status: "paid" | "pending" | "failed";
  invoiceUrl?: string;
}

const mockBillingHistory: BillingHistoryItem[] = [
  {
    id: "inv-001",
    date: "1403/09/15",
    amount: 999000,
    plan: "creator", // Stored as English
    status: "paid",
  },
  {
    id: "inv-002",
    date: "1403/08/15",
    amount: 999000,
    plan: "creator", // Stored as English
    status: "paid",
  },
  {
    id: "inv-003",
    date: "1403/07/15",
    amount: 350000,
    plan: "explorer", // Stored as English
    status: "paid",
  },
];

// Map plan names (English) to icons
const planIcons: Record<string, typeof Sparkles> = {
  free: Gift,
  explorer: Sparkles,
  creator: Crown,
  studio: Zap,
};

export default function BillingPage() {
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { user } = useUser();

  // Map landing plans to billing page format
  const plans = useMemo(() => {
    return landingPlans.map((plan) => {
      // Convert Persian plan name to English for comparison
      const planEnglish = getPlanNameEnglish(plan.name);
      return {
        ...plan,
        icon: planIcons[planEnglish || ""] || Sparkles,
        current: planEnglish === user.currentPlan,
        priceNumber: parseInt(plan.price.replace(/,/g, ""), 10),
      };
    });
  }, [user.currentPlan]);

  const currentPlan = plans.find((p) => p.current);

  // Calculate usage based on current plan
  const getImageLimit = (planName: string) => {
    const plan = landingPlans.find((p) => p.name === planName);
    if (!plan) return 0;
    const imageMatch = plan.highlights.find((h) => h.includes("تصویر"));
    if (!imageMatch) return 0;
    const match = imageMatch.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "1403/10/15";
    // Convert to Persian date (simplified - you might want to use a proper library)
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  };

  const usage = {
    imagesGenerated: user.imagesGeneratedThisMonth,
    imagesLimit: currentPlan ? getImageLimit(currentPlan.name) : 0,
    resetDate: formatDate(user.monthlyResetDate),
  };

  const handleUpgrade = (planName: string) => {
    setSelectedPlan(planName);
    setIsUpgradeDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fa-IR").format(amount) + " تومان";
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      paid: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      failed: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    const labels = {
      paid: "پرداخت شده",
      pending: "در انتظار",
      failed: "ناموفق",
    };
    return (
      <span
        className={`rounded-lg border px-2 py-1 text-xs font-semibold ${
          styles[status as keyof typeof styles]
        }`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-pink-500/20 md:h-12 md:w-12">
            <CreditCard className="h-5 w-5 text-yellow-400 md:h-6 md:w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white md:text-4xl">
              صورتحساب و پرداخت
            </h1>
            <p className="text-xs text-slate-400 md:text-base">
              مدیریت اشتراک و پرداخت‌های خود
            </p>
          </div>
        </div>
      </div>

      {/* Current Plan & Usage */}
      <div className="mb-6 md:mb-8 grid gap-4 md:grid-cols-2">
        {/* Current Plan Card */}
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-6 md:rounded-2xl md:p-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 md:text-sm">اشتراک فعلی</p>
              <h3 className="mt-1 text-xl font-bold text-white md:text-2xl">
                {currentPlan?.name}
              </h3>
            </div>
            {currentPlan && (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-pink-500/20 md:h-14 md:w-14">
                <currentPlan.icon className="h-6 w-6 text-yellow-400 md:h-7 md:w-7" />
              </div>
            )}
          </div>
          <div className="mb-4">
            <p className="text-2xl font-black text-white md:text-3xl">
              {currentPlan && `${currentPlan.price} ${currentPlan.currency}`}
            </p>
            <p className="text-xs text-slate-400 md:text-sm">
              {currentPlan?.tagline}
            </p>
          </div>
          {user.planEndDate && (
            <div className="mb-4 flex items-center gap-2 text-xs text-slate-400 md:text-sm">
              <Calendar className="h-4 w-4" />
              <span>تجدید خودکار در {formatDate(user.planEndDate)}</span>
            </div>
          )}
          <Button
            variant="outline"
            className="w-full border-white/10 text-white/80 hover:border-yellow-400/30 hover:text-yellow-400"
          >
            تغییر اشتراک
          </Button>
        </div>

        {/* Usage Card */}
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-6 md:rounded-2xl md:p-8">
          <div className="mb-4">
            <p className="text-xs text-slate-400 md:text-sm">استفاده این ماه</p>
            <h3 className="mt-1 text-xl font-bold text-white md:text-2xl">
              {usage.imagesGenerated} / {usage.imagesLimit}
            </h3>
          </div>
          <div className="mb-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 transition-all"
                style={{
                  width: `${
                    (usage.imagesGenerated / usage.imagesLimit) * 100
                  }%`,
                }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 md:text-sm">
            <Calendar className="h-4 w-4" />
            <span>بازنشانی در {usage.resetDate}</span>
          </div>
        </div>
      </div>

      {/* Plans Section */}
      <div className="mb-6 md:mb-8">
        <h2 className="mb-4 text-xl font-bold text-white md:text-2xl">
          پلن‌های موجود
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = plan.current;
            return (
              <div
                key={plan.name}
                className={`relative overflow-hidden rounded-xl border p-6 transition-all md:rounded-2xl md:p-8 ${
                  isCurrent
                    ? "border-yellow-400/50 bg-gradient-to-br from-yellow-400/10 via-orange-400/10 to-pink-500/10 shadow-[0_0_30px_rgba(251,191,36,0.2)]"
                    : "border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/50 hover:border-yellow-400/30"
                }`}
              >
                {isCurrent && (
                  <div className="absolute left-4 top-4 rounded-lg bg-yellow-400/20 px-2 py-1 text-xs font-semibold text-yellow-400">
                    فعلی
                  </div>
                )}
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-pink-500/20 md:h-14 md:w-14">
                    <Icon className="h-6 w-6 text-yellow-400 md:h-7 md:w-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white md:text-xl">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-slate-400 md:text-sm">
                      {plan.nameEn}
                    </p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-2xl font-black text-white md:text-3xl">
                    {plan.price} {plan.currency}
                  </p>
                  <p className="mt-1 text-xs text-slate-400 md:text-sm">
                    {plan.tagline}
                  </p>
                </div>
                <ul className="mb-6 space-y-2">
                  {plan.highlights.map((feature, idx) => {
                    const isNoStorage = feature.includes("بدون نگهداری");
                    return (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-xs text-slate-300 md:text-sm"
                      >
                        {isNoStorage ? (
                          <Close className="h-4 w-4 flex-shrink-0 text-red-400" />
                        ) : (
                          <Check className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                        )}
                        <span>{feature}</span>
                      </li>
                    );
                  })}
                </ul>
                <Button
                  onClick={() => !isCurrent && handleUpgrade(plan.name)}
                  disabled={isCurrent}
                  variant={isCurrent ? "outline" : "default"}
                  className={`w-full ${
                    isCurrent
                      ? "border-white/10 text-white/80"
                      : "bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:from-yellow-500 hover:to-orange-500"
                  }`}
                >
                  {isCurrent ? "اشتراک فعلی" : "ارتقا به " + plan.name}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Billing History */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-white md:text-2xl">
          تاریخچه پرداخت
        </h2>
        <div className="overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/50 md:rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 md:px-6 md:text-sm">
                    شماره فاکتور
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 md:px-6 md:text-sm">
                    تاریخ
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 md:px-6 md:text-sm">
                    پلن
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 md:px-6 md:text-sm">
                    مبلغ
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 md:px-6 md:text-sm">
                    وضعیت
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 md:px-6 md:text-sm">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockBillingHistory.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-white/5 transition-colors hover:bg-white/5"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-white md:px-6">
                      {item.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300 md:px-6">
                      {item.date}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300 md:px-6">
                      {getPlanNamePersian(item.plan as any)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-white md:px-6">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="px-4 py-3 md:px-6">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-4 py-3 md:px-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-white"
                      >
                        <Download className="h-4 w-4 ml-1" />
                        دانلود
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Upgrade Dialog */}
      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent className="bg-slate-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-right text-white mt-5">
              ارتقا به پلن {selectedPlan}
            </DialogTitle>
            <DialogDescription className="text-right text-slate-400">
              آیا مطمئن هستید که می‌خواهید به پلن {selectedPlan} ارتقا دهید؟
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row-reverse gap-2">
            <Button
              onClick={() => setIsUpgradeDialogOpen(false)}
              className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:from-yellow-500 hover:to-orange-500"
            >
              تایید و پرداخت
            </Button>
            <Button
              onClick={() => setIsUpgradeDialogOpen(false)}
              variant="outline"
              className="border-white/10 text-white/80 hover:border-white/30"
            >
              انصراف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

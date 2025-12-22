"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
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
  Coins,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { plans as landingPlans, creditPackages } from "@/lib/data";
import { useUser } from "@/hooks/use-user";
import { getPlanNamePersian, getPlanNameEnglish } from "@/lib/utils";
import { UpgradeDialog } from "@/components/dialog/upgrade-dialog";
import { persianToast } from "@/components/ui/persian-toaster";

interface BillingHistoryItem {
  id: string;
  date: string;
  amount: number;
  type?: "plan" | "credits";
  plan?: string;
  credits?: number;
  status: "paid" | "pending" | "failed";
  invoiceUrl?: string;
  authority?: string;
  refId?: number;
}

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
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedCreditPackage, setSelectedCreditPackage] = useState<
    string | null
  >(null);
  const [isPurchasingCredits, setIsPurchasingCredits] = useState(false);
  const [billingHistory, setBillingHistory] = useState<BillingHistoryItem[]>(
    []
  );
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const { user, refreshUserData } = useUser();

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
  const getCreditsLimit = (planName: string) => {
    const plan = landingPlans.find((p) => p.name === planName);
    if (!plan) return 0;
    const creditsMatch = plan.highlights.find((h) => h.includes("اعتبار"));
    if (!creditsMatch) return 0;
    const match = creditsMatch.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "1403/10/15";

    // Convert string to Date if needed
    let dateObj: Date;
    if (typeof date === "string") {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "1403/10/15";
    }

    // Convert to Persian date (simplified - you might want to use a proper library)
    try {
      return new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(dateObj);
    } catch (error) {
      return "1403/10/15";
    }
  };

  const usage = {
    imagesGenerated: user.imagesGeneratedThisMonth,
    creditsLimit: currentPlan ? getCreditsLimit(currentPlan.name) : 0,
    resetDate: formatDate(user.monthlyResetDate),
  };

  // Fetch billing history
  const fetchBillingHistory = useCallback(async () => {
    try {
      setIsLoadingHistory(true);
      const response = await fetch("/api/user/billing");
      if (!response.ok) {
        throw new Error("Failed to fetch billing history");
      }
      const history = await response.json();
      // Convert date strings to Date objects and format for display
      const formattedHistory: BillingHistoryItem[] = history.map(
        (item: any) => ({
          ...item,
          date: formatDate(item.date),
          type: item.type || "plan", // Default to "plan" for backward compatibility
        })
      );
      setBillingHistory(formattedHistory);
    } catch (error) {
      console.error("Error fetching billing history:", error);
      setBillingHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // Fetch billing history on mount
  useEffect(() => {
    fetchBillingHistory();
  }, [fetchBillingHistory]);

  // Handle payment status from query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");

    if (payment) {
      setPaymentStatus(payment);

      // Remove payment param from URL
      params.delete("payment");
      const newUrl =
        window.location.pathname +
        (params.toString() ? `?${params.toString()}` : "");
      window.history.replaceState({}, "", newUrl);

      // Refresh data if payment was successful
      if (payment === "success") {
        refreshUserData();
        fetchBillingHistory();
      }

      // Auto-hide message after 5 seconds
      const timer = setTimeout(() => {
        setPaymentStatus(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [refreshUserData, fetchBillingHistory]);

  const handleUpgrade = (planName: string) => {
    setSelectedPlan(planName);
    setIsUpgradeDialogOpen(true);
  };

  const handlePurchase = async (discountCode?: string) => {
    if (!selectedPlan) return;

    const planEnglish = getPlanNameEnglish(selectedPlan);
    if (!planEnglish) return;

    // Don't allow free plan purchases
    if (planEnglish === "free") {
      persianToast.error("نمی‌توانید پلن رایگان را خریداری کنید.");
      return;
    }

    setIsPurchasing(true);
    try {
      // Call payment request API
      const response = await fetch("/api/payment/zarinpal/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          plan: planEnglish, 
          type: "plan",
          ...(discountCode && { discountCode }),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create payment request");
      }

      const data = await response.json();

      if (data.paymentUrl) {
        // Redirect to Zarinpal payment gateway
        window.location.href = data.paymentUrl;
      } else {
        throw new Error("Payment URL not received");
      }
    } catch (error: any) {
      console.error("Error creating payment request:", error);
      persianToast.error(
        "خطا در ایجاد درخواست پرداخت",
        error.message || "لطفا دوباره تلاش کنید."
      );
      setIsPurchasing(false);
    }
  };

  const handleCreditPurchase = async (creditPackageId: string) => {
    setIsPurchasingCredits(true);
    setSelectedCreditPackage(creditPackageId);
    try {
      // Call payment request API for credits
      const response = await fetch("/api/payment/zarinpal/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "credits",
          creditPackageId: creditPackageId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create payment request");
      }

      const data = await response.json();

      if (data.paymentUrl) {
        // Redirect to Zarinpal payment gateway
        window.location.href = data.paymentUrl;
      } else {
        throw new Error("Payment URL not received");
      }
    } catch (error: any) {
      console.error("Error creating credit purchase request:", error);
      persianToast.error(
        "خطا در ایجاد درخواست پرداخت",
        error.message || "لطفا دوباره تلاش کنید."
      );
      setIsPurchasingCredits(false);
      setSelectedCreditPackage(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fa-IR").format(amount) + " تومان";
  };

  const getStatusBadge = (status: string) => {
    // If not paid, show as cancelled
    if (status !== "paid") {
      return (
        <span className="rounded-lg border px-2 py-1 text-xs font-semibold bg-slate-500/20 text-slate-400 border-slate-500/30">
          لغو شده
        </span>
      );
    }

    // If paid, show as paid
    return (
      <span className="rounded-lg border px-2 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
        پرداخت شده
      </span>
    );
  };

  const getPaymentStatusMessage = () => {
    if (!paymentStatus) return null;

    const messages: Record<string, { text: string; className: string }> = {
      success: {
        text: "پرداخت با موفقیت انجام شد! پلن شما فعال شد.",
        className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      },
      failed: {
        text: "پرداخت ناموفق بود. لطفا دوباره تلاش کنید.",
        className: "bg-red-500/20 text-red-400 border-red-500/30",
      },
      verify_failed: {
        text: "خطا در تایید پرداخت. لطفا با پشتیبانی تماس بگیرید.",
        className: "bg-red-500/20 text-red-400 border-red-500/30",
      },
      notfound: {
        text: "درخواست پرداخت یافت نشد.",
        className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      },
      error: {
        text: "خطایی رخ داد. لطفا دوباره تلاش کنید.",
        className: "bg-red-500/20 text-red-400 border-red-500/30",
      },
    };

    const message = messages[paymentStatus];
    if (!message) return null;

    return (
      <div className={`mb-4 rounded-xl border p-4 ${message.className}`}>
        <p className="text-sm font-medium md:text-base">{message.text}</p>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pb-10">
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-pink-500/20 md:h-12 md:w-12 flex-shrink-0">
            <CreditCard className="h-5 w-5 text-yellow-400 md:h-6 md:w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white md:text-4xl">
              صورتحساب و پرداخت
            </h1>
            <p className="text-xs text-slate-400 md:text-base">
              مدیریت اشتراک و پرداخت‌های خود
            </p>
          </div>
        </div>
      </div>

      {/* Payment Status Message */}
      {getPaymentStatusMessage()}

      {/* Current Plan & Usage */}
      <div className="mb-6 md:mb-8 grid gap-4 md:grid-cols-2">
        {/* Current Plan Card */}
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-4 md:rounded-2xl md:p-8">
          <div className="mb-4 flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-400 md:text-sm">اشتراک فعلی</p>
              <h3 className="mt-1 text-lg font-bold text-white md:text-2xl truncate">
                {currentPlan?.name}
              </h3>
            </div>
            {currentPlan && (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-pink-500/20 md:h-14 md:w-14 flex-shrink-0 mr-2">
                <currentPlan.icon className="h-5 w-5 text-yellow-400 md:h-7 md:w-7" />
              </div>
            )}
          </div>
          <div className="mb-4">
            <p className="text-xl font-black text-white md:text-3xl">
              {currentPlan && `${currentPlan.price} ${currentPlan.currency}`}
            </p>
            <p className="text-xs text-slate-400 md:text-sm mt-1">
              {currentPlan?.tagline}
            </p>
          </div>
          {user.planEndDate && (
            <div className="mb-4 flex items-center gap-2 text-xs text-slate-400 md:text-sm">
              <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
              <span className="break-words">
                اتمام اشتراک در {formatDate(user.planEndDate)}
              </span>
            </div>
          )}
        </div>

        {/* Credits Card */}
        <div className="relative overflow-hidden rounded-xl border border-yellow-400/30 bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-pink-500/10 p-4 shadow-[0_0_40px_rgba(251,191,36,0.15)] md:rounded-2xl md:p-8">
          {/* Decorative background elements */}
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-yellow-400/10 blur-3xl" />
          <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-orange-400/10 blur-2xl" />

          <div className="relative z-10">
            {/* Header with icon */}
            <div className="mb-6 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-pink-500/20 md:h-14 md:w-14 flex-shrink-0">
                  <Coins className="h-5 w-5 text-yellow-400 md:h-7 md:w-7" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-300 md:text-sm">
                    میزان اعتبار باقی مانده
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-400 md:h-4 md:w-4" />
                    <span className="text-xs text-emerald-400 md:text-sm">
                      فعال
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Credits display */}
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-black text-white md:text-6xl">
                  {new Intl.NumberFormat("fa-IR").format(user.credits)}
                </h3>
                <span className="text-lg font-semibold text-slate-400 md:text-xl">
                  اعتبار
                </span>
              </div>
              {usage.creditsLimit > 0 && (
                <p className="mt-2 text-xs text-slate-400 md:text-sm">
                  از {new Intl.NumberFormat("fa-IR").format(usage.creditsLimit)}{" "}
                  اعتبار کل
                </p>
              )}
            </div>

            {/* Progress bar */}
            {usage.creditsLimit > 0 && (
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between text-xs text-slate-400 md:text-sm">
                  <span>میزان استفاده</span>
                  <span className="font-semibold text-white">
                    {Math.round((user.credits / usage.creditsLimit) * 100)}%
                  </span>
                </div>
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/10 backdrop-blur-sm">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 shadow-lg shadow-yellow-400/30 transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        (user.credits / usage.creditsLimit) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Footer info */}
            {/* TODO: Maybe add reset date in future */}
            {/* <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 backdrop-blur-sm">
              <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <span className="text-xs text-slate-300 md:text-sm">
                بازنشانی در {usage.resetDate}
              </span>
            </div> */}
          </div>
        </div>
      </div>

      {/* Plans Section */}
      <div className="mb-6 md:mb-8">
        <h2 className="mb-4 text-lg font-bold text-white md:text-2xl">
          پلن‌های ماهانه
        </h2>
        <div className="grid gap-3 md:grid-cols-4">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = plan.current;
            const isFreePlan = plan.name === "رایگان";
            // Free plan should always allow upgrade, even if current (since users fall back to it)
            // But don't show upgrade button for free plan itself - users upgrade TO other plans

            return (
              <div
                key={plan.name}
                className={`relative flex flex-col overflow-hidden rounded-xl border p-3 transition-all md:rounded-xl md:p-4 ${
                  isCurrent
                    ? "border-yellow-400/50 bg-gradient-to-br from-yellow-400/10 via-orange-400/10 to-pink-500/10 shadow-[0_0_30px_rgba(251,191,36,0.2)]"
                    : "border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/50 hover:border-yellow-400/30"
                }`}
              >
                {isCurrent && (
                  <div className="absolute left-2 top-2 md:left-3 md:top-3 rounded-lg bg-yellow-400/20 px-1.5 py-0.5 text-[10px] font-semibold text-yellow-400 md:text-xs">
                    فعلی
                  </div>
                )}
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-pink-500/20 md:h-10 md:w-10 flex-shrink-0">
                    <Icon className="h-4 w-4 text-yellow-400 md:h-5 md:w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-white md:text-base truncate">
                      {plan.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 md:text-xs truncate">
                      {plan.nameEn}
                    </p>
                  </div>
                </div>
                <div className="mb-3">
                  <p className="text-lg font-black text-white md:text-xl">
                    {plan.price} {plan.currency}
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-400 md:text-xs">
                    {plan.tagline}
                  </p>
                </div>
                <ul className="mb-3 flex-1 space-y-1.5">
                  {plan.highlights.map((feature, idx) => {
                    const isNoStorage = feature.includes("بدون نگهداری");
                    return (
                      <li
                        key={idx}
                        className="flex items-start gap-1.5 text-[10px] text-slate-300 md:text-xs"
                      >
                        {isNoStorage ? (
                          <Close className="h-3 w-3 md:h-3.5 md:w-3.5 flex-shrink-0 text-red-400 mt-0.5" />
                        ) : (
                          <Check className="h-3 w-3 md:h-3.5 md:w-3.5 flex-shrink-0 text-emerald-400 mt-0.5" />
                        )}
                        <span className="break-words leading-tight">
                          {feature}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                {isFreePlan && !isCurrent ? (
                  // Free plan is automatic - don't show upgrade button when not current
                  <div className="w-full h-8 flex items-center justify-center text-xs text-slate-400 md:h-9 md:text-sm mt-auto"></div>
                ) : (
                  <Button
                    onClick={() => !isCurrent && handleUpgrade(plan.name)}
                    disabled={isCurrent}
                    variant={isCurrent ? "outline" : "default"}
                    className={`w-full h-8 text-xs md:h-9 md:text-sm mt-auto ${
                      isCurrent
                        ? "border-white/10 text-white/80"
                        : "bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:from-yellow-500 hover:to-orange-500"
                    }`}
                  >
                    {isCurrent ? "اشتراک فعلی" : "ارتقا به " + plan.name}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Credit Packages Section */}
      <div className="mb-6 md:mb-8">
        <h2 className="mb-4 text-lg font-bold text-white md:text-2xl">
          خرید اعتبار اضافی
        </h2>
        <div className="grid gap-3 md:grid-cols-4">
          {creditPackages.map((pkg) => {
            const isPurchasing =
              isPurchasingCredits && selectedCreditPackage === pkg.id;
            const pricePerCredit = Math.round(pkg.price / pkg.credits);

            return (
              <div
                key={pkg.id}
                className={`relative flex flex-col overflow-hidden rounded-xl border p-4 transition-all md:p-6 ${
                  pkg.popular
                    ? "border-yellow-400/50 bg-gradient-to-br from-yellow-400/10 via-orange-400/10 to-pink-500/10 shadow-[0_0_30px_rgba(251,191,36,0.2)]"
                    : "border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/50 hover:border-yellow-400/30"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute left-3 top-3 md:left-4 md:top-4 rounded-lg bg-yellow-400/20 px-2 py-1 text-[10px] font-semibold text-yellow-400 md:text-xs">
                    پیشنهاد ویژه
                  </div>
                )}
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-pink-500/20 md:h-12 md:w-12 flex-shrink-0">
                    <Coins className="h-5 w-5 text-yellow-400 md:h-6 md:w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-white md:text-lg">
                      {pkg.name}
                    </h3>
                    <p className="text-xs text-slate-400 md:text-sm">
                      {pkg.description}
                    </p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-2xl font-black text-white md:text-3xl">
                    {new Intl.NumberFormat("fa-IR").format(pkg.price)}{" "}
                    {pkg.currency}
                  </p>
                  {/* <p className="mt-1 text-xs text-slate-400 md:text-sm">
                    {new Intl.NumberFormat("fa-IR").format(pricePerCredit)}{" "}
                    تومان به ازای هر اعتبار
                  </p> */}
                </div>
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 backdrop-blur-sm">
                  <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-xs text-slate-300 md:text-sm">
                    {new Intl.NumberFormat("fa-IR").format(pkg.credits)} اعتبار
                    اضافه می‌شود
                  </span>
                </div>
                <Button
                  onClick={() => handleCreditPurchase(pkg.id)}
                  disabled={isPurchasing}
                  className="w-full h-9 text-sm md:h-10 md:text-base bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:from-yellow-500 hover:to-orange-500 disabled:opacity-50"
                >
                  {isPurchasing ? "در حال پردازش..." : "خرید اعتبار"}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Billing History */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-white md:text-2xl">
          تاریخچه پرداخت
        </h2>

        {/* Mobile Card View */}
        <div className="space-y-3 md:hidden">
          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-slate-400">در حال بارگذاری...</p>
            </div>
          ) : billingHistory.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-slate-400">تاریخچه پرداخت خالی است</p>
            </div>
          ) : (
            billingHistory.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">شماره فاکتور</p>
                    <p className="mt-1 text-sm font-medium text-white">
                      {item.id}
                    </p>
                  </div>
                  <div className="text-left">{getStatusBadge(item.status)}</div>
                </div>
                <div className="space-y-2 border-t border-white/10 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">تاریخ</span>
                    <span className="text-sm text-slate-300">{item.date}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">نوع</span>
                    <span className="text-sm text-slate-300">
                      {item.type === "credits" ? (
                        <span className="flex items-center gap-1">
                          <Coins className="h-3.5 w-3.5 text-yellow-400" />
                          {new Intl.NumberFormat("fa-IR").format(
                            item.credits || 0
                          )}{" "}
                          اعتبار
                        </span>
                      ) : (
                        getPlanNamePersian(item.plan as any)
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">مبلغ</span>
                    <span className="text-sm font-semibold text-white">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/10">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-slate-400 hover:text-white h-9"
                  >
                    <Download className="h-4 w-4 ml-1" />
                    دانلود فاکتور
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/50 md:rounded-2xl">
          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-slate-400">در حال بارگذاری...</p>
            </div>
          ) : billingHistory.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-slate-400">تاریخچه پرداخت خالی است</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-3 text-right text-sm font-semibold text-slate-400">
                      شماره فاکتور
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-slate-400">
                      تاریخ
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-slate-400">
                      نوع
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-slate-400">
                      مبلغ
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-slate-400">
                      وضعیت
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {billingHistory.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-white/5 transition-colors hover:bg-white/5"
                    >
                      <td className="px-6 py-3 text-sm font-medium text-white">
                        {item.id}
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-300">
                        {item.date}
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-300">
                        {item.type === "credits" ? (
                          <span className="flex items-center gap-2">
                            <Coins className="h-4 w-4 text-yellow-400" />
                            {new Intl.NumberFormat("fa-IR").format(
                              item.credits || 0
                            )}{" "}
                            اعتبار
                          </span>
                        ) : (
                          getPlanNamePersian(item.plan as any)
                        )}
                      </td>
                      <td className="px-6 py-3 text-sm font-semibold text-white">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="px-6 py-3">
                        {getStatusBadge(item.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Dialog */}
      <UpgradeDialog
        open={isUpgradeDialogOpen}
        onOpenChange={(open) => {
          setIsUpgradeDialogOpen(open);
          if (!open) {
            setSelectedPlan(null);
          }
        }}
        selectedPlan={selectedPlan}
        plans={plans}
        onPurchase={handlePurchase}
        isPurchasing={isPurchasing}
      />
    </div>
  );
}

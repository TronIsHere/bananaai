"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, X, Loader2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { plans } from "@/lib/data";
import { getPlanNameEnglish } from "@/lib/utils";
import { persianToast } from "@/components/ui/persian-toaster";

interface PostGenerationUpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  generatedImageUrl: string | null;
  onUpgrade?: () => void;
}

export function PostGenerationUpgradeDialog({
  open,
  onOpenChange,
  generatedImageUrl,
  onUpgrade,
}: PostGenerationUpgradeDialogProps) {
  const router = useRouter();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [discountExpiresIn, setDiscountExpiresIn] = useState<number | null>(null);

  // Get Creator plan
  const creatorPlan = plans.find((p) => p.nameEn === "Creator");

  // Calculate discount expiration (24 hours from now)
  useEffect(() => {
    if (open && !discountExpiresIn) {
      // Set expiration to 24 hours from now
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem("creator_discount_expires", expiresAt.toString());
      setDiscountExpiresIn(expiresAt);
    }

    // Update countdown every second
    const interval = setInterval(() => {
      const stored = localStorage.getItem("creator_discount_expires");
      if (stored) {
        const expires = parseInt(stored, 10);
        const remaining = Math.max(0, expires - Date.now());
        if (remaining === 0) {
          setDiscountExpiresIn(null);
        } else {
          setDiscountExpiresIn(expires);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [open, discountExpiresIn]);

  // Load expiration from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("creator_discount_expires");
    if (stored) {
      const expires = parseInt(stored, 10);
      if (expires > Date.now()) {
        setDiscountExpiresIn(expires);
      }
    }
  }, []);

  const formatTimeRemaining = (expiresAt: number) => {
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) return "منقضی شده";
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours} ساعت و ${minutes} دقیقه`;
    }
    return `${minutes} دقیقه`;
  };

  const handleUpgrade = async () => {
    if (!creatorPlan) return;

    setIsPurchasing(true);
    try {
      const planEnglish = getPlanNameEnglish(creatorPlan.name);
      if (!planEnglish) return;

      // Try with discount code first, fallback to no discount if code doesn't exist
      let response = await fetch("/api/payment/zarinpal/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: planEnglish,
          type: "plan",
          discountCode: "NEWUSER10", // 10% discount for new users
        }),
      });

      // If discount code fails, try without discount
      if (!response.ok) {
        const errorData = await response.json();
        // If it's a discount error, try without discount
        if (errorData.error && errorData.error.includes("تخفیف")) {
          response = await fetch("/api/payment/zarinpal/request", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              plan: planEnglish,
              type: "plan",
            }),
          });
        } else {
          throw new Error(errorData.error || "Failed to create payment request");
        }
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create payment request");
      }

      const data = await response.json();

      if (data.paymentUrl) {
        // Call onUpgrade callback if provided
        if (onUpgrade) {
          onUpgrade();
        }
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

  const handleLater = () => {
    onOpenChange(false);
  };

  if (!creatorPlan) return null;

  // Calculate discounted price (10% off)
  const originalPrice = parseInt(creatorPlan.price.replace(/,/g, ""), 10);
  const discountAmount = Math.round(originalPrice * 0.1);
  const discountedPrice = originalPrice - discountAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-950 border-white/10 text-white p-0 overflow-hidden max-w-lg gap-0 sm:rounded-3xl">
        {/* Header Section */}
        <div className="relative px-4 pt-8 pb-4 pr-12 bg-linear-to-b from-slate-900 to-slate-950 overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-yellow-500/10 blur-[60px] rounded-full pointer-events-none" />
          <div className="absolute -top-16 -left-16 w-48 h-48 bg-orange-500/10 blur-[60px] rounded-full pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-yellow-400 via-orange-400 to-pink-500" />

          <DialogHeader className="relative z-10 pt-0 pr-0">
            <div className="flex flex-col items-center text-center space-y-3 pt-2">
              {/* Success Icon */}
              <div className="relative group">
                <div className="absolute inset-0 bg-linear-to-br from-yellow-400 to-orange-500 blur-xl opacity-30 group-hover:opacity-40 transition-opacity duration-500 rounded-full" />
                <div className="relative h-16 w-16 flex items-center justify-center rounded-xl bg-linear-to-br from-slate-800 to-slate-900 border border-white/10 shadow-2xl shadow-black/50">
                  <Sparkles className="h-8 w-8 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                </div>
              </div>

              {/* Title */}
              <div>
                <DialogTitle className="text-2xl font-black text-white mb-1">
                  🎉 عالی شد!
                </DialogTitle>
                <p className="text-sm text-slate-300 leading-relaxed">
                  با پلن Creator می‌تونی همین حالا
                  <br />
                  <span className="font-bold text-yellow-400">30 تصویر دیگه بسازی</span>
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Body Section */}
        <div className="px-5 pb-4 bg-slate-950 space-y-4">
          {/* Generated Image Display */}
          {generatedImageUrl && (
            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-slate-900/50">
              <img
                src={generatedImageUrl}
                alt="Generated image"
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 to-transparent" />
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <Crown className="h-4 w-4 text-yellow-400" />
                <span className="text-xs font-medium text-white">
                  تصویر شما با Creator
                </span>
              </div>
            </div>
          )}

          {/* Discount Badge */}
          <div className="rounded-xl border border-yellow-400/30 bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-pink-500/10 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">⏳</span>
                <span className="text-sm font-bold text-yellow-400">
                  10٪ تخفیف کاربران جدید
                </span>
              </div>
              {discountExpiresIn && (
                <span className="text-xs text-slate-400">
                  {formatTimeRemaining(discountExpiresIn)}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg text-slate-400 line-through">
                {originalPrice.toLocaleString("fa-IR")} تومان
              </span>
              <span className="text-2xl font-black text-white">
                {discountedPrice.toLocaleString("fa-IR")} تومان
              </span>
            </div>
          </div>

          {/* Creator Plan Info */}
          <div className="rounded-lg bg-slate-900/50 border border-white/5 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-yellow-400" />
              <span className="text-sm font-bold text-white">پلن Creator</span>
            </div>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-2 text-xs text-slate-300">
                <span className="text-emerald-400">✓</span>
                <span>۶۵۰ اعتبار</span>
              </li>
              <li className="flex items-center gap-2 text-xs text-slate-300">
                <span className="text-emerald-400">✓</span>
                <span>کیفیت ۱۰۲۴×۱۰۲۴</span>
              </li>
              <li className="flex items-center gap-2 text-xs text-slate-300">
                <span className="text-emerald-400">✓</span>
                <span>بدون واترمارک</span>
              </li>
              <li className="flex items-center gap-2 text-xs text-slate-300">
                <span className="text-emerald-400">✓</span>
                <span>نگهداری ۳۰ روزه</span>
              </li>
            </ul>
          </div>

          {/* Footer Actions */}
          <div className="space-y-2 pt-2">
            <Button
              onClick={handleUpgrade}
              disabled={isPurchasing}
              className="w-full h-12 text-base font-bold bg-linear-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg shadow-orange-500/20 rounded-xl transition-all duration-300 hover:scale-[1.02] disabled:hover:scale-100 disabled:opacity-70"
            >
              {isPurchasing ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  در حال پردازش...
                </>
              ) : (
                <>
                  <Crown className="h-4 w-4 ml-2" />
                  ✅ ادامه با Creator
                </>
              )}
            </Button>

            <Button
              onClick={handleLater}
              disabled={isPurchasing}
              variant="ghost"
              className="w-full h-10 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-xl"
            >
              ❌ بعداً
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


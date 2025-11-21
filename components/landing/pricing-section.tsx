"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { plans } from "@/lib/data";
import { HiCheck, HiSparkles } from "react-icons/hi2";
import {
  FaImage,
  FaRocket,
  FaCrown,
  FaShieldAlt,
  FaTimesCircle,
} from "react-icons/fa";
import { useUser } from "@/hooks/use-user";
import { LoginDialog } from "@/components/dialog/login-dialog";

const featureIcons: Record<string, any> = {
  تصویر: FaImage,
  "متن به تصویر": FaImage,
  "تصویر به تصویر": FaImage,
  کیفیت: HiSparkles,
  پردازش: FaRocket,
  واترمارک: FaShieldAlt,
  نگهداری: FaShieldAlt,
  پشتیبانی: FaCrown,
};

export function PricingSection() {
  const router = useRouter();
  const { isAuthenticated } = useUser();
  const [loginOpen, setLoginOpen] = useState(false);

  const handlePlanClick = () => {
    if (isAuthenticated) {
      router.push("/dashboard/billing");
    } else {
      setLoginOpen(true);
    }
  };

  return (
    <section id="pricing" className="mx-auto mt-16 max-w-7xl sm:mt-20 md:mt-24">
      <div className="text-center">
        <div className="mx-auto inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold text-white/70 sm:px-4 sm:text-xs">
          پلن های اعتباری
        </div>
        <h2 className="mt-4 text-3xl font-black text-white sm:mt-6 sm:text-4xl md:text-5xl">
          انتخاب پلن مناسب برای شما
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-base text-slate-300 sm:text-lg">
          پلن‌های اعتباری هوش مصنوعی بنانا بر اساس نیاز‌های شما طراحی شده‌اند
        </p>
      </div>

      <div className="mt-12 grid gap-3 sm:mt-16 md:grid-cols-4">
        {plans.map((plan) => {
          const isFeatured = plan.featured;

          return (
            <div
              key={plan.name}
              className={`group relative flex flex-col overflow-hidden rounded-xl border transition-all md:rounded-xl ${
                isFeatured
                  ? "border-yellow-400/50 bg-gradient-to-br from-yellow-400/10 via-orange-400/10 to-pink-500/10 shadow-[0_0_30px_rgba(251,191,36,0.2)]"
                  : "border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/50 hover:border-yellow-400/30"
              }`}
            >
              {/* Featured badge */}
              {isFeatured && (
                <div className="absolute left-2 top-2 md:left-3 md:top-3 rounded-lg bg-yellow-400/20 px-1.5 py-0.5 text-[10px] font-semibold text-yellow-400 md:text-xs z-10">
                  محبوب ترین
                </div>
              )}

              {/* Card content */}
              <div className="relative flex flex-col p-3 md:p-4 h-full">
                {/* Plan header */}
                <div className="mb-3">
                  <div className="flex items-center gap-2">
                    {isFeatured && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-pink-500/20 md:h-10 md:w-10 flex-shrink-0">
                        <FaCrown className="h-4 w-4 text-yellow-400 md:h-5 md:w-5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-white md:text-base truncate">
                        {plan.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 md:text-xs truncate">
                        {plan.nameEn}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="mb-3">
                  <p className="text-lg font-black text-white md:text-xl">
                    {plan.price} {plan.currency}
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-400 md:text-xs">
                    {plan.tagline}
                  </p>
                </div>

                {/* Features list */}
                <ul className="mb-3 flex-1 space-y-1.5 min-h-0">
                  {plan.highlights.map((item) => {
                    const isNoStorage = item.includes("بدون نگهداری");
                    const iconKey = Object.keys(featureIcons).find((key) =>
                      item.includes(key)
                    );
                    const IconComponent = iconKey
                      ? featureIcons[iconKey]
                      : isNoStorage
                      ? FaTimesCircle
                      : HiCheck;

                    return (
                      <li
                        key={item}
                        className="flex items-start gap-1.5 text-[10px] text-slate-300 md:text-xs"
                      >
                        {isNoStorage ? (
                          <FaTimesCircle className="h-3 w-3 md:h-3.5 md:w-3.5 flex-shrink-0 text-red-400 mt-0.5" />
                        ) : (
                          <IconComponent className="h-3 w-3 md:h-3.5 md:w-3.5 flex-shrink-0 text-emerald-400 mt-0.5" />
                        )}
                        <span className="break-words leading-tight">
                          {item}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {/* CTA Button */}
                <Button
                  onClick={handlePlanClick}
                  className={`w-full h-8 text-xs md:h-9 md:text-sm mt-auto ${
                    isFeatured
                      ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:from-yellow-500 hover:to-orange-500"
                      : "border-white/10 text-white/80"
                  }`}
                  variant={isFeatured ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional info */}
      <div className="mt-12 text-center">
        <p className="text-sm text-slate-400">
          تمام پلن‌ها شامل پشتیبانی ۲۴/۷ و به‌روزرسانی‌های رایگان هستند
        </p>
      </div>
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </section>
  );
}

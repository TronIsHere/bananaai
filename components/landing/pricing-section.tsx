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

      <div className="mt-12 grid gap-6 sm:mt-16 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {plans.map((plan) => {
          const isFeatured = plan.featured;

          return (
            <div
              key={plan.name}
              className={`group relative rounded-3xl transition-all duration-300 ${
                isFeatured
                  ? "shadow-[0_0_60px_rgba(251,191,36,0.3)] md:-translate-y-2 md:scale-105 p-[2px]"
                  : "border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-950/90 shadow-[0_30px_120px_rgba(15,23,42,0.45)] hover:border-white/20 hover:shadow-[0_40px_140px_rgba(15,23,42,0.6)]"
              }`}
            >
              {/* Animated gradient border for featured */}
              {isFeatured && (
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 bg-[length:200%_100%] animate-gradient-border" />
              )}

              {/* Inner content wrapper */}
              <div
                className={`relative rounded-3xl ${
                  isFeatured
                    ? "bg-gradient-to-br from-slate-900/95 to-slate-950/95"
                    : ""
                }`}
              >
                {/* Featured badge */}
                {isFeatured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="relative flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 px-4 py-1.5 shadow-lg">
                      <HiSparkles className="h-3 w-3 text-slate-950" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-950 sm:text-xs">
                        محبوب ترین
                      </span>
                    </div>
                  </div>
                )}

                {/* Card content */}
                <div className="relative p-6 sm:p-8">
                  {/* Plan header */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3
                          className={`text-2xl font-black sm:text-3xl ${
                            isFeatured ? "text-white" : "text-white"
                          }`}
                        >
                          {plan.name}
                        </h3>
                        <p className="mt-1 text-xs text-white/50 sm:text-sm">
                          {plan.nameEn}
                        </p>
                      </div>
                      {isFeatured && (
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg">
                          <FaCrown className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <p
                      className={`mt-3 text-sm leading-relaxed ${
                        isFeatured ? "text-white/90" : "text-slate-300"
                      }`}
                    >
                      {plan.tagline}
                    </p>
                  </div>

                  {/* Pricing */}
                  <div className="mb-6 border-b border-white/10 pb-6">
                    <div className="flex items-baseline gap-2">
                      <span
                        className={`text-4xl font-black sm:text-5xl ${
                          isFeatured ? "text-white" : "text-white"
                        }`}
                      >
                        {plan.price}
                      </span>
                      {plan.currency && (
                        <span
                          className={`text-base font-medium ${
                            isFeatured ? "text-white/70" : "text-slate-400"
                          }`}
                        >
                          {plan.currency}
                        </span>
                      )}
                    </div>
                    {isFeatured && (
                      <p className="mt-2 text-xs text-white/60">
                        بهترین قیمت برای بیشترین ارزش
                      </p>
                    )}
                  </div>

                  {/* Features list */}
                  <ul className="mb-8 space-y-3">
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
                        <li key={item} className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${
                              isNoStorage
                                ? "bg-red-500/20 text-red-400"
                                : isFeatured
                                ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-950"
                                : "bg-emerald-500/20 text-emerald-400"
                            }`}
                          >
                            <IconComponent className="h-3 w-3" />
                          </div>
                          <span
                            className={`text-sm leading-relaxed ${
                              isFeatured ? "text-white/90" : "text-slate-300"
                            }`}
                          >
                            {item}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    className={`w-full rounded-2xl px-6 py-6 text-sm font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                      isFeatured
                        ? "bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 text-slate-950 shadow-lg hover:scale-105 hover:shadow-xl hover:shadow-yellow-400/50"
                        : "border-2 border-white/20 bg-white/5 text-white backdrop-blur-sm hover:border-white/40 hover:bg-white/10 hover:shadow-lg"
                    }`}
                    variant={isFeatured ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </div>

                {/* Decorative elements for non-featured */}
                {!isFeatured && (
                  <div className="absolute inset-0 -z-10 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl" />
                    <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-purple-500/10 blur-3xl" />
                  </div>
                )}
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
    </section>
  );
}

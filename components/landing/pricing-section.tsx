import { Button } from "@/components/ui/button";
import { plans } from "@/lib/data";

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="mx-auto mt-16 max-w-6xl sm:mt-20 md:mt-24"
    >
      <div className="text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/60 sm:text-xs">
          ماتریس اعتباری
        </p>
        <h2 className="mt-3 text-3xl font-black sm:mt-4 sm:text-4xl">
          تعرفه‌های اعتباری
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-base text-slate-300 sm:text-lg">
          کرایه GPU فقط وقتی استفاده می‌کنید. هر اعتبار معادل یک رندر
          استاندارد ۱۰۲۴px است.
        </p>
      </div>
      <div className="mt-12 grid gap-6 sm:mt-16 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-3xl border border-white/5 p-6 shadow-[0_30px_120px_rgba(15,23,42,0.55)] sm:p-8 ${
              plan.featured
                ? "bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 text-slate-950 md:-translate-y-4"
                : "bg-white/5"
            }`}
          >
            {plan.featured && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-950 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white sm:px-4 sm:text-xs">
                پیشنهاد ویژه
              </span>
            )}
            <div className="mt-2 sm:mt-0">
              <h3
                className={`text-xl font-black sm:text-2xl ${
                  plan.featured ? "text-slate-950" : "text-white"
                }`}
              >
                {plan.name}
              </h3>
              <p
                className={`mt-1 text-xs ${
                  plan.featured ? "text-slate-800/80" : "text-white/60"
                } sm:text-sm`}
              >
                {plan.tagline}
              </p>
              <div className="mt-6 flex items-baseline gap-2">
                <p
                  className={`text-3xl font-black sm:text-4xl ${
                    plan.featured ? "text-slate-950" : "text-white"
                  }`}
                >
                  {plan.price}
                </p>
                {plan.currency && (
                  <p
                    className={`text-sm ${
                      plan.featured ? "text-slate-800/80" : "text-white/60"
                    }`}
                  >
                    {plan.currency}
                  </p>
                )}
              </div>
              <ul
                className={`mt-6 space-y-2.5 text-xs sm:space-y-3 sm:text-sm ${
                  plan.featured ? "text-slate-900/80" : "text-slate-300"
                }`}
              >
                {plan.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span
                      className={`mt-0.5 text-base ${
                        plan.featured
                          ? "text-slate-900"
                          : "text-emerald-300"
                      }`}
                    >
                      •
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={`mt-6 w-full rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-[0.2em] transition sm:mt-8 sm:text-sm ${
                  plan.featured
                    ? "bg-slate-950 text-white hover:bg-slate-900"
                    : "border border-white/20 text-white hover:border-white/50"
                }`}
                variant={plan.featured ? "default" : "outline"}
              >
                {plan.cta}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


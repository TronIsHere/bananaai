"use client";

import { Button } from "@/components/ui/button";
import { stats } from "@/lib/data";

export function HeroSection() {
  return (
    <section className="relative mx-auto mt-6 max-w-6xl overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 shadow-[0_40px_140px_rgba(15,23,42,0.7)] sm:mt-10 sm:p-8 md:p-10">
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_top,#facc15,transparent_45%),radial-gradient(circle_at_bottom,#f472b6,transparent_40%)]" />
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(120deg,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]; [background-size:160px_200px,120px_120px]" />
        <div className="absolute -right-32 top-16 h-64 w-64 rounded-full bg-cyan-500/20 blur-[120px]" />
        <div className="absolute -left-40 bottom-10 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-[140px]" />
      </div>
      <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
        <div className="space-y-6 sm:space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold text-white/60 sm:gap-3 sm:px-4 sm:py-2 sm:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            نانوبنانا • نسل ۳ • چندوجهی
          </div>
          <h1 className="text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
            <span className="block text-white">پلتفرم مولد</span>
            <span className="mx-2 mt-2 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-fuchsia-300 sm:px-4 sm:py-2 sm:text-sm md:text-base">
              هوش مصنوعی + ایران
            </span>
            <span className="mt-2 block bg-gradient-to-r from-cyan-300 via-emerald-200 to-yellow-200 bg-clip-text text-transparent">
              خلق تصاویر سینمایی از ذهن شما
            </span>
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            BananaAI تنها پلتفرم ایرانی با موتور{" "}
            <span className="font-semibold text-white">نانوبنانا</span> است
            که متن، تصویر و ویدیو را در زیرساختی کم‌تاخیر پردازش می‌کند.
            شبکه عصبی اختصاصی ما برای ادبیات فارسی و مفاهیم بصری منطقه آموزش
            دیده است.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button className="group flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 px-5 py-3.5 text-base font-extrabold text-white shadow-[0_25px_60px_rgba(14,165,233,0.4)] transition hover:translate-y-[-2px] sm:px-6 sm:py-4 sm:text-lg">
              <span>ورود به استودیو</span>
              <span className="text-xl transition group-hover:translate-x-1 sm:text-2xl">
                →
              </span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-1 items-center justify-center rounded-2xl border-white/10 bg-white/5 px-5 py-3.5 text-base font-bold text-white hover:border-white/30 sm:px-6 sm:py-4 sm:text-lg"
            >
              نمایش دمو
            </Button>
          </div>
          <div className="grid gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 sm:grid-cols-3 sm:gap-6 sm:p-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center sm:text-right">
                <p className="text-xl font-black text-white sm:text-2xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-[10px] text-white/60 sm:text-xs">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative hidden lg:block">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/20 via-transparent to-fuchsia-500/10 blur-3xl" />
          <div className="relative rounded-[32px] border border-white/5 bg-gradient-to-b from-slate-900/80 to-slate-950/90 p-4 shadow-2xl sm:p-6">
            <div className="mb-4 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-white/40 sm:mb-6 sm:text-xs">
              <span>ضبط عصبی</span>
              <span>زمان واقعی</span>
            </div>
            <div className="relative h-64 overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900 to-slate-950 sm:h-72">
              <div className="absolute inset-0 opacity-40 [background:radial-gradient(circle_at_30%_20%,rgba(14,165,233,0.7),transparent_55%),radial-gradient(circle_at_70%_80%,rgba(217,70,239,0.5),transparent_45%)]" />
              <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/40 blur-lg" />
              <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-200/20 blur-2xl" />
              <div className="absolute inset-6 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-slate-200 sm:inset-10 sm:p-4 sm:text-sm">
                <p className="mb-2 font-semibold text-cyan-200">
                  پرامپت نمونه
                </p>
                <p className="leading-relaxed text-white/80">
                  «یک روبات نوازنده تار در بازار تبریز، نور نئون، سبک
                  سینمایی، رندر Octane، لنز ۳۵mm»
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 text-xs text-white/70 sm:mt-6 sm:gap-4 sm:text-sm">
              <div className="flex items-center justify-between">
                <span>تاخیر GPU</span>
                <span className="font-semibold text-emerald-300">
                  ۱.۸ ثانیه
                </span>
              </div>
              <div className="h-1 rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-emerald-400 to-cyan-400"
                  style={{ width: "76%" }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>دقت</span>
                <span className="font-semibold text-cyan-300">۹۸.۷٪</span>
              </div>
              <div className="h-1 rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-cyan-400 via-blue-500 to-purple-500"
                  style={{ width: "91%" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


"use client";

import { Button } from "@/components/ui/button";

export function BetaCTASection() {
  return (
    <section className="mx-auto mt-20 max-w-4xl rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-purple-500/10 p-6 text-center sm:mt-28 sm:p-8 md:p-10">
      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/60 sm:text-xs">
        پیوستن به بتا
      </p>
      <h2 className="mt-4 text-2xl font-black text-white sm:text-3xl">
        نسخه Vision-to-Video بزودی در بتای خصوصی خواهد بود
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm text-slate-300 sm:text-base">
        با ثبت‌نام در بتا به موتور تولید ویدیو، کنترل فریم و لایه‌های صوتی
        دسترسی می‌گیرید.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          placeholder="ایمیل کاری شما"
          className="flex-1 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-center text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 sm:text-base"
        />
        <Button className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:scale-105 sm:text-base">
          درخواست دسترسی
        </Button>
      </div>
    </section>
  );
}


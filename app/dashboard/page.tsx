"use client";

import { Sparkles, Image } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="max-w-5xl">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-black text-white mb-2 md:text-4xl">
          داشبورد
        </h1>
        <p className="text-sm text-slate-400 md:text-base">
          به پنل کاربری بنانا خوش آمدید
        </p>
      </div>

      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        <Link href="/dashboard/text-to-image">
          <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-6 transition-all active:scale-[0.98] hover:border-yellow-400/30 hover:shadow-[0_0_30px_rgba(251,191,36,0.2)] md:rounded-2xl md:p-8">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-pink-500/20 md:mb-4 md:h-16 md:w-16">
              <Sparkles className="h-6 w-6 text-yellow-400 md:h-8 md:w-8" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-white md:text-xl">
              متن به تصویر
            </h3>
            <p className="text-xs text-slate-400 md:text-sm">
              تولید تصویر از متن با استفاده از هوش مصنوعی
            </p>
            <div className="mt-4">
              <Button
                variant="outline"
                className="w-full border-white/10 text-white/80 hover:border-yellow-400/30 hover:text-yellow-400 md:w-auto"
              >
                شروع کنید
              </Button>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/image-to-image">
          <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-6 transition-all active:scale-[0.98] hover:border-yellow-400/30 hover:shadow-[0_0_30px_rgba(251,191,36,0.2)] md:rounded-2xl md:p-8">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-pink-500/20 md:mb-4 md:h-16 md:w-16">
              <Image className="h-6 w-6 text-yellow-400 md:h-8 md:w-8" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-white md:text-xl">
              تصویر به تصویر
            </h3>
            <p className="text-xs text-slate-400 md:text-sm">
              تبدیل و پردازش تصویر با هوش مصنوعی
            </p>
            <div className="mt-4">
              <Button
                variant="outline"
                className="w-full border-white/10 text-white/80 hover:border-yellow-400/30 hover:text-yellow-400 md:w-auto"
              >
                شروع کنید
              </Button>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

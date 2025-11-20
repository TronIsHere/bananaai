"use client";

import { Sparkles, Image } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white mb-2">داشبورد</h1>
        <p className="text-slate-400">به پنل کاربری BananaAI خوش آمدید</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/dashboard/text-to-image">
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-8 transition-all hover:border-yellow-400/30 hover:shadow-[0_0_30px_rgba(251,191,36,0.2)]">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-pink-500/20">
              <Sparkles className="h-8 w-8 text-yellow-400" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">متن به تصویر</h3>
            <p className="text-sm text-slate-400">
              تولید تصویر از متن با استفاده از هوش مصنوعی
            </p>
            <div className="mt-4">
              <Button
                variant="outline"
                className="border-white/10 text-white/80 hover:border-yellow-400/30 hover:text-yellow-400"
              >
                شروع کنید
              </Button>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/image-to-image">
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-8 transition-all hover:border-yellow-400/30 hover:shadow-[0_0_30px_rgba(251,191,36,0.2)]">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-pink-500/20">
              <Image className="h-8 w-8 text-yellow-400" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">تصویر به تصویر</h3>
            <p className="text-sm text-slate-400">
              تبدیل و پردازش تصویر با هوش مصنوعی
            </p>
            <div className="mt-4">
              <Button
                variant="outline"
                className="border-white/10 text-white/80 hover:border-yellow-400/30 hover:text-yellow-400"
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


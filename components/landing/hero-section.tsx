"use client";

import { ImageCluster } from "@/components/landing/image-cluster";
import { Button } from "@/components/ui/button";
import { stats } from "@/lib/data";
import { HiArrowLeft, HiPlay } from "react-icons/hi";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { LoginDialog } from "@/components/dialog/login-dialog";

export function HeroSection() {
  const router = useRouter();
  const { isAuthenticated } = useUser();
  const [loginOpen, setLoginOpen] = useState(false);

  const handleCreateImage = () => {
    if (isAuthenticated) {
      router.push("/dashboard/text-to-image");
    } else {
      setLoginOpen(true);
    }
  };

  return (
    <section className="relative mx-auto mt-6 max-w-7xl overflow-hidden rounded-3xl px-4 sm:mt-12 sm:px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
        {/* Content */}
        <div className="space-y-8 order-2 lg:order-1 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold text-white/60 sm:gap-3 sm:px-4 sm:py-2 sm:text-xs backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            قدرتمند ترین مدل هوش مصنوعی تصویر
          </div>

          <h1 className="text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="block text-slate-300 mb-2">تخیلات خود را</span>
            <span className="bg-gradient-to-r from-cyan-300 via-emerald-200 to-yellow-200 bg-clip-text text-transparent">
              به تصویر بکشید
            </span>
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
            با هوش مصنوعی نانوبنانا، ایده‌های خود را در چند ثانیه به آثار هنری
            خیره‌کننده تبدیل کنید.
            <span className="text-slate-200 font-medium">
              {" "}
              بدون نیاز به دانش فنی{" "}
            </span>
            و با پشتیبانی کامل از زبان فارسی.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleCreateImage}
              className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 px-8 py-4 text-base font-bold text-white shadow-lg transition-all duration-300 hover:from-yellow-500 hover:to-orange-600 hover:scale-[1.02] hover:shadow-orange-500/25 sm:px-10 sm:py-6 sm:text-lg"
            >
              <span className="relative z-10 flex items-center gap-2">
                شروع رایگان
                <HiArrowLeft className="text-xl transition-transform duration-300 group-hover:-translate-x-1" />
              </span>
            </Button>

            {/* <Button
              variant="outline"
              className="group flex items-center justify-center gap-3 rounded-2xl border-white/10 bg-white/5 px-8 py-4 text-base font-medium text-white hover:bg-white/10 sm:px-10 sm:py-6 sm:text-lg backdrop-blur-sm"
            >
              <span className="flex items-center gap-2">
                نمونه کارها
                <HiPlay className="text-xl text-slate-400 transition-colors group-hover:text-white" />
              </span>
            </Button> */}
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500 font-medium">
            {/* <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              بدون نیاز به کارت اعتباری
            </div> */}
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              ۱۰۰٪ رایگان برای شروع
            </div>
          </div>

          <dl className="grid grid-cols-3 gap-4 border-t border-white/10 pt-8 sm:gap-8">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-2xl font-black text-white sm:text-3xl">
                  {stat.value}
                </dt>
                <dd className="mt-1 text-[10px] text-slate-400 sm:text-xs">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Visuals */}
        <div className="relative order-1 lg:order-2">
          <ImageCluster />

          {/* Floating badge */}
          <div className="absolute -bottom-6 -left-6 z-20 hidden md:flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-xl backdrop-blur-xl animate-bounce [animation-duration:3s]">
            <div className="flex -space-x-3 -space-x-reverse">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-10 w-10 rounded-full border-2 border-slate-900 bg-slate-800"
                />
              ))}
            </div>
            <div>
              <p className="text-sm font-bold text-white">۱۰۰۰+ عکس</p>
              <p className="text-xs text-slate-400">در هفته گذشته</p>
            </div>
          </div>
        </div>
      </div>
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </section>
  );
}

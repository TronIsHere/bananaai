"use client";

import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  Palette,
  Wand2,
  Image as ImageIcon,
  Lightbulb,
  Target,
  Rocket,
  MoveRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { MobileMenu } from "@/components/landing/mobile-menu";
import { useState } from "react";

export default function TextToImageFeaturePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Lightbulb,
      title: "درک عمیق فارسی",
      description:
        "پشتیبانی کامل از زبان فارسی با درک دقیق متن و تولید تصاویر مرتبط",
    },
    {
      icon: Target,
      title: "کنترل کامل سبک",
      description: "تعیین سبک هنری، نورپردازی، ترکیب‌بندی و جزئیات با دقت بالا",
    },
    {
      icon: Zap,
      title: "سرعت بالا",
      description:
        "تولید تصاویر با کیفیت در کمتر از ۱۰ ثانیه با استفاده از GPUهای قدرتمند",
    },
    {
      icon: Palette,
      title: "کیفیت حرفه‌ای",
      description:
        "خروجی با رزولوشن بالا و بدون نویز، آماده برای استفاده در پروژه‌های حرفه‌ای",
    },
  ];

  const useCases = [
    {
      title: "طراحی گرافیک",
      description: "ایجاد تصاویر برای بنرها، پوسترها و محتوای تبلیغاتی",
    },
    {
      title: "هنر دیجیتال",
      description: "خلق آثار هنری منحصر به فرد با سبک‌های مختلف",
    },
    {
      title: "محتوای شبکه‌های اجتماعی",
      description:
        "تولید تصاویر جذاب برای پست‌ها و استوری‌های اینستاگرام و تلگرام",
    },
    {
      title: "طراحی محصول",
      description: "تجسم ایده‌های محصول قبل از ساخت نمونه اولیه",
    },
    {
      title: "آموزش و پژوهش",
      description: "ایجاد تصاویر آموزشی و تصویرسازی مفاهیم پیچیده",
    },
    {
      title: "بازاریابی محتوا",
      description: "تولید سریع تصاویر برای کمپین‌های بازاریابی",
    },
  ];

  const tips = [
    "جزئیات بیشتری در پرامپت بنویسید تا نتیجه بهتری بگیرید",
    "از کلمات کلیدی سبک هنری استفاده کنید (مثلاً: واقع‌گرایانه، کارتونی، نقاشی رنگ روغن)",
    "نورپردازی و رنگ‌ها را مشخص کنید",
    "ابعاد و ترکیب‌بندی را در نظر بگیرید",
    "می‌توانید از مثال‌های آماده استفاده کنید",
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white" dir="rtl">
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      <Header onMobileMenuOpen={() => setMobileMenuOpen(true)} />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 sm:py-24 lg:py-28">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 blur-3xl" />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
            <div className="mx-auto max-w-3xl text-center mb-12 sm:mb-16">
              <div className="mb-6 inline-flex gap-2 items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300 backdrop-blur-sm">
                <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
                قدرتمندترین موتور تولید تصویر
              </div>
              <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl mb-6">
                جادوی تبدیل <br />
                <span className="text-cyan-400">متن به تصویر</span>
              </h1>
              <p className="text-base sm:text-lg leading-8 text-slate-300 max-w-2xl mx-auto mb-8">
                موتور تبدیل متن به تصویر با درک عمیق فارسی و کنترل کامل بر سبک،
                نور و جزئیات. از پرامپت‌های ساده تا دستورات پیچیده با دقت بالا.
              </p>
              <div className="flex items-center justify-center gap-x-6">
                <Link href="/dashboard/text-to-image">
                  <Button className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg rounded-2xl bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_40px_-10px_rgba(8,145,178,0.5)] hover:shadow-[0_0_60px_-10px_rgba(8,145,178,0.6)] transition-all duration-300 group">
                    شروع رایگان
                    <MoveRight className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Demo Image Section */}
            <div className="mt-8 sm:mt-12 lg:mt-16">
              <div className="relative rounded-lg sm:rounded-2xl bg-slate-900/50 border border-white/10 p-1.5 sm:p-3 lg:p-4">
                <div className="absolute -inset-0.5 sm:-inset-2 bg-gradient-to-r from-cyan-500 to-blue-600 opacity-20 blur-2xl -z-10 rounded-lg sm:rounded-2xl" />
                <div className="relative aspect-[3/4] sm:aspect-[4/3] lg:aspect-[16/9] rounded-md sm:rounded-xl overflow-hidden bg-slate-800 border border-white/10">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent" />

                  {/* Prompt Overlay */}
                  <div className="absolute bottom-2 left-2 right-2 sm:bottom-6 sm:left-6 sm:right-6 lg:bottom-10 lg:left-10 lg:right-10">
                    <div className="bg-black/85 backdrop-blur-md border border-white/10 rounded-md sm:rounded-xl p-2.5 sm:p-4 lg:p-6 max-w-2xl mx-auto">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="mt-0.5 sm:mt-1 shrink-0">
                          <Sparkles className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-cyan-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] sm:text-xs lg:text-sm text-cyan-300 font-semibold mb-1 sm:mb-1.5">
                            پرامپت:
                          </p>
                          <p className="text-[11px] sm:text-sm lg:text-base text-white/90 leading-relaxed break-words">
                            یک فضانورد گربه در حال نوشیدن قهوه روی ماه، سبک
                            واقع‌گرایانه، نورپردازی سینمایی، با جزئیات بالا و
                            کیفیت 4K
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 sm:py-24 lg:py-28 bg-slate-950 relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center mb-12 sm:mb-16">
              <h2 className="text-sm sm:text-base font-semibold leading-7 text-cyan-400 mb-3">
                چرا BananaAI؟
              </h2>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
                ویژگی‌های منحصر به فرد
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 hover:bg-white/[0.07] transition-all duration-300"
                  >
                    <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 flex flex-col sm:flex-row gap-6">
                      <div className="shrink-0">
                        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-cyan-400" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-16 sm:py-24 lg:py-28 bg-slate-900/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-10 sm:mb-12 text-center">
              کاربردهای نامحدود
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {useCases.map((useCase, index) => (
                <div
                  key={index}
                  className="group relative p-5 sm:p-6 bg-white/5 rounded-xl sm:rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 rounded-xl sm:rounded-2xl transition-opacity" />
                  <div className="relative z-10">
                    <h3 className="text-base sm:text-lg font-semibold text-white gap-2 mb-2 flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 " />
                      {useCase.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      {useCase.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="py-16 sm:py-24 lg:py-28 bg-slate-950 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] bg-cyan-600/5 rounded-full blur-3xl" />

          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 sm:p-12 backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <Lightbulb className="h-6 w-6 text-cyan-400" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  نکات طلایی برای بهترین نتیجه
                </h2>
              </div>

              <ul className="space-y-4">
                {tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-sm font-bold text-cyan-400">
                      {index + 1}
                    </div>
                    <span className="text-sm sm:text-base text-slate-300">
                      {tip}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-16 sm:py-24 lg:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-cyan-950/20" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative text-center">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 sm:mb-6">
              ایده‌هایتان را به تصویر بکشید
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 mb-8 sm:mb-10 max-w-2xl mx-auto">
              همین حالا شروع کنید و با قدرت هوش مصنوعی، خلاقیت خود را بدون
              محدودیت تجربه کنید.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/dashboard/text-to-image">
                <Button className="h-12 sm:h-14 px-8 sm:px-10 rounded-full bg-white text-slate-950 hover:bg-slate-200 font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
                  شروع کنید رایگان
                  <Zap className="mr-2 h-5 w-5 fill-slate-950" />
                </Button>
              </Link>
              <Link href="/#features">
                <Button
                  variant="outline"
                  className="h-12 sm:h-14 px-8 sm:px-10 rounded-full border-white/20 bg-transparent text-white hover:bg-white/10 font-medium text-base sm:text-lg"
                >
                  بازگشت به خانه
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

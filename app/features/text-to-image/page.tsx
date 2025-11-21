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

      <main className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        {/* Hero Section */}
        <div className="mb-12 text-center md:mb-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70">
            <Sparkles className="h-4 w-4 text-yellow-400" />
            <span>قابلیت هوش مصنوعی بنانا</span>
          </div>

          <div className="mb-6 flex items-center justify-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 via-blue-500/20 to-purple-500/20 md:h-20 md:w-20">
              <Sparkles className="h-8 w-8 text-cyan-400 md:h-10 md:w-10" />
            </div>
            <h1 className="text-4xl font-black text-white md:text-5xl lg:text-6xl">
              تبدیل متن به تصویر
            </h1>
          </div>

          <p className="mx-auto max-w-3xl text-lg text-slate-300 md:text-xl">
            موتور تبدیل متن به تصویر با درک عمیق فارسی و کنترل کامل بر سبک، نور
            و جزئیات. از پرامپت‌های ساده تا دستورات پیچیده با دقت بالا.
          </p>
        </div>

        {/* Main Feature Description */}
        <div className="mb-16 rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900/80 to-slate-950/90 p-8 shadow-[0_35px_120px_rgba(15,23,42,0.45)] md:p-12">
          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-black text-white md:text-3xl">
              چگونه کار می‌کند؟
            </h2>
            <div className="space-y-6 text-slate-300">
              <p className="leading-relaxed text-base md:text-lg">
                تبدیل متن به تصویر (Text-to-Image) یکی از پیشرفته‌ترین
                قابلیت‌های هوش مصنوعی است که به شما امکان می‌دهد با نوشتن یک متن
                ساده، تصویری منحصر به فرد و با کیفیت تولید کنید.
              </p>
              <p className="leading-relaxed text-base md:text-lg">
                سیستم BananaAI با استفاده از مدل‌های پیشرفته Diffusion، متن شما
                را تحلیل می‌کند و با درک عمیق از زبان فارسی و انگلیسی، تصویری
                دقیق و مرتبط با توصیفات شما خلق می‌کند.
              </p>
              <p className="leading-relaxed text-base md:text-lg">
                شما می‌توانید سبک هنری، نورپردازی، رنگ‌ها، ترکیب‌بندی و هر
                جزئیات دیگری را در پرامپت خود مشخص کنید و سیستم با دقت بالا
                آن‌ها را در تصویر نهایی اعمال می‌کند.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-white/5 bg-white/5 p-6 transition hover:border-white/10 hover:bg-white/10"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400/20 to-purple-500/20">
                      <Icon className="h-6 w-6 text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-black text-white">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-slate-300">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-16">
          <h2 className="mb-8 text-center text-3xl font-black text-white md:text-4xl">
            کاربردها
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="rounded-xl border border-white/5 bg-gradient-to-br from-slate-900/80 to-slate-950/90 p-6 transition hover:scale-[1.02] hover:border-white/10"
              >
                <div className="mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-lg font-black text-white">
                    {useCase.title}
                  </h3>
                </div>
                <p className="text-slate-300">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <div className="mb-16 rounded-3xl border border-white/5 bg-gradient-to-br from-yellow-400/10 via-orange-400/10 to-pink-500/10 p-8 md:p-12">
          <div className="mb-6 flex items-center gap-3">
            <Lightbulb className="h-8 w-8 text-yellow-400" />
            <h2 className="text-2xl font-black text-white md:text-3xl">
              نکات مهم برای بهترین نتیجه
            </h2>
          </div>
          <ul className="space-y-4">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-3 text-slate-300">
                <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-yellow-400/20 text-sm font-bold text-yellow-400">
                  {index + 1}
                </div>
                <span className="text-base md:text-lg">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Section */}
        <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-cyan-400/10 via-blue-500/10 to-purple-500/10 p-8 text-center md:p-12">
          <Rocket className="mx-auto mb-6 h-12 w-12 text-cyan-400 md:h-16 md:w-16" />
          <h2 className="mb-4 text-2xl font-black text-white md:text-3xl">
            آماده شروع هستید؟
          </h2>
          <p className="mb-8 mx-auto max-w-2xl text-slate-300 md:text-lg">
            همین حالا شروع کنید و قدرت تبدیل متن به تصویر را تجربه کنید
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/dashboard/text-to-image">
              <Button className="w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 font-bold text-white shadow-[0_10px_35px_rgba(59,130,246,0.35)] hover:scale-[1.02] hover:opacity-90 h-12 text-base active:scale-[0.98] sm:w-auto sm:px-8">
                شروع استفاده
                <ArrowRight className="mr-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/#features">
              <Button
                variant="outline"
                className="w-full border-white/10 text-white/80 hover:border-white/30 hover:text-white h-12 text-base sm:w-auto sm:px-8"
              >
                بازگشت به صفحه اصلی
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

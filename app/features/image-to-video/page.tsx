"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Video,
  ArrowRight,
  CheckCircle2,
  Zap,
  Palette,
  Wand2,
  Sparkles,
  Lightbulb,
  Target,
  Rocket,
  Upload,
  Recycle,
  Layers,
  MoveRight,
  Play,
  Timer,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { MobileMenu } from "@/components/landing/mobile-menu";
import { useState } from "react";

export default function ImageToVideoFeaturePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Play,
      title: "تبدیل تصویر به ویدیو",
      description:
        "تبدیل تصاویر ثابت به ویدیوهای متحرک و زنده با تکنولوژی پیشرفته Kling 2.6. هوش مصنوعی حرکت طبیعی و روان را به تصاویر شما اضافه می‌کند.",
    },
    {
      icon: Timer,
      title: "کنترل مدت زمان",
      description:
        "انتخاب مدت زمان ویدیو (۵ یا ۱۰ ثانیه) بر اساس نیاز شما. ویدیوهای کوتاه برای شبکه‌های اجتماعی یا ویدیوهای طولانی‌تر برای محتوای حرفه‌ای.",
    },
    {
      icon: Volume2,
      title: "افزودن صدا",
      description:
        "امکان افزودن موسیقی پس‌زمینه و افکت‌های صوتی به ویدیوهای تولید شده برای تجربه کامل‌تر.",
    },
    {
      icon: Zap,
      title: "پردازش سریع",
      description:
        "تولید ویدیوهای حرفه‌ای در چند دقیقه با استفاده از مدل‌های بهینه Kling 2.6 و سرورهای قدرتمند.",
    },
  ];

  const useCases = [
    {
      title: "محتوای شبکه‌های اجتماعی",
      description:
        "ایجاد ویدیوهای جذاب از عکس‌های ثابت برای پست‌ها و استوری‌های اینستاگرام، تلگرام و تیک‌تاک.",
    },
    {
      title: "تبلیغات و بازاریابی",
      description:
        "تبدیل تصاویر محصولات به ویدیوهای تبلیغاتی متحرک برای کمپین‌های بازاریابی.",
    },
    {
      title: "هنر دیجیتال",
      description:
        "به زندگی بخشیدن به آثار هنری و تصاویر خلاقانه با افزودن حرکت و انیمیشن.",
    },
    {
      title: "محتوا برای وبسایت",
      description:
        "ایجاد ویدیوهای کوتاه برای استفاده در صفحات فرود و صفحات محصول برای جذابیت بیشتر.",
    },
    {
      title: "ارائه و پورتفولیو",
      description:
        "تبدیل تصاویر نمونه کارها به ویدیوهای پویا برای ارائه حرفه‌ای به مشتریان.",
    },
    {
      title: "سرگرمی و خلاقیت",
      description:
        "آزمایش و خلق محتوای خلاقانه با تبدیل عکس‌های شخصی به ویدیوهای متحرک.",
    },
  ];

  const tips = [
    "از تصاویر با کیفیت و وضوح بالا استفاده کنید تا نتیجه بهتری بگیرید.",
    "تصاویری با سوژه واضح و مرکزیت مناسب بهترین نتیجه را می‌دهند.",
    "برای ویدیوهای ۱۰ ثانیه‌ای، حرکت بیشتری در ویدیو ایجاد می‌شود.",
    "می‌توانید از ویدیوهای تولید شده به عنوان ورودی برای تغییرات بیشتر استفاده کنید.",
    "حداکثر حجم فایل ۱۰ مگابایت است، فرمت‌های JPG/PNG/WEBP پشتیبانی می‌شوند.",
  ];

  const steps = [
    {
      icon: Upload,
      title: "آپلود تصویر",
      description:
        "تصویر مورد نظر را بارگذاری کنید یا با کشیدن و رها کردن اضافه کنید.",
      number: "۱",
    },
    {
      icon: Video,
      title: "تنظیمات ویدیو",
      description:
        "مدت زمان ویدیو را انتخاب کنید (۵ یا ۱۰ ثانیه) و در صورت نیاز موسیقی اضافه کنید.",
      number: "۲",
    },
    {
      icon: Play,
      title: "دریافت ویدیو",
      description:
        "در چند دقیقه ویدیو متحرک شما آماده می‌شود و می‌توانید آن را دانلود کنید.",
      number: "۳",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white" dir="rtl">
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      <Header onMobileMenuOpen={() => setMobileMenuOpen(true)} />

      <main className="">
        {/* Hero Section - Modern & Tech-focused */}
        <section className="relative overflow-hidden  py-16 sm:py-24 lg:py-28">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-pink-500/10 blur-3xl" />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
            <div className="mx-auto max-w-3xl text-center mb-12 sm:mb-16">
              <div className="mb-6 inline-flex gap-2 items-center rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-sm text-yellow-300 backdrop-blur-sm">
                <span className="flex h-2 w-2 rounded-full bg-yellow-400  animate-pulse"></span>
                نسل جدید تولید ویدیو
              </div>
              <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl mb-6">
                جادوی تبدیل <br />
                <span className="text-yellow-400">تصویر به ویدیو</span>
              </h1>
              <p className="text-base sm:text-lg leading-8 text-slate-300 max-w-2xl mx-auto mb-8">
                با مدل پیشرفته Kling 2.6، تصاویر ثابت خود را به ویدیوهای متحرک و
                زنده تبدیل کنید. کنترل کامل بر حرکت، مدت زمان و صدا برای خلق
                محتوای حرفه‌ای.
              </p>
              <div className="flex items-center justify-center gap-x-6">
                <Link href="/dashboard/image-to-video">
                  <Button className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg rounded-2xl bg-yellow-600 hover:bg-yellow-500 shadow-[0_0_40px_-10px_rgba(234,179,8,0.5)] hover:shadow-[0_0_60px_-10px_rgba(234,179,8,0.6)] transition-all duration-300 group">
                    شروع رایگان
                    <MoveRight className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Demo Video Section */}
            {/* <div className="mt-12 sm:mt-16">
              <div className="relative rounded-2xl bg-slate-900/50 border border-white/10 p-3 sm:p-4">
                <div className="absolute -inset-2 bg-gradient-to-r from-yellow-500 to-orange-600 opacity-20 blur-2xl -z-10 rounded-2xl" />
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-800 border border-white/10">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/50 to-orange-900/50 flex items-center justify-center">
                    <div className="text-center">
                      <Video className="h-16 w-16 sm:h-20 sm:w-20 text-yellow-400 opacity-50 mx-auto mb-4" />
                      <p className="text-white text-sm sm:text-base font-medium">
                        نمونه ویدیو تولید شده از تصویر
                      </p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-4 sm:p-6">
                    <div className="w-full">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse"></div>
                        <p className="text-white text-xs sm:text-sm font-medium">
                          ویدیو ۱۰ ثانیه‌ای با موسیقی پس‌زمینه
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-300">
                        <div className="flex items-center gap-1">
                          <Play className="h-3 w-3" />
                          <span>Kling 2.6</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Timer className="h-3 w-3" />
                          <span>۱۰ ثانیه</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </section>

        {/* Features Grid - Bento Style */}
        <section className="py-16 sm:py-24 lg:py-28 bg-slate-950 relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center mb-12 sm:mb-16">
              <h2 className="text-sm sm:text-base font-semibold leading-7 text-yellow-400 mb-3">
                امکانات پیشرفته
              </h2>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
                همه چیز برای خلق ویدیوهای متحرک
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
                    <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 flex flex-col sm:flex-row gap-6">
                      <div className="shrink-0">
                        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-yellow-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-yellow-400" />
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

        {/* Process Section - Steps */}
        <section className="py-16 sm:py-24 lg:py-28 bg-slate-950 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] bg-yellow-600/5 rounded-full blur-3xl" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
            <div className="mx-auto max-w-2xl lg:text-center mb-12 sm:mb-16">
              <h2 className="text-sm sm:text-base font-semibold leading-7 text-yellow-400 mb-3">
                مسیر ساده
              </h2>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
                سه گام تا ویدیو متحرک
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  {index !== steps.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-0 w-full h-[2px] bg-gradient-to-r from-yellow-500/50 to-transparent -z-10" />
                  )}
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-900 border border-yellow-500/30 flex items-center justify-center mb-4 sm:mb-6 shadow-[0_0_30px_-10px_rgba(234,179,8,0.3)]">
                      <step.icon className="h-8 w-8 sm:h-10 sm:w-10 text-yellow-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
                      {step.title}
                    </h3>
                    <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases - Scrolling Cards */}
        <section className="py-16 sm:py-24 lg:py-28 bg-slate-900/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-10 sm:mb-12 text-center">
              کاربردهای نامحدود
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {useCases.map((useCase, idx) => (
                <div
                  key={idx}
                  className="group relative p-5 sm:p-6 bg-white/5 rounded-xl sm:rounded-2xl border border-white/10 hover:border-yellow-500/50 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 rounded-xl sm:rounded-2xl transition-opacity" />
                  <div className="relative z-10">
                    <h3 className="text-base sm:text-lg font-semibold text-white gap-2 mb-2 flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 " />
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
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] bg-yellow-600/5 rounded-full blur-3xl" />

          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 sm:p-12 backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Lightbulb className="h-6 w-6 text-yellow-400" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  نکات طلایی برای بهترین نتیجه
                </h2>
              </div>

              <ul className="space-y-4">
                {tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-500/20 text-sm font-bold text-yellow-400">
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

        {/* CTA Section - Tech Style */}
        <section className="relative py-16 sm:py-24 lg:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-yellow-950/20" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative text-center">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 sm:mb-6">
              آماده متحرک کردن تصاویرتان هستید؟
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 mb-8 sm:mb-10 max-w-2xl mx-auto">
              به جمع هزاران خالق دیجیتال بپیوندید و تصاویر خود را با قدرت مدل
              Kling 2.6 به ویدیوهای متحرک تبدیل کنید.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/dashboard/image-to-video">
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

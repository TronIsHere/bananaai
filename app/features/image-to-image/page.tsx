"use client";

import Link from "next/link";
import {
  Image as ImageIcon,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { MobileMenu } from "@/components/landing/mobile-menu";
import { useState } from "react";

export default function ImageToImageFeaturePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Target,
      title: "حفظ ترکیب‌بندی",
      description:
        "ساختار اصلی تصویر شما حفظ می‌شود و فقط سبک و جزئیات به‌صورت هوشمند تغییر می‌کند.",
    },
    {
      icon: Wand2,
      title: "تغییر سبک پیشرفته",
      description:
        "تبدیل تصویر به سبک‌های مختلف هنری بدون از دست دادن کیفیت یا جزئیات مهم.",
    },
    {
      icon: Sparkles,
      title: "بهبود جزئیات",
      description:
        "افزودن جزئیات، تنظیم نور، رنگ و حذف نویز برای رسیدن به خروجی حرفه‌ای.",
    },
    {
      icon: Zap,
      title: "پردازش سریع",
      description:
        "ارائه نتایج در چند ثانیه با استفاده از GPUهای قدرتمند و مدل‌های بهینه BananaAI.",
    },
  ];

  const useCases = [
    {
      title: "تبدیل سبک هنری",
      description:
        "تبدیل عکس‌های واقعی به نقاشی، کارتون یا سبک‌های تخیلی و فانتزی.",
    },
    {
      title: "بهبود تصاویر",
      description:
        "افزودن نور مناسب، حذف نویز و بهبود رنگ برای تصاویر خام یا قدیمی.",
    },
    {
      title: "ایجاد نسخه‌های مختلف",
      description:
        "ساخت نسخه‌های متفاوت از یک تصویر برای کمپین‌ها و شبکه‌های اجتماعی.",
    },
    {
      title: "بازسازی تصاویر قدیمی",
      description:
        "بازسازی و ترمیم عکس‌های قدیمی، آسیب‌دیده یا با کیفیت پایین.",
    },
    {
      title: "تجسم معماری",
      description:
        "تبدیل طرح‌های اولیه به تصاویر واقع‌گرایانه برای ارائه به مشتریان.",
    },
    {
      title: "الهام طراحی",
      description:
        "آزمایش ایده‌های مختلف روی یک تصویر برای پیدا کردن بهترین نتیجه.",
    },
  ];

  const styles = [
    { icon: Palette, name: "نقاشی رنگ روغن" },
    { icon: Sparkles, name: "کارتونی" },
    { icon: Wand2, name: "طراحی دستی" },
    { icon: ImageIcon, name: "واقع‌گرایانه" },
    { icon: Zap, name: "سایبرپانک" },
    { icon: Palette, name: "آبرنگ" },
  ];

  const tips = [
    "تصاویر واضح و با کیفیت آپلود کنید تا نتیجه بهتری بگیرید.",
    "در پرامپت مشخص کنید چه بخش‌هایی باید تغییر کند و چه چیزهایی ثابت بماند.",
    "از سبک‌های پیشنهادی استفاده کنید تا سریع‌تر به نتیجه برسید.",
    "می‌توانید تصویر تولید شده را دوباره به عنوان ورودی استفاده کنید.",
    "حداکثر حجم فایل ۱۰ مگابایت است، فرمت‌های JPG/PNG/WEBP پشتیبانی می‌شوند.",
  ];

  const steps = [
    {
      icon: Upload,
      title: "آپلود تصویر",
      description:
        "تصویر اولیه را بارگذاری کنید یا با کشیدن و رها کردن اضافه کنید.",
      number: "۱",
    },
    {
      icon: Wand2,
      title: "تعیین تغییرات",
      description: "پرامپت خود را بنویسید یا از سبک‌های آماده استفاده کنید.",
      number: "۲",
    },
    {
      icon: Recycle,
      title: "دریافت نسخه جدید",
      description:
        "در چند ثانیه تصویر جدید را دریافت کنید و در صورت نیاز تکرار کنید.",
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

      <main>
        {/* Hero Section - Modern & Tech-focused */}
        <section className="relative overflow-hidden py-16 sm:py-24 lg:py-28">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 via-transparent to-purple-500/10 blur-3xl" />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
            <div className="mx-auto max-w-3xl text-center mb-12 sm:mb-16">
              <div className="mb-6 inline-flex gap-2 items-center rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-sm text-fuchsia-300 backdrop-blur-sm">
                <span className="flex h-2 w-2 rounded-full bg-fuchsia-400  animate-pulse"></span>
                نسل جدید پردازش تصویر
              </div>
              <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl mb-6">
                جادوی تبدیل <br />
                <span className="text-fuchsia-400">تصویر به تصویر</span>
              </h1>
              <p className="text-base sm:text-lg leading-8 text-slate-300 max-w-2xl mx-auto mb-8">
                با حفظ ساختار اصلی، تصاویر خود را دگرگون کنید. هوش مصنوعی
                پیشرفته BananaAI با درک عمیق از محتوا، سبک و جزئیات را بازآفرینی
                می‌کند.
              </p>
              <div className="flex items-center justify-center gap-x-6">
                <Link href="/dashboard/image-to-image">
                  <Button className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-500 shadow-[0_0_40px_-10px_rgba(192,38,211,0.5)] hover:shadow-[0_0_60px_-10px_rgba(192,38,211,0.6)] transition-all duration-300 group">
                    شروع رایگان
                    <MoveRight className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Before/After Section - Simple Side by Side */}
            <div className="mt-12 sm:mt-16">
              <div className="relative rounded-2xl bg-slate-900/50 border border-white/10 p-3 sm:p-4">
                <div className="absolute -inset-2 bg-gradient-to-r from-fuchsia-500 to-purple-600 opacity-20 blur-2xl -z-10 rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {/* Before Image */}
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-800 border border-white/10">
                    <div className="absolute top-3 right-3 z-10 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/20">
                      قبل
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-slate-600 opacity-50" />
                    </div>
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center opacity-70 grayscale" />
                  </div>

                  {/* After Image */}
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-800 border border-fuchsia-500/30">
                    <div className="absolute top-3 left-3 z-10 bg-fuchsia-500/30 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-semibold border border-fuchsia-500/50 text-fuchsia-200">
                      بعد
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-900/50 to-purple-900/50 flex items-center justify-center">
                      <Sparkles className="h-12 w-12 text-fuchsia-500 opacity-50" />
                    </div>
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-4">
                      <p className="text-white text-sm font-medium">
                        تبدیل شده به سبک سایبرپانک
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid - Bento Style */}
        <section className="py-16 sm:py-24 lg:py-28 bg-slate-950 relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center mb-12 sm:mb-16">
              <h2 className="text-sm sm:text-base font-semibold leading-7 text-fuchsia-400 mb-3">
                امکانات پیشرفته
              </h2>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
                همه چیز برای خلاقیت بی‌پایان
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 auto-rows-[minmax(180px,auto)]">
              {/* Feature 1 - Large */}
              <div className="md:col-span-2 md:row-span-2 relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 hover:bg-white/[0.07] transition-colors group">
                <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-fuchsia-500/10 to-transparent" />
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-fuchsia-500/20 flex items-center justify-center mb-4">
                    <Target className="h-5 w-5 sm:h-6 sm:w-6 text-fuchsia-400" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                      حفظ دقیق ترکیب‌بندی
                    </h3>
                    <p className="text-sm sm:text-base text-slate-400 max-w-md">
                      با استفاده از تکنولوژی ControlNet، ساختار اصلی تصویر شما
                      کاملاً حفظ می‌شود در حالی که سبک و جزئیات تغییر می‌کنند.
                    </p>
                  </div>
                </div>
                {/* Abstract Visualization */}
                <div className="absolute left-0 bottom-0 w-1/2 h-full opacity-30 group-hover:opacity-50 transition-opacity">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-fuchsia-500/40 via-transparent to-transparent" />
                </div>
              </div>

              {/* Feature 2 */}
              <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6 hover:bg-white/[0.07] transition-colors relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Wand2 className="h-7 w-7 sm:h-8 sm:w-8 text-purple-400 mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-bold text-white mb-2">
                  تغییر سبک هنری
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  تبدیل عکس به نقاشی، کارتون و طرح دستی
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6 hover:bg-white/[0.07] transition-colors relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Sparkles className="h-7 w-7 sm:h-8 sm:w-8 text-blue-400 mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-bold text-white mb-2">
                  بهبود کیفیت
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  افزایش وضوح و جزئیات تصاویر قدیمی
                </p>
              </div>

              {/* Feature 4 - Wide */}
              <div className="md:col-span-2 rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 hover:bg-white/[0.07] transition-colors relative overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between group">
                <div className="relative z-10">
                  <Zap className="h-7 w-7 sm:h-8 sm:w-8 text-yellow-400 mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                    پردازش در لحظه
                  </h3>
                  <p className="text-sm sm:text-base text-slate-400">
                    تولید تصاویر با سرعت بالا توسط GPUهای قدرتمند
                  </p>
                </div>
                <div className="absolute left-0 top-0 h-full w-1/2 bg-gradient-to-r from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        </section>

        {/* Process Section - Steps */}
        <section className="py-16 sm:py-24 lg:py-28 bg-slate-950 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] bg-fuchsia-600/5 rounded-full blur-3xl" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
            <div className="mx-auto max-w-2xl lg:text-center mb-12 sm:mb-16">
              <h2 className="text-sm sm:text-base font-semibold leading-7 text-fuchsia-400 mb-3">
                مسیر ساده
              </h2>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
                سه گام تا شاهکار هنری
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  {index !== steps.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-0 w-full h-[2px] bg-gradient-to-r from-fuchsia-500/50 to-transparent -z-10" />
                  )}
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-900 border border-fuchsia-500/30 flex items-center justify-center mb-4 sm:mb-6 shadow-[0_0_30px_-10px_rgba(192,38,211,0.3)]">
                      <step.icon className="h-8 w-8 sm:h-10 sm:w-10 text-fuchsia-400" />
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
                  className="group relative p-5 sm:p-6 bg-white/5 rounded-xl sm:rounded-2xl border border-white/10 hover:border-fuchsia-500/50 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-transparent opacity-0 group-hover:opacity-100 rounded-xl sm:rounded-2xl transition-opacity" />
                  <div className="relative z-10">
                    <h3 className="text-base sm:text-lg font-semibold text-white gap-2 mb-2 flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 " />
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

        {/* CTA Section - Tech Style */}
        <section className="relative py-16 sm:py-24 lg:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-fuchsia-950/20" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative text-center">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 sm:mb-6">
              آماده تغییر هستید؟
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 mb-8 sm:mb-10 max-w-2xl mx-auto">
              به جمع هزاران خالق دیجیتال بپیوندید و ایده‌های خود را با قدرت هوش
              مصنوعی به واقعیت تبدیل کنید.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/dashboard/image-to-image">
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

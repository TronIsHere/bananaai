"use client";

import { Button } from "@/components/ui/button";
import { HiArrowLeft } from "react-icons/hi";

export function ContactSection() {
  return (
    <section
      id="contact"
      className="mx-auto mt-16 max-w-4xl sm:mt-20 md:mt-24"
    >
      <div className="flex flex-col gap-4 text-center sm:gap-6">
        <p className="mx-auto inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold text-white/70 sm:px-4 sm:text-xs">
          تماس با ما
        </p>
        <h2 className="text-2xl font-black text-white sm:text-3xl md:text-4xl lg:text-5xl">
          با ما در ارتباط باشید
        </h2>
        <p className="mx-auto max-w-2xl text-base text-slate-300 sm:text-lg">
          سوالی دارید یا می‌خواهید با ما همکاری کنید؟ ما اینجا هستیم تا به
          شما کمک کنیم.
        </p>
      </div>
      <div className="mt-12 rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-purple-500/10 p-6 sm:mt-16 sm:p-8 md:p-10">
        <form className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold text-white/80"
              >
                نام و نام خانوادگی
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="نام شما"
                className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 sm:text-base"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-white/80"
              >
                ایمیل
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="email@example.com"
                className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 sm:text-base"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="subject"
              className="mb-2 block text-sm font-semibold text-white/80"
            >
              موضوع
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              placeholder="موضوع پیام شما"
              className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 sm:text-base"
            />
          </div>
          <div>
            <label
              htmlFor="message"
              className="mb-2 block text-sm font-semibold text-white/80"
            >
              پیام
            </label>
            <textarea
              id="message"
              name="message"
              rows={6}
              placeholder="پیام خود را اینجا بنویسید..."
              className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 sm:text-base"
            />
          </div>
          <div className="flex justify-center">
            <Button
              type="submit"
              className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-xl border border-yellow-400/20 bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 px-8 py-4 text-base font-bold text-white shadow-[0_0_20px_rgba(251,191,36,0.15)] backdrop-blur-md transition-all duration-300 hover:border-yellow-400/40 hover:shadow-[0_0_30px_rgba(251,191,36,0.3)] hover:scale-[1.02] sm:px-10 sm:py-5 sm:text-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/10 to-yellow-400/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:animate-shimmer" />
              <span className="relative z-10 flex items-center gap-2">
                ارسال پیام
                <HiArrowLeft className="text-lg transition-transform duration-300 group-hover:-translate-x-1 sm:text-xl" />
              </span>
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}



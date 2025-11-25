import Link from "next/link";
import { siteConfig } from "@/lib/seo-config";

export function Footer() {
  const currentYear = new Date().toLocaleDateString("fa-IR", {
    year: "numeric",
  });

  return (
    <footer
      id="about"
      className="relative overflow-hidden border-t border-white/5 bg-slate-950/80 backdrop-blur-xl"
    >
      {/* Ambient Glow */}
      <div className="absolute -left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-purple-500/5 blur-[100px]" />
      <div className="absolute -right-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-yellow-500/5 blur-[100px]" />

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-4 lg:gap-8">
          {/* Brand Section */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 w-fit">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 text-xl shadow-[0_0_35px_rgba(251,191,36,0.45)]">
                  🍌
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400">
                  آزمایشگاه هوش مصنوعی
                </p>
                <p className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-xl font-black text-transparent">
                  {siteConfig.name}
                </p>
              </div>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-slate-400">
              {siteConfig.description}
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-2 lg:pl-12">
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-white">دسترسی سریع</h3>
              <nav className="flex flex-col gap-3 text-sm text-slate-400">
                <Link
                  href="/"
                  className="transition-colors hover:text-yellow-400 w-fit"
                >
                  صفحه اصلی
                </Link>
                <Link
                  href="/#pricing"
                  className="transition-colors hover:text-yellow-400 w-fit"
                >
                  تعرفه‌ها
                </Link>
                <Link
                  href="/dashboard"
                  className="transition-colors hover:text-yellow-400 w-fit"
                >
                  پنل کاربری
                </Link>
              </nav>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-white">
                قوانین و مقررات
              </h3>
              <nav className="flex flex-col gap-3 text-sm text-slate-400">
                <Link
                  href="#"
                  className="transition-colors hover:text-yellow-400 w-fit"
                >
                  قوانین استفاده
                </Link>
                <Link
                  href="#"
                  className="transition-colors hover:text-yellow-400 w-fit"
                >
                  حریم خصوصی
                </Link>
                <Link
                  href="#"
                  className="transition-colors hover:text-yellow-400 w-fit"
                >
                  وضعیت سرورها
                </Link>
              </nav>
            </div>
          </div>

          {/* eNamad Trust Seal */}
          <div className="flex justify-center ">
            <div className="">
              <a
                referrerPolicy="origin"
                target="_blank"
                href="https://trustseal.enamad.ir/?id=676991&Code=k5usXhcVbTOWZ92lwB14ToJWOXTiRdVx"
                className="transition-opacity hover:opacity-80"
              >
                <img
                  referrerPolicy="origin"
                  src="https://trustseal.enamad.ir/logo.aspx?id=676991&Code=k5usXhcVbTOWZ92lwB14ToJWOXTiRdVx"
                  alt="eNamad Trust Seal"
                  className="h-32 w-auto cursor-pointer"
                  loading="lazy"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="my-8 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 text-xs text-slate-500 sm:flex-row">
          <p>© {currentYear} BananaAI — تمامی حقوق محفوظ است.</p>

          <div className="flex items-center gap-4">
            <Link
              href="https://whitediv.ir"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 transition-colors hover:text-slate-300"
            >
              <span>Design & Develop by whitediv</span>
              <div className="relative h-6 w-auto overflow-hidden">
                <img
                  src="https://whitediv.ir/img/logo-transparent.png"
                  alt="WhiteDiv Logo"
                  className="h-6 w-auto opacity-60 transition-all duration-300 group-hover:opacity-100 group-hover:brightness-110"
                  loading="lazy"
                />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

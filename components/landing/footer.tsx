import Link from "next/link";

export function Footer() {
  return (
    <footer
      id="about"
      className="border-t border-white/5 bg-slate-950/70 py-8 sm:py-12"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:text-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <p>© ۱۴۰۳ BananaAI — ساخته شده در ایران</p>
          <Link
            href="https://whitediv.ir"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-slate-500">توسط</span>
            <img
              src="https://whitediv.ir/img/logo-transparent.png"
              alt="لوگوی WhiteDiv - توسعه‌دهنده وب"
              className="h-6 w-auto opacity-70 hover:opacity-100 transition-opacity"
              width="80"
              height="24"
              loading="lazy"
            />
          </Link>
        </div>
        <div className="flex flex-wrap gap-4 sm:gap-6">
          <Link href="#" className="hover:text-white transition-colors">
            قوانین
          </Link>
          <Link href="#" className="hover:text-white transition-colors">
            حریم خصوصی
          </Link>
          <Link href="#" className="hover:text-white transition-colors">
            وضعیت سرورها
          </Link>
        </div>
      </div>
    </footer>
  );
}

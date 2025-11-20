"use client";

export function AboutSection() {
  return (
    <section
      id="about"
      className="mx-auto mt-16 max-w-6xl sm:mt-20 md:mt-24"
    >
      <div className="flex flex-col gap-4 text-center sm:gap-6">
        <p className="mx-auto inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold text-white/70 sm:px-4 sm:text-xs">
          درباره ما
        </p>
        <h2 className="text-2xl font-black text-white sm:text-3xl md:text-4xl lg:text-5xl">
          داستان بنانا
        </h2>
        <p className="mx-auto max-w-2xl text-base text-slate-300 sm:text-lg">
          ما تیمی از محققان و مهندسان هستیم که به قدرت هوش مصنوعی در خلق هنر
          اعتقاد داریم.
        </p>
      </div>
      <div className="mt-12 grid gap-6 sm:mt-16 md:grid-cols-2 lg:grid-cols-3">
        <article className="group relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900/80 to-slate-950/90 p-6 shadow-[0_35px_120px_rgba(15,23,42,0.45)] transition hover:scale-[1.02] sm:p-8">
          <div className="absolute inset-0 opacity-30 blur-3xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-500" />
          <div className="relative space-y-4">
            <h3 className="text-xl font-black text-white sm:text-2xl">
              ماموریت ما
            </h3>
            <p className="leading-relaxed text-slate-300 sm:text-base">
              ایجاد دسترسی به ابزارهای پیشرفته هوش مصنوعی برای همه، با تمرکز
              ویژه بر نیازهای جامعه فارسی‌زبان و فرهنگ منطقه.
            </p>
          </div>
        </article>
        <article className="group relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900/80 to-slate-950/90 p-6 shadow-[0_35px_120px_rgba(15,23,42,0.45)] transition hover:scale-[1.02] sm:p-8">
          <div className="absolute inset-0 opacity-30 blur-3xl bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-500" />
          <div className="relative space-y-4">
            <h3 className="text-xl font-black text-white sm:text-2xl">
              چشم‌انداز ما
            </h3>
            <p className="leading-relaxed text-slate-300 sm:text-base">
              تبدیل شدن به پیشروترین پلتفرم هوش مصنوعی در منطقه، با مدل‌های
              اختصاصی که برای زبان و فرهنگ فارسی بهینه شده‌اند.
            </p>
          </div>
        </article>
        <article className="group relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900/80 to-slate-950/90 p-6 shadow-[0_35px_120px_rgba(15,23,42,0.45)] transition hover:scale-[1.02] sm:p-8 md:col-span-2 lg:col-span-1">
          <div className="absolute inset-0 opacity-30 blur-3xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500" />
          <div className="relative space-y-4">
            <h3 className="text-xl font-black text-white sm:text-2xl">
              ارزش‌های ما
            </h3>
            <p className="leading-relaxed text-slate-300 sm:text-base">
              نوآوری، شفافیت و تعهد به کیفیت. ما به کاربران خود اهمیت می‌دهیم
              و همیشه در حال بهبود تجربه استفاده از پلتفرم هستیم.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}


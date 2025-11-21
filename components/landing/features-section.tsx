import Link from "next/link";
import { features } from "@/lib/data";

export function FeaturesSection() {
  const getFeatureLink = (title: string) => {
    if (title === "تبدیل متن به تصویر") {
      return "/features/text-to-image";
    }
    if (title === "تبدیل تصویر به تصویر") {
      return "/features/image-to-image";
    }
    return "#";
  };

  return (
    <section
      id="features"
      className="mx-auto mt-16 max-w-6xl sm:mt-20 md:mt-24"
    >
      <div className="flex flex-col gap-4 text-center sm:gap-6">
        <p className="mx-auto inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold text-white/70 sm:px-4 sm:text-xs">
          پشته ماژولار هوش مصنوعی
        </p>
        <h2 className="text-2xl font-black text-white sm:text-3xl md:text-4xl lg:text-5xl">
          ماژول‌های مغز BananaAI
        </h2>
        <p className="mx-auto max-w-2xl text-base text-slate-300 sm:text-lg">
          هر ماژول برای جریان خاصی طراحی شده تا کنترل کامل روی نور، سوژه، عمق
          میدان و ترکیب‌بندی داشته باشید.
        </p>
      </div>
      <div className="mt-12 grid gap-6 sm:mt-16 md:grid-cols-2">
        {features.map((feature) => {
          const Icon = feature.icon;
          const featureLink = getFeatureLink(feature.title);
          return (
            <Link key={feature.title} href={featureLink} className="block">
              <article className="group relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900/80 to-slate-950/90 p-5 shadow-[0_35px_120px_rgba(15,23,42,0.45)] transition hover:scale-[1.02] cursor-pointer sm:p-6">
                <div
                  className={`absolute inset-0 opacity-30 blur-3xl bg-gradient-to-br ${feature.accent} pointer-events-none`}
                />
                <div className="relative space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-2xl sm:h-14 sm:w-14 sm:text-3xl">
                      <Icon />
                    </div>
                    <div>
                      <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/70 sm:px-3 sm:text-xs">
                        {feature.subtitle}
                      </div>
                      <h3 className="mt-2 text-xl font-black text-white sm:text-2xl">
                        {feature.title}
                      </h3>
                    </div>
                  </div>
                  <p className="leading-relaxed text-slate-300 sm:text-base">
                    {feature.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm font-semibold text-white/70 transition group-hover:text-white">
                    <span>اطلاعات بیشتر</span>
                    <span className="text-lg transition group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

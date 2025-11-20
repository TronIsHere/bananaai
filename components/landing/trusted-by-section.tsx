import { logos } from "@/lib/data";

export function TrustedBySection() {
  return (
    <section className="mx-auto mt-16 max-w-5xl text-center sm:mt-20 md:mt-24">
      <p className="text-[10px] uppercase tracking-[0.3em] text-white/60 sm:text-xs">
        مورد اعتماد
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 sm:gap-6 sm:text-sm">
        {logos.map((logo) => (
          <span
            key={logo}
            className="rounded-full border border-white/10 px-4 py-2"
          >
            {logo}
          </span>
        ))}
      </div>
    </section>
  );
}


import { workflow } from "@/lib/data";

export function WorkflowSection() {
  return (
    <section
      id="workflow"
      className="mx-auto mt-20 max-w-5xl sm:mt-24 md:mt-28"
    >
      <div className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-lg sm:p-8 md:p-10">
        <div className="flex flex-col gap-3 text-center sm:gap-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/70 sm:text-xs">
            نحوه پردازش تصویر
          </p>
          <h2 className="text-2xl font-black sm:text-3xl md:text-4xl">
            جریان کار از پرامپت تا پیکسل
          </h2>
        </div>
        <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
          {workflow.map((step) => (
            <div
              key={step.step}
              className="relative rounded-2xl border border-white/10 bg-slate-950/60 p-5 sm:p-6"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-pink-500 text-lg font-black text-slate-950">
                {step.step}
              </div>
              <h3 className="text-base font-bold text-white sm:text-lg">
                {step.title}
              </h3>
              <p className="mt-2 text-xs text-slate-300 sm:text-sm">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

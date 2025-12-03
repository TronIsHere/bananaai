"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HiArrowLeft } from "react-icons/hi";

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsLoading(true);

    try {
      const response = await fetch("/api/contact/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "خطا در ارسال پیام");
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
      setIsLoading(false);

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setError("خطا در ارتباط با سرور");
      setIsLoading(false);
    }
  };

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
        {success && (
          <div className="mb-6 rounded-2xl bg-green-500/20 border border-green-500/30 px-4 py-3 text-sm text-green-400">
            پیام شما با موفقیت ارسال شد. به زودی با شما تماس خواهیم گرفت.
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-2xl bg-red-500/20 border border-red-500/30 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
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
                value={formData.name}
                onChange={handleChange}
                placeholder="نام شما"
                required
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
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                required
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
              value={formData.subject}
              onChange={handleChange}
              placeholder="موضوع پیام شما"
              required
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
              value={formData.message}
              onChange={handleChange}
              rows={6}
              placeholder="پیام خود را اینجا بنویسید..."
              required
              className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 sm:text-base"
            />
          </div>
          <div className="flex justify-center">
            <Button
              type="submit"
              disabled={isLoading}
              className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-yellow-400 to-orange-400 px-8 py-4 text-base font-bold text-white shadow-lg transition-all duration-300 hover:from-yellow-500 hover:to-orange-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-yellow-400/50 disabled:opacity-50 disabled:cursor-not-allowed sm:px-10 sm:py-5 sm:text-lg"
            >
              <span className="relative z-10 flex items-center gap-2">
                {isLoading ? "در حال ارسال..." : "ارسال پیام"}
                <HiArrowLeft className="text-lg transition-transform duration-300 group-hover:-translate-x-1 sm:text-xl" />
              </span>
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}



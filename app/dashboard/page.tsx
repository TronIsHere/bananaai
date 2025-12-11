"use client";

import {
  Sparkles,
  Image,
  Camera,
  Palette,
  Wand2,
  Brush,
  Sparkle,
  ImageIcon,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface UseCaseCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient?: string;
}

function UseCaseCard({
  href,
  icon,
  title,
  description,
  gradient = "from-yellow-400/20 via-orange-400/20 to-pink-500/20",
}: UseCaseCardProps) {
  return (
    <Link href={href}>
      <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-6 transition-all active:scale-[0.98] hover:border-yellow-400/30 hover:shadow-[0_0_30px_rgba(251,191,36,0.2)] md:rounded-2xl md:p-8">
        <div
          className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} md:mb-4 md:h-16 md:w-16`}
        >
          {icon}
        </div>
        <h3 className="mb-2 text-lg font-bold text-white md:text-xl">
          {title}
        </h3>
        <p className="text-xs text-slate-400 md:text-sm">{description}</p>
        <div className="mt-4">
          <Button
            variant="outline"
            className="w-full border-white/10 text-white/80 hover:border-yellow-400/30 hover:text-yellow-400 md:w-auto"
          >
            شروع کنید
          </Button>
        </div>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  return (
    <div className="max-w-7xl">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-black text-white mb-2 md:text-4xl">
          داشبورد
        </h1>
        <p className="text-sm text-slate-400 md:text-base">
          به پنل کاربری بنانا خوش آمدید
        </p>
      </div>

      {/* Main Tools Section */}
      <div className="mb-8 md:mb-12">
        <h2 className="text-xl font-bold text-white mb-4 md:text-2xl">
          ابزارهای اصلی
        </h2>
        <div className="grid gap-4 md:gap-6 md:grid-cols-2">
          <UseCaseCard
            href="/dashboard/text-to-image"
            icon={
              <Sparkles className="h-6 w-6 text-yellow-400 md:h-8 md:w-8" />
            }
            title="متن به تصویر"
            description="تولید تصویر از متن با استفاده از هوش مصنوعی"
          />
          <UseCaseCard
            href="/dashboard/image-to-image"
            icon={<Image className="h-6 w-6 text-yellow-400 md:h-8 md:w-8" />}
            title="تصویر به تصویر"
            description="تبدیل و پردازش تصویر با هوش مصنوعی"
          />
        </div>
      </div>

      {/* Photo Creation Use Cases */}
      <div className="mb-8 md:mb-12">
        <h2 className="text-xl font-bold text-white mb-4 md:text-2xl">
          ساخت عکس
        </h2>
        <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
          <UseCaseCard
            href="/dashboard/text-to-image?prompt=عکس+مجلسی+و+رسمی+با+کیفیت+عالی+،+نور+حرفه‌ای+،+پس‌زمینه+ساده+و+زیبا"
            icon={<Camera className="h-6 w-6 text-blue-400 md:h-8 md:w-8" />}
            title="ساخت عکس مجلسی"
            description="ایجاد عکس‌های مجلسی و رسمی با کیفیت بالا"
            gradient="from-blue-400/20 via-purple-400/20 to-pink-500/20"
          />
          <UseCaseCard
            href="/dashboard/text-to-image?prompt=عکس+استودیویی+حرفه‌ای+،+نور+استودیو+،+پس‌زمینه+یکدست+،+کیفیت+بالا"
            icon={
              <ImageIcon className="h-6 w-6 text-purple-400 md:h-8 md:w-8" />
            }
            title="ساخت عکس استودیویی"
            description="تولید عکس‌های استودیویی حرفه‌ای"
            gradient="from-purple-400/20 via-pink-400/20 to-red-500/20"
          />
          <UseCaseCard
            href="/dashboard/image-to-image?prompt=تبدیل+به+پرتره+حرفه‌ای+،+بهبود+کیفیت+،+نور+طبیعی+،+فوکوس+روی+چهره"
            icon={<Brush className="h-6 w-6 text-pink-400 md:h-8 md:w-8" />}
            title="تبدیل به پرتره"
            description="تبدیل عکس‌های معمولی به پرتره حرفه‌ای"
            gradient="from-pink-400/20 via-rose-400/20 to-orange-500/20"
          />
        </div>
      </div>

      {/* Advanced Features */}
      <div className="mb-8 md:mb-12">
        <h2 className="text-xl font-bold text-white mb-4 md:text-2xl">
          ویژگی‌های پیشرفته
        </h2>
        <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
          <UseCaseCard
            href="/dashboard/image-to-image?prompt=تغییر+پس‌زمینه+،+حذف+پس‌زمینه+قدیمی+و+جایگزینی+با+پس‌زمینه+جدید+و+زیبا"
            icon={<Layers className="h-6 w-6 text-indigo-400 md:h-8 md:w-8" />}
            title="تغییر پس‌زمینه"
            description="تغییر یا حذف پس‌زمینه تصاویر"
            gradient="from-indigo-400/20 via-violet-400/20 to-purple-500/20"
          />
          <UseCaseCard
            href="/dashboard/text-to-image?prompt=تصویر+محصول+حرفه‌ای+،+نور+استودیو+،+پس‌زمینه+ساده+،+کیفیت+بالا+،+نمایش+بهترین+زاویه"
            icon={<Image className="h-6 w-6 text-emerald-400 md:h-8 md:w-8" />}
            title="تصاویر محصول"
            description="ایجاد تصاویر حرفه‌ای برای محصولات"
            gradient="from-emerald-400/20 via-green-400/20 to-lime-500/20"
          />
          <UseCaseCard
            href="/dashboard/image-to-image?prompt=بازسازی+و+ترمیم+تصویر+،+بهبود+کیفیت+،+حذف+نویز+و+خطوط+،+افزایش+وضوح+و+جزئیات"
            icon={<Sparkles className="h-6 w-6 text-rose-400 md:h-8 md:w-8" />}
            title="بازسازی تصویر"
            description="بازسازی و ترمیم تصاویر قدیمی یا آسیب‌دیده"
            gradient="from-rose-400/20 via-pink-400/20 to-fuchsia-500/20"
          />
        </div>
      </div>

      {/* Creative Tools Section */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 md:text-2xl">
          ابزارهای خلاقانه
        </h2>
        <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
          <UseCaseCard
            href="/dashboard/text-to-image?prompt=آثار+هنری+و+طراحی+خلاقانه+،+سبک+هنری+منحصر+به+فرد+،+رنگ‌های+زنده+و+زیبا"
            icon={<Palette className="h-6 w-6 text-green-400 md:h-8 md:w-8" />}
            title="هنر و طراحی"
            description="ایجاد آثار هنری و طراحی‌های خلاقانه"
            gradient="from-green-400/20 via-emerald-400/20 to-teal-500/20"
          />
          <UseCaseCard
            href="/dashboard/image-to-image?prompt=بهبود+کیفیت+تصویر+،+افزایش+وضوح+،+حذف+نویز+،+بهبود+رنگ+و+روشنایی"
            icon={<Wand2 className="h-6 w-6 text-cyan-400 md:h-8 md:w-8" />}
            title="بهبود تصویر"
            description="بهبود کیفیت و وضوح تصاویر موجود"
            gradient="from-cyan-400/20 via-blue-400/20 to-indigo-500/20"
          />
          <UseCaseCard
            href="/dashboard/image-to-image?prompt=تغییر+استایل+تصویر+،+اعمال+فیلتر+هنری+،+تغییر+رنگ+و+بافت+،+سبک+خلاقانه"
            icon={<Sparkle className="h-6 w-6 text-yellow-400 md:h-8 md:w-8" />}
            title="تغییر استایل"
            description="تغییر استایل و ظاهر تصاویر"
            gradient="from-yellow-400/20 via-amber-400/20 to-orange-500/20"
          />
        </div>
      </div>
    </div>
  );
}

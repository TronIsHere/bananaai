"use client";

import { StyleCard } from "@/components/cards/style-card";
import { Button } from "@/components/ui/button";
import { Image, Sparkles, Video } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { READY_PROMPTS } from "@/lib/data";

interface UseCaseCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient?: string;
  badges?: string[];
}

function UseCaseCard({
  href,
  icon,
  title,
  description,
  gradient = "from-yellow-400/20 via-orange-400/20 to-pink-500/20",
  badges,
}: UseCaseCardProps) {
  return (
    <Link href={href}>
      <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-6 transition-all active:scale-[0.98] hover:border-yellow-400/30 hover:shadow-[0_0_30px_rgba(251,191,36,0.2)] md:rounded-2xl md:p-8">
        {/* Badges - Top Left */}
        {badges && badges.length > 0 && (
          <div className="absolute top-3 left-3 flex items-center gap-2 flex-wrap z-10">
            {badges.map((badge, index) => {
              // Determine badge color based on content
              let badgeClass = "";
              if (badge.includes("Pro")) {
                badgeClass =
                  "bg-yellow-500/15 border-yellow-500/30 text-yellow-400";
              } else if (badge.includes("Kling")) {
                badgeClass =
                  "bg-purple-500/15 border-purple-500/30 text-purple-400";
              } else {
                badgeClass = "bg-cyan-500/15 border-cyan-500/30 text-cyan-400";
              }

              return (
                <div
                  key={index}
                  className={`flex items-center justify-center rounded-md border px-2.5 py-1 text-[10px] font-medium ${badgeClass}`}
                >
                  {badge}
                </div>
              );
            })}
          </div>
        )}
        <div
          className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} md:mb-4 md:h-16 md:w-16`}
        >
          {icon}
        </div>
        <div className="mb-3">
          <h3 className="text-lg font-bold text-white md:text-xl">{title}</h3>
        </div>
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

interface Banner {
  id: string;
  imageUrl: string;
  link: string;
  height: "small" | "medium" | "large";
  customHeight?: number;
}

// Helper function to build prompt URLs
const buildPromptUrl = (route: string, prompt: string) => {
  return `${route}?prompt=${encodeURIComponent(prompt)}`;
};

export default function DashboardPage() {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [isLoadingBanner, setIsLoadingBanner] = useState(true);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await fetch("/api/banner");
        const data = await response.json();

        if (response.ok && data.banner) {
          setBanner(data.banner);
        }
      } catch (error) {
        console.error("Error fetching banner:", error);
      } finally {
        setIsLoadingBanner(false);
      }
    };

    fetchBanner();
  }, []);

  const getBannerHeight = () => {
    if (!banner) return "h-32";
    if (banner.customHeight) {
      return `${banner.customHeight}px`;
    }
    switch (banner.height) {
      case "small":
        return "h-32";
      case "medium":
        return "h-48 md:h-52";
      case "large":
        return "h-64 md:h-80";
      default:
        return "h-32";
    }
  };

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

      {/* Dynamic Image Banner */}
      {!isLoadingBanner && banner && (
        <Link href={banner.link} className="block mb-8 md:mb-12">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/50 transition-all hover:border-yellow-400/30 hover:shadow-[0_0_30px_rgba(251,191,36,0.2)] cursor-pointer">
            <div
              className="relative w-full overflow-hidden"
              style={{
                height:
                  typeof getBannerHeight() === "string" &&
                  getBannerHeight().includes("px")
                    ? getBannerHeight()
                    : getBannerHeight() === "h-32"
                    ? "120px"
                    : getBannerHeight() === "h-48 md:h-52"
                    ? "200px"
                    : getBannerHeight() === "h-64 md:h-80"
                    ? "320px"
                    : "120px",
              }}
            >
              <img
                src={banner.imageUrl}
                alt="Banner"
                className="w-full h-full object-contain"
                onError={(e) => {
                  console.error(
                    "Banner image failed to load:",
                    banner.imageUrl
                  );
                }}
              />
            </div>
          </div>
        </Link>
      )}

      {/* Main Tools Section */}
      <div className="mb-8 md:mb-12">
        <h2 className="text-xl font-bold text-white mb-4 md:text-2xl">
          ابزارهای اصلی
        </h2>
        <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
          <UseCaseCard
            href="/dashboard/text-to-image"
            icon={
              <Sparkles className="h-6 w-6 text-yellow-400 md:h-8 md:w-8" />
            }
            title="متن به تصویر"
            description="تولید تصویر از متن با استفاده از هوش مصنوعی"
            badges={["Nano Banana", "Nano Banana Pro"]}
          />
          <UseCaseCard
            href="/dashboard/image-to-image"
            icon={<Image className="h-6 w-6 text-yellow-400 md:h-8 md:w-8" />}
            title="تصویر به تصویر"
            description="تبدیل و پردازش تصویر با هوش مصنوعی"
            badges={["Nano Banana", "Nano Banana Pro"]}
          />
          <UseCaseCard
            href="/dashboard/image-to-video"
            icon={<Video className="h-6 w-6 text-yellow-400 md:h-8 md:w-8" />}
            title="تصویر به ویدیو"
            description="تبدیل تصویر به ویدیوهای متحرک با هوش مصنوعی"
            badges={["مدل Kling-2.6"]}
          />
        </div>
      </div>
      {/* Photo Creation Use Cases */}
      {/* <div className="mb-8 md:mb-12">
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
      </div> */}
      {/* TODO: make these style cards later */}
      {/* Ready Prompts */}
      <div className="mb-8 md:mb-12">
        <h2 className="text-xl font-bold text-white mb-4 md:text-2xl">
          پرامپت‌های آماده
        </h2>
        <div className="grid gap-4 md:gap-6 md:grid-cols-4 lg:grid-cols-4">
          <StyleCard
            href="/dashboard/text-to-image?prompt=تغییر+پس‌زمینه+تصویر+،+حذف+پس‌زمینه+قدیمی+و+جایگزینی+با+پس‌زمینه+جدید+و+زیبا+در+محیط+دشت+طبیعی+با+نمای+باشکوه+کوه+دماوند+در+پس‌زمینه+،+نور+طبیعی+واقع‌گرایانه+،+کیفیت+بالا+،+جزئیات+دقیق+،+فضای+سینمایی+و+چشم‌نواز"
            title="تغییر پس‌زمینه"
            beforeImage="/img/styles/background-change-before.jpg"
            afterImage="/img/styles/background-change-after.png"
            gradient="from-indigo-400/20 via-violet-400/20 to-purple-500/20"
          />
          <StyleCard
            href="/dashboard/text-to-image?prompt=A+professional+studio+product+shot+of+the+product+suspended+mid-air%2C+perfectly+centered%2C+with+elegant+flowing+luxury+silk+fabric+wrapping+and+floating+around+it%2E"
            title="تصاویر محصول"
            beforeImage="/img/styles/product-images-before.jpg"
            afterImage="/img/styles/product-images-after.png"
            gradient="from-emerald-400/20 via-green-400/20 to-lime-500/20"
          />
          <StyleCard
            href="/dashboard/image-to-image?prompt=بازسازی+و+ترمیم+تصویر+،+بهبود+کیفیت+،+حذف+نویز+و+خطوط+،+افزایش+وضوح+و+جزئیات"
            title="بازسازی تصویر"
            beforeImage="/img/styles/image-restoration-before.jpg"
            afterImage="/img/styles/image-restoration-after.png"
            gradient="from-rose-400/20 via-pink-400/20 to-fuchsia-500/20"
          />
          <StyleCard
            href="/dashboard/text-to-image?prompt=A+hyper-realistic+black-and-white+cinematic+street+portrait+featuring+the+reference+man+walking+through+a+crowded+urban+street%2E+The+camera+captures+him+at+medium+distance%2C+sharply+focused+on+his+face+while+the+surrounding+crowd+is+motion-blurred%2E+He+has+a+strong+jawline%2C+short+styled+hair%2C+and+an+intense%2C+serious+expression%2E+He+wears+a+dark+tailored+coat+over+a+fitted+shirt%2C+giving+him+a+modern%2C+masculine%2C+high-fashion+look%2E+The+background+is+a+busy+city+street+with+people+passing+by%2C+storefront+reflections%2C+and+soft+natural+daylight+bouncing+between+buildings%2E+Depth+of+field+is+shallow%2C+isolating+the+subject+dramatically+from+the+environment%2E+Lighting+is+soft%2C+diffused%2C+and+realistic%2C+emphasizing+facial+structure+and+texture%2E+The+mood+is+stylish%2C+moody%2C+and+cinematic%2C+reminiscent+of+luxury+fashion+editorials%2E+Shot+on+a+high-end+telephoto+lens%2C+85mm+to+135mm%2C+f%2F1%2E8+to+f%2F2%2E8%2C+capturing+crisp+detail+on+the+subject+with+creamy+blurred+surroundings%2E+Ultra-sharp%2C+high+contrast%2C+rich+monochrome+tones%2C+premium+magazine-style+aesthetic%2E"
            title="تغییر استایل"
            beforeImage="/img/styles/style-change.png"
            gradient="from-yellow-400/20 via-amber-400/20 to-orange-500/20"
          />
          {READY_PROMPTS.map((promptData, index) => (
            <StyleCard
              key={index}
              href={buildPromptUrl(promptData.route, promptData.prompt)}
              title={promptData.title}
              beforeImage={promptData.imageUrl}
              gradient={promptData.gradient}
            />
          ))}
        </div>
      </div>
      {/* Creative Tools Section */}
      {/* <div>
        <h2 className="text-xl font-bold text-white mb-4 md:text-2xl">
          ابزارهای خلاقانه
        </h2>
        <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
          <StyleCard
            href="/dashboard/text-to-image?prompt=آثار+هنری+و+طراحی+خلاقانه+،+سبک+هنری+منحصر+به+فرد+،+رنگ‌های+زنده+و+زیبا"
            title="هنر و طراحی"
            beforeImage="/img/styles/art-design-before.jpg"
            afterImage="/img/styles/art-design-after.jpg"
            gradient="from-green-400/20 via-emerald-400/20 to-teal-500/20"
          />
          <StyleCard
            href="/dashboard/image-to-image?prompt=بهبود+کیفیت+تصویر+،+افزایش+وضوح+،+حذف+نویز+،+بهبود+رنگ+و+روشنایی"
            title="بهبود تصویر"
            beforeImage="/img/styles/image-enhancement-before.jpg"
            afterImage="/img/styles/image-enhancement-after.png"
            gradient="from-cyan-400/20 via-blue-400/20 to-indigo-500/20"
          />

        </div>
      </div> */}
    </div>
  );
}

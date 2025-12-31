"use client";

import { StyleCard } from "@/components/cards/style-card";
import { Button } from "@/components/ui/button";
import {
  Image,
  Sparkles,
  Video,
  ArrowLeft,
  Zap,
  Crown,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { READY_PROMPTS } from "@/lib/data";
import { useUser } from "@/hooks/use-user";

interface UseCaseCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient?: string;
  badges?: string[];
  accentColor?: string;
}

function UseCaseCard({
  href,
  icon,
  title,
  description,
  badges,
  accentColor = "yellow",
}: UseCaseCardProps) {
  const getAccentClasses = () => {
    switch (accentColor) {
      case "purple":
        return {
          iconBg: "bg-purple-500/20",
          border: "hover:border-purple-400/40",
          shadow: "hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]",
          button:
            "hover:border-purple-400/40 hover:bg-purple-400/10 hover:text-purple-400",
        };
      case "cyan":
        return {
          iconBg: "bg-cyan-500/20",
          border: "hover:border-cyan-400/40",
          shadow: "hover:shadow-[0_0_40px_rgba(34,211,238,0.15)]",
          button:
            "hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-400",
        };
      default:
        return {
          iconBg: "bg-yellow-500/20",
          border: "hover:border-yellow-400/40",
          shadow: "hover:shadow-[0_0_40px_rgba(251,191,36,0.15)]",
          button:
            "hover:border-yellow-400/40 hover:bg-yellow-400/10 hover:text-yellow-400",
        };
    }
  };

  const accent = getAccentClasses();

  return (
    <Link href={href} className="block h-full">
      <div
        className={`group relative overflow-hidden rounded-2xl bg-zinc-900/80 border border-white/10 p-5 sm:p-6 transition-all duration-300 active:scale-[0.98] h-full flex flex-col ${accent.border} ${accent.shadow}`}
      >
        {/* Badges */}
        {badges && badges.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-4">
            {badges.map((badge, index) => {
              let badgeClass = "";
              if (badge.includes("Pro")) {
                badgeClass =
                  "bg-gradient-to-r from-yellow-500/15 to-orange-500/15 border-yellow-500/30 text-yellow-400";
              } else if (badge.includes("Kling")) {
                badgeClass =
                  "bg-purple-500/15 border-purple-500/30 text-purple-400";
              } else {
                badgeClass = "bg-cyan-500/15 border-cyan-500/30 text-cyan-400";
              }

              return (
                <span
                  key={index}
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold ${badgeClass}`}
                >
                  {badge}
                </span>
              );
            })}
          </div>
        )}

        {/* Icon */}
        <div
          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${accent.iconBg} transition-transform duration-300 group-hover:scale-110`}
        >
          {icon}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>

        {/* Description */}
        <p className="text-sm text-white/50 mb-5 leading-relaxed grow">
          {description}
        </p>

        {/* CTA */}
        <div className="flex items-center justify-between mt-auto">
          <span
            className={`text-sm font-medium text-white/40 group-hover:text-white/60 transition-colors`}
          >
            شروع کنید
          </span>
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 transition-all group-hover:bg-white/10 ${accent.button}`}
          >
            <ChevronLeft className="h-4 w-4 text-white/60 group-hover:text-white transition-colors" />
          </div>
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
  const { user } = useUser();

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
    if (!banner) return "120px";
    if (banner.customHeight) {
      return `${banner.customHeight}px`;
    }
    switch (banner.height) {
      case "small":
        return "120px";
      case "medium":
        return "200px";
      case "large":
        return "320px";
      default:
        return "120px";
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4">
      {/* Header Section */}
      <div className="mb-8 sm:mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
              سلام، {user.firstName || "کاربر"} 👋
            </h1>
            <p className="text-sm sm:text-base text-white/50">
              امروز می‌خوای چی بسازی؟
            </p>
          </div>

          {/* Credits Badge */}
          <div className="flex items-center gap-3 bg-zinc-900/80 rounded-2xl border border-white/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500">
                <Zap className="h-4 w-4 text-black" />
              </div>
              <div>
                <p className="text-xs text-white/50">اعتبار شما</p>
                <p className="text-lg font-bold text-white">
                  {user.credits.toLocaleString("fa-IR")}
                </p>
              </div>
            </div>
            <Link href="/dashboard/billing">
              <Button
                size="sm"
                className="bg-[#c8ff00] hover:bg-[#b8ef00] text-black font-bold rounded-xl h-9 px-4"
              >
                <Crown className="h-3.5 w-3.5 ml-1.5" />
                خرید
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Dynamic Image Banner */}
      {!isLoadingBanner && banner && (
        <Link href={banner.link} className="block mb-8 sm:mb-10">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/80 transition-all hover:border-yellow-400/30 hover:shadow-[0_0_40px_rgba(251,191,36,0.15)] cursor-pointer">
            <div
              className="relative w-full overflow-hidden"
              style={{ height: getBannerHeight() }}
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
      <div className="mb-10 sm:mb-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">ابزارهای هوش مصنوعی</h2>
        </div>
        <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
          <UseCaseCard
            href="/dashboard/text-to-image"
            icon={<Sparkles className="h-6 w-6 text-yellow-400" />}
            title="متن به تصویر"
            description="با نوشتن یک متن ساده، تصاویر خیره‌کننده بسازید"
            badges={["Nano Banana", "Nano Banana Pro"]}
            accentColor="yellow"
          />
          <UseCaseCard
            href="/dashboard/image-to-image"
            icon={<Image className="h-6 w-6 text-cyan-400" />}
            title="تصویر به تصویر"
            description="تصاویر خود را به آثار هنری جدید تبدیل کنید"
            badges={["Nano Banana", "Nano Banana Pro"]}
            accentColor="cyan"
          />
          <UseCaseCard
            href="/dashboard/image-to-video"
            icon={<Video className="h-6 w-6 text-purple-400" />}
            title="تصویر به ویدیو"
            description="تصاویر ثابت خود را به ویدیوهای متحرک تبدیل کنید"
            badges={["Kling 2.6"]}
            accentColor="purple"
          />
        </div>
      </div>

      {/* Ready Prompts Section */}
      <div className="mb-10 sm:mb-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">پرامپت‌های آماده</h2>
          <span className="text-xs text-white/40 bg-white/5 px-3 py-1.5 rounded-full">
            کلیک کنید و امتحان کنید
          </span>
        </div>

        {/* Featured Style Cards */}
        <div className="grid gap-4 sm:gap-5 grid-cols-2 lg:grid-cols-4 mb-5">
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
        </div>

        {/* More Style Cards from READY_PROMPTS */}
        {READY_PROMPTS.length > 0 && (
          <div className="grid gap-4 sm:gap-5 grid-cols-2 lg:grid-cols-4">
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
        )}
      </div>

      {/* Quick Tips Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-transparent rounded-2xl border border-yellow-500/20 p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-yellow-500/20 shrink-0">
              <Sparkles className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1">
                نکته برای نتایج بهتر
              </h3>
              <p className="text-sm text-white/60 leading-relaxed">
                برای گرفتن بهترین نتیجه، پرامپت خود را با جزئیات بیشتری بنویسید.
                مثلاً به جای &quot;یک گربه&quot;، بنویسید &quot;یک گربه نارنجی
                پشمالو در حال خواب روی یک مبل آبی در نور آفتاب عصر&quot;
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

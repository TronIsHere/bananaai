import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StyleCardProps {
  href: string;
  title: string;
  beforeImage?: string;
  afterImage?: string;
  gradient?: string;
}

export function StyleCard({
  href,
  title,
  beforeImage,
  afterImage,
  gradient = "from-yellow-400/20 via-orange-400/20 to-pink-500/20",
}: StyleCardProps) {
  // Determine if we have both images or just one
  const hasBothImages = beforeImage && afterImage;
  const singleImage = beforeImage || afterImage;

  return (
    <Link href={href}>
      <div className="group relative h-[400px] overflow-hidden rounded-xl border border-white/10 transition-all active:scale-[0.98] hover:border-yellow-400/30 hover:shadow-[0_0_30px_rgba(251,191,36,0.2)] md:rounded-2xl">
        {/* Images Container */}
        <div className="absolute inset-0 flex flex-col">
          {hasBothImages ? (
            <>
              {/* Before Image - Top Half */}
              <div className="w-full h-1/2 overflow-hidden">
                <div
                  className="w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url(${beforeImage})` }}
                />
              </div>
              {/* After Image - Bottom Half */}
              <div className="w-full h-1/2 overflow-hidden">
                <div
                  className="w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url(${afterImage})` }}
                />
              </div>
            </>
          ) : singleImage ? (
            /* Single Image - Full Height */
            <div className="w-full h-full overflow-hidden">
              <div
                className="w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url(${singleImage})` }}
              />
            </div>
          ) : (
            /* No Images - Gradient Full Height */
            <div className={`w-full h-full bg-gradient-to-br ${gradient}`} />
          )}
        </div>
        {/* Bottom Shadow Gradient for text readability */}
        <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />
        {/* Content */}
        <div className="relative flex h-full flex-col justify-end p-6 md:p-8">
          <div className="mt-auto">
            <h3 className="mb-3 text-2xl font-bold text-white drop-shadow-lg md:text-3xl">
              {title}
            </h3>
            <div className="flex justify-end ">
              <Button
                variant="outline"
                className="border-white/20 bg-white/10 text-white backdrop-blur-sm transition-all hover:border-yellow-400/50 hover:bg-yellow-400/20 hover:text-yellow-400 w-auto"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                مثل این بساز
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

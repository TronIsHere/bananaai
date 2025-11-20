"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Download, 
  Loader2, 
  Palette,
  Wand2,
  Zap,
  Image as ImageIcon,
  AlertCircle
} from "lucide-react";
import { demoPrompts } from "@/lib/data";
import { GeneratedImage } from "@/types/dashboard-types";
import { GeneratedImageDisplay } from "@/components/dashboard/generated-image-display";
import { LoadingState } from "@/components/dashboard/loading-state";
import { saveImageToHistory } from "@/lib/history";
import { useUser } from "@/hooks/use-user";

const STYLE_PRESETS = [
  { id: "realistic", name: "واقع‌گرایانه", icon: ImageIcon, prompt: "ultra realistic, high detail, professional photography" },
  { id: "oil-painting", name: "نقاشی رنگ روغن", icon: Palette, prompt: "oil painting style, artistic brushstrokes, classical art" },
  { id: "cartoon", name: "کارتونی", icon: Sparkles, prompt: "cartoon style, animated, vibrant colors, playful" },
  { id: "sketch", name: "طراحی", icon: Wand2, prompt: "pencil sketch, hand-drawn, artistic, monochrome" },
  { id: "vintage", name: "قدیمی", icon: Zap, prompt: "vintage style, retro, aged photo effect, nostalgic" },
  { id: "cyberpunk", name: "سایبرپانک", icon: Zap, prompt: "cyberpunk style, neon lights, futuristic, dark atmosphere" },
];

export default function TextToImagePage() {
  const [prompt, setPrompt] = useState("");
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedGenerated, setSelectedGenerated] = useState<GeneratedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<{
    attempts: number;
    elapsedSeconds: number;
    estimatedTimeRemaining: number;
  } | null>(null);
  
  const { user, refreshUserData } = useUser();
  const [numOutputs] = useState(1);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);
    setSelectedGenerated(null);
    setLoadingProgress({ attempts: 0, elapsedSeconds: 0, estimatedTimeRemaining: 120 });
    startTimeRef.current = Date.now();
    
    try {
      // Step 1: Submit generation request
      const response = await fetch("/api/generate/text-to-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          numImages: numOutputs,
          image_size: "16:9",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to generate image");
      }

      if (!data.success || !data.taskId) {
        throw new Error(data.message || "خطا در ثبت درخواست تولید تصویر");
      }

      const taskId = data.taskId;

      // Step 2: Poll for task completion
      const pollInterval = 1500; // Poll every 1.5 seconds (faster)
      const maxAttempts = 80; // Maximum 2 minutes (80 * 1.5 seconds)
      let attempts = 0;

      const pollTaskStatus = async (): Promise<void> => {
        try {
          attempts++;
          const elapsedSeconds = startTimeRef.current 
            ? Math.floor((Date.now() - startTimeRef.current) / 1000) 
            : 0;
          const estimatedTimeRemaining = Math.max(0, 120 - elapsedSeconds);
          
          setLoadingProgress({
            attempts,
            elapsedSeconds,
            estimatedTimeRemaining,
          });

          const statusResponse = await fetch(`/api/generate/task-status/${taskId}`);
          const statusData = await statusResponse.json();

          if (!statusResponse.ok) {
            throw new Error(statusData.message || statusData.error || "خطا در بررسی وضعیت");
          }

          if (statusData.status === "completed") {
            // Task completed successfully
            if (statusData.images && statusData.images.length > 0) {
              const newImages: GeneratedImage[] = statusData.images.map((url: string, index: number) => ({
                id: `${Date.now()}-${index}`,
                url,
                timestamp: new Date(),
                prompt: prompt.trim(),
              }));

              setGeneratedImages(newImages);
              setSelectedGenerated(newImages[0]);
              
              // Save to local history
              newImages.forEach((img) => saveImageToHistory(img));
              
              // Refresh user data to update credits
              await refreshUserData();
            } else {
              throw new Error("هیچ تصویری تولید نشد");
            }
            setIsLoading(false);
            setLoadingProgress(null);
            startTimeRef.current = null;
            if (pollingTimeoutRef.current) {
              clearTimeout(pollingTimeoutRef.current);
              pollingTimeoutRef.current = null;
            }
          } else if (statusData.status === "failed") {
            // Task failed
            setIsLoading(false);
            setLoadingProgress(null);
            startTimeRef.current = null;
            if (pollingTimeoutRef.current) {
              clearTimeout(pollingTimeoutRef.current);
              pollingTimeoutRef.current = null;
            }
            throw new Error(statusData.error || "تولید تصویر با خطا مواجه شد");
          } else if (statusData.status === "pending" || statusData.status === "processing") {
            // Still processing, continue polling
            if (attempts >= maxAttempts) {
              setIsLoading(false);
              if (pollingTimeoutRef.current) {
                clearTimeout(pollingTimeoutRef.current);
                pollingTimeoutRef.current = null;
              }
              throw new Error("زمان انتظار به پایان رسید. لطفاً دوباره تلاش کنید.");
            } else {
              pollingTimeoutRef.current = setTimeout(pollTaskStatus, pollInterval);
            }
          }
        } catch (err: any) {
          console.error("Error polling task status:", err);
          setIsLoading(false);
          setLoadingProgress(null);
          startTimeRef.current = null;
          if (pollingTimeoutRef.current) {
            clearTimeout(pollingTimeoutRef.current);
            pollingTimeoutRef.current = null;
          }
          setError(err.message || "خطا در بررسی وضعیت تولید تصویر");
        }
      };

      // Start polling immediately (don't wait for first interval)
      pollTaskStatus();
    } catch (err: any) {
      console.error("Error generating image:", err);
      setError(err.message || "خطا در تولید تصویر. لطفاً دوباره تلاش کنید.");
      setIsLoading(false);
      setLoadingProgress(null);
      startTimeRef.current = null;
    }
  };

  const handleUseExample = (examplePrompt: string) => {
    setPrompt(examplePrompt);
  };

  const handleDownload = (imageUrl: string, id: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `bananaai-text2img-${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const applyPreset = (preset: typeof STYLE_PRESETS[0]) => {
    if (prompt.trim()) {
      // Append to existing prompt on a new line
      setPrompt(`${prompt.trim()}\n${preset.prompt}`);
    } else {
      // If prompt is empty, just set the preset
      setPrompt(preset.prompt);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 md:mb-8">
        <div className="mb-3 flex items-center gap-2 md:mb-4 md:gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-pink-500/20 md:h-12 md:w-12">
            <Sparkles className="h-5 w-5 text-yellow-400 md:h-6 md:w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white md:text-4xl">متن به تصویر</h1>
            <p className="text-xs text-slate-400 md:text-base">تولید تصویر از متن با هوش مصنوعی پیشرفته</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 md:space-y-6">
        {/* Error Message */}
        {error && (
          <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-400 font-medium">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300 transition"
            >
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          <div className="space-y-3 md:space-y-4">
            {/* Prompt */}
            <div className="space-y-2">
              <label
                htmlFor="prompt"
                className="text-sm font-semibold text-white/80 block text-right"
              >
                متن توصیفی (پرامپت)
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="تصویری که می‌خواهید را به فارسی یا انگلیسی توصیف کنید... مثلاً: یک گربه فضانورد در حال رانندگی با موتورسیکلت در مریخ، نور طلایی، سبک علمی تخیلی"
                className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-right text-sm text-white placeholder:text-white/30 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 min-h-[140px] resize-none md:p-4 md:text-base md:min-h-[180px]"
                dir="rtl"
              />
              <p className="text-xs text-slate-400 text-right">
                هرچه جزئیات بیشتری بنویسید، نتیجه بهتری خواهید گرفت
              </p>
            </div>

            {/* Example Prompts */}
            {demoPrompts.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/80 block text-right">
                  مثال‌های آماده
                </label>
                <div className="flex flex-wrap gap-2">
                  {demoPrompts.map((example, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleUseExample(example)}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 transition hover:border-yellow-400/30 hover:bg-yellow-400/10 hover:text-yellow-400"
                    >
                      {example.substring(0, 40)}...
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Style Presets */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/80 block text-right">
                سبک‌های پیشنهادی
              </label>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  {STYLE_PRESETS.map((preset) => {
                    const Icon = preset.icon;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[10px] text-white/80 transition active:scale-95 hover:border-yellow-400/30 hover:bg-yellow-400/10 hover:text-yellow-400 md:gap-2 md:px-3 md:text-xs"
                      >
                        <Icon className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{preset.name}</span>
                      </button>
                    );
                  })}
                </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="w-full bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 font-bold text-slate-950 shadow-[0_10px_35px_rgba(251,191,36,0.35)] hover:scale-[1.02] hover:opacity-90 h-12 text-base active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 md:h-14 md:text-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 ml-2 animate-spin" />
                در حال تولید تصویر...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 ml-2" />
                تولید تصویر با هوش مصنوعی
              </>
            )}
          </Button>
        </form>

        {/* Loading State */}
        {isLoading && (
          <LoadingState 
            message="در حال آماده‌سازی عکس هستیم"
            subMessage={
              loadingProgress
                ? `زمان سپری شده: ${loadingProgress.elapsedSeconds} ثانیه`
                : undefined
            }
            numOutputs={numOutputs}
          />
        )}

        {/* Generated Images */}
        {generatedImages.length > 0 && !isLoading && (
          <GeneratedImageDisplay
            generatedImages={generatedImages}
            selectedGenerated={selectedGenerated}
            onSelectImage={setSelectedGenerated}
            onDownload={handleDownload}
            onCopyPrompt={handleCopyPrompt}
            copiedId={copiedId}
          />
        )}
      </div>
    </div>
  );
}

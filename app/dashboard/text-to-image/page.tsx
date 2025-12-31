"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Loader2,
  Palette,
  Wand2,
  Zap,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import { demoPrompts, STYLE_PRESETS, IMAGE_SIZES } from "@/lib/data";
import { GeneratedImage } from "@/types/dashboard-types";
import { GeneratedImageDisplay } from "@/components/dashboard/generated-image-display";
import { LoadingState } from "@/components/dashboard/loading-state";
import { useUser } from "@/hooks/use-user";
import { InsufficientCreditsDialog } from "@/components/dialog/insufficient-credits-dialog";
import { PostGenerationUpgradeDialog } from "@/components/dialog/post-generation-upgrade-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Icon mapping for style presets
const iconMap = {
  ImageIcon,
  Palette,
  Sparkles,
  Wand2,
  Zap,
} as const;

// Aspect ratio icon component
function AspectRatioIcon({
  ratio,
  className = "",
}: {
  ratio: string;
  className?: string;
}) {
  const getRect = () => {
    switch (ratio) {
      case "1:1":
        return { x: 3, y: 3, width: 10, height: 10 };
      case "16:9":
        return { x: 1, y: 4, width: 14, height: 8 };
      case "9:16":
        return { x: 4, y: 1, width: 8, height: 14 };
      case "3:4":
        return { x: 3.5, y: 1, width: 9, height: 14 };
      case "4:3":
        return { x: 1, y: 3.5, width: 14, height: 9 };
      case "3:2":
        return { x: 1, y: 4, width: 14, height: 8 };
      case "2:3":
        return { x: 4, y: 1, width: 8, height: 14 };
      case "5:4":
        return { x: 1.5, y: 2, width: 13, height: 12 };
      case "4:5":
        return { x: 2, y: 1.5, width: 12, height: 13 };
      case "21:9":
        return { x: 0.5, y: 5, width: 15, height: 6 };
      default:
        return { x: 3, y: 3, width: 10, height: 10 };
    }
  };

  const rect = getRect();

  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x={rect.x}
        y={rect.y}
        width={rect.width}
        height={rect.height}
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        rx="1"
      />
    </svg>
  );
}

export default function TextToImagePage() {
  const [prompt, setPrompt] = useState("");
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedGenerated, setSelectedGenerated] =
    useState<GeneratedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<{
    attempts: number;
    elapsedSeconds: number;
    estimatedTimeRemaining: number;
  } | null>(null);
  const [showInsufficientCreditsDialog, setShowInsufficientCreditsDialog] =
    useState(false);
  const [insufficientCreditsMessage, setInsufficientCreditsMessage] = useState<
    string | undefined
  >();
  const [showPostGenerationUpgrade, setShowPostGenerationUpgrade] =
    useState(false);
  const [upgradeDialogImageUrl, setUpgradeDialogImageUrl] = useState<
    string | null
  >(null);

  const { user, refreshUserData } = useUser();
  const [numOutputs, setNumOutputs] = useState(1);
  const [imageSize, setImageSize] = useState("1:1");
  const [isPro, setIsPro] = useState(true);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Check if user has access to image size selection (creator or studio plans)
  const canSelectImageSize =
    user.currentPlan === "creator" || user.currentPlan === "studio";

  const creditCost = isPro ? 24 : 4;

  // Set prompt from URL parameter on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlPrompt = params.get("prompt");
    if (urlPrompt) {
      setPrompt(decodeURIComponent(urlPrompt));
    }
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, []);

  // Show post-generation upgrade dialog for free plan users after first successful generation
  useEffect(() => {
    if (
      generatedImages.length > 0 &&
      user.currentPlan === "free" &&
      !localStorage.getItem("post_gen_upgrade_shown") &&
      !showPostGenerationUpgrade
    ) {
      setUpgradeDialogImageUrl(generatedImages[0].url);
      setShowPostGenerationUpgrade(true);
      localStorage.setItem("post_gen_upgrade_shown", "true");
    }
  }, [generatedImages, user.currentPlan, showPostGenerationUpgrade]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);
    setSelectedGenerated(null);
    setLoadingProgress({
      attempts: 0,
      elapsedSeconds: 0,
      estimatedTimeRemaining: 120,
    });
    startTimeRef.current = Date.now();

    try {
      // Construct final prompt with style
      let finalPrompt = prompt.trim();

      // Add selected style
      if (selectedStyleId) {
        const selectedStyle = STYLE_PRESETS.find(
          (s) => s.id === selectedStyleId
        );
        if (selectedStyle) {
          finalPrompt += `\n${selectedStyle.prompt}`;
        }
      }

      // Step 1: Submit generation request
      const response = await fetch("/api/generate/text-to-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: finalPrompt,
          numImages: numOutputs,
          image_size: imageSize,
          isPro: isPro,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if it's an insufficient credits error
        if (
          response.status === 403 ||
          data.error === "Insufficient credits" ||
          data.message?.includes("اعتبار") ||
          data.message?.includes("کافی نیست")
        ) {
          setInsufficientCreditsMessage(data.message);
          setShowInsufficientCreditsDialog(true);
          setIsLoading(false);
          setLoadingProgress(null);
          startTimeRef.current = null;
          return;
        }
        throw new Error(
          data.message || data.error || "Failed to generate image"
        );
      }

      if (!data.success || !data.taskId) {
        throw new Error(data.message || "خطا در ثبت درخواست تولید تصویر");
      }

      const taskId = data.taskId;

      // Step 2: Poll for task completion
      const pollInterval = 1500;
      const maxAttempts = 80;
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

          const statusResponse = await fetch(
            `/api/generate/task-status/${taskId}`
          );
          const statusData = await statusResponse.json();

          if (!statusResponse.ok) {
            throw new Error(
              statusData.message || statusData.error || "خطا در بررسی وضعیت"
            );
          }

          if (statusData.status === "completed") {
            if (statusData.images && statusData.images.length > 0) {
              const newImages: GeneratedImage[] = statusData.images.map(
                (url: string, index: number) => ({
                  id: `${Date.now()}-${index}`,
                  url,
                  timestamp: new Date(),
                  prompt: prompt.trim(),
                })
              );

              setGeneratedImages(newImages);
              setSelectedGenerated(newImages[0]);
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
            setIsLoading(false);
            setLoadingProgress(null);
            startTimeRef.current = null;
            if (pollingTimeoutRef.current) {
              clearTimeout(pollingTimeoutRef.current);
              pollingTimeoutRef.current = null;
            }
            throw new Error(statusData.error || "تولید تصویر با خطا مواجه شد");
          } else if (
            statusData.status === "pending" ||
            statusData.status === "processing"
          ) {
            if (attempts >= maxAttempts) {
              setIsLoading(false);
              if (pollingTimeoutRef.current) {
                clearTimeout(pollingTimeoutRef.current);
                pollingTimeoutRef.current = null;
              }
              throw new Error(
                "زمان انتظار به پایان رسید. لطفاً دوباره تلاش کنید."
              );
            } else {
              pollingTimeoutRef.current = setTimeout(
                pollTaskStatus,
                pollInterval
              );
            }
          }
        } catch (err: unknown) {
          console.error("Error polling task status:", err);
          setIsLoading(false);
          setLoadingProgress(null);
          startTimeRef.current = null;
          if (pollingTimeoutRef.current) {
            clearTimeout(pollingTimeoutRef.current);
            pollingTimeoutRef.current = null;
          }
          setError(
            err instanceof Error
              ? err.message
              : "خطا در بررسی وضعیت تولید تصویر"
          );
        }
      };

      pollTaskStatus();
    } catch (err: unknown) {
      console.error("Error generating image:", err);
      setError(
        err instanceof Error
          ? err.message
          : "خطا در تولید تصویر. لطفاً دوباره تلاش کنید."
      );
      setIsLoading(false);
      setLoadingProgress(null);
      startTimeRef.current = null;
    }
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

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4">
      {/* Error Message */}
      {error && (
        <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-4 flex items-start gap-3 mb-6">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
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

      {/* Insufficient Credits Dialog */}
      <InsufficientCreditsDialog
        open={showInsufficientCreditsDialog}
        onOpenChange={setShowInsufficientCreditsDialog}
        message={insufficientCreditsMessage}
        requiredCredits={creditCost * numOutputs}
        currentCredits={user.credits}
      />

      {/* Post-Generation Upgrade Dialog */}
      <PostGenerationUpgradeDialog
        open={showPostGenerationUpgrade}
        onOpenChange={setShowPostGenerationUpgrade}
        generatedImageUrl={upgradeDialogImageUrl}
        onUpgrade={() => {
          setShowPostGenerationUpgrade(false);
        }}
      />

      {/* Main Input Container */}
      <form onSubmit={handleSubmit}>
        <div className="bg-zinc-900/80 rounded-2xl border border-white/10">
          {/* Prompt Input Area */}
          <div className="p-4">
            {/* Mobile label */}
            <label className="sm:hidden block text-xs font-medium text-white/70 mb-2 text-right">
              پرامپت
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="تصویری که می‌خواهید را توصیف کنید..."
              className="w-full bg-transparent text-white placeholder:text-white/40 text-base resize-none outline-none min-h-[80px] sm:min-h-[60px] py-1"
              dir="rtl"
              rows={3}
            />
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2 px-4 pb-4 flex-wrap">
            {/* Model Selector */}
            <Select
              value={isPro ? "pro" : "standard"}
              onValueChange={(value) => setIsPro(value === "pro")}
            >
              <SelectTrigger className="w-fit sm:flex-initial rounded-full bg-white/5 hover:bg-white/10 border-white/10 text-white h-9 sm:h-9 px-3 sm:px-3 py-2 gap-2">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold ${
                        isPro
                          ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-black"
                          : "bg-cyan-500 text-white"
                      }`}
                    >
                      {isPro ? "G" : "S"}
                    </span>
                    <span className="text-sm font-medium">
                      {isPro ? "Nano Banana Pro" : "استاندارد"}
                    </span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 text-white">
                <SelectItem
                  value="pro"
                  className="text-right focus:bg-yellow-400/10 focus:text-yellow-400"
                >
                  <div className="flex items-center gap-3 w-full">
                    <span className="flex items-center justify-center w-6 h-6 rounded bg-gradient-to-br from-yellow-400 to-orange-500 text-xs font-bold text-black">
                      G
                    </span>
                    <div className="flex-1 text-right">
                      <div className="text-sm font-medium">Nano Banana Pro</div>
                      <div className="text-xs text-white/50">
                        ۲۴ اعتبار • کیفیت بالا
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem
                  value="standard"
                  className="text-right focus:bg-cyan-400/10 focus:text-cyan-400"
                >
                  <div className="flex items-center gap-3 w-full">
                    <span className="flex items-center justify-center w-6 h-6 rounded bg-cyan-500 text-xs font-bold text-white">
                      S
                    </span>
                    <div className="flex-1 text-right">
                      <div className="text-sm font-medium">استاندارد</div>
                      <div className="text-xs text-white/50">
                        ۴ اعتبار • سریع
                      </div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Aspect Ratio Selector */}
            {canSelectImageSize && (
              <Select value={imageSize} onValueChange={setImageSize}>
                <SelectTrigger className="w-fit rounded-full bg-white/5 hover:bg-white/10 border-white/10 text-white h-9 px-3 py-2 gap-2">
                  <AspectRatioIcon
                    ratio={imageSize}
                    className="text-white/80"
                  />
                  <SelectValue>
                    <span className="text-sm">{imageSize}</span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                  {IMAGE_SIZES.map((size) => (
                    <SelectItem
                      key={size.value}
                      value={size.value}
                      className="text-right focus:bg-yellow-400/10 focus:text-yellow-400"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <AspectRatioIcon
                          ratio={size.value}
                          className="text-white/80"
                        />
                        <span className="flex-1">{size.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Style Selector */}
            <Select
              value={selectedStyleId || "none"}
              onValueChange={(value) =>
                setSelectedStyleId(value === "none" ? null : value)
              }
            >
              <SelectTrigger
                className={`w-fit rounded-full border h-9 px-3 py-2 gap-2 ${
                  selectedStyleId
                    ? "bg-yellow-400/10 border-yellow-400/30 text-yellow-400"
                    : "bg-white/5 hover:bg-white/10 border-white/10 text-white/80"
                }`}
              >
                <Palette className="h-4 w-4" />
                <SelectValue>
                  <span className="text-sm">
                    {selectedStyleId
                      ? STYLE_PRESETS.find((s) => s.id === selectedStyleId)
                          ?.name
                      : "سبک"}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 text-white">
                <SelectItem
                  value="none"
                  className="text-right focus:bg-white/5"
                >
                  <span className="text-sm text-white/60">بدون سبک</span>
                </SelectItem>
                {STYLE_PRESETS.map((preset) => {
                  const Icon =
                    iconMap[preset.icon as keyof typeof iconMap] || ImageIcon;
                  return (
                    <SelectItem
                      key={preset.id}
                      value={preset.id}
                      className="text-right focus:bg-yellow-400/10 focus:text-yellow-400"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <Icon className="h-4 w-4 text-white/60" />
                        <span className="flex-1">{preset.name}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Generate Button */}
            <Button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="w-full sm:w-auto bg-[#c8ff00] hover:bg-[#b8ef00] text-black font-bold px-6 py-2 rounded-xl h-10 sm:h-10 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  در حال تولید...
                </>
              ) : (
                <>
                  تولید
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span className="text-black/70">
                    ✦ {creditCost * numOutputs}
                  </span>
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Example Prompts */}
      {!generatedImages.length && !isLoading && demoPrompts.length > 0 && (
        <div className="mt-6">
          <p className="text-xs text-white/40 mb-3 text-right">
            مثال‌های پیشنهادی:
          </p>
          <div className="flex flex-wrap gap-2 justify-end">
            {demoPrompts.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setPrompt(example)}
                className="rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 text-xs text-white/60 hover:text-white/80 transition-colors text-right"
              >
                {example.substring(0, 50)}...
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="mt-8">
          <LoadingState
            message="در حال آماده‌سازی تصویر"
            subMessage={
              loadingProgress
                ? `زمان سپری شده: ${loadingProgress.elapsedSeconds} ثانیه`
                : undefined
            }
            numOutputs={numOutputs}
          />
        </div>
      )}

      {/* Generated Images */}
      {generatedImages.length > 0 && !isLoading && (
        <div className="mt-8">
          <GeneratedImageDisplay
            generatedImages={generatedImages}
            selectedGenerated={selectedGenerated}
            onSelectImage={setSelectedGenerated}
            onDownload={handleDownload}
            onCopyPrompt={handleCopyPrompt}
            copiedId={copiedId}
          />
        </div>
      )}
    </div>
  );
}

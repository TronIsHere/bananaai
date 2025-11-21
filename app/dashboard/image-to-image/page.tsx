"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Image as ImageIcon,
  Upload,
  X,
  Loader2,
  Sparkles,
  Palette,
  Wand2,
  Zap,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Settings,
} from "lucide-react";
import { GeneratedImage } from "@/types/dashboard-types";
import { GeneratedImageDisplay } from "@/components/dashboard/generated-image-display";
import { LoadingState } from "@/components/dashboard/loading-state";
import { useUser } from "@/hooks/use-user";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STYLE_PRESETS = [
  {
    id: "oil-painting",
    name: "نقاشی رنگ روغن",
    icon: Palette,
    prompt: "oil painting style, artistic brushstrokes",
  },
  {
    id: "cartoon",
    name: "کارتونی",
    icon: Sparkles,
    prompt: "cartoon style, animated, vibrant colors",
  },
  {
    id: "sketch",
    name: "طراحی",
    icon: Wand2,
    prompt: "pencil sketch, hand-drawn, artistic",
  },
  {
    id: "vintage",
    name: "قدیمی",
    icon: Zap,
    prompt: "vintage style, retro, aged photo effect",
  },
  {
    id: "cyberpunk",
    name: "سایبرپانک",
    icon: Zap,
    prompt: "cyberpunk style, neon lights, futuristic",
  },
  {
    id: "watercolor",
    name: "آبرنگ",
    icon: Palette,
    prompt: "watercolor painting, soft colors, artistic",
  },
];

const IMAGE_SIZES = [
  { value: "1:1", label: "مربع (1:1)" },
  { value: "9:16", label: "عمودی موبایل (9:16)" },
  { value: "16:9", label: "افقی واید (16:9)" },
  { value: "3:4", label: "عمودی (3:4)" },
  { value: "4:3", label: "افقی کلاسیک (4:3)" },
  { value: "3:2", label: "افقی عکس (3:2)" },
  { value: "2:3", label: "عمودی عکس (2:3)" },
  { value: "5:4", label: "عمودی نزدیک به مربع (5:4)" },
  { value: "4:5", label: "عمودی نزدیک به مربع (4:5)" },
  { value: "21:9", label: "افقی اولترا واید (21:9)" },
];

export default function ImageToImagePage() {
  const [prompt, setPrompt] = useState("");
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedGenerated, setSelectedGenerated] =
    useState<GeneratedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<{
    attempts: number;
    elapsedSeconds: number;
    estimatedTimeRemaining: number;
  } | null>(null);

  const { user, refreshUserData } = useUser();
  const [numOutputs] = useState(1);
  const [imageSize, setImageSize] = useState("16:9");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if user has access to image size selection (creator or studio plans)
  const canSelectImageSize =
    user.currentPlan === "creator" || user.currentPlan === "studio";
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

  const handleImageSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError("حجم فایل نباید بیشتر از 10 مگابایت باشد");
        return;
      }

      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setGeneratedImages([]);
        setSelectedGenerated(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageSelect(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageSelect(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setSelectedImageFile(null);
    setGeneratedImages([]);
    setSelectedGenerated(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImageFile || !prompt.trim()) return;

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
      // Step 1: Upload image to get public URL
      const formData = new FormData();
      formData.append("image", selectedImageFile);

      const uploadResponse = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(
          uploadData.message || uploadData.error || "Failed to upload image"
        );
      }

      if (!uploadData.success || !uploadData.url) {
        throw new Error("خطا در آپلود تصویر");
      }

      const imageUrl = uploadData.url;

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

      // Step 2: Submit generation request
      const response = await fetch("/api/generate/image-to-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: finalPrompt,
          imageUrls: [imageUrl], // Array of input image URLs
          numImages: numOutputs,
          image_size: imageSize,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to generate image"
        );
      }

      if (!data.success || !data.taskId) {
        throw new Error(data.message || "خطا در ثبت درخواست تولید تصویر");
      }

      const taskId = data.taskId;

      // Step 3: Poll for task completion
      const pollInterval = 1500; // Poll every 1.5 seconds
      const maxAttempts = 80; // Maximum 2 minutes
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
            // Task completed successfully
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
          } else if (
            statusData.status === "pending" ||
            statusData.status === "processing"
          ) {
            // Still processing, continue polling
            if (attempts >= maxAttempts) {
              setIsLoading(false);
              setLoadingProgress(null);
              startTimeRef.current = null;
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

      // Start polling immediately
      pollTaskStatus();
    } catch (err: any) {
      console.error("Error generating image:", err);
      setError(err.message || "خطا در تولید تصویر. لطفاً دوباره تلاش کنید.");
      setIsLoading(false);
      setLoadingProgress(null);
      startTimeRef.current = null;
    }
  };

  const handleDownload = (imageUrl: string, id: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `bananaai-img2img-${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReuse = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setGeneratedImages([]);
    setSelectedGenerated(null);
  };

  const applyPreset = (preset: (typeof STYLE_PRESETS)[0]) => {
    if (selectedStyleId === preset.id) {
      setSelectedStyleId(null);
    } else {
      setSelectedStyleId(preset.id);
    }
  };

  return (
    <div className="max-w-5xl mx-auto ">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-pink-500/20">
            <ImageIcon className="h-6 w-6 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">تصویر به تصویر</h1>
            <p className="text-sm text-slate-400 mt-1">
              تصاویر خود را به سبک‌های مختلف تبدیل کنید
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-5">
            {/* Image Upload Section - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-3">
              <label className="text-sm font-semibold text-white/90 block text-right">
                تصویر اولیه
              </label>

              {!selectedImage ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all h-[280px] active:scale-[0.98] md:h-[400px] ${
                    isDragging
                      ? "border-yellow-400 bg-yellow-400/10 scale-[1.02]"
                      : "border-white/20 bg-white/5 hover:border-yellow-400/50 hover:bg-white/10"
                  }`}
                >
                  <div className="text-center p-6 md:p-8">
                    <Upload
                      className={`mx-auto mb-4 h-14 w-14 transition-all md:h-16 md:w-16 ${
                        isDragging
                          ? "text-yellow-400 scale-110"
                          : "text-slate-400"
                      }`}
                    />
                    <p className="mb-2 text-base font-semibold text-white md:text-lg">
                      {isDragging ? "رها کنید!" : "کلیک کنید یا تصویر را بکشید"}
                    </p>
                    <p className="text-xs text-slate-400 mb-4 md:text-sm">
                      JPG, PNG, GIF, WEBP
                    </p>
                    <div className="inline-flex items-center gap-2 rounded-lg bg-yellow-400/10 px-3 py-1.5 text-xs text-yellow-400">
                      <Zap className="h-3 w-3" />
                      حداکثر 10 مگابایت
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative group">
                  <div className="relative overflow-hidden rounded-xl border-2 border-white/10 bg-slate-900/50">
                    <img
                      src={selectedImage}
                      alt="Selected"
                      className="w-full object-contain h-[280px] md:h-[400px]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute left-3 top-3 rounded-full bg-red-500/90 p-2 text-white transition hover:bg-red-500 hover:scale-110"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-3 right-3 rounded-lg bg-slate-950/90 px-3 py-1.5 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                      تصویر اصلی
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Prompt Section - Takes 3 columns */}
            <div className="lg:col-span-3 space-y-4">
              {/* Prompt */}
              <div className="space-y-3">
                <label
                  htmlFor="prompt"
                  className="text-sm font-semibold text-white/90 block text-right"
                >
                  چه تغییراتی می‌خواهید اعمال شود؟
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="مثلاً: به سبک نقاشی رنگ روغن، افزودن نور غروب، تبدیل به سیاه و سفید..."
                  className="w-full rounded-xl border-2 border-white/10 bg-white/5 p-4 text-right text-base text-white placeholder:text-white/30 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 min-h-[160px] resize-none transition-all md:min-h-[180px] md:text-lg"
                  dir="rtl"
                  autoFocus
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400 text-right">
                    💡 هرچه جزئیات بیشتری بنویسید، نتیجه بهتری خواهید گرفت
                  </p>
                  <span className="text-xs text-slate-500">
                    {prompt.length} کاراکتر
                  </span>
                </div>
              </div>

              {/* Advanced Options - Collapsible */}
              <div className="border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span>تنظیمات پیشرفته</span>
                  </div>
                  {showAdvanced ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                {showAdvanced && (
                  <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                    {/* Style Presets */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-white/70 block text-right">
                        افزودن سبک هنری
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {STYLE_PRESETS.map((preset) => {
                          const Icon = preset.icon;
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => applyPreset(preset)}
                              className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border px-2 py-2.5 text-[10px] transition active:scale-95 ${
                                selectedStyleId === preset.id
                                  ? "border-yellow-400 bg-yellow-400/20 text-yellow-400"
                                  : "border-white/10 bg-white/5 text-white/70 hover:border-yellow-400/30 hover:bg-yellow-400/10 hover:text-yellow-400"
                              }`}
                            >
                              <Icon className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate w-full text-center">
                                {preset.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Image Size Selector - Only for Creator and Studio plans */}
                    {canSelectImageSize && (
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-white/70 block text-right">
                          اندازه تصویر
                        </label>
                        <Select value={imageSize} onValueChange={setImageSize}>
                          <SelectTrigger className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10 focus:border-yellow-400 text-sm">
                            <SelectValue placeholder="انتخاب اندازه تصویر" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-white/10 text-white">
                            {IMAGE_SIZES.map((size) => (
                              <SelectItem
                                key={size.value}
                                value={size.value}
                                className="text-right focus:bg-yellow-400/10 focus:text-yellow-400"
                              >
                                {size.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !selectedImage || !prompt.trim()}
            className="w-full bg-yellow-500 font-bold text-slate-950 hover:bg-yellow-600 h-10 text-sm px-4 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 ml-2 animate-spin" />
                در حال پردازش تصویر...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 ml-2" />
                تبدیل تصویر
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
            onReuse={handleReuse}
            copiedId={copiedId}
          />
        )}
      </div>
    </div>
  );
}

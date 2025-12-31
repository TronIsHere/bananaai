"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Video,
  Upload,
  X,
  Loader2,
  AlertCircle,
  Settings,
  Check,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { LoadingState } from "@/components/dashboard/loading-state";
import { InsufficientCreditsDialog } from "@/components/dialog/insufficient-credits-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface GeneratedVideo {
  id: string;
  url: string;
  timestamp: Date;
  prompt: string;
}

interface ImageSlot {
  file: File | null;
  preview: string | null;
}

export default function ImageToVideoPage() {
  const [prompt, setPrompt] = useState("");
  const [imageSlot, setImageSlot] = useState<ImageSlot>({
    file: null,
    preview: null,
  });
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedGenerated, setSelectedGenerated] =
    useState<GeneratedVideo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<{
    attempts: number;
    elapsedSeconds: number;
    estimatedTimeRemaining: number;
  } | null>(null);
  const [duration, setDuration] = useState<"5" | "10">("5");
  const [sound, setSound] = useState(false);
  const [showInsufficientCreditsDialog, setShowInsufficientCreditsDialog] =
    useState(false);
  const [insufficientCreditsMessage, setInsufficientCreditsMessage] = useState<
    string | undefined
  >();

  const { user, refreshUserData } = useUser();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Calculate credits required based on duration and sound
  const calculateCredits = (duration: "5" | "10", sound: boolean): number => {
    const baseCredits = duration === "10" ? 110 : 55;
    return sound ? baseCredits * 2 : baseCredits;
  };

  const requiredCredits = calculateCredits(duration, sound);

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

  const handleImageSelect = (file: File) => {
    if (file) {
      // Check if file is an image by MIME type or extension
      const fileName = file.name.toLowerCase();
      const fileExtension = fileName.substring(fileName.lastIndexOf("."));
      const allowedExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".heic",
        ".heif",
      ];
      const isImageByType = file.type.startsWith("image/");
      const isImageByExtension = allowedExtensions.includes(fileExtension);

      if (isImageByType || isImageByExtension) {
        // Validate file size (6MB max)
        const maxSize = 6 * 1024 * 1024; // 6MB
        if (file.size > maxSize) {
          setError("حجم فایل نباید بیشتر از 6 مگابایت باشد");
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          setImageSlot({
            file: file,
            preview: reader.result as string,
          });
          setGeneratedVideos([]);
          setSelectedGenerated(null);
          setError(null);
        };
        reader.readAsDataURL(file);
      } else {
        setError("فرمت فایل نامعتبر است. فقط JPG، PNG، WEBP و HEIC مجاز است");
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageSelect(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageSelect(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const handleRemoveImage = () => {
    setImageSlot({ file: null, preview: null });
    setGeneratedVideos([]);
    setSelectedGenerated(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageSlot.file || !prompt.trim()) {
      setError("لطفاً تصویر و متن توصیفی را وارد کنید");
      return;
    }

    if (prompt.length > 2500) {
      setError("متن توصیفی نباید بیشتر از 2500 کاراکتر باشد");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedVideos([]);
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
      formData.append("image", imageSlot.file);

      const uploadResponse = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      // Handle 413 errors specifically (Request Entity Too Large)
      if (uploadResponse.status === 413) {
        throw new Error(
          "حجم فایل خیلی بزرگ است. لطفاً فایلی کوچکتر از 6 مگابایت انتخاب کنید."
        );
      }

      // Try to parse JSON, but handle cases where response might be HTML error page
      let uploadData;
      try {
        uploadData = await uploadResponse.json();
      } catch (parseError) {
        // If JSON parsing fails, it might be an HTML error page
        if (uploadResponse.status >= 400) {
          throw new Error(
            "خطا در آپلود تصویر. لطفاً مطمئن شوید حجم فایل کمتر از 6 مگابایت است."
          );
        }
        throw parseError;
      }

      if (!uploadResponse.ok) {
        throw new Error(
          uploadData.message || uploadData.error || "خطا در آپلود تصویر"
        );
      }

      if (!uploadData.success || !uploadData.url) {
        throw new Error("خطا در آپلود تصویر");
      }

      const imageUrl = uploadData.url;

      // Step 2: Submit generation request
      const response = await fetch("/api/generate/image-to-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          imageUrls: [imageUrl],
          sound: sound,
          duration: duration,
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
        throw new Error(data.message || data.error || "خطا در تولید ویدیو");
      }

      if (!data.success || !data.taskId) {
        throw new Error(data.message || "خطا در ثبت درخواست تولید ویدیو");
      }

      const taskId = data.taskId;

      // Step 3: Poll for task completion
      const pollInterval = 2000; // Poll every 2 seconds (videos take longer)
      const maxAttempts = 150; // Maximum 5 minutes (150 * 2 seconds)
      let attempts = 0;

      const pollTaskStatus = async (): Promise<void> => {
        try {
          attempts++;
          const elapsedSeconds = startTimeRef.current
            ? Math.floor((Date.now() - startTimeRef.current) / 1000)
            : 0;
          const estimatedTimeRemaining = Math.max(0, 300 - elapsedSeconds);

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
            if (statusData.videos && statusData.videos.length > 0) {
              const newVideos: GeneratedVideo[] = statusData.videos.map(
                (url: string, index: number) => ({
                  id: `${Date.now()}-${index}`,
                  url,
                  timestamp: new Date(),
                  prompt: prompt.trim(),
                })
              );

              setGeneratedVideos(newVideos);
              setSelectedGenerated(newVideos[0]);

              // Refresh user data to update credits
              await refreshUserData();
            } else {
              throw new Error("هیچ ویدیویی تولید نشد");
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
            throw new Error(statusData.error || "تولید ویدیو با خطا مواجه شد");
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
          setError(err.message || "خطا در بررسی وضعیت تولید ویدیو");
        }
      };

      // Start polling immediately
      pollTaskStatus();
    } catch (err: any) {
      console.error("Error generating video:", err);
      setError(err.message || "خطا در تولید ویدیو. لطفاً دوباره تلاش کنید.");
      setIsLoading(false);
      setLoadingProgress(null);
      startTimeRef.current = null;
    }
  };

  const handleDownload = (videoUrl: string, id: string) => {
    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = `bananaai-img2vid-${id}.mp4`;
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
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-pink-500/20">
            <Video className="h-6 w-6 text-yellow-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-black text-white">تصویر به ویدیو</h1>
              <div className="flex items-center gap-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-500">
                مدل Kling-2.6
              </div>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              تصاویر خود را به ویدیوهای متحرک تبدیل کنید
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

        {/* Insufficient Credits Dialog */}
        <InsufficientCreditsDialog
          open={showInsufficientCreditsDialog}
          onOpenChange={setShowInsufficientCreditsDialog}
          message={insufficientCreditsMessage}
          requiredCredits={requiredCredits}
          currentCredits={user.credits}
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-5">
            {/* Image Upload Section - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-3">
              <label className="text-sm font-semibold text-white/90 text-right block">
                تصویر ورودی
              </label>

              {!imageSlot.preview ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all h-[200px] active:scale-[0.98] ${
                    dragging
                      ? "border-yellow-400 bg-yellow-400/10 scale-[1.02]"
                      : "border-white/20 bg-white/5 hover:border-yellow-400/50 hover:bg-white/10"
                  }`}
                >
                  <div className="text-center p-2">
                    <Upload
                      className={`mx-auto mb-2 h-8 w-8 transition-all ${
                        dragging
                          ? "text-yellow-400 scale-110"
                          : "text-slate-400"
                      }`}
                    />
                    <p className="text-xs font-semibold text-white/80">
                      تصویر را اینجا بکشید یا کلیک کنید
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      JPG، PNG، WEBP (حداکثر 10MB)
                    </p>
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
                <div className="relative group h-[200px]">
                  <div className="relative overflow-hidden rounded-xl border-2 border-white/10 bg-slate-900/50 w-full h-full">
                    <img
                      src={imageSlot.preview}
                      alt="Upload"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute left-2 top-2 rounded-full bg-red-500/90 p-1.5 text-white transition hover:bg-red-500 hover:scale-110"
                    >
                      <X className="h-3 w-3" />
                    </button>
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
                  چه حرکتی می‌خواهید در ویدیو باشد؟
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="مثلاً: دوربین به آرامی به سمت راست حرکت می‌کند، باد در برگ‌ها می‌وزد، نور خورشید در حال طلوع است..."
                  className="w-full rounded-xl border-2 border-white/10 bg-white/5 p-4 text-right text-base text-white placeholder:text-white/30 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 min-h-[160px] resize-none transition-all md:min-h-[180px] md:text-lg"
                  dir="rtl"
                  autoFocus
                  maxLength={2500}
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400 text-right">
                    💡 هرچه جزئیات بیشتری بنویسید، نتیجه بهتری خواهید گرفت
                  </p>
                  <span className="text-xs text-slate-500">
                    {prompt.length}/2500 کاراکتر
                  </span>
                </div>
              </div>

              {/* Video Settings */}
              <div className="space-y-4 border-t border-white/10 pt-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/70 block text-right">
                    مدت زمان ویدیو
                  </label>
                  <Select
                    value={duration}
                    onValueChange={(value) => setDuration(value as "5" | "10")}
                  >
                    <SelectTrigger className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10 focus:border-yellow-400 text-sm">
                      <SelectValue placeholder="انتخاب مدت زمان" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-white">
                      <SelectItem
                        value="5"
                        className="text-right focus:bg-yellow-400/10 focus:text-yellow-400"
                      >
                        5 ثانیه
                      </SelectItem>
                      <SelectItem
                        value="10"
                        className="text-right focus:bg-yellow-400/10 focus:text-yellow-400"
                      >
                        10 ثانیه
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <label
                    htmlFor="sound"
                    className="text-xs font-medium text-white/70 text-right cursor-pointer"
                  >
                    صدا
                  </label>
                  <div className="flex items-center gap-2">
                    {sound ? (
                      <Volume2 className="h-4 w-4 text-yellow-400" />
                    ) : (
                      <VolumeX className="h-4 w-4 text-slate-500" />
                    )}
                    <Switch
                      id="sound"
                      checked={sound}
                      onCheckedChange={setSound}
                      className="data-[state=checked]:bg-yellow-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !imageSlot.file || !prompt.trim()}
            className="w-full bg-yellow-500 font-bold text-slate-950 hover:bg-yellow-600 h-10 text-sm px-4 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 ml-2 animate-spin" />
                در حال تولید ویدیو...
              </>
            ) : (
              <>
                <Video className="h-5 w-5 ml-2" />
                تولید ویدیو ({requiredCredits} اعتبار)
              </>
            )}
          </Button>
        </form>

        {/* Loading State */}
        {isLoading && (
          <LoadingState
            message="در حال تولید ویدیو هستیم"
            subMessage={
              loadingProgress
                ? `زمان سپری شده: ${loadingProgress.elapsedSeconds} ثانیه`
                : undefined
            }
            numOutputs={1}
          />
        )}

        {/* Generated Videos */}
        {generatedVideos.length > 0 && !isLoading && (
          <div className="space-y-6">
            {/* Main Generated Video */}
            {selectedGenerated && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-semibold text-white/80">
                    ویدیو تولید شده
                  </span>
                </div>

                <div className="relative overflow-hidden rounded-xl border border-yellow-400/30 bg-slate-900/50">
                  <video
                    src={selectedGenerated.url}
                    controls
                    className="w-full h-auto max-h-[600px]"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                variant="outline"
                onClick={() =>
                  selectedGenerated &&
                  handleDownload(selectedGenerated.url, selectedGenerated.id)
                }
                className="border-white/10 text-white/80 hover:border-yellow-400/30 hover:bg-yellow-400/10 hover:text-yellow-400"
              >
                <Upload className="h-5 w-5 ml-2" />
                دانلود ویدیو
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  selectedGenerated &&
                  handleCopyPrompt(
                    selectedGenerated.id,
                    selectedGenerated.prompt
                  )
                }
                className="border-white/10 text-white/80 hover:border-white/30 hover:text-white"
              >
                {copiedId === selectedGenerated?.id ? (
                  <>
                    <Check className="h-5 w-5 ml-2 text-green-400" />
                    کپی شد!
                  </>
                ) : (
                  <>
                    <Video className="h-5 w-5 ml-2" />
                    کپی پرامپت
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Video,
  Upload,
  X,
  Loader2,
  AlertCircle,
  Check,
  Volume2,
  VolumeX,
  Clock,
  Play,
  Download,
  Copy,
  Sparkles,
} from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { VideoLoadingState } from "@/components/dashboard/video-loading-state";
import { InsufficientCreditsDialog } from "@/components/dialog/insufficient-credits-dialog";

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
        const maxSize = 6 * 1024 * 1024;
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
    if (file) {
      handleImageSelect(file);
    }
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
      const formData = new FormData();
      formData.append("image", imageSlot.file);

      const uploadResponse = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      if (uploadResponse.status === 413) {
        throw new Error(
          "حجم فایل خیلی بزرگ است. لطفاً فایلی کوچکتر از 6 مگابایت انتخاب کنید."
        );
      }

      let uploadData;
      try {
        uploadData = await uploadResponse.json();
      } catch (parseError) {
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

      const pollInterval = 2000; // Poll every 2 seconds
      const maxAttempts = 400; // Maximum ~13 minutes (400 * 2 seconds = 800 seconds)
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
        requiredCredits={requiredCredits}
        currentCredits={user.credits}
      />

      {/* Main Input Container */}
      <form onSubmit={handleSubmit}>
        <div className="bg-zinc-900/80 rounded-2xl border border-white/10">
          {/* Image Upload Section */}
          <div className="p-3 sm:p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-3 gap-2">
              <label className="text-sm font-medium text-white/70 text-right">
                تصویر ورودی
              </label>
              <div className="flex items-center gap-1 sm:gap-1.5 rounded-full bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-medium text-yellow-500 shrink-0">
                <Play className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span className="hidden xs:inline">Kling 2.6</span>
                <span className="xs:hidden">K2.6</span>
              </div>
            </div>

            {/* Image Upload Area */}
            {!imageSlot.preview ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-lg sm:rounded-xl border-2 border-dashed transition-all h-[180px] sm:h-[200px] md:h-[220px] active:scale-[0.98] touch-manipulation ${
                  dragging
                    ? "border-yellow-400 bg-yellow-400/10 scale-[1.02]"
                    : "border-white/20 bg-white/5 hover:border-yellow-400/50 hover:bg-white/10"
                }`}
              >
                <Upload
                  className={`h-8 w-8 sm:h-10 sm:w-10 mb-2 sm:mb-3 transition-all ${
                    dragging ? "text-yellow-400 scale-110" : "text-white/40"
                  }`}
                />
                <p className="text-sm sm:text-base font-medium text-white/70 text-center px-4">
                  تصویر را اینجا بکشید یا کلیک کنید
                </p>
                <p className="text-xs text-white/40 mt-1.5">
                  JPG، PNG، WEBP، HEIC (حداکثر 6MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative">
                <div className="relative overflow-hidden rounded-lg sm:rounded-xl border-2 border-yellow-500/30 bg-slate-900/50 w-full aspect-video max-h-[400px]">
                  <img
                    src={imageSlot.preview}
                    alt="Uploaded image"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute left-2 top-2 rounded-full bg-red-500/90 p-2 text-white transition active:bg-red-500 active:scale-110 touch-manipulation sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Prompt Input Area */}
          <div className="p-3 sm:p-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="حرکت را توصیف کنید... مثلاً: دوربین به آرامی زوم می‌کند، باد موها را تکان می‌دهد، آب دریا موج می‌زند..."
              className="w-full bg-transparent text-white placeholder:text-white/40 text-sm sm:text-base resize-none outline-none min-h-[90px] sm:min-h-[80px] md:min-h-[100px] py-1"
              dir="rtl"
              rows={3}
              maxLength={2500}
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-[10px] text-white/30">
                {prompt.length}/2500
              </span>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 pb-3 sm:pb-4 flex-wrap">
            {/* Duration Toggle */}
            <div className="flex items-center rounded-full bg-white/5 p-0.5 border border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setDuration("5")}
                className={`flex items-center gap-1 sm:gap-1.5 rounded-full px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-all touch-manipulation ${
                  duration === "5"
                    ? "bg-yellow-400 text-black"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span>5s</span>
              </button>
              <button
                type="button"
                onClick={() => setDuration("10")}
                className={`flex items-center gap-1 sm:gap-1.5 rounded-full px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-all touch-manipulation ${
                  duration === "10"
                    ? "bg-yellow-400 text-black"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span>10s</span>
              </button>
            </div>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={() => setSound(!sound)}
              className={`flex items-center gap-1 sm:gap-1.5 rounded-full px-2.5 sm:px-3 py-1.5 border transition-all touch-manipulation shrink-0 ${
                sound
                  ? "bg-violet-500/20 border-violet-500/40 text-violet-400"
                  : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              {sound ? (
                <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              ) : (
                <VolumeX className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              )}
              <span className="text-xs sm:text-sm font-medium">
                {sound ? "با صدا" : "بی‌صدا"}
              </span>
            </button>

            {/* Credits indicator */}
            <div className="mr-auto flex items-center gap-1 sm:gap-1.5 bg-yellow-500/10 border border-yellow-500/30 px-2 sm:px-3 py-1.5 rounded-full shrink-0">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-yellow-400" />
              <span className="text-xs sm:text-sm font-semibold text-yellow-400 whitespace-nowrap">
                {requiredCredits} اعتبار
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-4">
          <Button
            type="submit"
            disabled={isLoading || !imageSlot.file || !prompt.trim()}
            className="w-full sm:w-auto sm:ml-auto bg-[#c8ff00] hover:bg-[#b8ef00] text-black font-bold px-6 py-3 sm:py-2 rounded-xl h-12 sm:h-10 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg sm:shadow-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                <span className="text-sm sm:text-base">در حال تولید...</span>
              </>
            ) : (
              <>
                <Video className="h-4 w-4 ml-2" />
                <span className="text-sm sm:text-base font-bold">
                  تولید ویدیو
                </span>
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Loading State */}
      {isLoading && (
        <div className="mt-6 sm:mt-8">
          <VideoLoadingState
            message="در حال ساخت ویدیو"
            elapsedSeconds={loadingProgress?.elapsedSeconds ?? 0}
            duration={duration}
            hasSound={sound}
          />
        </div>
      )}

      {/* Generated Video Result */}
      {generatedVideos.length > 0 && !isLoading && selectedGenerated && (
        <div className="mt-6 sm:mt-8 space-y-4">
          {/* Video Preview Card */}
          <div className="bg-zinc-900/80 rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden">
            <div className="relative">
              <video
                src={selectedGenerated.url}
                controls
                autoPlay
                loop
                className="w-full h-auto max-h-[400px] sm:max-h-[500px] object-contain bg-black"
              />
            </div>

            {/* Video Actions */}
            <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 border-t border-white/10">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleDownload(selectedGenerated.url, selectedGenerated.id)
                }
                className="w-full sm:flex-1 border-white/10 text-white/80 hover:border-yellow-400/30 hover:bg-yellow-400/10 hover:text-yellow-400 rounded-xl h-10 touch-manipulation"
              >
                <Download className="h-4 w-4 ml-2" />
                دانلود
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleCopyPrompt(
                    selectedGenerated.id,
                    selectedGenerated.prompt
                  )
                }
                className="w-full sm:flex-1 border-white/10 text-white/80 hover:border-white/30 hover:text-white rounded-xl h-10 touch-manipulation"
              >
                {copiedId === selectedGenerated.id ? (
                  <>
                    <Check className="h-4 w-4 ml-2 text-green-400" />
                    کپی شد!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 ml-2" />
                    کپی پرامپت
                  </>
                )}
              </Button>

              {/* Video info - Mobile */}
              <div className="flex sm:hidden items-center justify-center gap-2 text-xs text-white/40 pt-1">
                <span>{duration} ثانیه</span>
                <span>•</span>
                <span>{sound ? "با صدا" : "بی‌صدا"}</span>
              </div>
              {/* Video info - Desktop */}
              <div className="mr-auto hidden sm:flex items-center gap-2 text-xs text-white/40">
                <span>{duration} ثانیه</span>
                <span>•</span>
                <span>{sound ? "با صدا" : "بی‌صدا"}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

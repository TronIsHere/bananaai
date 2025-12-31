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
  Check,
} from "lucide-react";
import { STYLE_PRESETS, IMAGE_SIZES } from "@/lib/data";
import { GeneratedImage } from "@/types/dashboard-types";
import { GeneratedImageDisplay } from "@/components/dashboard/generated-image-display";
import { LoadingState } from "@/components/dashboard/loading-state";
import { useUser } from "@/hooks/use-user";
import { InsufficientCreditsDialog } from "@/components/dialog/insufficient-credits-dialog";
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

interface ImageSlot {
  file: File | null;
  preview: string | null;
}

export default function ImageToImagePage() {
  const [prompt, setPrompt] = useState("");
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);

  // Manage two image slots
  const [imageSlots, setImageSlots] = useState<[ImageSlot, ImageSlot]>([
    { file: null, preview: null },
    { file: null, preview: null },
  ]);

  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // Dragging state for each slot: 0, 1, or -1 (none)
  const [draggingSlot, setDraggingSlot] = useState<number>(-1);
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

  const { user, refreshUserData } = useUser();
  const [numOutputs] = useState(1);
  const [imageSize, setImageSize] = useState("1:1");
  const [isPro, setIsPro] = useState(true);

  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([null, null]);

  // Check if user has access to image size selection (creator or studio plans)
  const canSelectImageSize =
    user.currentPlan === "creator" || user.currentPlan === "studio";
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

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

  const handleImageSelect = (file: File, index: number) => {
    if (file) {
      // Check if file is an image by MIME type or extension (for HEIC support)
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
          setImageSlots((prev) => {
            const newSlots = [...prev] as [ImageSlot, ImageSlot];
            newSlots[index] = {
              file: file,
              preview: reader.result as string,
            };
            return newSlots;
          });
          setGeneratedImages([]);
          setSelectedGenerated(null);
          setError(null);
        };
        reader.readAsDataURL(file);
      } else {
        setError("فرمت فایل نامعتبر است. فقط JPG، PNG، WEBP و HEIC مجاز است");
      }
    }
  };

  const handleFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (file) handleImageSelect(file, index);
  };

  const handleDrop = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDraggingSlot(-1);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageSelect(file, index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDraggingSlot(index);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDraggingSlot(-1);
  }, []);

  const handleRemoveImage = (index: number) => {
    setImageSlots((prev) => {
      const newSlots = [...prev] as [ImageSlot, ImageSlot];
      newSlots[index] = { file: null, preview: null };
      return newSlots;
    });
    setGeneratedImages([]);
    setSelectedGenerated(null);
    setError(null);
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]!.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if at least one image is selected
    const activeImages = imageSlots.filter((slot) => slot.file !== null);

    if (activeImages.length === 0 || !prompt.trim()) {
      setError("لطفاً حداقل یک تصویر و متن توصیفی را وارد کنید");
      return;
    }

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
      // Step 1: Upload images to get public URLs
      const uploadedUrls: string[] = [];

      for (const slot of activeImages) {
        if (!slot.file) continue;

        const formData = new FormData();
        formData.append("image", slot.file);

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

        uploadedUrls.push(uploadData.url);
      }

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
          imageUrls: uploadedUrls, // Array of input image URLs
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
          data.error === "اعتبار ناکافی" ||
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
        let errorMessage = data.message || data.error || "خطا در تولید تصویر";
        // Check for pattern matching error and replace with user-friendly message
        if (
          errorMessage.toLowerCase().includes("string") &&
          (errorMessage.toLowerCase().includes("pattern") ||
            errorMessage.toLowerCase().includes("matched"))
        ) {
          errorMessage = "مشکلی پیش امده لطفا دوباره امتحان کنید";
        }
        throw new Error(errorMessage);
      }

      if (!data.success || !data.taskId) {
        throw new Error(data.message || "خطا در ثبت درخواست تولید تصویر");
      }

      const taskId = data.taskId;

      // Step 3: Poll for task completion
      const pollInterval = 1500; // Poll every 1.5 seconds
      const maxAttempts = 120; // Maximum 2 minutes (80 * 1.5 seconds)
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
            let errorMessage =
              statusData.error || "تولید تصویر با خطا مواجه شد";
            // Check for pattern matching error and replace with user-friendly message
            if (
              errorMessage.toLowerCase().includes("string") &&
              (errorMessage.toLowerCase().includes("pattern") ||
                errorMessage.toLowerCase().includes("matched"))
            ) {
              errorMessage = "مشکلی پیش امده لطفا دوباره امتحان کنید";
            }
            throw new Error(errorMessage);
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
          let errorMessage = err.message || "خطا در بررسی وضعیت تولید تصویر";
          // Check for pattern matching error and replace with user-friendly message
          if (
            errorMessage.toLowerCase().includes("string") &&
            (errorMessage.toLowerCase().includes("pattern") ||
              errorMessage.toLowerCase().includes("matched"))
          ) {
            errorMessage = "مشکلی پیش امده لطفا دوباره امتحان کنید";
          }
          setError(errorMessage);
        }
      };

      // Start polling immediately
      pollTaskStatus();
    } catch (err: any) {
      console.error("Error generating image:", err);
      let errorMessage =
        err.message || "خطا در تولید تصویر. لطفاً دوباره تلاش کنید.";
      // Check for pattern matching error and replace with user-friendly message
      if (
        errorMessage.toLowerCase().includes("string") &&
        (errorMessage.toLowerCase().includes("pattern") ||
          errorMessage.toLowerCase().includes("matched"))
      ) {
        errorMessage = "مشکلی پیش امده لطفا دوباره امتحان کنید";
      }
      setError(errorMessage);
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
    // Set reuse image to the first empty slot or replace the first one
    setImageSlots((prev) => {
      const newSlots = [...prev] as [ImageSlot, ImageSlot];
      if (!newSlots[0].file) {
        // If slot 1 is empty (or we just want to use URL), we can't easily convert URL to File
        // for re-upload. But 'handleReuse' usually implies using the generated image as input.
        // Since we need a File object for upload in the current flow (to get URL via our upload API),
        // OR we can change the logic to support direct URLs.
        // For now, we can fetch the image and convert to blob/file to reuse it.
        // But simpler approach for now: just warn or try to fetch.
        // Let's try to fetch the image blob.
        return newSlots;
      }
      return newSlots;
    });

    // Implementation of handleReuse needs to fetch the blob to populate the file input
    // or we update the logic to accept URLs directly.
    // For now, let's implement a fetch to blob.
    fetch(imageUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "generated-image.png", {
          type: "image/png",
        });
        handleImageSelect(file, 0);
      })
      .catch((err) => console.error("Failed to load image for reuse", err));
  };

  const activeImagesCount = imageSlots.filter((s) => s.file).length;

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

      {/* Main Input Container */}
      <form onSubmit={handleSubmit}>
        <div className="bg-zinc-900/80 rounded-2xl border border-white/10">
          {/* Image Upload Section */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-white/70 text-right">
                تصاویر ورودی
              </label>
              <span className="text-xs text-white/50 bg-white/5 px-2 py-0.5 rounded-full">
                {activeImagesCount}/2
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[0, 1].map((index) => (
                <div key={index} className="relative">
                  {!imageSlots[index].preview ? (
                    <div
                      onDrop={(e) => handleDrop(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onClick={() => fileInputRefs.current[index]?.click()}
                      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all h-[120px] active:scale-[0.98] ${
                        draggingSlot === index
                          ? "border-yellow-400 bg-yellow-400/10 scale-[1.02]"
                          : "border-white/20 bg-white/5 hover:border-yellow-400/50 hover:bg-white/10"
                      }`}
                    >
                      <Upload
                        className={`h-6 w-6 mb-1 transition-all ${
                          draggingSlot === index
                            ? "text-yellow-400 scale-110"
                            : "text-white/40"
                        }`}
                      />
                      <p className="text-xs font-medium text-white/60 text-center px-2">
                        {index === 0 ? "تصویر اصلی" : "تصویر دوم (اختیاری)"}
                      </p>
                      <input
                        ref={(el) => {
                          fileInputRefs.current[index] = el;
                        }}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileInputChange(e, index)}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="relative group h-[120px]">
                      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/50 w-full h-full">
                        <img
                          src={imageSlots[index].preview!}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute left-2 top-2 rounded-full bg-red-500/90 p-1.5 text-white transition hover:bg-red-500 hover:scale-110 opacity-0 group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Prompt Input Area */}
          <div className="p-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="چه تغییراتی می‌خواهید اعمال شود؟ مثلاً: به سبک نقاشی رنگ روغن، افزودن نور غروب..."
              className="w-full bg-transparent text-white placeholder:text-white/40 text-base resize-none outline-none min-h-[60px] md:min-h-[80px] py-1"
              dir="rtl"
              rows={2}
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
          </div>
        </div>

        {/* Bottom Action Bar - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-4">
          {/* Mobile: Full width Generate button, Desktop: Auto width */}
          <Button
            type="submit"
            disabled={isLoading || activeImagesCount === 0 || !prompt.trim()}
            className="w-full sm:w-auto sm:ml-auto bg-[#c8ff00] hover:bg-[#b8ef00] text-black font-bold px-6 py-3 sm:py-2 rounded-xl h-12 sm:h-10 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg sm:shadow-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                <span className="text-sm sm:text-base">در حال تولید...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 ml-2" />
                <span className="text-sm sm:text-base font-bold">تولید</span>
                <span className="text-black/60 text-xs sm:text-sm mr-2">
                  {creditCost * numOutputs} اعتبار
                </span>
              </>
            )}
          </Button>
        </div>
      </form>

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
            onReuse={handleReuse}
            copiedId={copiedId}
          />
        </div>
      )}
    </div>
  );
}

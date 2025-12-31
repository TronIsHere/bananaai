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
  Check,
  Plus,
} from "lucide-react";
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
  const [insufficientCreditsMessage, setInsufficientCreditsMessage] =
    useState<string | undefined>();

  const { user, refreshUserData } = useUser();
  const [numOutputs] = useState(1);
  const [imageSize, setImageSize] = useState("16:9");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isPro, setIsPro] = useState(true);

  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([null, null]);

  // Check if user has access to image size selection (creator or studio plans)
  const canSelectImageSize =
    user.currentPlan === "creator" || user.currentPlan === "studio";
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

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
      const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];
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

  const applyPreset = (preset: (typeof STYLE_PRESETS)[0]) => {
    if (selectedStyleId === preset.id) {
      setSelectedStyleId(null);
    } else {
      setSelectedStyleId(preset.id);
    }
  };

  const activeImagesCount = imageSlots.filter((s) => s.file).length;

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
              تصاویر خود را با استفاده از هوش مصنوعی ترکیب یا ویرایش کنید
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
          requiredCredits={isPro ? 24 : 4}
          currentCredits={user.credits}
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mode Selection - Compact & Top */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white/90 block text-right">
              مدل انتخابی
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Standard Mode */}
              <div
                onClick={() => setIsPro(false)}
                className={`cursor-pointer relative rounded-xl border p-3 transition-all duration-200 ${
                  !isPro
                    ? "border-cyan-500 bg-cyan-500/10"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-lg ${
                        !isPro ? "bg-cyan-500/20" : "bg-white/10"
                      }`}
                    >
                      <Sparkles
                        className={`h-4 w-4 ${
                          !isPro ? "text-cyan-400" : "text-white/70"
                        }`}
                      />
                    </div>
                    <div>
                      <h3
                        className={`font-bold text-sm ${
                          !isPro ? "text-white" : "text-white/80"
                        }`}
                      >
                        استاندارد
                      </h3>
                      <div className="flex items-center gap-1 text-cyan-300 text-[10px] font-medium">
                        <span className="font-bold">۴</span>
                        <span>اعتبار</span>
                      </div>
                    </div>
                  </div>
                  {/* Checkmark */}
                  {!isPro && (
                    <div className="h-5 w-5 rounded-full bg-cyan-500 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Pro Mode */}
              <div
                onClick={() => setIsPro(true)}
                className={`cursor-pointer relative rounded-xl border p-3 transition-all duration-200 ${
                  isPro
                    ? "border-yellow-400 bg-yellow-400/10 shadow-[0_0_15px_-5px_rgba(250,204,21,0.3)]"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                {/* Badge */}
                <div className="absolute -top-2 right-3 px-1.5 py-0.5 bg-linear-to-r from-yellow-400 to-orange-500 rounded-full text-[8px] font-bold text-black shadow-sm">
                  PRO
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isPro ? "bg-yellow-400/20" : "bg-white/10"
                      }`}
                    >
                      <Zap
                        className={`h-4 w-4 ${
                          isPro ? "text-yellow-400" : "text-white/70"
                        }`}
                      />
                    </div>
                    <div>
                      <h3
                        className={`font-bold text-sm ${
                          isPro ? "text-white" : "text-white/80"
                        }`}
                      >
                        نانو بنانا پرو
                      </h3>
                      <div className="flex items-center gap-1 text-yellow-400 text-[10px] font-medium">
                        <span className="font-bold">۲۴</span>
                        <span>اعتبار</span>
                      </div>
                    </div>
                  </div>
                  {/* Checkmark */}
                  {isPro && (
                    <div className="h-5 w-5 rounded-full bg-yellow-400 flex items-center justify-center">
                      <Check className="h-3 w-3 text-black" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-5">
            {/* Image Upload Section - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-white/90 text-right">
                  تصاویر ورودی
                </label>
                <span className="text-xs text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                  {activeImagesCount}/2
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {[0, 1].map((index) => (
                  <div key={index} className="relative">
                    {!imageSlots[index].preview ? (
                      <div
                        onDrop={(e) => handleDrop(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRefs.current[index]?.click()}
                        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all h-[140px] active:scale-[0.98] ${
                          draggingSlot === index
                            ? "border-yellow-400 bg-yellow-400/10 scale-[1.02]"
                            : "border-white/20 bg-white/5 hover:border-yellow-400/50 hover:bg-white/10"
                        }`}
                      >
                        <div className="text-center p-2">
                          <Upload
                            className={`mx-auto mb-2 h-8 w-8 transition-all ${
                              draggingSlot === index
                                ? "text-yellow-400 scale-110"
                                : "text-slate-400"
                            }`}
                          />
                          <p className="text-xs font-semibold text-white/80">
                            {index === 0 ? "تصویر اصلی" : "تصویر دوم (اختیاری)"}
                          </p>
                        </div>
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
                      <div className="relative group h-[140px]">
                        <div className="relative overflow-hidden rounded-xl border-2 border-white/10 bg-slate-900/50 w-full h-full">
                          <img
                            src={imageSlots[index].preview!}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-contain"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute left-2 top-2 rounded-full bg-red-500/90 p-1.5 text-white transition hover:bg-red-500 hover:scale-110"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <div className="absolute bottom-2 right-2 rounded-lg bg-slate-950/90 px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                            {index === 0 ? "تصویر اصلی" : "تصویر دوم"}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {activeImagesCount === 0 && (
                <div className="text-xs text-slate-400 text-center bg-blue-500/5 border border-blue-500/10 p-3 rounded-lg">
                  <p>برای شروع حداقل یک تصویر انتخاب کنید</p>
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
                  placeholder="مثلاً: به سبک نقاشی رنگ روغن، افزودن نور غروب، ترکیب دو تصویر..."
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
                    <div className="flex items-center gap-1">
                      <Settings className="h-4 w-4" />
                      <span>تنظیمات پیشرفته</span>
                    </div>
                    {(selectedStyleId ||
                      (canSelectImageSize && imageSize !== "16:9")) && (
                      <span className="flex h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
                    )}
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
            disabled={isLoading || activeImagesCount === 0 || !prompt.trim()}
            className="w-full bg-yellow-500 font-bold text-slate-950 hover:bg-yellow-600 h-10 text-sm px-4 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 ml-2 animate-spin" />
                در حال پردازش {activeImagesCount} تصویر...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 ml-2" />
                تبدیل تصاویر
              </>
            )}
          </Button>
        </form>

        {/* Loading State */}
        {isLoading && (
          <LoadingState
            message="در حال آماده‌سازی عکس‌ها هستیم"
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

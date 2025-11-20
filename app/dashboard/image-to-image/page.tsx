"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { 
  Image as ImageIcon, 
  Upload, 
  X, 
  Loader2, 
  Sparkles,
  Palette,
  Wand2,
  Zap
} from "lucide-react";
import { GeneratedImage } from "@/types/dashboard-types";
import { GeneratedImageDisplay } from "@/components/dashboard/generated-image-display";
import { LoadingState } from "@/components/dashboard/loading-state";

const STYLE_PRESETS = [
  { id: "oil-painting", name: "نقاشی رنگ روغن", icon: Palette, prompt: "oil painting style, artistic brushstrokes" },
  { id: "cartoon", name: "کارتونی", icon: Sparkles, prompt: "cartoon style, animated, vibrant colors" },
  { id: "sketch", name: "طراحی", icon: Wand2, prompt: "pencil sketch, hand-drawn, artistic" },
  { id: "vintage", name: "قدیمی", icon: Zap, prompt: "vintage style, retro, aged photo effect" },
  { id: "cyberpunk", name: "سایبرپانک", icon: Zap, prompt: "cyberpunk style, neon lights, futuristic" },
  { id: "watercolor", name: "آبرنگ", icon: Palette, prompt: "watercolor painting, soft colors, artistic" },
];

export default function ImageToImagePage() {
  const [prompt, setPrompt] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedGenerated, setSelectedGenerated] = useState<GeneratedImage | null>(null);
  
  const [numOutputs] = useState(1);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setGeneratedImages([]);
        setSelectedGenerated(null);
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
    setGeneratedImages([]);
    setSelectedGenerated(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage || !prompt.trim()) return;

    setIsLoading(true);
    
    // Simulate API call with multiple outputs
    setTimeout(() => {
      const newImages: GeneratedImage[] = Array.from({ length: numOutputs }, (_, i) => ({
        id: `${Date.now()}-${i}`,
        url: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='512' height='512'%3E%3Crect fill='%23${['1e293b', '334155', '475569'][i % 3]}' width='512' height='512'/%3E%3Ctext x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' fill='%23fbbf24' font-size='16' font-family='Arial'%3Eتصویر پردازش شده ${i + 1}%3C/text%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' fill='%23cbd5e1' font-size='12' font-family='Arial'%3E${prompt.substring(0, 20)}...%3C/text%3E%3C/svg%3E`,
        timestamp: new Date(),
        prompt: prompt,
      }));
      setGeneratedImages(newImages);
      setSelectedGenerated(newImages[0]);
      setIsLoading(false);
    }, 3000);
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

  const applyPreset = (preset: typeof STYLE_PRESETS[0]) => {
    setPrompt(preset.prompt);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-pink-500/20">
            <ImageIcon className="h-6 w-6 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white">تصویر به تصویر</h1>
            <p className="text-slate-400">تبدیل و پردازش تصویر با هوش مصنوعی پیشرفته</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-5">
            {/* Image Upload Section - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-3">
              <label className="text-sm font-semibold text-white/80 block text-right">
                آپلود تصویر اولیه
              </label>
              
              {!selectedImage ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all h-[400px] ${
                    isDragging
                      ? "border-yellow-400 bg-yellow-400/10 scale-[1.02]"
                      : "border-white/20 bg-white/5 hover:border-yellow-400/50 hover:bg-white/10"
                  }`}
                >
                  <div className="text-center p-8">
                    <Upload className={`mx-auto mb-4 h-16 w-16 transition-all ${isDragging ? 'text-yellow-400 scale-110' : 'text-slate-400'}`} />
                    <p className="mb-2 text-base font-semibold text-white">
                      {isDragging ? "رها کنید!" : "کلیک کنید یا تصویر را بکشید"}
                    </p>
                    <p className="text-sm text-slate-400 mb-4">
                      فرمت‌های پشتیبانی شده: JPG, PNG, GIF, WEBP
                    </p>
                    <div className="inline-flex items-center gap-2 rounded-lg bg-yellow-400/10 px-4 py-2 text-xs text-yellow-400">
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
                  <div className="relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/50">
                    <img
                      src={selectedImage}
                      alt="Selected"
                      className="w-full object-contain h-[400px]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute left-3 top-3 rounded-full bg-red-500/90 p-2 text-white transition hover:bg-red-500 hover:scale-110"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-3 right-3 rounded-lg bg-slate-950/90 px-3 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      تصویر اصلی
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Prompt and Settings Section - Takes 3 columns */}
            <div className="lg:col-span-3 space-y-4">
              {/* Prompt */}
              <div className="space-y-2">
                <label
                  htmlFor="prompt"
                  className="text-sm font-semibold text-white/80 block text-right"
                >
                  متن توصیفی تغییرات
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="چه تغییراتی می‌خواهید در تصویر اعمال شود؟ مثلاً: به سبک نقاشی رنگ روغن، افزودن نور غروب، تبدیل به سیاه و سفید..."
                  className="w-full rounded-lg border border-white/10 bg-white/5 p-4 text-right text-white placeholder:text-white/30 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 min-h-[140px] resize-none"
                  dir="rtl"
                />
              </div>

              {/* Style Presets */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/80 block text-right">
                  سبک‌های پیشنهادی
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {STYLE_PRESETS.map((preset) => {
                    const Icon = preset.icon;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 transition hover:border-yellow-400/30 hover:bg-yellow-400/10 hover:text-yellow-400"
                      >
                        <Icon className="h-3 w-3" />
                        <span>{preset.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !selectedImage || !prompt.trim()}
            className="w-full bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 font-bold text-slate-950 shadow-[0_10px_35px_rgba(251,191,36,0.35)] hover:scale-[1.02] hover:opacity-90 h-14 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 ml-2 animate-spin" />
                در حال پردازش تصویر...
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
            message="در حال پردازش تصویر..."
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


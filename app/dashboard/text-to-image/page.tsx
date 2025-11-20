"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Download, 
  Loader2, 
  Palette,
  Wand2,
  Zap,
  Image as ImageIcon
} from "lucide-react";
import { demoPrompts } from "@/lib/data";
import { GeneratedImage } from "@/types/dashboard-types";
import { GeneratedImageDisplay } from "@/components/dashboard/generated-image-display";
import { LoadingState } from "@/components/dashboard/loading-state";

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
  
  const [numOutputs] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setGeneratedImages([]);
    setSelectedGenerated(null);
    
    // Simulate API call with multiple outputs
    setTimeout(() => {
      const newImages: GeneratedImage[] = Array.from({ length: numOutputs }, (_, i) => ({
        id: `${Date.now()}-${i}`,
        url: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='512' height='512'%3E%3Crect fill='%23${['1e293b', '334155', '475569'][i % 3]}' width='512' height='512'/%3E%3Ctext x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' fill='%23fbbf24' font-size='16' font-family='Arial'%3Eتصویر تولید شده ${i + 1}%3C/text%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' fill='%23cbd5e1' font-size='12' font-family='Arial'%3E${prompt.substring(0, 20)}...%3C/text%3E%3C/svg%3E`,
        timestamp: new Date(),
        prompt: prompt,
      }));
      setGeneratedImages(newImages);
      setSelectedGenerated(newImages[0]);
      setIsLoading(false);
    }, 3000);
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
    setPrompt(preset.prompt);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-pink-500/20">
            <Sparkles className="h-6 w-6 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white">متن به تصویر</h1>
            <p className="text-slate-400">تولید تصویر از متن با هوش مصنوعی پیشرفته</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
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
                className="w-full rounded-lg border border-white/10 bg-white/5 p-4 text-right text-white placeholder:text-white/30 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 min-h-[180px] resize-none"
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

          <Button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="w-full bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 font-bold text-slate-950 shadow-[0_10px_35px_rgba(251,191,36,0.35)] hover:scale-[1.02] hover:opacity-90 h-14 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
            message="در حال تولید تصویر..."
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

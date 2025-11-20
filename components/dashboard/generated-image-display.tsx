"use client";

import { Image as ImageIcon, Download, Copy, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GeneratedImage } from "@/types/dashboard-types";

interface GeneratedImageDisplayProps {
  generatedImages: GeneratedImage[];
  selectedGenerated: GeneratedImage | null;
  onSelectImage: (image: GeneratedImage) => void;
  onDownload: (imageUrl: string, id: string) => void;
  onCopyPrompt: (id: string, text: string) => void;
  onReuse?: (imageUrl: string) => void;
  copiedId: string | null;
}

export function GeneratedImageDisplay({
  generatedImages,
  selectedGenerated,
  onSelectImage,
  onDownload,
  onCopyPrompt,
  onReuse,
  copiedId,
}: GeneratedImageDisplayProps) {
  if (generatedImages.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* Main Generated Image */}
      {selectedGenerated && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-semibold text-white/80">تصویر تولید شده</span>
          </div>
          
          <div className="relative overflow-hidden rounded-xl border border-yellow-400/30 bg-slate-900/50">
            <img
              src={selectedGenerated.url}
              alt="Generated"
              className="w-full h-auto object-contain max-h-[600px]"
            />
          </div>
        </div>
      )}

      {/* Thumbnails Grid */}
      {generatedImages.length > 1 && (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-white/80 block text-right">
            تمام نتایج ({generatedImages.length})
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {generatedImages.map((img, index) => (
              <div
                key={img.id}
                onClick={() => onSelectImage(img)}
                className={`group relative cursor-pointer overflow-hidden rounded-lg transition-all ${
                  selectedGenerated?.id === img.id
                    ? "ring-2 ring-yellow-400 scale-105"
                    : "ring-1 ring-white/10 hover:ring-yellow-400/50"
                }`}
              >
                <img
                  src={img.url}
                  alt={`Generated ${index + 1}`}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-2 right-2 rounded-full bg-yellow-400 px-2 py-1 text-xs font-bold text-slate-950">
                  #{index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Button
          variant="outline"
          onClick={() => selectedGenerated && onDownload(selectedGenerated.url, selectedGenerated.id)}
          className="border-white/10 text-white/80 hover:border-yellow-400/30 hover:bg-yellow-400/10 hover:text-yellow-400"
        >
          <Download className="h-5 w-5 ml-2" />
          دانلود تصویر
        </Button>
        <Button
          variant="outline"
          onClick={() => selectedGenerated && onCopyPrompt(selectedGenerated.id, selectedGenerated.prompt)}
          className="border-white/10 text-white/80 hover:border-white/30 hover:text-white"
        >
          {copiedId === selectedGenerated?.id ? (
            <>
              <Check className="h-5 w-5 ml-2 text-green-400" />
              کپی شد!
            </>
          ) : (
            <>
              <Copy className="h-5 w-5 ml-2" />
              کپی پرامپت
            </>
          )}
        </Button>
        {onReuse && selectedGenerated && (
          <Button
            variant="outline"
            onClick={() => onReuse(selectedGenerated.url)}
            className="border-white/10 text-white/80 hover:border-pink-400/30 hover:bg-pink-400/10 hover:text-pink-400"
          >
            <RefreshCw className="h-5 w-5 ml-2" />
            استفاده مجدد
          </Button>
        )}
      </div>
    </div>
  );
}


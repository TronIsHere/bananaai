"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Image, Upload, X } from "lucide-react";

export default function ImageToTextPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [outputText, setOutputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setOutputText("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) return;

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setOutputText("متن استخراج شده از تصویر:\n\nاین یک نمونه متن استخراج شده است. در نسخه واقعی، این متن از تصویر شما استخراج می‌شود.");
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-pink-500/20">
            <Image className="h-6 w-6 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white">تصویر به متن</h1>
            <p className="text-slate-400">استخراج متن از تصاویر با OCR</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white/80 block text-right">
              آپلود تصویر
            </label>
            
            {!selectedImage ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/20 bg-white/5 p-12 transition-all hover:border-yellow-400/50 hover:bg-white/10"
              >
                <Upload className="mb-4 h-12 w-12 text-slate-400" />
                <p className="mb-2 text-sm font-semibold text-white">
                  کلیک کنید یا تصویر را بکشید
                </p>
                <p className="text-xs text-slate-400">
                  فرمت‌های پشتیبانی شده: JPG, PNG, GIF
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative">
                <div className="relative overflow-hidden rounded-lg border border-white/10">
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="w-full object-contain max-h-[400px]"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute left-4 top-4 rounded-full bg-red-500/90 p-2 text-white transition hover:bg-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading || !selectedImage}
            className="w-full bg-yellow-500 font-bold text-slate-950 hover:bg-yellow-600 h-10 text-sm px-4 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              "در حال استخراج متن..."
            ) : (
              <>
                <Image className="h-5 w-5 ml-2" />
                استخراج متن از تصویر
              </>
            )}
          </Button>
        </form>

        {outputText && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white/80 block text-right">
              متن استخراج شده
            </label>
            <div className="rounded-lg border border-white/10 bg-slate-900/50 p-4 text-right text-white min-h-[200px] whitespace-pre-wrap">
              {outputText}
            </div>
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(outputText);
              }}
              className="w-full border-white/10 text-white/80 hover:border-white/30 hover:text-white"
            >
              کپی کردن متن
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}


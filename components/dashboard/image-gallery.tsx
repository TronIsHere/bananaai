"use client";

import { useState } from "react";
import { Image as ImageIcon, Download, Copy, Check, Trash2, X, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GeneratedImage } from "@/types/dashboard-types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ImageGalleryProps {
  images: GeneratedImage[];
  onDelete?: (imageId: string) => void;
  onDownload?: (imageUrl: string, id: string) => void;
}

export function ImageGallery({ images, onDelete, onDownload }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleImageClick = (image: GeneratedImage) => {
    setSelectedImage(image);
    setIsDialogOpen(true);
  };

  const handleDownload = (imageUrl: string, id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (onDownload) {
      onDownload(imageUrl, id);
    } else {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `bananaai-image-${id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCopyPrompt = (id: string, text: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (imageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(imageId);
      if (selectedImage?.id === imageId) {
        setIsDialogOpen(false);
        setSelectedImage(null);
      }
    }
  };

  const formatDate = (date: Date) => {
    try {
      return new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      // Fallback to default locale if Persian locale is not available
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    }
  };

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-800/50">
          <ImageIcon className="h-10 w-10 text-slate-600" />
        </div>
        <h3 className="mb-2 text-xl font-bold text-white">هیچ تصویری یافت نشد</h3>
        <p className="text-slate-400">شما هنوز تصویری تولید نکرده‌اید</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {images.map((image) => (
          <div
            key={image.id}
            onClick={() => handleImageClick(image)}
            className="group relative cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-slate-900/50 transition-all hover:border-yellow-400/30 hover:shadow-[0_0_20px_rgba(251,191,36,0.15)]"
          >
            <div className="aspect-square overflow-hidden">
              <img
                src={image.url}
                alt={image.prompt.substring(0, 30)}
                className="h-full w-full object-cover transition-transform group-hover:scale-110"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="mb-1 line-clamp-2 text-xs text-white">
                  {image.prompt.substring(0, 50)}
                  {image.prompt.length > 50 && "..."}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(image.timestamp)}</span>
                </div>
              </div>
            </div>
            <div className="absolute top-2 left-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 md:opacity-0">
              <button
                onClick={(e) => handleDownload(image.url, image.id, e)}
                className="rounded-lg bg-slate-900/90 p-1.5 text-white transition active:scale-95 hover:bg-yellow-400 hover:text-slate-950"
                title="دانلود"
              >
                <Download className="h-3 w-3" />
              </button>
              {onDelete && (
                <button
                  onClick={(e) => handleDelete(image.id, e)}
                  className="rounded-lg bg-slate-900/90 p-1.5 text-white transition active:scale-95 hover:bg-red-500"
                  title="حذف"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Image Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl bg-slate-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-right text-white">جزئیات تصویر</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-xl border border-white/10 bg-slate-800/50">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.prompt}
                  className="w-full h-auto max-h-[600px] object-contain mx-auto"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2 rounded-lg bg-slate-800/50 p-3">
                  <FileText className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0 md:h-5 md:w-5" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-white/80 mb-1 md:text-sm">پرامپت:</p>
                    <p className="text-xs text-white/90 text-right md:text-sm">{selectedImage.prompt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-slate-800/50 p-3">
                  <Calendar className="h-4 w-4 text-yellow-400 flex-shrink-0 md:h-5 md:w-5" />
                  <div>
                    <p className="text-xs font-semibold text-white/80 mb-1 md:text-sm">تاریخ تولید:</p>
                    <p className="text-xs text-white/90 md:text-sm">{formatDate(selectedImage.timestamp)}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:gap-3">
                <Button
                  onClick={() => handleDownload(selectedImage.url, selectedImage.id)}
                  className="flex-1 border-white/10 text-white/80 active:scale-95 hover:border-yellow-400/30 hover:bg-yellow-400/10 hover:text-yellow-400"
                >
                  <Download className="h-4 w-4 ml-2 md:h-5 md:w-5" />
                  دانلود تصویر
                </Button>
                <Button
                  onClick={() => handleCopyPrompt(selectedImage.id, selectedImage.prompt)}
                  variant="outline"
                  className="flex-1 border-white/10 text-white/80 active:scale-95 hover:border-white/30 hover:text-white"
                >
                  {copiedId === selectedImage.id ? (
                    <>
                      <Check className="h-4 w-4 ml-2 text-green-400 md:h-5 md:w-5" />
                      کپی شد!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 ml-2 md:h-5 md:w-5" />
                      کپی پرامپت
                    </>
                  )}
                </Button>
                {onDelete && (
                  <Button
                    onClick={(e) => handleDelete(selectedImage.id, e)}
                    variant="outline"
                    className="flex-1 border-white/10 text-white/80 active:scale-95 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 sm:flex-1"
                  >
                    <Trash2 className="h-4 w-4 ml-2 md:h-5 md:w-5" />
                    حذف
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}


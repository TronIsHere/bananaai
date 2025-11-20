"use client";

import { useState, useEffect } from "react";
import { History, Trash2, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GeneratedImage } from "@/types/dashboard-types";
import { ImageGallery } from "@/components/dashboard/image-gallery";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function HistoryPage() {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<GeneratedImage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/user/history");
      
      if (!response.ok) {
        throw new Error("Failed to fetch history");
      }
      
      const history = await response.json();
      // Convert timestamp strings to Date objects
      const formattedHistory = history.map((img: any) => ({
        ...img,
        timestamp: new Date(img.timestamp),
      }));
      
      setImages(formattedHistory);
      setFilteredImages(formattedHistory);
    } catch (err) {
      console.error("Error fetching history:", err);
      setError("خطا در بارگذاری تاریخچه");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredImages(images);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = images.filter(
      (img) =>
        img.prompt.toLowerCase().includes(query) ||
        img.id.toLowerCase().includes(query)
    );
    setFilteredImages(filtered);
  }, [searchQuery, images]);

  const handleDelete = async (imageId: string) => {
    try {
      const response = await fetch(`/api/user/history/${imageId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete image");
      }
      
      // Update local state
      const updatedImages = images.filter((img) => img.id !== imageId);
      setImages(updatedImages);
      setFilteredImages(updatedImages.filter((img) => 
        !searchQuery.trim() || 
        img.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        img.id.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    } catch (err) {
      console.error("Error deleting image:", err);
      setError("خطا در حذف تصویر");
    }
  };

  const handleClearAll = async () => {
    try {
      const response = await fetch("/api/user/history", {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to clear history");
      }
      
      setImages([]);
      setFilteredImages([]);
      setIsClearDialogOpen(false);
    } catch (err) {
      console.error("Error clearing history:", err);
      setError("خطا در پاک کردن تاریخچه");
    }
  };

  const handleDownload = (imageUrl: string, id: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `bananaai-image-${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-slate-400">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-red-400">{error}</p>
          <Button onClick={fetchHistory} variant="outline">
            تلاش مجدد
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 md:mb-8">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-pink-500/20 md:h-12 md:w-12">
              <History className="h-5 w-5 text-yellow-400 md:h-6 md:w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white md:text-4xl">تاریخچه تصاویر</h1>
              <p className="text-xs text-slate-400 md:text-base">
                تمام تصاویر تولید شده شما ({images.length} تصویر)
              </p>
            </div>
          </div>
          {images.length > 0 && (
            <Button
              onClick={() => setIsClearDialogOpen(true)}
              variant="outline"
              className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500 active:scale-95 md:w-auto"
            >
              <Trash2 className="h-4 w-4 ml-2 md:h-5 md:w-5" />
              پاک کردن همه
            </Button>
          )}
        </div>

        {/* Search Bar */}
        {images.length > 0 && (
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 md:h-5 md:w-5" />
            <Input
              type="text"
              placeholder="جستجو در تاریخچه..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 pr-9 text-sm text-white placeholder:text-white/30 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 md:pr-10 md:text-base"
              dir="rtl"
            />
          </div>
        )}
      </div>

      {/* Gallery */}
      {filteredImages.length > 0 ? (
        <ImageGallery
          images={filteredImages}
          onDelete={handleDelete}
          onDownload={handleDownload}
        />
      ) : images.length === 0 ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-slate-400">تاریخچه شما خالی است</p>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-slate-400">نتیجه‌ای یافت نشد</p>
        </div>
      )}

      {/* Clear All Dialog */}
      <Dialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
        <DialogContent className="bg-slate-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-right text-white">پاک کردن تمام تاریخچه</DialogTitle>
            <DialogDescription className="text-right text-slate-400">
              آیا مطمئن هستید که می‌خواهید تمام تصاویر تاریخچه را پاک کنید؟ این عمل قابل بازگشت نیست.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row-reverse gap-2">
            <Button
              onClick={handleClearAll}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              بله، پاک کن
            </Button>
            <Button
              onClick={() => setIsClearDialogOpen(false)}
              variant="outline"
              className="border-white/10 text-white/80 hover:border-white/30"
            >
              انصراف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


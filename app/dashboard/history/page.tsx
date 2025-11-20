"use client";

import { useState, useEffect } from "react";
import { History, Trash2, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GeneratedImage } from "@/types/dashboard-types";
import { ImageGallery } from "@/components/dashboard/image-gallery";
import { getImageHistory, deleteImageFromHistory, clearImageHistory } from "@/lib/history";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function HistoryPage() {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<GeneratedImage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);

  useEffect(() => {
    const history = getImageHistory();
    setImages(history);
    setFilteredImages(history);
  }, []);

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

  const handleDelete = (imageId: string) => {
    deleteImageFromHistory(imageId);
    const updatedImages = images.filter((img) => img.id !== imageId);
    setImages(updatedImages);
    setFilteredImages(updatedImages.filter((img) => 
      !searchQuery.trim() || 
      img.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.id.toLowerCase().includes(searchQuery.toLowerCase())
    ));
  };

  const handleClearAll = () => {
    clearImageHistory();
    setImages([]);
    setFilteredImages([]);
    setIsClearDialogOpen(false);
  };

  const handleDownload = (imageUrl: string, id: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `bananaai-image-${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-pink-500/20">
              <History className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white">تاریخچه تصاویر</h1>
              <p className="text-slate-400">
                تمام تصاویر تولید شده شما ({images.length} تصویر)
              </p>
            </div>
          </div>
          {images.length > 0 && (
            <Button
              onClick={() => setIsClearDialogOpen(true)}
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500"
            >
              <Trash2 className="h-5 w-5 ml-2" />
              پاک کردن همه
            </Button>
          )}
        </div>

        {/* Search Bar */}
        {images.length > 0 && (
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="جستجو در تاریخچه (بر اساس پرامپت)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 pr-10 text-white placeholder:text-white/30 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20"
              dir="rtl"
            />
          </div>
        )}
      </div>

      {/* Gallery */}
      <ImageGallery
        images={filteredImages}
        onDelete={handleDelete}
        onDownload={handleDownload}
      />

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


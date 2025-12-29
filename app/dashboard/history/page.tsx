"use client";

import { useState, useEffect } from "react";
import { History, Trash2, Search, Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GeneratedImage, GeneratedVideo } from "@/types/dashboard-types";
import { ImageGallery } from "@/components/dashboard/image-gallery";
import { VideoGallery } from "@/components/dashboard/video-gallery";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

type TabType = "images" | "videos";

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<TabType>("images");
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);
  const [filteredImages, setFilteredImages] = useState<GeneratedImage[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<GeneratedVideo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);
  const [isClearingAll, setIsClearingAll] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch both image and video history in parallel
      const [imagesResponse, videosResponse] = await Promise.all([
        fetch("/api/user/history"),
        fetch("/api/user/video-history"),
      ]);
      
      if (!imagesResponse.ok) {
        throw new Error("Failed to fetch image history");
      }
      
      if (!videosResponse.ok) {
        throw new Error("Failed to fetch video history");
      }
      
      const imageHistory = await imagesResponse.json();
      const videoHistory = await videosResponse.json();
      
      // Convert timestamp strings to Date objects
      const formattedImages = imageHistory.map((img: any) => ({
        ...img,
        timestamp: new Date(img.timestamp),
      }));
      
      const formattedVideos = videoHistory.map((video: any) => ({
        ...video,
        timestamp: new Date(video.timestamp),
      }));
      
      setImages(formattedImages);
      setVideos(formattedVideos);
      setFilteredImages(formattedImages);
      setFilteredVideos(formattedVideos);
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
      setFilteredVideos(videos);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filteredImgs = images.filter(
      (img) =>
        img.prompt.toLowerCase().includes(query) ||
        img.id.toLowerCase().includes(query)
    );
    const filteredVids = videos.filter(
      (video) =>
        video.prompt.toLowerCase().includes(query) ||
        video.id.toLowerCase().includes(query)
    );
    setFilteredImages(filteredImgs);
    setFilteredVideos(filteredVids);
  }, [searchQuery, images, videos]);

  const handleDelete = async (imageId: string) => {
    try {
      setDeletingImageId(imageId);
      setError(null);
      
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
    } finally {
      setDeletingImageId(null);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    try {
      setDeletingVideoId(videoId);
      setError(null);
      
      const response = await fetch(`/api/user/video-history/${videoId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete video");
      }
      
      // Update local state
      const updatedVideos = videos.filter((video) => video.id !== videoId);
      setVideos(updatedVideos);
      setFilteredVideos(updatedVideos.filter((video) => 
        !searchQuery.trim() || 
        video.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.id.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    } catch (err) {
      console.error("Error deleting video:", err);
      setError("خطا در حذف ویدیو");
    } finally {
      setDeletingVideoId(null);
    }
  };

  const handleClearAll = async () => {
    try {
      setIsClearingAll(true);
      setError(null);
      
      // Clear based on active tab
      if (activeTab === "images") {
        const response = await fetch("/api/user/history", {
          method: "DELETE",
        });
        
        if (!response.ok) {
          throw new Error("Failed to clear image history");
        }
        
        setImages([]);
        setFilteredImages([]);
      } else {
        const response = await fetch("/api/user/video-history", {
          method: "DELETE",
        });
        
        if (!response.ok) {
          throw new Error("Failed to clear video history");
        }
        
        setVideos([]);
        setFilteredVideos([]);
      }
      
      setIsClearDialogOpen(false);
    } catch (err) {
      console.error("Error clearing history:", err);
      setError("خطا در پاک کردن تاریخچه");
    } finally {
      setIsClearingAll(false);
    }
  };

  const handleDownloadImage = (imageUrl: string, id: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `bananaai-image-${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadVideo = (videoUrl: string, id: string) => {
    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = `bananaai-video-${id}.mp4`;
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

  const currentItems = activeTab === "images" ? images : videos;
  const currentFilteredItems = activeTab === "images" ? filteredImages : filteredVideos;
  const totalCount = images.length + videos.length;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 md:mb-8">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-pink-500/20 md:h-12 md:w-12">
              <History className="h-5 w-5 text-yellow-400 md:h-6 md:w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white md:text-4xl">تاریخچه</h1>
              <p className="text-xs text-slate-400 md:text-base">
                تمام محتوای تولید شده شما ({images.length} تصویر، {videos.length} ویدیو)
              </p>
            </div>
          </div>
          {currentItems.length > 0 && (
            <Button
              onClick={() => setIsClearDialogOpen(true)}
              variant="outline"
              disabled={isClearingAll || deletingImageId !== null || deletingVideoId !== null}
              className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500 active:scale-95 md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isClearingAll ? (
                <>
                  <div className="h-4 w-4 ml-2 border-2 border-red-400 border-t-transparent rounded-full animate-spin md:h-5 md:w-5" />
                  در حال پاک کردن...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 ml-2 md:h-5 md:w-5" />
                  پاک کردن همه
                </>
              )}
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-4 flex gap-2 border-b border-white/10">
          <button
            onClick={() => setActiveTab("images")}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === "images"
                ? "border-yellow-400 text-yellow-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            <span className="text-sm font-medium">تصاویر ({images.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("videos")}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === "videos"
                ? "border-yellow-400 text-yellow-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <VideoIcon className="h-4 w-4" />
            <span className="text-sm font-medium">ویدیوها ({videos.length})</span>
          </button>
        </div>

        {/* Search Bar */}
        {currentItems.length > 0 && (
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
      {activeTab === "images" ? (
        filteredImages.length > 0 ? (
          <ImageGallery
            images={filteredImages}
            onDelete={handleDelete}
            onDownload={handleDownloadImage}
            deletingImageId={deletingImageId}
          />
        ) : images.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-slate-400">تاریخچه تصاویر شما خالی است</p>
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-slate-400">نتیجه‌ای یافت نشد</p>
          </div>
        )
      ) : (
        filteredVideos.length > 0 ? (
          <VideoGallery
            videos={filteredVideos}
            onDelete={handleDeleteVideo}
            onDownload={handleDownloadVideo}
            deletingVideoId={deletingVideoId}
          />
        ) : videos.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-slate-400">تاریخچه ویدیوهای شما خالی است</p>
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-slate-400">نتیجه‌ای یافت نشد</p>
          </div>
        )
      )}

      {/* Clear All Dialog */}
      <Dialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
        <DialogContent className="bg-slate-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-right text-white">
              پاک کردن تمام تاریخچه {activeTab === "images" ? "تصاویر" : "ویدیوها"}
            </DialogTitle>
            <DialogDescription className="text-right text-slate-400">
              آیا مطمئن هستید که می‌خواهید تمام {activeTab === "images" ? "تصاویر" : "ویدیوهای"} تاریخچه را پاک کنید؟ این عمل قابل بازگشت نیست.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row-reverse gap-2">
            <Button
              onClick={handleClearAll}
              disabled={isClearingAll}
              className="bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isClearingAll ? (
                <>
                  <div className="h-4 w-4 ml-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  در حال پاک کردن...
                </>
              ) : (
                "بله، پاک کن"
              )}
            </Button>
            <Button
              onClick={() => setIsClearDialogOpen(false)}
              variant="outline"
              disabled={isClearingAll}
              className="border-white/10 text-white/80 hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              انصراف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


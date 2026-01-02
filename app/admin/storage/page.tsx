"use client";

import { useState, useEffect, useCallback } from "react";
import { Image, Loader2, Trash2, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StorageFile {
  key: string;
  size: number;
  lastModified?: string;
  url: string;
}

export default function AdminStoragePage() {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/storage/list-files");
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "خطا در دریافت فایل‌ها");
        setIsLoading(false);
        return;
      }

      setFiles(data.files || []);
    } catch (error) {
      console.error("Error fetching files:", error);
      setError("خطا در ارتباط با سرور");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleDelete = async (key: string) => {
    if (!confirm("آیا مطمئن هستید که می‌خواهید این تصویر را حذف کنید؟")) {
      return;
    }

    setIsDeleting(key);
    try {
      const response = await fetch("/api/storage/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "خطا در حذف فایل");
        setIsDeleting(null);
        return;
      }

      // Remove the file from the list
      setFiles((prev) => prev.filter((file) => file.key !== key));
      setError("");
    } catch (error) {
      console.error("Error deleting file:", error);
      setError("خطا در ارتباط با سرور");
    } finally {
      setIsDeleting(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "نامشخص";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getFileName = (key: string) => {
    const parts = key.split("/");
    return parts[parts.length - 1] || key;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">
            مدیریت تصاویر
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            مشاهده و مدیریت تمام تصاویر ذخیره شده در bucket
          </p>
        </div>
        <Button
          onClick={fetchFiles}
          disabled={isLoading}
          className="bg-white/10 text-white hover:bg-white/20"
        >
          <RefreshCw
            className={`h-4 w-4 ml-2 ${isLoading ? "animate-spin" : ""}`}
          />
          بروزرسانی
        </Button>
      </div>

      {/* Statistics */}
      {!isLoading && files.length > 0 && (
        <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-3 sm:p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Image className="h-5 w-5 text-yellow-400" />
            <p className="text-sm text-slate-400">
              تعداد کل تصاویر:{" "}
              <span className="text-white font-bold">{files.length}</span>
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-red-500/20 border border-red-500/30 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
        </div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] py-20 text-center backdrop-blur-sm">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-white/10 to-white/5 mb-6 shadow-lg">
            <Image className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">تصویری یافت نشد</h3>
          <p className="text-slate-400 text-sm max-w-xs mx-auto">
            هنوز هیچ تصویری در bucket ذخیره نشده است.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {files.map((file) => (
            <div
              key={file.key}
              className="group relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] overflow-hidden backdrop-blur-sm hover:border-white/20 transition-all"
            >
              {/* Image */}
              <div
                className="aspect-square relative overflow-hidden bg-slate-900 cursor-pointer"
                onClick={() => setSelectedImage(file.url)}
              >
                <img
                  src={file.url}
                  alt={getFileName(file.key)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Overlay Actions */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(file.url, "_blank");
                    }}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(file.key);
                    }}
                    disabled={isDeleting === file.key}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30"
                  >
                    {isDeleting === file.key ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* File Info */}
              <div className="p-4 space-y-2">
                <p
                  className="text-sm font-semibold text-white truncate"
                  title={getFileName(file.key)}
                >
                  {getFileName(file.key)}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{formatFileSize(file.size || 0)}</span>
                  {file.lastModified && (
                    <span
                      className="truncate"
                      title={formatDate(file.lastModified)}
                    >
                      {formatDate(file.lastModified)}
                    </span>
                  )}
                </div>
                <div className="pt-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(file.key)}
                    disabled={isDeleting === file.key}
                    className="w-full text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    {isDeleting === file.key ? (
                      <>
                        <Loader2 className="h-3 w-3 ml-1 animate-spin" />
                        در حال حذف...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-3 w-3 ml-1" />
                        حذف
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-7xl max-h-[90vh]">
            <img
              src={selectedImage}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <Button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 left-4 bg-red-500/20 hover:bg-red-500/30 text-white border-red-500/30"
            >
              بستن
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}





"use client";

import { useState, useEffect, useCallback } from "react";
import { Image, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Banner {
  id?: string;
  isActive: boolean;
  imageUrl: string;
  link: string;
  height: "small" | "medium" | "large";
  customHeight?: number;
}

export default function AdminBannerPage() {
  const [banner, setBanner] = useState<Banner>({
    isActive: false,
    imageUrl: "",
    link: "",
    height: "small",
    customHeight: undefined,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchBanner = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/banner");
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "خطا در دریافت تنظیمات بنر");
        setIsLoading(false);
        return;
      }

      if (data.banner) {
        setBanner({
          id: data.banner.id,
          isActive: data.banner.isActive ?? false,
          imageUrl: data.banner.imageUrl ?? "",
          link: data.banner.link ?? "",
          height: data.banner.height ?? "small",
          customHeight: data.banner.customHeight,
        });
      }
      setError("");
    } catch (error) {
      console.error("Error fetching banner:", error);
      setError("خطا در ارتباط با سرور");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanner();
  }, [fetchBanner]);

  const handleSave = async () => {
    if (!banner.imageUrl.trim() || !banner.link.trim()) {
      setError("آدرس تصویر و لینک الزامی است");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/banner", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(banner),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "خطا در ذخیره تنظیمات بنر");
        setIsSaving(false);
        return;
      }

      setSuccess("تنظیمات بنر با موفقیت ذخیره شد");
      setBanner(data.banner);
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error saving banner:", error);
      setError("خطا در ارتباط با سرور");
    } finally {
      setIsSaving(false);
    }
  };

  const getHeightValue = () => {
    if (banner.customHeight) {
      return banner.customHeight;
    }
    switch (banner.height) {
      case "small":
        return 120;
      case "medium":
        return 200;
      case "large":
        return 320;
      default:
        return 120;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">
            مدیریت بنر داشبورد
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            تنظیم و مدیریت بنر نمایش داده شده در صفحه اصلی داشبورد
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-500/20 border border-red-500/30 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl bg-green-500/20 border border-green-500/30 px-4 py-3 text-sm text-green-400">
          {success}
        </div>
      )}

      {/* Banner Settings Form */}
      <div className="space-y-6">
        {/* Preview Section */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm p-6">
          <h2 className="text-lg font-bold text-white mb-4">پیش‌نمایش</h2>
          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/50">
            <div
              className="relative w-full"
              style={{ height: `${getHeightValue()}px` }}
            >
              {banner.imageUrl ? (
                banner.imageUrl.endsWith('.gif') ? (
                  <img
                    src={banner.imageUrl}
                    alt="Banner preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={banner.imageUrl}
                    alt="Banner preview"
                    className="w-full h-full object-cover"
                  />
                )
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                  <div className="text-center">
                    <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">پیش‌نمایش بنر</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          {banner.link && (
            <p className="mt-3 text-xs text-slate-400">
              لینک: <span className="text-slate-300">{banner.link}</span>
            </p>
          )}
        </div>

        {/* Settings Form */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm p-6 space-y-6">
          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-slate-900/50">
            <div>
              <label className="text-sm font-semibold text-white block mb-1">
                فعال کردن بنر
              </label>
              <p className="text-xs text-slate-400">
                نمایش بنر در صفحه اصلی داشبورد
              </p>
            </div>
            <Switch
              checked={banner.isActive}
              onCheckedChange={(checked) =>
                setBanner({ ...banner, isActive: checked })
              }
            />
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">
              آدرس تصویر یا GIF *
            </label>
            <Input
              value={banner.imageUrl}
              onChange={(e) =>
                setBanner({ ...banner, imageUrl: e.target.value })
              }
              placeholder="/img/proshir-gemini.png یا https://example.com/banner.gif"
              className="bg-slate-800 border-white/10 text-white"
            />
            <p className="text-xs text-slate-500">
              می‌توانید از مسیرهای عمومی، URL خارجی یا فایل‌های GIF استفاده کنید
            </p>
          </div>

          {/* Link */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">
              لینک (مسیر روتینگ) *
            </label>
            <Input
              value={banner.link}
              onChange={(e) =>
                setBanner({ ...banner, link: e.target.value })
              }
              placeholder="/dashboard/billing"
              className="bg-slate-800 border-white/10 text-white"
            />
            <p className="text-xs text-slate-500">
              مسیری که کاربر با کلیک روی بنر به آن هدایت می‌شود
            </p>
          </div>

          {/* Height */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">
              ارتفاع بنر
            </label>
            <Select
              value={banner.height}
              onValueChange={(value: "small" | "medium" | "large") =>
                setBanner({ ...banner, height: value, customHeight: undefined })
              }
            >
              <SelectTrigger className="bg-slate-800 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10">
                <SelectItem value="small">کوچک (120px)</SelectItem>
                <SelectItem value="medium">متوسط (200px)</SelectItem>
                <SelectItem value="large">بزرگ (320px)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              ارتفاع پیش‌فرض: {getHeightValue()}px
            </p>
          </div>

          {/* Custom Height */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">
              ارتفاع سفارشی (پیکسل) - اختیاری
            </label>
            <Input
              type="number"
              value={banner.customHeight || ""}
              onChange={(e) =>
                setBanner({
                  ...banner,
                  customHeight: e.target.value
                    ? parseInt(e.target.value)
                    : undefined,
                })
              }
              placeholder="مثال: 150"
              min="100"
              max="600"
              className="bg-slate-800 border-white/10 text-white"
            />
            <p className="text-xs text-slate-500">
              در صورت تعیین، این مقدار بر ارتفاع پیش‌فرض اولویت دارد
            </p>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 text-white hover:opacity-90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  در حال ذخیره...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 ml-2" />
                  ذخیره تنظیمات
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


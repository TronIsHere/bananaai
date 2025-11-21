"use client";

import { useState, useEffect } from "react";
import { Settings, User, Phone, Save, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/hooks/use-user";
import { signOut } from "next-auth/react";

export default function SettingsPage() {
  const { user, refreshUserData } = useUser();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with user data
  useEffect(() => {
    if (user.firstName) {
      setFirstName(user.firstName);
    }
    if (user.lastName) {
      setLastName(user.lastName);
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaveSuccess(false);
    setIsSaving(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      // Refresh user data
      await refreshUserData();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err instanceof Error ? err.message : "خطا در به‌روزرسانی پروفایل");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-pink-500/20 md:h-12 md:w-12 flex-shrink-0">
            <Settings className="h-5 w-5 text-yellow-400 md:h-6 md:w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white md:text-4xl">
              تنظیمات
            </h1>
            <p className="text-xs text-slate-400 md:text-base">
              مدیریت اطلاعات حساب کاربری
            </p>
          </div>
        </div>
      </div>

      {/* Profile Information Section */}
      <div className="mb-6 md:mb-8">
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-4 md:rounded-2xl md:p-8">
          <div className="mb-6 flex items-center gap-2">
            <User className="h-5 w-5 text-yellow-400 md:h-6 md:w-6" />
            <h2 className="text-lg font-bold text-white md:text-xl">
              اطلاعات پروفایل
            </h2>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {/* First Name */}
            <div>
              <label
                htmlFor="firstName"
                className="mb-2 block text-sm font-semibold text-white/80"
              >
                نام
              </label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="نام خود را وارد کنید"
                className="w-full rounded-lg border border-white/10 bg-white/5 text-sm text-white placeholder:text-white/30 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 md:text-base"
                dir="rtl"
                required
                minLength={2}
                maxLength={50}
              />
            </div>

            {/* Last Name */}
            <div>
              <label
                htmlFor="lastName"
                className="mb-2 block text-sm font-semibold text-white/80"
              >
                نام خانوادگی
              </label>
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="نام خانوادگی خود را وارد کنید"
                className="w-full rounded-lg border border-white/10 bg-white/5 text-sm text-white placeholder:text-white/30 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 md:text-base"
                dir="rtl"
                required
                minLength={2}
                maxLength={50}
              />
            </div>

            {/* Mobile Number (Read-only) */}
            <div>
              <label
                htmlFor="mobileNumber"
                className="mb-2 block text-sm font-semibold text-white/80"
              >
                شماره موبایل
              </label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 md:h-5 md:w-5" />
                <Input
                  id="mobileNumber"
                  type="text"
                  value={user.mobileNumber || ""}
                  disabled
                  className="w-full rounded-lg border border-white/10 bg-white/5 pr-10 text-sm text-white/60 md:text-base"
                  dir="ltr"
                />
              </div>
              <p className="mt-1 text-xs text-slate-400">
                شماره موبایل قابل تغییر نیست
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {saveSuccess && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3">
                <Check className="h-4 w-4 text-emerald-400" />
                <p className="text-sm text-emerald-400">
                  پروفایل با موفقیت به‌روزرسانی شد
                </p>
              </div>
            )}

            {/* Save Button */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSaving}
                className="w-full h-10 text-sm font-bold bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg shadow-orange-500/20 rounded-xl transition-all duration-300 hover:scale-[1.02] disabled:hover:scale-100 disabled:opacity-70 md:w-auto md:px-8"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    در حال ذخیره...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 ml-2" />
                    ذخیره تغییرات
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Account Actions Section */}
      <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-4 md:rounded-2xl md:p-8">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white md:text-xl">
            عملیات حساب کاربری
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            مدیریت حساب کاربری و خروج از سیستم
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-red-500/30 text-red-400 hover:border-red-500/50 hover:bg-red-500/10 h-10 md:w-auto md:px-6"
          >
            خروج از حساب کاربری
          </Button>
        </div>
      </div>
    </div>
  );
}


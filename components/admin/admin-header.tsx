"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  Menu,
  ChevronDown,
} from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useUserStore } from "@/store/user-store";

interface AdminHeaderProps {
  onMenuClick?: () => void;
  isMenuOpen?: boolean;
}

export function AdminHeader({
  onMenuClick,
  isMenuOpen,
}: AdminHeaderProps) {
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user } = useUser();
  const resetUser = useUserStore((state) => state.resetUser);

  const handleLogout = async () => {
    setShowUserMenu(false);
    resetUser();
    await signOut({ redirect: false });
    router.push("/");
  };

  const handleMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    if (onMenuClick) {
      onMenuClick();
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-3 md:px-8 md:py-4">
        {/* Left side - Menu button (mobile) + Title */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={handleMenuClick}
            className="flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-white transition hover:bg-white/10 active:scale-95 md:hidden"
            aria-label="منو"
            aria-expanded={isMenuOpen}
            type="button"
          >
            <Menu className="h-5 w-5" />
            <span className="text-sm font-medium">منو</span>
          </button>
          <div>
            <h2 className="text-base font-bold text-white md:text-lg">
              پنل مدیریت
            </h2>
            <p className="hidden text-xs text-slate-400 sm:block">
              مدیریت تیکت‌ها و پیام‌ها
            </p>
          </div>
        </div>

        {/* Right side - User Menu */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2 transition hover:bg-white/10 active:scale-95 md:h-auto md:w-auto md:px-3 md:py-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-pink-500 text-sm font-bold text-slate-950">
                {user.firstName?.[0] || "ک"}
              </div>
              <span className="hidden text-sm font-semibold text-white md:block">
                {user.firstName || "مدیر"}
              </span>
              <ChevronDown className="h-4 w-4 text-white" />
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute left-0 top-full z-20 mt-2 w-48 rounded-lg border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-xl">
                  <div className="p-2">
                    <button
                      className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      خروج از حساب
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}








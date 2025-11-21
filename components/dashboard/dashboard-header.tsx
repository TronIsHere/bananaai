"use client";

import { useState } from "react";
import Link from "next/link";
import { FiDatabase } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  User,
  LogOut,
  Settings,
  CreditCard,
  Menu,
  ChevronDown,
} from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useUserStore } from "@/store/user-store";

interface DashboardHeaderProps {
  onMenuClick?: () => void;
  isMenuOpen?: boolean;
}

export function DashboardHeader({
  onMenuClick,
  isMenuOpen,
}: DashboardHeaderProps) {
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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("fa-IR").format(num);
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
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition hover:bg-white/10 active:scale-95 md:hidden"
            aria-label="منو"
            aria-expanded={isMenuOpen}
            type="button"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-base font-bold text-white md:text-lg">
              پنل کاربری
            </h2>
            <p className="hidden text-xs text-slate-400 sm:block">
              به بنانا خوش آمدید
            </p>
          </div>
        </div>

        {/* Right side - Credits + User Menu */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Credits Badge */}
          <Link
            href="/dashboard/billing"
            className="hidden sm:flex items-center gap-2 rounded-lg border border-yellow-400/30 bg-yellow-400/10 px-3 py-1.5 transition-all hover:border-yellow-400/50 hover:bg-yellow-400/15 active:scale-95 md:px-4 md:py-2 cursor-pointer"
          >
            <FiDatabase className="h-4 w-4 text-yellow-400" />
            <div className="text-right">
              <p className="text-xs text-slate-400">اعتبار باقیمانده</p>
              <p className="text-sm font-bold text-yellow-400">
                {formatNumber(user.credits)} اعتبار
              </p>
            </div>
          </Link>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition hover:bg-white/10 active:scale-95 md:h-auto md:w-auto md:gap-2 md:px-3 md:py-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-pink-500 text-sm font-bold text-slate-950">
                {user.firstName?.[0] || "ک"}
              </div>
              <span className="hidden text-sm font-semibold text-white md:block">
                {user.firstName || "کاربر"}
              </span>
              <ChevronDown className="hidden h-4 w-4 text-white md:block" />
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute left-0 top-full z-20 mt-2 w-48 rounded-lg border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-xl">
                  <div className="p-2">
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="h-4 w-4" />
                      تنظیمات
                    </Link>
                    <Link
                      href="/dashboard/billing"
                      className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <CreditCard className="h-4 w-4" />
                      خرید اعتبار
                    </Link>
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

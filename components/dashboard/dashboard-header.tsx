"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User, LogOut, Settings, CreditCard } from "lucide-react";

export function DashboardHeader() {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-4 md:px-8">
        <div>
          <h2 className="text-lg font-bold text-white">پنل کاربری</h2>
          <p className="text-xs text-slate-400">به BananaAI خوش آمدید</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Credits Badge */}
          <div className="hidden sm:flex items-center gap-2 rounded-lg border border-yellow-400/30 bg-yellow-400/10 px-4 py-2">
            <CreditCard className="h-4 w-4 text-yellow-400" />
            <div className="text-right">
              <p className="text-xs text-slate-400">اعتبار باقیمانده</p>
              <p className="text-sm font-bold text-yellow-400">۱۲۵ تصویر</p>
            </div>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition hover:bg-white/10"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-pink-500 text-sm font-bold text-slate-950">
                ک
              </div>
              <span className="hidden text-sm font-semibold text-white md:block">
                کاربر
              </span>
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
                      className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="h-4 w-4" />
                      تنظیمات
                    </Link>
                    <Link
                      href="/dashboard/billing"
                      className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <CreditCard className="h-4 w-4" />
                      خرید اعتبار
                    </Link>
                    <button
                      className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
                      onClick={() => {
                        setShowUserMenu(false);
                        // Handle logout
                      }}
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


"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Menu, X, Sparkles, Image, History } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    href: "/dashboard",
    label: "داشبورد",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/text-to-image",
    label: "متن به تصویر",
    icon: Sparkles,
  },
  {
    href: "/dashboard/image-to-image",
    label: "تصویر به تصویر",
    icon: Image,
  },
  {
    href: "/dashboard/history",
    label: "تاریخچه",
    icon: History,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed right-4 top-4 z-50 rounded-lg border border-white/10 bg-slate-900/95 p-2 text-white md:hidden"
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/95 backdrop-blur-xl md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed right-0 top-0 z-40 h-screen w-64 border-l border-white/10 bg-slate-900/95 backdrop-blur-xl p-6 transition-transform md:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
        )}
      >
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 text-2xl shadow-[0_0_35px_rgba(251,191,36,0.45)]">
                🍌
              </div>
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 sm:text-xs">
                آزمایشگاه هوش مصنوعی فارسی
              </p>
              <p className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-xl font-black text-transparent sm:text-2xl">
                BananaAI
              </p>
            </div>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all",
                  isActive
                    ? "bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-pink-500/20 text-white shadow-[0_0_20px_rgba(251,191,36,0.15)]"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}


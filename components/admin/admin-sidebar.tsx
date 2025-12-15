"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

const menuItems = [
  {
    href: "/admin",
    label: "تیکت‌ها",
    icon: MessageSquare,
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const lastPathRef = useRef(pathname);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (!isOpen) {
      lastPathRef.current = pathname;
      return;
    }

    if (lastPathRef.current === pathname) return;

    lastPathRef.current = pathname;

    if (typeof window !== "undefined" && window.innerWidth < 768) {
      onClose();
    }
  }, [pathname, isOpen, onClose]);

  const SidebarContent = () => (
    <>
      {/* Logo Section */}
      <div className="mb-6 md:mb-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 text-xl shadow-[0_0_35px_rgba(251,191,36,0.45)] md:h-11 md:w-11 md:text-2xl">
                🍌
              </div>
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
            </div>

            <div>
              <p className="text-[10px] font-semibold text-slate-400 sm:text-xs">
                پنل مدیریت
              </p>
              <p className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-lg font-black text-transparent sm:text-xl md:text-2xl">
                بنانا
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="space-y-1.5 md:space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all active:scale-[0.98] md:px-4 md:py-3",
                isActive
                  ? "bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-pink-500/20 text-white shadow-[0_0_20px_rgba(251,191,36,0.15)]"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile Sheet */}
      <Sheet
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            onClose();
          }
        }}
        modal={true}
      >
        <SheetContent
          side="right"
          className="w-64 border-white/10 bg-slate-900/95 backdrop-blur-xl p-4 text-white md:hidden [&>button]:text-white [&>button]:hover:bg-white/10"
        >
          <SheetTitle className="sr-only">منوی ناوبری</SheetTitle>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden fixed right-0 top-0 z-40 h-screen w-64 border-l border-white/10 bg-slate-900/95 backdrop-blur-xl p-6 md:block">
        <SidebarContent />
      </aside>
    </>
  );
}








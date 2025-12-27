"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  Image,
  History,
  CreditCard,
  Settings,
  MessageSquare,
  Zap,
  Crown,
  ChevronLeft,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

const mainNavItems = [
  {
    href: "/dashboard",
    label: "داشبورد",
    icon: LayoutDashboard,
    description: "نمای کلی",
  },
];

const toolsNavItems = [
  {
    href: "/dashboard/text-to-image",
    label: "متن به تصویر",
    icon: Sparkles,
    description: "ایجاد تصویر از متن",
    badge: "پرطرفدار",
  },
  {
    href: "/dashboard/image-to-image",
    label: "تصویر به تصویر",
    icon: Image,
    description: "ویرایش و تغییر تصویر",
  },
  {
    href: "/dashboard/image-to-video",
    label: "تصویر به ویدیو",
    icon: Video,
    description: "تبدیل تصویر به ویدیو",
  },
];

const accountNavItems = [
  {
    href: "/dashboard/history",
    label: "تاریخچه",
    icon: History,
    description: "تصاویر قبلی",
  },
  {
    href: "/dashboard/billing",
    label: "پلن ها",
    icon: CreditCard,
    description: "خرید اعتبار",
  },
  {
    href: "/dashboard/support",
    label: "پشتیبانی",
    icon: MessageSquare,
    description: "ارتباط با ما",
  },
  {
    href: "/dashboard/settings",
    label: "تنظیمات",
    icon: Settings,
    description: "مدیریت حساب",
  },
];

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  badge?: string;
  isActive: boolean;
  onClick?: () => void;
  index: number;
}

function NavItem({
  href,
  label,
  icon: Icon,
  description,
  badge,
  isActive,
  onClick,
  index,
}: NavItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={href}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-300",
        "animate-fade-in-up",
        isActive
          ? "bg-gradient-to-l from-amber-500/20 via-orange-500/15 to-transparent"
          : "hover:bg-white/[0.04]"
      )}
      style={{
        animationDelay: `${index * 50}ms`,
        animationFillMode: "backwards",
      }}
    >
      {/* Active indicator bar */}
      <div
        className={cn(
          "absolute right-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-l-full transition-all duration-300",
          isActive
            ? "bg-gradient-to-b from-amber-400 to-orange-500 shadow-[0_0_12px_rgba(251,191,36,0.5)]"
            : "scale-y-0 bg-slate-500"
        )}
      />

      {/* Icon container */}
      <div
        className={cn(
          "relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-300",
          isActive
            ? "bg-gradient-to-br from-amber-400/20 to-orange-500/20 shadow-[0_0_20px_rgba(251,191,36,0.15)]"
            : "bg-white/[0.04] group-hover:bg-white/[0.08]"
        )}
      >
        <Icon
          className={cn(
            "h-[18px] w-[18px] transition-all duration-300",
            isActive
              ? "text-amber-400"
              : "text-slate-400 group-hover:text-slate-200",
            isHovered && !isActive && "scale-110"
          )}
        />
        {isActive && (
          <div className="absolute inset-0 animate-pulse rounded-lg bg-amber-400/10" />
        )}
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-semibold transition-colors duration-300",
              isActive ? "text-white" : "text-slate-300 group-hover:text-white"
            )}
          >
            {label}
          </span>
          {badge && (
            <span className="rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400 ring-1 ring-amber-500/30">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p
            className={cn(
              "text-[11px] truncate transition-colors duration-300",
              isActive
                ? "text-slate-400"
                : "text-slate-500 group-hover:text-slate-400"
            )}
          >
            {description}
          </p>
        )}
      </div>

      {/* Hover arrow */}
      <ChevronLeft
        className={cn(
          "h-4 w-4 transition-all duration-300",
          isActive
            ? "text-amber-400/60 translate-x-0 opacity-100"
            : "text-slate-600 translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
        )}
      />
    </Link>
  );
}

function NavSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {title}
      </p>
      {children}
    </div>
  );
}

export function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
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

  const SidebarContent = () => {
    let itemIndex = 0;

    return (
      <div className="flex h-full flex-col">
        {/* Logo Section */}
        <div className="mb-6 px-2">
          <Link
            href="/"
            className="group flex items-center gap-3 rounded-xl p-2 transition-all hover:bg-white/[0.04]"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-400 via-orange-400 to-pink-500 opacity-50 blur-lg transition-opacity group-hover:opacity-70" />
              {/* Logo container */}
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-orange-400 to-pink-500 text-2xl shadow-lg">
                🍌
              </div>
              {/* Status dot */}
              <span className="absolute -left-0.5 -top-0.5 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-slate-900"></span>
              </span>
            </div>

            <div>
              <p className="text-[10px] font-medium text-slate-500 transition-colors group-hover:text-slate-400">
                آزمایشگاه هوش مصنوعی
              </p>
              <p className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-xl font-black text-transparent">
                بنانا
              </p>
            </div>
          </Link>
        </div>

        {/* Quick Action Card */}
        <div className="mx-2 mb-6 overflow-hidden rounded-xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent p-3 ring-1 ring-amber-500/20">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
              <Zap className="h-4 w-4 text-slate-900" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">شروع سریع</p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                تصویر خود را با هوش مصنوعی بسازید
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/text-to-image"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-2 text-xs font-bold text-slate-900 transition-all hover:from-amber-400 hover:to-orange-400 hover:shadow-[0_0_20px_rgba(251,191,36,0.3)] active:scale-[0.98]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            ایجاد تصویر جدید
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700">
          {/* Main nav */}
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <NavItem
                key={item.href}
                {...item}
                isActive={pathname === item.href}
                onClick={onClose}
                index={itemIndex++}
              />
            ))}
          </div>

          {/* Tools section */}
          <NavSection title="ابزارهای هوش مصنوعی">
            {toolsNavItems.map((item) => (
              <NavItem
                key={item.href}
                {...item}
                isActive={pathname === item.href}
                onClick={onClose}
                index={itemIndex++}
              />
            ))}
          </NavSection>

          {/* Account section */}
          <NavSection title="حساب کاربری">
            {accountNavItems.map((item) => (
              <NavItem
                key={item.href}
                {...item}
                isActive={pathname === item.href}
                onClick={onClose}
                index={itemIndex++}
              />
            ))}
          </NavSection>
        </nav>
      </div>
    );
  };

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
          className="w-72 border-white/[0.08] bg-slate-900/98 backdrop-blur-2xl p-4 text-white md:hidden [&>button]:text-white [&>button]:hover:bg-white/10"
        >
          <SheetTitle className="sr-only">منوی ناوبری</SheetTitle>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden fixed right-0 top-0 z-40 h-screen w-72 border-l border-white/[0.06] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 py-5 md:block">
        {/* Ambient background effects */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-amber-500/[0.03] blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-orange-500/[0.03] blur-3xl" />
        </div>
        <div className="relative h-full">
          <SidebarContent />
        </div>
      </aside>
    </>
  );
}

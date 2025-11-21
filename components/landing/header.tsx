"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { navigationItems } from "@/lib/data";
import { LoginDialog } from "@/components/dialog/login-dialog";

interface HeaderProps {
  onMobileMenuOpen: () => void;
}

export function Header({ onMobileMenuOpen }: HeaderProps) {
  const [loginOpen, setLoginOpen] = useState(false);
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && !!session;

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label="برو به صفحه اصلی BananaAI"
        >
          <div className="flex items-center gap-3">
            <div className="relative" aria-hidden="true">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 text-2xl shadow-[0_0_35px_rgba(251,191,36,0.45)]">
                🍌
              </div>
              <span
                className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-slate-950"
                aria-label="آنلاین"
              />
            </div>

            <div>
              <p className="text-[10px] font-semibold text-slate-400 sm:text-xs">
                آزمایشگاه هوش مصنوعی
              </p>
              <p className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-xl font-black text-transparent sm:text-2xl">
                BananaAI
              </p>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden gap-6 text-sm text-slate-400 md:flex lg:gap-8"
          aria-label="منوی اصلی"
        >
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative font-semibold tracking-wide text-slate-400 transition hover:text-white"
              aria-label={`برو به ${item.label}`}
            >
              {item.label}
              <span
                className="absolute inset-x-0 -bottom-1 h-px scale-x-0 bg-gradient-to-l from-yellow-400 to-pink-500 transition group-hover:scale-x-100"
                aria-hidden="true"
              />
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button and Login */}
        <div className="flex items-center gap-2 md:hidden">
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="border-white/10 px-4 py-2 text-xs font-semibold text-white/80 hover:border-white/30 hover:text-white"
              >
                برو به داشبورد
              </Button>
            </Link>
          ) : (
            <Button
              onClick={() => setLoginOpen(true)}
              variant="outline"
              className="border-white/10 px-4 py-2 text-xs font-semibold text-white/80 hover:border-white/30 hover:text-white"
            >
              ورود
            </Button>
          )}
          <Button
            onClick={onMobileMenuOpen}
            variant="ghost"
            size="icon"
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-lg border border-white/10"
            aria-label="باز کردن منوی موبایل"
            aria-expanded="false"
          >
            <span className="h-0.5 w-5 bg-white" aria-hidden="true"></span>
            <span className="h-0.5 w-5 bg-white" aria-hidden="true"></span>
            <span className="h-0.5 w-5 bg-white" aria-hidden="true"></span>
          </Button>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden gap-3 text-sm md:flex">
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="border-white/10 text-white/80 hover:border-white/30 hover:text-white"
              >
                برو به داشبورد
              </Button>
            </Link>
          ) : (
            <Button
              onClick={() => setLoginOpen(true)}
              variant="outline"
              className="border-white/10 text-white/80 hover:border-white/30 hover:text-white"
            >
              ورود
            </Button>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </header>
  );
}

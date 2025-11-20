"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { navigationItems } from "@/lib/data";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-slate-950/95 backdrop-blur-xl lg:hidden"
      onClick={onClose}
    >
      <div className="flex h-full flex-col items-center justify-center gap-8 text-xl">
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className="font-bold text-white"
          >
            {item.label}
          </Link>
        ))}
        <Button
          onClick={onClose}
          variant="outline"
          className="mt-4 border-white/20 px-6 py-3 font-bold text-white hover:border-white/40"
        >
          بستن
        </Button>
      </div>
    </div>
  );
}


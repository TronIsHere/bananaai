"use client";

import { useState, useCallback } from "react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-950 text-white" dir="rtl">
      <DashboardSidebar 
        isOpen={isMobileMenuOpen} 
        onClose={closeMenu} 
      />
      <div className="mr-0 flex-1 md:mr-64">
        <DashboardHeader 
          onMenuClick={toggleMenu}
          isMenuOpen={isMobileMenuOpen}
        />
        <main className="w-full p-4 pb-6 md:p-8 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}


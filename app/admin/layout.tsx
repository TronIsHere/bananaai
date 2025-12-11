"use client";

import { useState, useCallback } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export default function AdminLayout({
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
      <AdminSidebar 
        isOpen={isMobileMenuOpen} 
        onClose={closeMenu} 
      />
      <div className="mr-0 flex-1 md:mr-64">
        <AdminHeader 
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






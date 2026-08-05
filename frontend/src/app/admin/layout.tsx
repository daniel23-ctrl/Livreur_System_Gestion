"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F5F5F5]">
      {/* 1. Backdrop sombre sur mobile quand le menu est ouvert */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 2. Sidebar : 'fixed' et cachée à gauche sur mobile, 'relative' sur desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 transform lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdminSidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
      </aside>

      {/* 3. Contenu principal : prend 100% de la largeur sur mobile */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden w-full">
        <AdminHeader
          onNouvelleCommande={() => {}}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        <main className="flex-1 overflow-y-auto p-3 sm:p-6" style={{ backgroundImage: "url('/backdashboard.jpg')" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
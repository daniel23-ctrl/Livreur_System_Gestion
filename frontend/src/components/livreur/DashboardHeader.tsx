'use client';

import React, { useEffect, useState } from "react";
import { Bell, Menu, Sun } from "lucide-react";
import { getCurrentUser } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DashboardHeaderProps {
  title: string;
  onToggleMobileMenu?: () => void;
  location?: string;
}

export function DashboardHeader({
  title,
  onToggleMobileMenu,
  location = "Lomé, Togo",
}: DashboardHeaderProps) {
  const [currentDate, setCurrentDate] = useState<string>("");
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUser(getCurrentUser());

    const today = new Date();
    const formatted = today.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    setCurrentDate(formatted.charAt(0).toUpperCase() + formatted.slice(1));
  }, []);

  const initiales = mounted && user
    ? `${user.prenom?.[0] ?? ""}${user.nom?.[0] ?? ""}`.toUpperCase()
    : "AK";

  const userName = mounted && user
    ? `${user?.prenom ?? ""} ${user?.nom ?? ""}`.trim()
    : "Utilisateur";

  return (
    <TooltipProvider delay={100}>
      <header className="w-full bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-2 lg:py-2 flex items-center justify-between transition-all">
        {/* Côté gauche : Menu Mobile + Titre + Sous-titre / Statut */}
        <div className="flex items-center gap-3">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}

          <div className="flex flex-col justify-center gap-0.5">
            <h1 className="text-base sm:text-lg font-bold text-emerald-950 tracking-tight leading-tight">
              {title}
            </h1>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block shrink-0" />
              <p className="text-xs text-amber-700/80 font-medium">
                {/* {statusText} */}
                {currentDate && `  ${currentDate}, ${location}`}
              </p>
            </div>
          </div>
        </div>

        {/* Côté droit : Notifications + Avatar dynamique + Bouton Thème */}
        <div className="flex items-center gap-3 lg:gap-5">
          {/* Tooltip Notifications */}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="outline"
                  className="relative p-2 rounded-full text-gray-500 hover:bg-gray-50 transition-colors h-9 w-9"
                />
              }
            >
              <Bell className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#DCA524] border-2 border-white" />
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="bg-[#0b3b29] text-white border-emerald-800 text-xs font-medium shadow-md z-50"
            >
              Notifications
            </TooltipContent>
          </Tooltip>

          {/* Tooltip Avatar de l'utilisateur connecté */}
          <Tooltip>
            <TooltipTrigger
              render={
                <Avatar className="w-8 h-8 rounded-full bg-white text-[#DCA524] font-bold text-xs flex items-center justify-center shadow-xs cursor-pointer border border-gray-100" />
              }
            >
              <AvatarFallback className="bg-white text-[#DCA524] text-xs font-bold">
                {initiales}
              </AvatarFallback>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="bg-[#0b3b29] text-white border-emerald-800 text-xs font-medium shadow-md z-50"
            >
              {userName}
            </TooltipContent>
          </Tooltip>

          {/* Tooltip Bouton Changement de Thème */}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-[#0B3B29]"
                />
              }
              onClick={() => {
                // Logique de changement de thème
              }}
            >
              <Sun className="w-4 h-4 text-[#DCA524]" />
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="bg-[#0b3b29] text-white border-emerald-800 text-xs font-medium shadow-md z-50"
            >
              Changer de thème
            </TooltipContent>
          </Tooltip>
        </div>
      </header>
    </TooltipProvider>
  );
}
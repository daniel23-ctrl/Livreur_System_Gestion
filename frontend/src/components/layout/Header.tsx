'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Bell, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getCurrentUser } from '@/services/auth.service';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { LoginResponse } from '@/types/auth.types';

export function Header() {
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState<string>("");

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
    : "CL";

  const userName = mounted && user
    ? `${user?.prenom ?? ""} ${user?.nom ?? ""}`.trim()
    : "Client";

  return (
    <TooltipProvider delay={100}>
      <header className="bg-[#0b3b29] text-white px-3 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
          {/* Logo & Titres */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="rounded-xl flex items-center justify-center w-10 h-10 shrink-0">
              <Image
                src="/KusiLogo.png"
                alt="Logo Kusi Livraison"
                width={32}
                height={32}
                className="object-contain w-full h-full"
                priority
              />
            </div>

            <div className="min-w-0">
              <h2 className="text-sm text-white leading-tight truncate">
                Kusi Client
              </h2>
              <p className="text-[10px] text-emerald-200/80 leading-tight truncate">
                {currentDate || "Portail Client Lomé, Togo"}
              </p>
            </div>
          </div>

          {/* Éléments à droite : Notifications + Avatar + Thème */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Tooltip Notifications */}
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    size="icon"
                    className="relative h-8 w-8 rounded-full bg-transparent text-xs font-bold text-emerald-200/70 hover:text-white hover:bg-white/10"
                  />
                }
              >
                <Bell size={16} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#d4a017] border border-[#0b3b29]" />
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-white text-[#0b3b29] border-gray-200 text-xs font-medium shadow-md z-50">
                Notifications
              </TooltipContent>
            </Tooltip>

            {/* Tooltip Avatar de l'utilisateur connecté */}
            <Tooltip>
              <TooltipTrigger
                render={
                  <Avatar className="w-6 h-6 rounded-full bg-transparent border border-[#d4a017] text-[#d4a017] font-bold text-xs flex items-center justify-center cursor-pointer" />
                }
              >
                <AvatarFallback className="bg-transparent text-[#d4a017] text-xs font-bold">
                  {initiales}
                </AvatarFallback>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-white text-[#0b3b29] border-gray-200 text-xs font-medium shadow-md z-50">
                {userName}
              </TooltipContent>
            </Tooltip>

            {/* Tooltip Bouton Changement de Thème */}
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-emerald-200/70 hover:text-white hover:bg-white/10"
                  />
                }
                onClick={() => {
                  // Logique de changement de thème
                }}
              >
                <Sun size={16} className="text-[#d4a017]" />
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-white text-[#0b3b29] border-gray-200 text-xs font-medium shadow-md z-50">
                Changer de thème
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}
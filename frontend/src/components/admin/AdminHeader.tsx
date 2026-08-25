"use client";
import NotificationsPopover from "@/components/admin/NotificationsPopover";
import React, { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Bell, Menu, Sun } from "lucide-react";
import { Livreur } from "@/types/livreur.types";
import { getConnectes } from "@/services/livreur.service";
import { getCurrentUser } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PAGE_TITLES: Record<string, string> = {
  "/admin/dashboard": "Tableau de bord",
  "/admin/commandes": "Commandes",
  "/admin/livreurs": "Gestion des Livreurs",
  "/admin/affectations": "Affectations",
  "/admin/archives": "Archives",
  "/admin/parametres": "Paramètres",
};

export interface AdminHeaderProps {
  onNouvelleCommande?: () => void;
  onToggleMobileMenu?: () => void;
  location?: string;
  onRefreshData?: () => void;
}

export default function AdminHeader({
  onNouvelleCommande,
  onToggleMobileMenu,
  location = "Lomé, Togo",
  onRefreshData,
}: AdminHeaderProps) {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] || "Tableau de bord";

  const [currentDate, setCurrentDate] = useState<string>("");
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  // États pour la gestion du Dialog et des livreurs
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [livreursEnLigne, setLivreursEnLigne] = useState<Livreur[]>([]);

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

  // Charger les livreurs disponibles pour l'assignation
  const fetchLivreurs = useCallback(async () => {
    try {
      const res = await getConnectes();
      setLivreursEnLigne(res);
    } catch (err) {
      console.error("Erreur lors de la récupération des livreurs :", err);
    }
  }, []);

  return (
    <TooltipProvider delay={100}>
      <header className="w-full bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-2 lg:py-2 flex items-center justify-between transition-all">
        {/* Côté gauche : Menu Mobile + Titre + Date */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex flex-col justify-center gap-0.5">
            <h1 className=" sm:text-xl lg:text-xl font-bold text-emerald-950 tracking-tight leading-tight">
              {title}
            </h1>

            <p className="md:block text-xs lg:text-xs">
              {currentDate ? `${currentDate}, ${location}` : location}
            </p>
          </div>
        </div>

        {/* Côté droit : Notifications + Avatar dynamique + Bouton Thème */}
        <div className="flex items-center gap-3 lg:gap-5">
          {/* Tooltip Notifications */}
          <Tooltip>
            <TooltipTrigger render={<span />}>
              <NotificationsPopover />
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
                <Avatar className="w-8 h-8 lg:w-8 lg:h-8 rounded-full bg-white text-[#DCA524] font-bold text-xs lg:text-sm flex items-center justify-center shadow-xs cursor-pointer" />
              }
            >
              <AvatarFallback className="bg-white text-[#DCA524] text-xs lg:text-sm font-bold">
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
                  className="h-9 w-9 lg:h-8 lg:w-8 rounded-full border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-[#0B3B29]"
                />
              }
              onClick={() => {
                // Logique de changement de thème à implémenter ici
              }}
            >
              <Sun className="w-4 h-4 lg:w-5 lg:h-5 text-[#DCA524]" />
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
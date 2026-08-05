"use client";

import React, { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Bell, Plus, Menu } from "lucide-react";
import axiosInstance from "@/lib/axios";
import API from "@/lib/apiPaths";
import { Livreur } from "@/types/livreur.types";
import { 
  CreateCommandeDialog,  
} from "@/components/admin/commandes/CreateCommandeDialog"; // Adapte le chemin selon ton dossier


import { getDisponibles } from "@/services/livreur.service"; 
import { CreateCommandePayload } from "@/types/commande.types";




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
  onRefreshData?: () => void; // Callback optionnel si tu souhaites rafraîchir la liste de la page en cours
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
  
  // États pour la gestion du Dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [livreursEnLigne, setLivreursEnLigne] = useState<Livreur[]>([]);

  useEffect(() => {
    const today = new Date();
    const formatted = today.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    setCurrentDate(formatted.charAt(0).toUpperCase() + formatted.slice(1));
  }, []);

  // Charger les livreurs disponibles pour l'assignation
  const fetchLivreurs = useCallback(async () => {
    try {
      const res = await getDisponibles();
      setLivreursEnLigne(res);
    } catch (err) {
      console.error("Erreur lors de la récupération des livreurs :", err);
    }
  }, []);

  // Déclenché à l'ouverture du dialogue
  const handleOpenDialog = () => {
    if (onNouvelleCommande) {
      onNouvelleCommande();
    }
    fetchLivreurs();
    setIsDialogOpen(true);
  };

  // API 1 : Création de la commande
  const handleCreateCommande = async (data: CreateCommandePayload) => {
    const res = await axiosInstance.post(API.commandes.all, data);
    if (onRefreshData) onRefreshData();
    return res.data; // Doit retourner { id: "..." }
  };

  // API 2 : Assignation du livreur
  const handleAssignerLivreur = async (commandeId: string, livreurId: string) => {
    await axiosInstance.post(`${API.commandes.all}/${commandeId}/assigner`, {
      id_livreur: livreurId,
    });
    if (onRefreshData) onRefreshData();
  };

  return (
    <>
      <header className="w-full bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-3.5 lg:py-4 flex items-center justify-between transition-all">
        {/* Côté gauche : Menu Mobile + Titre + Date */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex flex-col justify-center">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#0B3B29] tracking-tight leading-tight">
              {title}
            </h1>
            
            <p className="hidden md:block text-xs lg:text-sm font-medium text-gray-400 mt-0.5">
              {currentDate ? `${currentDate} • ${location}` : location}
            </p>
          </div>
        </div>

        {/* Côté droit : Notifications + Avatar + Bouton Action */}
        <div className="flex items-center gap-3 lg:gap-5">
          {/* Bell Icon avec pastille dorée */}
          <button
            className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#DCA524] border-2 border-white" />
          </button>

          {/* Avatar */}
          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-[#DCA524] text-white font-bold text-xs lg:text-sm flex items-center justify-center shadow-xs">
            AK
          </div>

          {/* Bouton Ouverture du Dialog */}
          <button
            onClick={handleOpenDialog}
            className="flex items-center gap-2 px-3.5 py-2 lg:px-5 lg:py-2.5 rounded-xl bg-[#DCA524] hover:bg-[#c8941d] text-white font-semibold text-xs lg:text-sm shadow-xs transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="hidden sm:inline">Nouvelle commande</span>
            <span className="sm:hidden">Créer</span>
          </button>
        </div>
      </header>

      {/* Intégration du composant Dialog de création/assignation */}
      <CreateCommandeDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        livreursEnLigne={livreursEnLigne}
        onCreateCommande={handleCreateCommande}
        onAssignerLivreur={handleAssignerLivreur}
      />
    </>
  );
}
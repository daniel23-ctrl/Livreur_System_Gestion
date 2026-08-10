"use client";

import { useState, useEffect } from "react";
import { Users, Clock, Truck, TrendingUp, Loader2 } from "lucide-react";
import { getAll as getAllCommandes } from "@/services/commande.service";
import { getAll as getAllLivreurs, getDisponibles } from "@/services/livreur.service";
import { CommandeResponse } from "@/types/commande.types";
import { Livreur } from "@/types/livreur.types";

export function AffectationsStats() {
  const [commandes, setCommandes] = useState<CommandeResponse[]>([]);
  const [livreurs, setLivreurs] = useState<Livreur[]>([]);
  const [livreursDispo, setLivreursDispo] = useState<Livreur[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatsData() {
      try {
        setLoading(true);
        const [cmdData, livData, dispoData] = await Promise.all([
          getAllCommandes(),
          getAllLivreurs(),
          getDisponibles()
        ]);
        setCommandes(cmdData);
        setLivreurs(livData);
        setLivreursDispo(dispoData);
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques :", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStatsData();
  }, []);

  // Calculs dynamiques basés sur les vraies données
  const livreursActifsCount = livreurs.filter(l => l.est_actif).length;
  
  // Commandes en attente (non assignées, ex: sans livreur)
  const commandesEnAttente = commandes.filter(c => !c.id_livreur && !c.livreur).length;
  
  // Courses en cours (par exemple avec un statut spécifique ou ayant un livreur assigné non livré)
  const coursesEnCours = commandes.filter(c => c.id_livreur || c.livreur).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-6">
        <Loader2 className="w-5 h-5 animate-spin text-[#0B3B29]" />
      </div>
    );
  }

  return (
    <div className="w-full bg-[#0B3B29]/80 border border-[#0B3B29]/20 rounded-xl py-4 px-2 mb-3 shadow-xs text-white">
      <div className="flex flex-wrap items-center justify-around gap-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
        
        {/* Livreurs en service */}
        <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:px-4 first:pt-0 first:px-2">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-white font-bold tracking-wide uppercase">Livreurs en service</div>
            <div className="text-sm font-bold text-white flex items-center gap-1">
              <span>{livreursDispo.length}</span>
              <span className="text-xs text-gray-300 font-normal">/ {livreursActifsCount}</span>
            </div>
          </div>
        </div>

        {/* En attente */}
        <div className="flex items-center gap-3 pt-3 sm:pt-0 sm:px-4">
          <div className="w-9 h-9 rounded-lg bg-[#DCA524]/20 text-[#DCA524] flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-white font-bold tracking-wide uppercase">En attente</div>
            <div className="text-sm font-bold text-white">{commandesEnAttente}</div>
          </div>
        </div>

        {/* Courses en cours */}
        <div className="flex items-center gap-3 pt-3 sm:pt-0 sm:px-4">
          <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-white font-bold tracking-wide uppercase">Courses en cours</div>
            <div className="text-sm font-bold text-white">{coursesEnCours}</div>
          </div>
        </div>

        {/* Total Commandes */}
        <div className="flex items-center gap-3 pt-3 sm:pt-0 sm:px-4 last:pr-0">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-white font-bold tracking-wide uppercase">Total Commandes</div>
            <div className="text-sm font-bold text-white">{commandes.length}</div>
          </div>
        </div>

      </div>
    </div>
  );
}
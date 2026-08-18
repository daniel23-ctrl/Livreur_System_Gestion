"use client";

import { useState, useMemo } from "react";
import axiosInstance from "@/lib/axios";
import API from "@/lib/apiPaths";
import { StatutCommande } from "@/types/commande.types";
import { useAdmin } from "@/contexts/AdminContext"; // Import du contexte global

import CommandesHeader from "@/components/admin/commandes/CommandeHeader";
import CommandesStats from "@/components/admin/commandes/CommandeStats";
import CommandesTable from "@/components/admin/commandes/CommandeTables";
import { CreateCommandeDialog } from "@/components/admin/commandes/CreateCommandeDialog"; 

import { CreateCommandePayload } from "@/types/commande.types";

export default function CommandesPage() {
  // Utilisation du contexte global admin
  const { commandes, livreursConnectes, loading, chargerDonnees } = useAdmin();

  const [search, setSearch] = useState("");
  const [filtreStatut, setFiltreStatut] = useState<StatutCommande | "TOUTES">("TOUTES");
  const [vuePeriode, setVuePeriode] = useState<"JOUR" | "GLOBAL">("JOUR");
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // État pour la modale de création
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const commandesPeriode = useMemo(() => {
    if (vuePeriode === "GLOBAL") return commandes;
    const today = new Date().toDateString();
    return commandes.filter((c) => c.createdAt && new Date(c.createdAt).toDateString() === today);
  }, [commandes, vuePeriode]);

  const stats = useMemo(() => {
    return {
      total: commandesPeriode.length,
      enAttente: commandesPeriode.filter((c) => c.statut_commande === "EN_ATTENTE").length,
      enCours: commandesPeriode.filter(
        (c) => c.statut_commande === "ASSIGNEE" || c.statut_commande === "EN_COURS_DE_LIVRAISON"
      ).length,
      livrees: commandesPeriode.filter((c) => c.statut_commande === "LIVREE").length,
      annulees: commandesPeriode.filter((c) => c.statut_commande === "ANNULEE").length,
    };
  }, [commandesPeriode]);

  const commandesFiltrees = useMemo(() => {
    return commandesPeriode.filter((c) => {
      const matchStatut = filtreStatut === "TOUTES" || c.statut_commande === filtreStatut;
      const q = search.toLowerCase();
      const matchSearch =
        c.reference?.toLowerCase().includes(q) ||
        c.client?.nom.toLowerCase().includes(q) ||
        c.telephone_demandeur?.includes(q) ||
        c.adresse_livraison?.toLowerCase().includes(q);

      return matchStatut && matchSearch;
    });
  }, [commandesPeriode, filtreStatut, search]);

  // Handler 1 : Créer la commande backend (Étape 1)
  const handleCreateCommande = async (data: CreateCommandePayload) => {
    const res = await axiosInstance.post(API.commandes.all, data);
    await chargerDonnees(false); 
    setLastRefresh(new Date());
    return res.data; 
  };

  // Handler 2 : Assigner le livreur backend (Étape 2)
  const handleAssignerLivreur = async (commandeId: string, livreurId: string) => {
    await axiosInstance.post(`${API.commandes.all}/${commandeId}/assigner`, {
      id_livreur: livreurId,
    });
    await chargerDonnees(false); 
    setLastRefresh(new Date());
  };

  return (
    <div className="px-1 py-2 sm:p-4 lg:p-2 space-y-4">
      <CommandesHeader 
        vuePeriode={vuePeriode} 
        setVuePeriode={setVuePeriode} 
        onOpenCreate={() => setIsCreateOpen(true)}
      />

      <CommandesStats vuePeriode={vuePeriode} stats={stats} />
      
      <CommandesTable
        commandes={commandesFiltrees}
        totalPeriode={commandesPeriode.length}
        loading={loading}
        search={search}
        setSearch={setSearch}
        filtreStatut={filtreStatut}
        setFiltreStatut={setFiltreStatut}
        onRefresh={async () => {
          await chargerDonnees(false);
          setLastRefresh(new Date());
        }}
        lastRefresh={lastRefresh}
      />

      {/* Modale de création et d'assignation */}
      <CreateCommandeDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        livreursEnLigne={livreursConnectes}
        onSuccess={async () => {
          await chargerDonnees(false);
          setLastRefresh(new Date());
        }}
      />
    </div>
  );
}
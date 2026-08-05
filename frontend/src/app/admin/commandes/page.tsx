"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import axiosInstance from "@/lib/axios";
import API from "@/lib/apiPaths";
import { Commande, StatutCommande } from "@/types/admin.types";

import CommandesHeader from "@/components/admin/commandes/CommandeHeader";
import CommandesStats from "@/components/admin/commandes/CommandeStats";
import CommandesTable from "@/components/admin/commandes/CommandeTables";
import { 
  CreateCommandeDialog,  
} from "@/components/admin/commandes/CreateCommandeDialog"; 

import {Livreur} from "@/types/livreur.types"; 
import { getDisponibles } from "@/services/livreur.service"; 
import { CreateCommandePayload } from "@/types/commande.types";

export default function CommandesPage() {

  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [livreursEnLigne, setLivreursEnLigne] = useState<Livreur[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtreStatut, setFiltreStatut] = useState<StatutCommande | "TOUTES">("TOUTES");
  const [vuePeriode, setVuePeriode] = useState<"JOUR" | "GLOBAL">("JOUR");
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // État pour la modale de création
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Charger la liste des commandes
  const fetchCommandes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(API.commandes.all);
      setCommandes(res.data);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Erreur chargement commandes", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les livreurs actifs/en ligne pour l'assignation
  const fetchLivreursEnLigne = useCallback(async () => {
    try {
      // Adapte le chemin API.livreurs si nécessaire
      const livreursActifs = await getDisponibles();
      
      setLivreursEnLigne(livreursActifs);
    } catch (err) {
      console.error("Erreur chargement livreurs", err);
    }
  }, []);

  useEffect(() => {
    fetchCommandes();
    fetchLivreursEnLigne();
  }, [fetchCommandes, fetchLivreursEnLigne]);

  // Handler 1 : Créer la commande backend (Étape 1)
  const handleCreateCommande = async (data: CreateCommandePayload) => {
    const res = await axiosInstance.post(API.commandes.all, data);
    fetchCommandes(); // Rafraîchit la liste globale des commandes
    return res.data; // Doit retourner l'objet créé avec son `id`
  };

  // Handler 2 : Assigner le livreur backend (Étape 2)
  const handleAssignerLivreur = async (commandeId: string, livreurId: string) => {
    await axiosInstance.post(`${API.commandes.all}/${commandeId}/assigner`, {
      id_livreur: livreurId,
    });
    fetchCommandes(); // Rafraîchit la liste pour mettre à jour le statut et le livreur
  };

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

  return (
    <div className="px-1 py-4 sm:p-6 lg:p-8 space-y-6">
      {/* Tu peux passer `onOpenCreate={() => setIsCreateOpen(true)}` à ton CommandesHeader s'il contient le bouton */}
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
        onRefresh={fetchCommandes}
        lastRefresh={lastRefresh}
      />

      {/* Modale de création et d'assignation */}
      <CreateCommandeDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        livreursEnLigne={livreursEnLigne}
        onSuccess={fetchCommandes}
      />
    </div>
  );
}
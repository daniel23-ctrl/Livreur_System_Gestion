"use client";

import { useState, useEffect, useCallback } from "react";
import { AffectationsStats } from "@/components/admin/affectations/AffectationsStats";
import { CommandesNonAffectees } from "@/components/admin/affectations/CommandesNonAffectees";
import { LivreursDisponibles } from "@/components/admin/affectations/LivreursDisponibles";
import { SuiviAffectationsTable } from "@/components/admin/affectations/SuiviAffectationsTable";
import { affecterLivreur } from "@/services/commande.service";
import { CommandeResponse } from "@/types/commande.types";
import { useAdmin } from "@/contexts/AdminContext"; // Import du contexte global
import { getReadableAddress, isCoordinatesString } from "@/utils/addresse";
import { toast } from "sonner";

export default function AffectationsPage() {
  // Récupération des données globales du contexte
  const { commandes: rawCommandes, livreursConnectes, livreursActifs, loading, chargerDonnees } = useAdmin();

  const [commandesEnrichies, setCommandesEnrichies] = useState<CommandeResponse[]>([]);
  const [isEnriching, setIsEnriching] = useState(false);

  // Fonction utilitaire pour enrichir les commandes avec les adresses lisibles
  const enrichCommandesWithAddresses = useCallback(async (rawCmds: any[]) => {
    return Promise.all(
      rawCmds.map(async (cmd) => {
        if (cmd.adresse_livraison && isCoordinatesString(cmd.adresse_livraison)) {
          const readable = await getReadableAddress(cmd.adresse_livraison);
          return { ...cmd, adresse_livraison: readable };
        }
        return cmd;
      })
    );
  }, []);

  // Mettre à jour et enrichir les commandes dès qu'elles changent dans le contexte
  useEffect(() => {
    let isMounted = true;
    const processAddresses = async () => {
      if (!rawCommandes || rawCommandes.length === 0) {
        if (isMounted) setCommandesEnrichies([]);
        return;
      }
      setIsEnriching(true);
      const enriched = await enrichCommandesWithAddresses(rawCommandes);
      if (isMounted) {
        setCommandesEnrichies(enriched);
        setIsEnriching(false);
      }
    };

    processAddresses();
    return () => {
      isMounted = false;
    };
  }, [rawCommandes, enrichCommandesWithAddresses]);

  const handleAffecterLivreur = async (idCommande: string, idLivreur: string) => {
    try {
      await affecterLivreur(idCommande, { id_livreur: idLivreur });
      toast.success("Livreur affecté avec succès !");

      // Mise à jour optimiste locale immédiate
      setCommandesEnrichies((prevCommandes) =>
        prevCommandes.map((cmd) =>
          cmd.id_commande === idCommande
            ? {
                ...cmd,
                id_livreur: idLivreur,
                livreur: livreursActifs.find((l: any) => l.id === idLivreur || l.id_livreur === idLivreur) || null
              }
            : cmd
        )
      );

      // Synchronisation globale en arrière-plan
      await chargerDonnees(false);

    } catch (error: any) {
      console.error("Erreur lors de l'affectation :", error);
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        error.error ||
        "Erreur lors de l'affectation du livreur.";
      toast.error(typeof errorMessage === "string" ? errorMessage : "Une erreur est survenue.");
      throw error;
    }
  };

  const isLoadingGlobal = loading || isEnriching;

  return (
    <div className="p-4 sm:p-6 w-full max-w-7xl mx-auto space-y-4">
      <AffectationsStats
        commandes={commandesEnrichies}
        livreurs={livreursActifs}
        livreursDispo={livreursConnectes}
        loading={isLoadingGlobal}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CommandesNonAffectees
          commandes={commandesEnrichies}
          livreursDispo={livreursConnectes}
          loading={isLoadingGlobal}
          onRefresh={() => chargerDonnees(false)}
          onAffecterLivreur={handleAffecterLivreur}
        />
        <LivreursDisponibles
          livreurs={livreursConnectes}
          commandes={commandesEnrichies}
          loading={isLoadingGlobal}
          onRefresh={() => chargerDonnees(false)}
        />
      </div>

      <SuiviAffectationsTable
        commandes={commandesEnrichies}
        loading={isLoadingGlobal}
        onRefresh={() => chargerDonnees(false)}
      />
    </div>
  );
}
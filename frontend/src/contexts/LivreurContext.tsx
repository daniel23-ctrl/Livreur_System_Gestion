'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { CommandeResponse } from "@/types/commande.types";
import { LivreurProfile } from "@/types/mission";
import { getCommandesLivreurConnecte } from "@/services/commande.service";
import { getMyself } from "@/services/livreur.service";
import { MapProfileLivreur } from "@/utils/livreur.utils";
import { wsService } from "@/lib/socket";
import { getReadableAddress } from "@/utils/addresse"; 

interface LivreurContextType {
  commandes: CommandeResponse[];
  profile: LivreurProfile | null;
  loading: boolean;
  refreshDonnees: () => Promise<void>;
}

const LivreurContext = createContext<LivreurContextType | undefined>(undefined);

export function LivreurProvider({ children }: { children: React.ReactNode }) {
  const [commandes, setCommandes] = useState<CommandeResponse[]>([]);
  const [profile, setProfile] = useState<LivreurProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshDonnees = useCallback(async () => {
    try {
      const [livreurResult, commandesResult] = await Promise.allSettled([
        getMyself(),
        getCommandesLivreurConnecte()
      ]);

      const rawCommandes: CommandeResponse[] = commandesResult.status === 'fulfilled' ? commandesResult.value : [];
      const livreurData = livreurResult.status === 'fulfilled' ? livreurResult.value : null;

      // Transformation des adresses en texte lisible (si vos commandes possèdent des coordonnées)
      const commandesAvecAdresses = await Promise.all(
        rawCommandes.map(async (cmd) => {
          const adresseRamassageLisible = cmd.adresse_ramassage 
            ? await getReadableAddress(cmd.adresse_ramassage) 
            : cmd.adresse_ramassage;

          const adresseLivraisonLisible = cmd.adresse_livraison 
            ? await getReadableAddress(cmd.adresse_livraison) 
            : cmd.adresse_livraison;

          return {
            ...cmd,
            adresse_ramassage: adresseRamassageLisible,
            adresse_livraison: adresseLivraisonLisible,
          };
        })
      );

      setCommandes(commandesAvecAdresses);
      
      if (livreurData) {
        setProfile(MapProfileLivreur(livreurData, commandesAvecAdresses));
      } else {
        // Profil par défaut si l'API profil renvoie une erreur
        setProfile({
          initials: '',
          name: '',
          status: 'En ligne',
          assignedCoursesCount: commandesAvecAdresses.filter(
            (c) => c.statut_commande !== 'LIVREE' && c.statut_commande !== 'ANNULEE'
          ).length,
          completedCoursesCount: commandesAvecAdresses.filter(
            (c) => c.statut_commande === 'LIVREE'
          ).length,
        });
      }
    } catch (error) {
      console.error("Erreur lors de la synchronisation des données livreur :", error);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await refreshDonnees();
      setLoading(false);
    };
    init();

    // Connexion WebSocket en temps réel
    wsService.connect();
    const handleWsEvent = () => {
      refreshDonnees(); // Recharge silencieusement les données dès qu'un événement survient
    };

    const eventsToListen = [
      'commandeCreated',
      'commandeUpdated',
      'commandeEtatUpdated',
      'commandeAssigned',
    ];

    eventsToListen.forEach((event) => wsService.on(event, handleWsEvent));

    return () => {
      eventsToListen.forEach((event) => wsService.off(event, handleWsEvent));
    };
  }, [refreshDonnees]);

  return (
    <LivreurContext.Provider value={{ commandes, profile, loading, refreshDonnees }}>
      {children}
    </LivreurContext.Provider>
  );
}

export function useLivreur() {
  const context = useContext(LivreurContext);
  if (!context) {
    throw new Error("useLivreur doit être utilisé à l'intérieur d'un LivreurProvider");
  }
  return context;
}
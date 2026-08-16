"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import axiosInstance from "@/lib/axios";
import API from "@/lib/apiPaths";
import { getConnectes, getActifs, getInactifs } from "@/services/livreur.service";
import { getAdminById } from "@/services/admin.service";
import { wsService } from "@/lib/socket";
import { Commande } from "@/types/commande.types";
import { Livreur } from "@/types/livreur.types";
import { ClientUpdate } from "@/types/auth.types";
import { Role } from "@/types/auth.types";
import { getReadableAddress } from "@/utils/addresse"; // <-- Importez votre utilitaire ici

interface AdminContextType {
  commandes: Commande[];
  livreursActifs: Livreur[];
  livreursArchives: Livreur[];
  livreursConnectes: Livreur[];
  adminProfile: ClientUpdate | null;
  role: Role | "";
  loading: boolean;
  chargerDonnees: (showLoader?: boolean) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [livreursActifs, setLivreursActifs] = useState<Livreur[]>([]);
  const [livreursArchives, setLivreursArchives] = useState<Livreur[]>([]);
  const [livreursConnectes, setLivreursConnectes] = useState<Livreur[]>([]);
  const [adminProfile, setAdminProfile] = useState<ClientUpdate | null>(null);
  const [role, setRole] = useState<Role | "">("");
  const [loading, setLoading] = useState<boolean>(true);

  const chargerDonnees = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);

      const adminId = localStorage.getItem("id") || "";
      const storedRole = localStorage.getItem("role") as Role;

      if (storedRole) {
        setRole(storedRole);
      }

      // Requêtes parallèles
      const [cmdRes, actifsRes, inactifsRes, connectesRes, adminData] = await Promise.all([
        axiosInstance.get(API.commandes.all),
        getActifs(),
        getInactifs(),
        getConnectes(),
        adminId ? getAdminById(adminId).catch(() => null) : Promise.resolve(null),
      ]);

      const rawCommandes: Commande[] = cmdRes.data;

      // Transformation asynchrone des adresses (Ramassage & Livraison) pour chaque commande
      const commandesAvecAdressesLisibles = await Promise.all(
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

      setCommandes(commandesAvecAdressesLisibles);
      setLivreursActifs(actifsRes);
      setLivreursArchives(inactifsRes);
      setLivreursConnectes(connectesRes);
      
      if (adminData) {
        setAdminProfile(adminData);
        if (adminData.role) {
          setRole(adminData.role as Role);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la synchronisation globale des données admin :", error);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    chargerDonnees(true);
    wsService.connect();

    // Fonction déclenchée à chaque réception de message WebSocket
    const handleWsEvent = (payload?: any) => {
      console.log("Événement WS capté, rechargement des données...", payload);
      chargerDonnees(false);
    };

    const eventsToListen = [
      'commandeCreated',
      'commandeUpdated',
      'commandeEtatUpdated',
      'commandeAssigned',
      'livreurCreated',
      'livreurUpdated',
      'livreurEtatUpdated',
      'livreurRestore',
      'livreurArchived',
    ];

    eventsToListen.forEach((event) => {
      wsService.on(event, handleWsEvent);
    });

    return () => {
      eventsToListen.forEach((event) => {
        wsService.off(event, handleWsEvent);
      });
    };
  }, [chargerDonnees]);
  return (
    <AdminContext.Provider
      value={{
        commandes,
        livreursActifs,
        livreursArchives,
        livreursConnectes,
        adminProfile,
        role,
        loading,
        chargerDonnees,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin doit être utilisé à l'intérieur d'un AdminProvider");
  }
  return context;
}
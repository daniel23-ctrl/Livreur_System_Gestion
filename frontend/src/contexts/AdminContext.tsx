"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import axiosInstance from "@/lib/axios";
import API from "@/lib/apiPaths";
import { getConnectes, getActifs, getInactifs } from "@/services/livreur.service";
import { getAdminById } from "@/services/admin.service";
import { listerNotifications } from "@/services/notification.service";
import { wsService } from "@/lib/socket";
import { Commande } from "@/types/commande.types";
import { Livreur } from "@/types/livreur.types";
import { ClientUpdate } from "@/types/auth.types";
import { Role } from "@/types/auth.types";
import { NotificationItem } from "@/types/notification.types";
import { getReadableAddress } from "@/utils/addresse";
import { toast } from "sonner";

interface AdminContextType {
  commandes: Commande[];
  livreursActifs: Livreur[];
  livreursArchives: Livreur[];
  livreursConnectes: Livreur[];
  adminProfile: ClientUpdate | null;
  role: Role | "";
  loading: boolean;
  chargerDonnees: (showLoader?: boolean) => Promise<void>;
  notifications: NotificationItem[];
  notificationsNonLues: number;
  marquerNotificationsCommeLues: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const STORAGE_KEY_DERNIERE_LECTURE = "notifications_derniere_lecture";

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [livreursActifs, setLivreursActifs] = useState<Livreur[]>([]);
  const [livreursArchives, setLivreursArchives] = useState<Livreur[]>([]);
  const [livreursConnectes, setLivreursConnectes] = useState<Livreur[]>([]);
  const [adminProfile, setAdminProfile] = useState<ClientUpdate | null>(null);
  const [role, setRole] = useState<Role | "">("");
  const [loading, setLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsNonLues, setNotificationsNonLues] = useState(0);

  const derniereLectureRef = useRef<number>(
    typeof window !== "undefined"
      ? Number(localStorage.getItem(STORAGE_KEY_DERNIERE_LECTURE)) || 0
      : 0
  );

  const chargerDonnees = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);

      const adminId = localStorage.getItem("id") || "";
      const storedRole = localStorage.getItem("role") as Role;
      if (storedRole) setRole(storedRole);

      const [cmdRes, actifsRes, inactifsRes, connectesRes, adminData, notifsRes] = await Promise.all([
        axiosInstance.get(API.commandes.all),
        getActifs(),
        getInactifs(),
        getConnectes(),
        adminId ? getAdminById(adminId).catch(() => null) : Promise.resolve(null),
        listerNotifications().catch(() => []),
      ]);

      const rawCommandes: Commande[] = cmdRes.data;

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

      const notifsTriees = [...notifsRes].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setNotifications(notifsTriees);
      const nonLues = notifsTriees.filter(
        (n) => new Date(n.createdAt).getTime() > derniereLectureRef.current
      ).length;
      setNotificationsNonLues(nonLues);

      if (adminData) {
        setAdminProfile(adminData);
        if (adminData.role) setRole(adminData.role as Role);
      }
    } catch (error) {
      console.error("Erreur lors de la synchronisation globale des données admin :", error);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  const marquerNotificationsCommeLues = useCallback(() => {
    const maintenant = Date.now();
    derniereLectureRef.current = maintenant;
    localStorage.setItem(STORAGE_KEY_DERNIERE_LECTURE, String(maintenant));
    setNotificationsNonLues(0);
  }, []);

  useEffect(() => {
    chargerDonnees(true);
    wsService.connect();

    const handleWsEvent = (payload?: any) => {
      chargerDonnees(false);
    };

    const handleNotificationCreated = (payload?: NotificationItem) => {
      if (!payload) return;

      setNotifications((prev) => [payload, ...prev]);
      setNotificationsNonLues((prev) => prev + 1);

      const estSucces = payload.statut_envoi === "ENVOYE";
      const titre = estSucces ? "SMS envoyé au client" : "Échec d'envoi SMS";

      if (estSucces) {
        toast.success(titre, { description: payload.message });
      } else {
        toast.error(titre, { description: payload.message });
      }
    };

    const eventsToListen = [
      "commandeCreated",
      "commandeUpdated",
      "commandeEtatUpdated",
      "commandeAssigned",
      "livreurCreated",
      "livreurUpdated",
      "livreurEtatUpdated",
      "livreurRestore",
      "livreurArchived",
    ];

    eventsToListen.forEach((event) => wsService.on(event, handleWsEvent));
    wsService.on("notificationCreated", handleNotificationCreated);

    return () => {
      eventsToListen.forEach((event) => wsService.off(event, handleWsEvent));
      wsService.off("notificationCreated", handleNotificationCreated);
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
        notifications,
        notificationsNonLues,
        marquerNotificationsCommeLues,
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
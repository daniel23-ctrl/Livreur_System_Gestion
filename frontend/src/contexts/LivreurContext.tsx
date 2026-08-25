'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { CommandeResponse } from "@/types/commande.types";
import { LivreurProfile } from "@/types/mission";
import { getCommandesLivreurConnecte } from "@/services/commande.service";
import { getMyself } from "@/services/livreur.service";
import { listerMesNotificationsLivreur } from "@/services/notification.service";
import { MapProfileLivreur } from "@/utils/livreur.utils";
import { wsService } from "@/lib/socket";
import { getReadableAddress } from "@/utils/addresse";
import { NotificationItem } from "@/types/notification.types";
import { toast } from "sonner";

interface LivreurContextType {
  commandes: CommandeResponse[];
  profile: LivreurProfile | null;
  loading: boolean;
  refreshDonnees: () => Promise<void>;
  notifications: NotificationItem[];
  notificationsNonLues: number;
  marquerNotificationsCommeLues: () => void;
}

const LivreurContext = createContext<LivreurContextType | undefined>(undefined);

const STORAGE_KEY_DERNIERE_LECTURE = "livreur_notifications_derniere_lecture";

export function LivreurProvider({ children }: { children: React.ReactNode }) {
  const [commandes, setCommandes] = useState<CommandeResponse[]>([]);
  const [profile, setProfile] = useState<LivreurProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsNonLues, setNotificationsNonLues] = useState(0);

  const commandesRef = useRef<CommandeResponse[]>([]);

  const derniereLectureRef = useRef<number>(
    typeof window !== "undefined"
      ? Number(localStorage.getItem(STORAGE_KEY_DERNIERE_LECTURE)) || 0
      : 0
  );

  const refreshDonnees = useCallback(async () => {
    try {
      const [livreurResult, commandesResult, notifsResult] = await Promise.allSettled([
        getMyself(),
        getCommandesLivreurConnecte(),
        listerMesNotificationsLivreur(),
      ]);

      const rawCommandes: CommandeResponse[] = commandesResult.status === 'fulfilled' ? commandesResult.value : [];
      const livreurData = livreurResult.status === 'fulfilled' ? livreurResult.value : null;
      const rawNotifs: NotificationItem[] = notifsResult.status === 'fulfilled' ? notifsResult.value : [];

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
      commandesRef.current = commandesAvecAdresses;

      const notifsTriees = [...rawNotifs].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setNotifications(notifsTriees);
      const nonLues = notifsTriees.filter(
        (n) => new Date(n.createdAt).getTime() > derniereLectureRef.current
      ).length;
      setNotificationsNonLues(nonLues);

      if (livreurData) {
        setProfile(MapProfileLivreur(livreurData, commandesAvecAdresses));
      } else {
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

  const marquerNotificationsCommeLues = useCallback(() => {
    const maintenant = Date.now();
    derniereLectureRef.current = maintenant;
    localStorage.setItem(STORAGE_KEY_DERNIERE_LECTURE, String(maintenant));
    setNotificationsNonLues(0);
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await refreshDonnees();
      setLoading(false);
    };
    init();

    wsService.connect();
    const handleWsEvent = () => {
      refreshDonnees();
    };

    const handleNotificationCreated = (payload?: NotificationItem) => {
      if (!payload) return;

      const estSaCommande = commandesRef.current.some((c) => c.id_commande === payload.id_commande);
      if (!estSaCommande) return;

      setNotifications((prev) => [payload, ...prev]);
      setNotificationsNonLues((prev) => prev + 1);

      const estSucces = payload.statut_envoi === "ENVOYE";
      toast[estSucces ? "success" : "error"](
        estSucces ? "SMS envoyé au client" : "Échec d'envoi SMS",
        { description: payload.message }
      );
    };

    const eventsToListen = [
      'commandeCreated',
      'commandeUpdated',
      'commandeEtatUpdated',
      'commandeAssigned',
    ];

    eventsToListen.forEach((event) => wsService.on(event, handleWsEvent));
    wsService.on("notificationCreated", handleNotificationCreated);

    return () => {
      eventsToListen.forEach((event) => wsService.off(event, handleWsEvent));
      wsService.off("notificationCreated", handleNotificationCreated);
    };
  }, [refreshDonnees]);

  return (
    <LivreurContext.Provider
      value={{
        commandes,
        profile,
        loading,
        refreshDonnees,
        notifications,
        notificationsNonLues,
        marquerNotificationsCommeLues,
      }}
    >
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
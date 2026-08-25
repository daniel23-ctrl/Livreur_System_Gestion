"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { listerMesNotificationsClient } from "@/services/notification.service";
import { wsService } from "@/lib/socket";
import { NotificationItem } from "@/types/notification.types";
import { toast } from "sonner";

interface ClientNotificationsContextType {
  notifications: NotificationItem[];
  notificationsNonLues: number;
  marquerNotificationsCommeLues: () => void;
  rafraichirNotifications: () => Promise<void>;
}

const ClientNotificationsContext = createContext<ClientNotificationsContextType | undefined>(undefined);

const STORAGE_KEY_DERNIERE_LECTURE = "client_notifications_derniere_lecture";

export function ClientNotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsNonLues, setNotificationsNonLues] = useState(0);

  const derniereLectureRef = useRef<number>(
    typeof window !== "undefined"
      ? Number(localStorage.getItem(STORAGE_KEY_DERNIERE_LECTURE)) || 0
      : 0
  );

  const rafraichirNotifications = useCallback(async () => {
    try {
      const data = await listerMesNotificationsClient();
      const triees = [...data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setNotifications(triees);
      const nonLues = triees.filter(
        (n) => new Date(n.createdAt).getTime() > derniereLectureRef.current
      ).length;
      setNotificationsNonLues(nonLues);
    } catch (error) {
      console.error("Erreur lors du chargement des notifications client :", error);
    }
  }, []);

  const marquerNotificationsCommeLues = useCallback(() => {
    const maintenant = Date.now();
    derniereLectureRef.current = maintenant;
    localStorage.setItem(STORAGE_KEY_DERNIERE_LECTURE, String(maintenant));
    setNotificationsNonLues(0);
  }, []);

  useEffect(() => {
    rafraichirNotifications();
    wsService.connect();

    const handleNotificationCreated = (payload?: NotificationItem) => {
      if (!payload) return;

      setNotifications((prev) => [payload, ...prev]);
      setNotificationsNonLues((prev) => prev + 1);

      const estSucces = payload.statut_envoi === "ENVOYE";
      const titre =
        payload.declencheur === "ASSIGNEE"
          ? "Un livreur a été assigné"
          : "Votre colis est en route";

      if (estSucces) {
        toast.success(titre, { description: payload.message });
      } else {
        // On informe quand même le client d'un événement, même si le SMS a échoué techniquement
        toast.info(titre, { description: payload.message });
      }
    };

    wsService.on("notificationCreated", handleNotificationCreated);

    return () => {
      wsService.off("notificationCreated", handleNotificationCreated);
    };
  }, [rafraichirNotifications]);

  return (
    <ClientNotificationsContext.Provider
      value={{
        notifications,
        notificationsNonLues,
        marquerNotificationsCommeLues,
        rafraichirNotifications,
      }}
    >
      {children}
    </ClientNotificationsContext.Provider>
  );
}

export function useClientNotifications() {
  const context = useContext(ClientNotificationsContext);
  if (!context) {
    throw new Error("useClientNotifications doit être utilisé à l'intérieur d'un ClientNotificationsProvider");
  }
  return context;
}
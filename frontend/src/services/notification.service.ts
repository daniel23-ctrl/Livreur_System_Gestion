import axiosInstance from "@/lib/axios";
import API from "@/lib/apiPaths";
// Assure-toi d'avoir créé ou adapté le type Notification correspondante
import { Notification } from "@/types/notification.types"; 

/** Liste toutes les notifications — Admin uniquement (@router.get("/")) */
export async function getAllNotifications(): Promise<Notification[]> {
  const res = await axiosInstance.get(API.notifications.base); // Adapte selon ton objet API paths
  return res.data;
}

/** Liste les notifications d'une commande — Admin uniquement (@router.get("/{id_commande}")) */
export async function getNotificationsByCommande(idCommande: string): Promise<Notification[]> {
  const res = await axiosInstance.get(`${API.notifications.base}/${idCommande}`);
  return res.data;
}
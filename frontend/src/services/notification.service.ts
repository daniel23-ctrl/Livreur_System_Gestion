
import axiosInstance from "@/lib/axios";
import API from "@/lib/apiPaths";
import { NotificationItem } from "@/types/notification.types";

export async function listerNotifications(): Promise<NotificationItem[]> {
  const { data } = await axiosInstance.get<NotificationItem[]>(API.notifications.all);
  return data;
}

export async function listerNotificationsParCommande(
  idCommande: string
): Promise<NotificationItem[]> {
  const { data } = await axiosInstance.get<NotificationItem[]>(
    API.notifications.parCommande(idCommande)
  );
  return data;
}
export async function listerMesNotificationsLivreur(): Promise<NotificationItem[]> {
  const { data } = await axiosInstance.get<NotificationItem[]>(
    API.notifications.mesNotificationsLivreur
  );
  return data;
}
export async function listerMesNotificationsClient(): Promise<NotificationItem[]> {
  const { data } = await axiosInstance.get<NotificationItem[]>(
    API.notifications.mesNotificationsClient
  );
  return data;
}

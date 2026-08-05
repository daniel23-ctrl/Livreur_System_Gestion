import axiosInstance from "@/lib/axios";
import API from "@/lib/apiPaths";
import { Notification } from "@/types/notification.types"; 

export async function getAllNotifications(): Promise<Notification[]> {
  const res = await axiosInstance.get(API.notifications.base);
  return res.data;
}

export async function getNotificationsByCommande(idCommande: string): Promise<Notification[]> {
  const res = await axiosInstance.get(`${API.notifications.base}/${idCommande}`);
  return res.data;
}
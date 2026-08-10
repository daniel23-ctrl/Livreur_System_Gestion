import axiosInstance from "@/lib/axios";
import API from "@/lib/apiPaths";
import { ClientResponse, ClientUpdate } from "@/types/auth.types";

export async function getAdminById(id: string): Promise<ClientResponse> {
  // Nettoie l'ID de tout espace blanc, retour à la ligne ou caractère invisible
  const cleanId = id ? id.trim() : "";
  const res = await axiosInstance.get(API.admin.recuperer(cleanId));
  return res.data;
}


export async function updateAdminProfile(data: ClientUpdate): Promise<ClientResponse> {
  const res = await axiosInstance.patch(API.admin.modifierMe, data);
  return res.data;
}
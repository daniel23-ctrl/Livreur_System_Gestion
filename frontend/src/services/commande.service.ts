import axiosInstance from "@/lib/axios";
import API from "@/lib/apiPaths";
import { CommandeResponse, CreateCommandePayload } from "@/types/commande.types"; 


export async function getAll(): Promise<CommandeResponse[]> {
  const res = await axiosInstance.get(API.commandes.all);
  return res.data;
}

export async function createCommande(payload: CreateCommandePayload): Promise<CommandeResponse> {
  const res = await axiosInstance.post(API.commandes.base, payload);
  return res.data;
}

export async function affecterLivreur(commandeId: string, payload: { id_livreur: string }): Promise<CommandeResponse> {
  const res = await axiosInstance.patch(
    API.commandes.affecter(commandeId),
    payload
  );
  return res.data;
}


export async function getCommandesClient(): Promise<CommandeResponse[]> {
  const res = await axiosInstance.get(API.commandes.base);
  return res.data;
}

export async function getCommandeById(idCommande: string): Promise<CommandeResponse> {
  const res = await axiosInstance.get(`${API.commandes.base}/${idCommande}`);
  return res.data;
}

export async function getCommandeByReference(reference: string): Promise<CommandeResponse> {
  const res = await axiosInstance.get(`${API.commandes.base}/reference/${reference}`);
  return res.data;
}

export async function getCommandesByStatut(statut: string): Promise<CommandeResponse[]> {
  const res = await axiosInstance.get(`${API.commandes.base}/statut/${statut}`);
  return res.data;
}

export async function updateCommande(idCommande: string, payload: Partial<CreateCommandePayload>): Promise<CommandeResponse> {
  const res = await axiosInstance.put(`${API.commandes.base}/${idCommande}`, payload);
  return res.data;
}

export async function updateStatutCommande(idCommande: string, statut: string): Promise<CommandeResponse> {
  const res = await axiosInstance.patch(`${API.commandes.base}/statut`, null, {
    params: { id_commande: idCommande, statut }
  });
  return res.data;
}

export async function suiviPublicCommande(reference: string): Promise<CommandeResponse> {
  const res = await axiosInstance.get(`${API.commandes.base}/suivi/${reference}`);
  return res.data;
}
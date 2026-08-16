import axiosInstance from "@/lib/axios";
import API from "@/lib/apiPaths";
import { Livreur,EtatActiviteEnum, LivreurCreatePayload, LivreurProfilUpdate} from "@/types/livreur.types";


export async function getAll(): Promise<Livreur[]> {
  const res = await axiosInstance.get(API.livreurs.base);
  return res.data;
}

export async function getConnectes(): Promise<Livreur[]> {
  const res = await axiosInstance.get(API.livreurs.connectes);
  return res.data;
}

export async function getActifs(): Promise<Livreur[]> {
  const res = await axiosInstance.get(API.livreurs.actifs);
  return res.data;
}

export async function getInactifs(): Promise<Livreur[]> {
  const res = await axiosInstance.get(API.livreurs.inactifs);
  return res.data;
}

export async function getById(id: string): Promise<Livreur> {
  const res = await axiosInstance.get(`${API.livreurs.base}/${id}`);
  return res.data;
}

export async function getMyself(): Promise<Livreur> {
  const res = await axiosInstance.get(API.livreurs.moi);
  return res.data;
}

export async function createLivreur(data: LivreurCreatePayload): Promise<Livreur> {
  const res = await axiosInstance.post(API.livreurs.base, data);
  return res.data;
}

export async function updateLivreur(id: string, data: LivreurProfilUpdate): Promise<Livreur> {
  const res = await axiosInstance.put(`${API.livreurs.modifier(id)}`, data);
  return res.data;
}

export async function updateEtatLivreur(id: string, etat_activite: EtatActiviteEnum): Promise<Livreur> {
  const res = await axiosInstance.patch(`${API.livreurs.etat(id)}`, { etat_activite });
  return res.data;
}

export async function updateMonProfil(data: Partial<LivreurCreatePayload>): Promise<Livreur> {
  const res = await axiosInstance.patch(`${API.livreurs.moi}`, data);
  return res.data;
}
export async function updateMonMotDePasse(data: { ancien_mot_de_passe: string, nouveau_mot_de_passe: string }): Promise<{ message: string }> {
  const res = await axiosInstance.put(API.livreurs.changerMotDePasse, data);
  return res.data;
}

export async function archiverLivreur(id: string): Promise<{ message: string }> {
  const res = await axiosInstance.delete(`${API.livreurs.supprimer(id)}`);
  return res.data;
}

export async function restaurerLivreur(id: string): Promise<Livreur> {
  const res = await axiosInstance.patch(`${API.livreurs.restaurer(id)}`);
  return res.data;
}
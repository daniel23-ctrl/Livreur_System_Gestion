import axiosInstance from "@/lib/axios";
import API from "@/lib/apiPaths";
import { Livreur,EtatActiviteEnum } from "@/types/livreur.types";


export async function getAll(): Promise<Livreur[]> {
  const res = await axiosInstance.get(API.livreurs.base);
  return res.data;
}

export async function getDisponibles(): Promise<Livreur[]> {
  const res = await axiosInstance.get(API.livreurs.disponibles);
  return res.data;
}


export async function getActifs(): Promise<Livreur[]> {
  const res = await axiosInstance.get(`${API.livreurs.base}/actifs`);
  return res.data;
}

export async function getById(id: string): Promise<Livreur> {
  const res = await axiosInstance.get(`${API.livreurs.base}/${id}`);
  return res.data;
}

export async function createLivreur(data: any): Promise<Livreur> {
  const res = await axiosInstance.post(API.livreurs.base, data);
  return res.data;
}

export async function updateLivreur(id: string, data: any): Promise<Livreur> {
  const res = await axiosInstance.put(`${API.livreurs.base}/${id}`, data);
  return res.data;
}

export async function updateEtatLivreur(id: string, etat_activite: EtatActiviteEnum): Promise<Livreur> {
  const res = await axiosInstance.patch(`${API.livreurs.base}/${id}/etat`, { etat_activite });
  return res.data;
}

export async function updateMonProfil(data: any): Promise<Livreur> {
  const res = await axiosInstance.patch(`${API.livreurs.base}/moi`, data);
  return res.data;
}

export async function deleteLivreur(id: string): Promise<{ message: string }> {
  const res = await axiosInstance.delete(`${API.livreurs.base}/${id}`);
  return res.data;
}
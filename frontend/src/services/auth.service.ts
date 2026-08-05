import axiosInstance from "@/lib/axios";
import API from "@/lib/apiPaths";
import {
  LoginPayload,
  LoginResponse,
  InscriptionClientPayload,
  InscriptionLivreurPayload,
  InscriptionResponse,
} from "@/types/auth.types";

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await axiosInstance.post<LoginResponse>(
    API.auth.login,
    payload
  );
  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("role", data.role);
  localStorage.setItem("id", data.id);
  localStorage.setItem("nom", data.nom);
  localStorage.setItem("prenom", data.prenom);
  return data;
}

export async function inscrireClient(
  payload: InscriptionClientPayload
): Promise<InscriptionResponse> {
  const { data } = await axiosInstance.post<InscriptionResponse>(
    API.auth.inscription,
    payload
  );
  return data;
}

export async function inscrireLivreur(
  payload: InscriptionLivreurPayload
): Promise<InscriptionResponse> {
  const { data } = await axiosInstance.post<InscriptionResponse>(
    API.auth.inscriptionLivreur,
    payload
  );
  return data;
}

export async function logout(): Promise<void> {
  try {
    await axiosInstance.post(API.auth.logout);
  } finally {
    localStorage.clear();
    window.location.href = "/login";
  }
}

export function getCurrentUser() {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("access_token");
  if (!token) return null;
  return {
    token,
    role: localStorage.getItem("role"),
    id: localStorage.getItem("id"),
    nom: localStorage.getItem("nom"),
    prenom: localStorage.getItem("prenom"),
  };
}

export function getRedirectPath(role: string): string {
  switch (role) {
    case "ADMINISTRATEUR": return "/admin/dashboard";
    case "LIVREUR": return "/livreur/missions";
    case "CLIENT": return "/client/commandes";
    default: return "/auth/login";
  }
}
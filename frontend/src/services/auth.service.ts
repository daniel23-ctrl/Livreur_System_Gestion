import axiosInstance from "@/lib/axios";
import API from "@/lib/apiPaths";
import {
  LoginPayload,
  LoginResponse,
  ClientResponse,
  InscriptionClientPayload,
  InscriptionLivreurPayload,
  Role,
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
  localStorage.setItem("telephone", data.telephone || "")
  return data;
}

export async function inscrireClient(
  payload: InscriptionClientPayload
): Promise<ClientResponse> {
  const { data } = await axiosInstance.post<ClientResponse>(
    API.auth.inscription,
    payload
  );
  return data;
}

export async function inscrireLivreur(
  payload: InscriptionLivreurPayload
): Promise<ClientResponse> {
  const { data } = await axiosInstance.post<ClientResponse>(
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
    window.location.href = "/auth/login";
  }
}

export function getCurrentUser() {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("access_token");
  if (!token) return null;

  const response: LoginResponse = {
    access_token: token,
    token_type: "Bearer",
    role: (localStorage.getItem("role") as Role) || "CLIENT",
    id: localStorage.getItem("id") ?? "",
    nom: localStorage.getItem("nom") ?? "",
    prenom: localStorage.getItem("prenom") ?? "",
    telephone: localStorage.getItem("telephone") || undefined,
  };
  
  return response
}

export function getRedirectPath(role: string): string {
  switch (role) {
    case "ADMINISTRATEUR": return "/admin/dashboard";
    case "LIVREUR": return "/livreur/missions";
    case "CLIENT": return "/client/commandes";
    default: return "/auth/login";
  }
}

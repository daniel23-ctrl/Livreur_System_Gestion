import axiosInstance from "@/lib/axios";
import API from "@/lib/apiPaths";
import {
  LoginPayload,
  LoginResponse,
  ClientResponse,
  InscriptionClientPayload,
  InscriptionLivreurPayload,
  VerifierOtpPayload,
  VerifierOtpResponse,
  RenvoyerOtpResponse,
  Role,
} from "@/types/auth.types";
import { wsService } from "@/lib/socket";


export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await axiosInstance.post<LoginResponse>(API.auth.login, payload);
  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("role", data.role);
  localStorage.setItem("id", data.id);
  localStorage.setItem("nom", data.nom);
  localStorage.setItem("prenom", data.prenom);
  localStorage.setItem("telephone", data.telephone || "");

  // Reconnexion forcée du WebSocket avec le token fraîchement reçu
  wsService.connect(true);

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
    wsService.disconnect();
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

export async function verifierOtp(
  payload: VerifierOtpPayload
): Promise<VerifierOtpResponse> {
  const { data } = await axiosInstance.post<VerifierOtpResponse>(
    API.auth.verifierOtp,
    payload
  );
  return data;
}

export async function renvoyerOtp(
  utilisateurId: string
): Promise<RenvoyerOtpResponse> {
  const { data } = await axiosInstance.post<RenvoyerOtpResponse>(
    API.auth.renvoyerOtp(utilisateurId)
  );
  return data;
}
import axiosInstance from "@/lib/axios";
import API from "@/lib/apiPaths";

export type EtatLivreur = "DISPONIBLE" | "HORS_LIGNE";
export type VehiculeEnum = "MOTO" | "VOITURE";
export type RoleEnum = "LIVREUR" | "ADMINISTRATEUR" | "CLIENT";
export type EtatActiviteEnum = "DISPONIBLE" | "HORS_LIGNE";

export interface LivreurCreatePayload {
  nom: string;
  prenom: string;
  telephone: string;
  mot_de_passe: string;
  email?: string;
  type_vehicule: "MOTO" | "VOITURE";
  immatriculation: string;
}
  
export interface LivreurProfilUpdate{
    nom?: string 
    prenom?: string
    telephone?: string
    email?: string
    type_vehicule?: VehiculeEnum 
    immatriculation?: string
}


    

export interface Livreur {
    id: string;
    nom?: string; 
    prenom?: string;
    telephone?: string;
    email?: string;
    role?: RoleEnum;
    type_vehicule: VehiculeEnum;
    immatriculation: string;
    etat_activite: EtatActiviteEnum;
    est_actif: boolean
}



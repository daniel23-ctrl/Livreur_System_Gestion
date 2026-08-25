export type Role = "ADMINISTRATEUR" | "LIVREUR" | "CLIENT";
export type TypeVehicule = "MOTO" | "VOITURE";

export interface LoginPayload {
  identifiant: string;
  mot_de_passe: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  role: Role;
  id: string;
  nom: string;
  prenom: string;
  telephone? : string
}
export interface VerifierOtpPayload {
  utilisateur_id: string;
  code: string;
}

export interface VerifierOtpResponse {
  message: string;
}

export interface RenvoyerOtpResponse {
  message: string;
}

export interface InscriptionClientPayload {
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  mot_de_passe: string;
}

export interface InscriptionLivreurPayload {
  nom: string;
  prenom: string;
  email?: string;
  telephone: string;
  mot_de_passe: string;
  type_vehicule: TypeVehicule;
  immatriculation: string;
}

// export interface InscriptionResponse {
//   id: string;
//   nom: string;
//   prenom: string;
//   email: string | null;
//   telephone: string | null;
//   role: Role;
// }

import { RoleEnum } from "./livreur.types";



export type EtatActiviteEnum = "DISPONIBLE" | "EN_COURSE" | "HORS_LIGNE";

export interface Client {
  id_utilisateur: string;
  nom: string;
  prenom: string;
  email?: string | null;
  telephone?: string | null;
  role?: string | null;
}

export interface ClientResponse{
    id_utilisateur: string 
    nom: string
    prenom: string 
    email?: string 
    telephone?: string
    role: RoleEnum
}
export interface Livreur {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  type_vehicule: "MOTO" | "VOITURE";
  immatriculation: string;
  etat_activite: EtatActiviteEnum;
  nb_courses?: number;
}
export interface ClientUpdate {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  ancien_mot_de_passe?: string;
  nouveau_mot_de_passe?: string;
}

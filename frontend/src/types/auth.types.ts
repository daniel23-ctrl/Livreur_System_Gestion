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

export interface InscriptionResponse {
  id: string;
  nom: string;
  prenom: string;
  email: string | null;
  telephone: string | null;
  role: Role;
}
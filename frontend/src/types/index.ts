export type Role = "admin" | "livreur" | "client";
export type NavItem = "dashboard" | "commandes" | "livreurs" | "affectations" | "archives";
export type OStatus = "En attente" | "Assignée" | "En cours de collecte" | "En cours de livraison" | "Livrée" | "Annulée";
export type DStatus = "Disponible" | "En course" | "Hors ligne";

export interface Order {
  ref: string;
  client: string;
  phone: string;
  pickup: string;
  delivery: string;
  colis: string;
  montant: number;
  status: OStatus;
  livreur?: string;
  livreurPhone?: string;
  time: string;
  date: string;
  instructions?: string;
}

export interface Driver {
  id: number;
  nom: string;
  prenom: string;
  phone: string;
  vehicule: string;
  immat: string;
  status: DStatus;
  courses: number;
  note: number;
}
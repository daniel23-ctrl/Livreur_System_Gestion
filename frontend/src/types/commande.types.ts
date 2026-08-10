import { Client } from "./auth.types";
import { Livreur } from "./livreur.types";

export type StatutCommande =
  | "EN_ATTENTE"
  | "ASSIGNEE"
  | "EN_COURS_DE_COLLECTE"
  | "EN_COURS_DE_LIVRAISON"
  | "LIVREE"
  | "ANNULEE";

export interface Commande {
  id_commande: string;
  id_client?: string | null;
  client?: Client | null;
  id_livreur?: string | null;
  livreur?: Livreur | null
  reference: string;
  description: string;
  adresse_ramassage: string;
  adresse_livraison: string;
  nom_destinataire: string;
  telephone_destinataire: string;
  telephone_demandeur: string;
  instructions?: string | null;
  montant_a_percevoir: number;
  statut_commande: StatutCommande;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CommandeCreatePayload {
  description: string;
  adresse_ramassage: string;
  adresse_livraison: string;
  nom_destinataire: string;
  telephone_destinataire: string;
  telephone_demandeur: string;
  instructions?: string | null;
  montant_a_percevoir: number;
}

export interface CommandeDetails {
  id_commande: string;
  reference: string;
  description?: string;
  adresse_ramassage?: string;
  adresse_livraison: string;
  nom_destinataire?: string;
  telephone_destinataire?: string;
  telephone_demandeur?: string;
  instructions?: string;
  montant_a_percevoir: number;
  statut_commande: string;
  createdAt?: string;
  client?: {
    id_utilisateur: string;
    nom: string;
    prenom: string;
    email?: string | null;
    telephone?: string | null;
  } | null;
  livreur?: {
    id: string;
    nom: string;
    prenom: string;
    telephone?: string;
    email?: string | null;
    type_vehicule?: string;
    immatriculation?: string;
  } | null;
}

export interface CreateCommandePayload {
  description: string;
  adresse_ramassage: string;
  adresse_livraison: string;
  nom_destinataire: string;
  telephone_destinataire: string;
  telephone_demandeur: string;
  instructions?: string | null;
  montant_a_percevoir: number;
}

export interface CommandeResponse {
  id_commande: string;
  id_client?: string | null;
  client?: Client | null;
  id_livreur?: string | null;
  livreur?: Livreur | null
  reference: string;
  description: string;
  adresse_ramassage: string;
  adresse_livraison: string;
  nom_destinataire: string;
  telephone_destinataire: string;
  telephone_demandeur: string;
  instructions?: string | null;
  montant_a_percevoir: number;
  statut_commande: StatutCommande;
  createdAt?: string | null;
  updatedAt?: string | null;
}
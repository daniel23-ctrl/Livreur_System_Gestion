export type StatutCommande =
  | "EN_ATTENTE"
  | "ASSIGNEE"
  | "EN_COURS_DE_COLLECTE"
  | "EN_COURS_DE_LIVRAISON"
  | "LIVREE"
  | "ANNULEE";

export type EtatActiviteEnum = "DISPONIBLE" | "EN_COURSE" | "HORS_LIGNE";

export interface Client {
  id_utilisateur: string;
  nom: string;
  prenom: string;
  email?: string | null;
  telephone?: string | null;
  role?: string | null;
}


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

export interface KpiData {
  livraisons_jour: number;
  taux_reussite: number;
  agent_plus_actif: {
    nom: string;
    prenom: string;
    nb_courses: number;
  } | null;
}
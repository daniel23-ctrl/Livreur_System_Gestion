export type StatutEnvoi = "EN_ATTENTE" | "ENVOYE" | "ECHEC";
export type Declencheur = "ASSIGNEE" | "EN_COURS_DE_LIVRAISON";

export interface NotificationItem {
  id_notification: string;
  id_commande: string;
  telephone_destinataire: string;
  message: string;
  statut_envoi: StatutEnvoi;
  declencheur: Declencheur;
  envoye_le: string | null;
  createdAt: string;
}
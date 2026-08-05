

export interface Notification {
  id_notification: string
    id_commande: string
    telephone_destinataire: string
    message: string
    statut_envoi: StatutEnvoiEnum
    declencheur: DeclencheurEnum
    envoye_le: string | null
    createdAt: string
} 

export type StatutEnvoiEnum =
  | "EN_ATTENTE"
  | "ENVOYE"
  | "ECHEC";

export type DeclencheurEnum =
  | "ASSIGNEE"
  | "EN_COURS_DE_LIVRAISON"
 

  

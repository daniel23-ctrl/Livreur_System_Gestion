export type MissionStatus = 'en_livraison' | 'assignee' | 'livree';

export interface Mission {
  id: string;
  date: string;
  pickup: string;
  destination: string;
  description: string;
  price: string;
  status: MissionStatus;
  statusLabel: string;
  highlightBorder?: boolean;
}

export interface LivreurProfile {
  initials: string;
  name: string; 
  status: string;
  assignedCoursesCount: number; 
  completedCoursesCount: number; 
  // Champs ajoutés pour le formulaire de paramètres :
  id?: string;
  id_livreur?: string;
  nom?: string;
  prenom?: string;
  telephone?: string;
  email?: string;
  role?: string;
  type_vehicule?: string;
  immatriculation?: string;
}
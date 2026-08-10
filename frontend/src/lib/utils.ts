import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Livreur } from '@/types/livreur.types'; 
import { LivreurProfile } from '@/types/mission';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import { CommandeResponse } from '@/types/commande.types';

// Adapte cette interface selon le type réel de ton objet Livreur
// interface LivreurData {
//   nom?: string;
//   prenom?: string;
//   etat_activite?: string;
//   [key: string]: any;
// }

export function MapProfileLivreur(livreurData: Livreur, commandes: CommandeResponse[]): LivreurProfile {
  // Construction du nom complet et des initiales 
  const prenom = livreurData.prenom || '';
  const nom = livreurData.nom || '';
  const nomComplet = [prenom, nom].filter(Boolean).join(' ') || 'Mon compte';
  
  const firstLetterPrenom = prenom ? prenom.charAt(0) : '';
  const firstLetterNom = nom ? nom.charAt(0) : '';
  const initials = (firstLetterPrenom + firstLetterNom).toUpperCase() || 'DL';

  // Calcul dynamique basé sur les commandes
  const assignedCoursesCount = commandes.filter(
    (c) => c.statut_commande !== 'LIVREE' && c.statut_commande !== 'ANNULEE'
  ).length;

  const completedCoursesCount = commandes.filter(
    (c) => c.statut_commande === 'LIVREE'
  ).length;

  return {
    initials,
    name: nomComplet,
    status: livreurData.etat_activite || 'En ligne',
    assignedCoursesCount,
    completedCoursesCount,
  };
}
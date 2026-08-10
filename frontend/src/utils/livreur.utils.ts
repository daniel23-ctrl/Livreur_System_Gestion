
import { Livreur } from '@/types/livreur.types';
import { LivreurProfile } from '@/types/mission';


import { CommandeResponse } from '@/types/commande.types';

export function MapProfileLivreur(livreurData: Livreur, commandes: CommandeResponse[]): LivreurProfile {

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
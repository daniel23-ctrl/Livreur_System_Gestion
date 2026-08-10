
export interface KpiData {
  livraisons_jour: number;
  taux_reussite: number;
  agent_plus_actif: {
    nom: string;
    prenom: string;
    nb_courses: number;
  } | null;
}
import { AffectationsStats } from "@/components/admin/affectations/AffectationsStats";
import { CommandesNonAffectees } from "@/components/admin/affectations/CommandesNonAffectees";
import { LivreursDisponibles } from "@/components/admin/affectations/LivreursDisponibles";
import { SuiviAffectationsTable } from "@/components/admin/affectations/SuiviAffectationsTable";

export const metadata = {
  title: "Affectations | Administration KUSI",
};

export default function AffectationsPage() {
  return (
    <div className="p-4 sm:p-6 w-full max-w-7xl mx-auto space-y-4">
      
      {/* 1. Bloc des statistiques rapides (compactes) */}
      <AffectationsStats />

      {/* 2. Vue Split-Screen : Commandes vs Livreurs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CommandesNonAffectees />
        <LivreursDisponibles />
      </div>

      {/* 3. Tableau de suivi visible directement sans gros scroll */}
      <SuiviAffectationsTable />

    </div>
  );
}
import { StatutCommande } from "@/types/admin.types";

const CONFIG: Record<
  StatutCommande,
  { label: string; bg: string; color: string }
> = {
  EN_ATTENTE:          { label: "En attente",   bg: "#FEF9C3", color: "#92400E" },
  ASSIGNEE:            { label: "Assignée",      bg: "#EDE9FE", color: "#5B21B6" },
  EN_COURS_DE_COLLECTE:{ label: "Collecte",      bg: "#FFEDD5", color: "#C2410C" },
  EN_COURS_DE_LIVRAISON:{ label: "En livraison", bg: "#DBEAFE", color: "#1D4ED8" },
  LIVREE:              { label: "Livrée",        bg: "#DCFCE7", color: "#15803D" },
  ANNULEE:             { label: "Annulée",       bg: "#FEE2E2", color: "#DC2626" },
};

export default function StatutBadge({ statut }: { statut: StatutCommande }) {
  const { label, bg, color } = CONFIG[statut] ?? CONFIG.EN_ATTENTE;
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: bg, color }}
    >
      {label}
    </span>
  );
}
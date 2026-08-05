import { EtatActiviteEnum } from "@/types/admin.types";

const CONFIG: Record<EtatActiviteEnum, { color: string; label: string }> = {
  DISPONIBLE: { color: "#16A34A", label: "Disponible" },
  EN_COURSE:  { color: "#D97706", label: "En course"  },
  HORS_LIGNE: { color: "#9CA3AF", label: "Hors ligne" },
};

export default function EtatLivreurDot({ etat }: { etat: EtatActiviteEnum }) {
  const { color, label } = CONFIG[etat];
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs" style={{ color: "#6B7280" }}>
        {label}
      </span>
    </span>
  );
}
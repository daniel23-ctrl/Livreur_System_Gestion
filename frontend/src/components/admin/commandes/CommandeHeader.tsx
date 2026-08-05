import { Calendar, Globe, Plus } from "lucide-react";

interface CommandesHeaderProps {
  vuePeriode: "JOUR" | "GLOBAL";
  setVuePeriode: (periode: "JOUR" | "GLOBAL") => void;
  onOpenCreate?: () => void;
}

export default function CommandesHeader({
  vuePeriode,
  setVuePeriode,
  onOpenCreate,
}: CommandesHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <p className="text-xs text-gray-500">
          Consultez, filtrez et gérez l'ensemble des livraisons
        </p>
      </div>

      <div className="flex items-center gap-3 self-start sm:self-auto">
        {/* Toggle Période */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
          <button
            onClick={() => setVuePeriode("JOUR")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              vuePeriode === "JOUR"
                ? "bg-[#0b3b29] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Calendar size={14} />
            Aujourd'hui
          </button>
          <button
            onClick={() => setVuePeriode("GLOBAL")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              vuePeriode === "GLOBAL"
                ? "bg-[#0b3b29] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Globe size={14} />
            Global
          </button>
        </div>

        {/* Bouton création (si transmis) */}
        {onOpenCreate && (
          <button
            onClick={onOpenCreate}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#DCA524] hover:bg-[#c8941d] text-white font-semibold text-xs shadow-xs transition-all active:scale-95 shrink-0"
          >
            <Plus size={16} />
            <span>Nouvelle commande</span>
          </button>
        )}
      </div>
    </div>
  );
}
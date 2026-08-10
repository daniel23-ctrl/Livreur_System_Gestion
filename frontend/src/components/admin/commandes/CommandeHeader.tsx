import { Calendar, Globe, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        <p className="text-xs text-emerald-950 p-2 font-semibold uppercase tracking-wide mb-1">
          Consultez, filtrez et gérez l'ensemble des livraisons
        </p>
      </div>

      <div className="flex items-center gap-3 self-start sm:self-auto">
        {/* Toggle Période */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setVuePeriode("JOUR")}
            className={`flex items-center gap-2 px-3 h-8 rounded-lg text-xs font-semibold transition-all hover:bg-transparent ${
              vuePeriode === "JOUR"
                ? "bg-[#DCA524] text-white hover:bg-[#DCA524] hover:text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Calendar size={14} />
            Aujourd'hui
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setVuePeriode("GLOBAL")}
            className={`flex items-center gap-2 px-3 h-8 rounded-lg text-xs font-semibold transition-all hover:bg-transparent ${
              vuePeriode === "GLOBAL"
                ? "bg-[#DCA524] text-white hover:bg-[#DCA524] hover:text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Globe size={14} />
            Global
          </Button>
        </div>

        {/* Bouton création (si transmis) */}
        {onOpenCreate && (
          <Button
            type="button"
            onClick={onOpenCreate}
            className="flex items-center gap-2 px-3.5 h-9 rounded-xl bg-[#DCA524] hover:bg-[#c8941d] text-white font-semibold text-xs shadow-xs transition-all active:scale-95 shrink-0"
          >
            <Plus size={16} />
            <span>Nouvelle commande</span>
          </Button>
        )}
      </div>
    </div>
  );
}
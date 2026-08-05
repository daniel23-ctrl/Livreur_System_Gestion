import React from "react";
import { Package, Truck, CheckCircle2, XCircle } from "lucide-react";
import KpiCard from "@/components/admin/KpiCard";

interface CommandesStatsProps {
  vuePeriode: "JOUR" | "GLOBAL";
  stats: {
    total: number;
    enAttente: number;
    enCours: number;
    livrees: number;
    annulees: number;
  };
}

export default function CommandesStats({ vuePeriode, stats }: CommandesStatsProps) {
  const taux = stats.total > 0 ? Math.round((stats.livrees / stats.total) * 100) : 0;

  const kpiItems = [
    {
      id: "total",
      label: vuePeriode === "JOUR" ? "Commandes (Jour)" : "Total Global",
      value: stats.total,
      subtitle: `${stats.enAttente} en attente`,
      iconBg: "#F0FDF4",
      icon: <Package className="w-6 h-6 text-[#0b3b29]" />,
    },
    {
      id: "enCours",
      label: "En Cours / Assignées",
      value: stats.enCours,
      subtitle: "Prises en charge",
      iconBg: "#FEF3C7",
      icon: <Truck className="w-6 h-6 text-[#DCA524]" />,
    },
    {
      id: "livrees",
      label: "Livrées",
      value: stats.livrees,
      subtitle: `${taux}% de réussite`,
      iconBg: "#DCFCE7",
      icon: <CheckCircle2 className="w-6 h-6 text-green-600" />,
    },
    {
      id: "annulees",
      label: "Annulées",
      value: stats.annulees,
      subtitle: "Échecs / Annulées",
      iconBg: "#FEE2E2",
      icon: <XCircle className="w-6 h-6 text-red-500" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {kpiItems.map((kpi) => (
        <KpiCard
          key={kpi.id}
          label={kpi.label}
          value={kpi.value}
          subtitle={kpi.subtitle}
          iconBg={kpi.iconBg}
          icon={kpi.icon}
        />
      ))}
    </div>
  );
}
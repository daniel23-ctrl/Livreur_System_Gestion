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
      iconBg: "rgba(255, 255, 255, 0.15)",
      icon: <Package className="w-5 h-5 text-white" />,
    },
    {
      id: "enCours",
      label: "En Cours / Assignées",
      value: stats.enCours,
      subtitle: "Prises en charge",
      iconBg: "rgba(255, 255, 255, 0.15)",
      icon: <Truck className="w-5 h-5 text-[#FACC15]" />,
    },
    {
      id: "livrees",
      label: "Livrées",
      value: stats.livrees,
      subtitle: `${taux}% de réussite`,
      iconBg: "rgba(255, 255, 255, 0.15)",
      icon: <CheckCircle2 className="w-5 h-5 text-[#4ADE80]" />,
    },
    {
      id: "annulees",
      label: "Annulées",
      value: stats.annulees,
      subtitle: "Échecs / Annulées",
      iconBg: "rgba(255, 255, 255, 0.15)",
      icon: <XCircle className="w-5 h-5 text-red-400" />,
    },
  ];

  return (
    <div className="bg-[#0B3B29]/80 rounded-2xl shadow-lg border border-white/10 flex flex-col lg:flex-row items-center justify-between divide-y lg:divide-y-0 lg:divide-x divide-white/15 w-full">
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
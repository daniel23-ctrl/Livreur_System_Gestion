"use client";

import { Users, UserCheck, Bike, ShieldAlert } from "lucide-react";
import { Livreur } from "@/types/livreur.types";
import KpiCard from "@/components/admin/KpiCard";

interface LivreurStatsProps {
  livreurs: Livreur[];
}

export function LivreurStatsOverview({ livreurs }: LivreurStatsProps) {
  const total = livreurs.length;
  const actifs = livreurs.filter((l) => l.est_actif).length;
  const disponibles = livreurs.filter((l) => l.etat_activite === "DISPONIBLE" && l.est_actif).length;

  const kpiItems = [
    {
      id: "total",
      label: "TOTAL LIVREURS",
      value: total,
      subtitle: "Enregistrés",
      iconBg: "rgba(255, 255, 255, 0.15)",
      icon: <Users className="w-5 h-5 text-white" />,
    },
    {
      id: "actifs",
      label: "COMPTES ACTIFS",
      value: actifs,
      subtitle: "Opérationnels",
      iconBg: "rgba(255, 255, 255, 0.15)",
      icon: <UserCheck className="w-5 h-5 text-[#60A5FA]" />,
    },
    {
      id: "disponibles",
      label: "DISPONIBLES",
      value: disponibles,
      subtitle: "Prêts pour course",
      iconBg: "rgba(255, 255, 255, 0.15)",
      icon: <Bike className="w-5 h-5 text-[#4ADE80]" />,
    },
   
  ];

  return (
    <div className="bg-[#0B3B29]/80 rounded-2xl shadow-lg border border-white/10 flex flex-col lg:flex-row items-center justify-between divide-y lg:divide-y-0 lg:divide-x divide-white/15 w-full mb-6">
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
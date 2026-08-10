"use client";

import { Users, UserCheck, Bike, ShieldAlert } from "lucide-react";
import { Livreur } from "@/types/livreur.types";

interface LivreurStatsProps {
  livreurs: Livreur[];
}

export function LivreurStatsOverview({ livreurs }: LivreurStatsProps) {
  const total = livreurs.length;
  const actifs = livreurs.filter((l) => l.est_actif).length;
  const disponibles = livreurs.filter((l) => l.etat_activite === "DISPONIBLE" && l.est_actif).length;
  const enMission = livreurs.filter((l) => l.etat_activite === "EN_COURSE" && l.est_actif).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:shadow-md">
        <div>
          <p className="text-sm font-medium text-slate-500">Total Livreurs</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{total}</h3>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
          <Users className="w-6 h-6" />
        </div>
      </div>

      {/* Actifs */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:shadow-md">
        <div>
          <p className="text-sm font-medium text-slate-500">Comptes Actifs</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{actifs}</h3>
        </div>
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
          <UserCheck className="w-6 h-6" />
        </div>
      </div>

      {/* Disponibles */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:shadow-md">
        <div>
          <p className="text-sm font-medium text-slate-500">Disponibles</p>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1">{disponibles}</h3>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
          <Bike className="w-6 h-6" />
        </div>
      </div>

      {/* En Mission */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:shadow-md">
        <div>
          <p className="text-sm font-medium text-slate-500">En Mission</p>
          <h3 className="text-2xl font-bold text-amber-600 mt-1">{enMission}</h3>
        </div>
        <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
          <ShieldAlert className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
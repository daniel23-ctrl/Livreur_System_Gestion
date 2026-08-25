"use client";

import { useEffect, useState, useCallback } from "react";
import { CircleCheck, TrendingUp, Star, Loader2 } from "lucide-react";
import KpiCard from "@/components/admin/KpiCard";
import EtatLivreurDot from "@/components/admin/EtatLivreurDot";
import DashboardCommandesTable from "@/components/admin/DashboardCommandesTable";
import { useAdmin } from "@/contexts/AdminContext"; 
import { KpiData } from "@/types/kpidata";

export default function DashboardPage() {
  // Récupération des données partagées depuis le contexte global
  const { commandes, livreursActifs, loading, chargerDonnees } = useAdmin();

  const [kpi, setKpi] = useState<KpiData | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Fonction utilitaire pour recalculer les KPI à partir des listes actuelles
  const calculateKpis = useCallback((cmdList: typeof commandes) => {
    const today = new Date().toDateString();
    const livreesAujourdhui = cmdList.filter(
      (c) =>
        c.statut_commande === "LIVREE" &&
        c.createdAt &&
        new Date(c.createdAt).toDateString() === today
    );
    const totalAujourdhui = cmdList.filter(
      (c) => c.createdAt && new Date(c.createdAt).toDateString() === today
    );
    const taux =
      totalAujourdhui.length > 0
        ? Math.round((livreesAujourdhui.length / totalAujourdhui.length) * 100)
        : 0;

    const compteur: Record<string, number> = {};
    cmdList.forEach((c) => {
      if (c.livreur?.nom) {
        const nomComplet = `${c.livreur.prenom ? c.livreur.prenom + " " : ""}${c.livreur.nom}`;
        compteur[nomComplet] = (compteur[nomComplet] || 0) + 1;
      }
    });
    const topAgent = Object.entries(compteur).sort((a, b) => b[1] - a[1])[0];

    setKpi({
      livraisons_jour: livreesAujourdhui.length,
      taux_reussite: taux,
      agent_plus_actif: topAgent
        ? { nom: topAgent[0], prenom: "", nb_courses: topAgent[1] }
        : null,
    });
  }, []);

  // Recalculer les KPIs dès que les commandes changent dans le contexte
  useEffect(() => {
    calculateKpis(commandes);
    setLastRefresh(new Date());
  }, [commandes, calculateKpis]);

  const disponibles = livreursActifs.filter((l) => l.etat_activite === "DISPONIBLE").length;
  const horsligne = livreursActifs.filter((l) => l.etat_activite === "HORS_LIGNE").length;

  return (
    <div className="flex-1 w-full min-h-screen flex flex-col bg-cover bg-center bg-no-repeat bg-fixed">
      <div className="flex-1 p-2.5 sm:p-6 space-y-3 sm:space-y-6 max-w-[1600px] mx-auto w-full">
        <div className="bg-[#0B3B29]/80 rounded-2xl shadow-lg border border-white/10 flex flex-col lg:flex-row items-center justify-between divide-y lg:divide-y-0 lg:divide-x divide-white/15 w-full">
          <KpiCard
            label="LIVRAISONS"
            value={kpi?.livraisons_jour ?? 0}
            subtitle="Aujourd'hui"
            iconBg="rgba(255, 255, 255, 0.15)"
            icon={<CircleCheck style={{ color: "#4ADE80" }} />}
          />
          <KpiCard
            label="TAUX RÉUSSITE"
            value={`${kpi?.taux_reussite ?? 0}%`}
            subtitle="Hors annul."
            iconBg="rgba(255, 255, 255, 0.15)"
            icon={<TrendingUp style={{ color: "#FACC15" }} />}
          />
          <KpiCard
            label="TOP AGENT"
            value={kpi?.agent_plus_actif?.nom ?? "—"}
            subtitle={kpi?.agent_plus_actif ? `${kpi.agent_plus_actif.nb_courses} courses` : undefined}
            iconBg="rgba(255, 255, 255, 0.15)"
            icon={<Star style={{ color: "#FACC15" }} />}
          />
        </div>

        {/* Section Tableau + Livreurs */}
        <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 items-start w-full">
          {/* Conteneur Tableau */}
          <div className="w-full xl:flex-1 min-w-0 rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden shadow-sm bg-white">
            {loading && commandes.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 gap-3">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#C49A1A" }} />
                <p className="text-sm text-slate-500 font-medium">Chargement des commandes...</p>
              </div>
            ) : (
              <DashboardCommandesTable
                commandes={commandes}
                lastRefresh={lastRefresh}
                onRefresh={() => chargerDonnees(false)}
              />
            )}
          </div>

          {/* Panel Livreurs */}
          <div className="w-full lg:w-72 shrink-0 bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-3 py-2.5 sm:px-4 sm:py-4 border-b border-gray-100 bg-[#FAFAFA] flex items-center justify-between lg:block">
              <h2 className="text-xs sm:text-sm font-semibold text-[#1A1A1A]">Livreurs</h2>
              <div className="flex items-center gap-2 sm:gap-3 lg:mt-2">
                {[
                  { count: disponibles, color: "#16A34A" },
                  { count: horsligne, color: "#9CA3AF" },
                ].map(({ count, color }, i) => (
                  <span key={i} className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold" style={{ color }}>
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ backgroundColor: color }} />
                    {count}
                  </span>
                ))}
              </div>
            </div>

            <div className="overflow-y-auto max-h-[250px] sm:max-h-[350px] lg:max-h-[500px]">
              {loading && livreursActifs.length === 0 ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                </div>
              ) : livreursActifs.length === 0 ? (
                <p className="text-center py-6 text-[11px] sm:text-xs text-[#9CA3AF]">Aucun livreur</p>
              ) : (
                livreursActifs.map((liv) => {
                  const initiales = `${liv.prenom?.[0] ?? ""}${liv.nom?.[0] ?? ""}`.toUpperCase();
                  const nbCourses = commandes.filter(
                    (c) =>
                      c.id_livreur === liv.id ||
                      (c.livreur?.nom && c.livreur.nom === liv.nom)
                  ).length;

                  return (
                    <div
                      key={liv.id}
                      className="flex items-center even:bg-[#FAFAFA] gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-3 border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <div
                        className="w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-white shrink-0"
                        style={{ backgroundColor: "#C49A1A" }}
                      >
                        {initiales}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] sm:text-xs font-semibold text-[#1A1A1A] truncate">
                          {liv.prenom} {liv.nom}
                        </p>
                        <EtatLivreurDot etat={liv.etat_activite} />
                        <p className="text-[9px] sm:text-xs text-[#9CA3AF] mt-0.5 truncate">
                          {liv.type_vehicule} · {liv.immatriculation}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-0.5 shrink-0">
                        <span className="text-[11px] sm:text-xs font-bold text-[#1A1A1A]">{nbCourses}</span>
                        <span className="text-[8px] sm:text-[10px] text-[#9CA3AF]">courses</span>
                        {/* {liv.etat_activite === "DISPONIBLE" && (
                          <button
                            className="mt-0.5 px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-semibold text-white transition-opacity hover:opacity-90"
                            style={{ backgroundColor: "#C49A1A" }}
                          >
                            Affecter
                          </button>
                        )} */}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
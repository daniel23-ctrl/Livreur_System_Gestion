"use client";

import { useEffect, useState, useCallback } from "react";
import { CircleCheck, TrendingUp, Star } from "lucide-react";
import KpiCard from "@/components/admin/KpiCard";
import EtatLivreurDot from "@/components/admin/EtatLivreurDot";
import DashboardCommandesTable from "@/components/admin/DashboardCommandesTable";
import axiosInstance from "@/lib/axios";
import API from "@/lib/apiPaths";
import { Commande, Livreur, KpiData } from "@/types/admin.types";

export default function DashboardPage() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [livreurs, setLivreurs] = useState<Livreur[]>([]);
  const [kpi, setKpi] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchData = useCallback(async () => {
    try {
      const [cmdRes, livRes] = await Promise.all([
        axiosInstance.get(API.commandes.all),
        axiosInstance.get(API.livreurs.base),
      ]);
      setCommandes(cmdRes.data);
      setLivreurs(livRes.data);

      const today = new Date().toDateString();
      const livreesAujourdhui = cmdRes.data.filter(
        (c: Commande) =>
          c.statut_commande === "LIVREE" &&
          c.createdAt &&
          new Date(c.createdAt).toDateString() === today
      );
      const totalAujourdhui = cmdRes.data.filter(
        (c: Commande) => c.createdAt && new Date(c.createdAt).toDateString() === today
      );
      const taux =
        totalAujourdhui.length > 0
          ? Math.round((livreesAujourdhui.length / totalAujourdhui.length) * 100)
          : 0;

      const compteur: Record<string, number> = {};
      cmdRes.data.forEach((c: Commande) => {
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

      setLastRefresh(new Date());
    } catch (err) {
      console.error("Erreur chargement dashboard", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const disponibles = livreurs.filter((l) => l.etat_activite === "DISPONIBLE").length;
  const enCourse = livreurs.filter((l) => l.etat_activite === "EN_COURSE").length;
  const horsligne = livreurs.filter((l) => l.etat_activite === "HORS_LIGNE").length;

  if (loading) {
    return (
      <div
        className="flex-1 min-h-screen flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('/backdashboard.jpg')" }}
      >
        <div className="flex flex-col items-center gap-3 bg-white/80 p-6 rounded-xl backdrop-blur-sm shadow-sm">
          <div
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "#C49A1A", borderTopColor: "transparent" }}
          />
          <p className="text-sm text-[#9CA3AF]">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 w-full min-h-screen flex flex-col bg-cover bg-center bg-no-repeat bg-fixed"
    >
      <div className="flex-1 p-2.5 sm:p-6 space-y-3 sm:space-y-6 max-w-[1600px] mx-auto w-full">
        {/* KPI Cards : Aligné côte-à-côte dès le mobile (grid-cols-3) */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-4">
          <KpiCard
            label="Livraisons"
            value={kpi?.livraisons_jour ?? 0}
            subtitle="+1 vs hier"
            iconBg="#F0FDF4"
            icon={<CircleCheck className="w-4 h-4 sm:w-6 sm:h-6" style={{ color: "#16A34A" }} />}
          />
          <KpiCard
            label="Taux réussite"
            value={`${kpi?.taux_reussite ?? 0}%`}
            subtitle="Hors annul."
            iconBg="#FEF9E7"
            icon={<TrendingUp className="w-4 h-4 sm:w-6 sm:h-6" style={{ color: "#DCA524" }} />}
          />
          <KpiCard
            label="Top Agent"
            value={kpi?.agent_plus_actif?.nom ?? "—"}
            subtitle={kpi?.agent_plus_actif ? `${kpi.agent_plus_actif.nb_courses} courses` : "Aucun"}
            iconBg="#FEF9E7"
            icon={<Star className="w-4 h-4 sm:w-6 sm:h-6" style={{ color: "#DCA524" }} />}
          />
        </div>

        {/* Section Tableau + Livreurs */}
        <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 items-start w-full">
          {/* Conteneur Tableau : forcing w-full et table-layout adapté */}
          <div className="w-full xl:flex-1 min-w-0  rounded-xl sm:rounded-2xl  border border-gray-100 sm:p-4 overflow-hidden">
            <DashboardCommandesTable
              commandes={commandes}
              lastRefresh={lastRefresh}
              onRefresh={fetchData}
            />
          </div>

          {/* Panel Livreurs */}
          <div className="w-full lg:w-72 shrink-0 bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-3 py-2.5 sm:px-4 sm:py-4 border-b border-gray-100 bg-[#FAFAFA] flex items-center justify-between lg:block">
              <h2 className="text-xs sm:text-sm font-semibold text-[#1A1A1A]">Livreurs</h2>
              <div className="flex items-center gap-2 sm:gap-3 lg:mt-2">
                {[
                  { count: disponibles, color: "#16A34A" },
                  { count: enCourse, color: "#D97706" },
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
              {livreurs.length === 0 ? (
                <p className="text-center py-6 text-[11px] sm:text-xs text-[#9CA3AF]">Aucun livreur</p>
              ) : (
                livreurs.map((liv) => {
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
                        {liv.etat_activite === "DISPONIBLE" && (
                          <button
                            className="mt-0.5 px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-semibold text-white transition-opacity hover:opacity-90"
                            style={{ backgroundColor: "#C49A1A" }}
                          >
                            Affecter
                          </button>
                        )}
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
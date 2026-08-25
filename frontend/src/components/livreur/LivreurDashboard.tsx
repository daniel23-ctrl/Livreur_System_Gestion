'use client';

import React, { useState } from 'react';
import { StatutCommande } from '@/types/commande.types';
import { LivreurSidebar } from './LivreurSidebar';
import { DashboardHeader } from './DashboardHeader';
import { CommandeCard } from './CommandeCard';
import { LivreurSettings } from './LivreurSettings'; 
import { updateStatutCommande } from '@/services/commande.service';
import { useLivreur } from '@/contexts/LivreurContext';
import { PackageX, TrendingUp, CheckCircle2, Clock, Truck, Calendar, Globe, ArrowRightLeft } from 'lucide-react';

export function LivreurDashboard() {
  const { commandes, profile, loading, refreshDonnees } = useLivreur();

  const [activeTab, setActiveTab] = useState<'commandes' | 'history' | 'settings'>('commandes');
  const [timeFilter, setTimeFilter] = useState<'today' | 'global'>('today');
  const [error, setError] = useState<string | null>(null);

  const handleUpdateStatus = async (id_commande: string, nouveauStatut: StatutCommande) => {
    try {
      await updateStatutCommande(id_commande, nouveauStatut);
      await refreshDonnees();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erreur lors de la mise à jour du statut.');
    }
  };

  const aujourdhui = new Date().toISOString().split('T')[0];

  const commandesFiltreesParTemps = commandes.filter((c) => {
    if (timeFilter === 'global') return true;
    if (!c.createdAt) return false;
    const dateCommande = new Date(c.createdAt).toISOString().split('T')[0];
    return dateCommande === aujourdhui;
  });

  const commandesActives = commandesFiltreesParTemps.filter(
    (c) => c.statut_commande !== 'LIVREE' && c.statut_commande !== 'ANNULEE'
  );

  const historiqueCommandes = commandesFiltreesParTemps.filter(
    (c) => c.statut_commande === 'LIVREE' || c.statut_commande === 'ANNULEE'
  );

  const currentCommandes =
    activeTab === 'commandes' ? commandesActives : historiqueCommandes;

  const coursesLivrees = commandesFiltreesParTemps.filter((c) => c.statut_commande === 'LIVREE').length;
  const enAttenteCount = commandesFiltreesParTemps.filter((c) => c.statut_commande === 'EN_ATTENTE').length;
  const enCoursCollecteCount = commandesFiltreesParTemps.filter((c) => c.statut_commande === 'EN_COURS_DE_COLLECTE').length;
  const enCoursLivraisonCount = commandesFiltreesParTemps.filter((c) => c.statut_commande === 'EN_COURS_DE_LIVRAISON').length;
  const totalCommandes = commandesFiltreesParTemps.length;

  return (
    <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden">
      <LivreurSidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        missionsCount={commandesActives.length}
        historyCount={historiqueCommandes.length}
        profile={profile || { initials: '', name: '', status: 'En ligne', assignedCoursesCount: 0, completedCoursesCount: 0 }}
      />

      <main
        className="flex-1 flex flex-col h-full overflow-y-auto w-full bg-[#F9FAFB] bg-repeat relative"
        style={{
          backgroundImage: "url('/backdashboard.jpg')",
        }}
      >
        <DashboardHeader
          title={
            activeTab === 'commandes'
              ? 'Mes commandes assignées'
              : activeTab === 'history'
                ? 'Historique de mes courses'
                : 'Paramètres du compte'
          }
          user={profile} 
        />

        <div className="p-6 md:p-8 max-w-6xl w-full mx-auto space-y-6">
          {/* SI ON EST SUR L'ONGLET PARAMÈTRES, ON AFFICHE LE COMPOSANT DÉDIÉ */}
          {activeTab === 'settings' ? (
            <LivreurSettings />
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-gray-700 bg-white/80 px-3 py-1 rounded-md backdrop-blur-xs inline-block shadow-xs">Vue d'ensemble</h2>
                </div>
                <div className="inline-flex bg-white/90 backdrop-blur-xs p-1.5 rounded-full shadow-xs border border-gray-200 gap-1">
                  <button
                    onClick={() => setTimeFilter('today')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${timeFilter === 'today'
                      ? 'bg-[#d4a017] text-white shadow-xs'
                      : 'text-gray-600 hover:bg-gray-150'
                      }`}
                  >
                    <Calendar size={14} /> Aujourd'hui
                  </button>
                  <button
                    onClick={() => setTimeFilter('global')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${timeFilter === 'global'
                      ? 'bg-[#0b3b29] text-white shadow-xs'
                      : 'text-gray-600 hover:bg-gray-150'
                      }`}
                  >
                    <Globe size={14} /> Global
                  </button>
                </div>
              </div>

              {/* STATISTIQUES */}
              <div className="bg-[#0b3b29]/95 backdrop-blur-xs p-4 rounded-2xl shadow-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
                <div className="flex items-center gap-3 px-2 py-2">
                  <div className="p-2.5 bg-white/10 text-emerald-400 rounded-xl shrink-0"><CheckCircle2 size={20} /></div>
                  <div>
                    <p className="text-[9px] uppercase font-bold tracking-wider text-emerald-200/70">Livrées</p>
                    <p className="text-base font-bold text-white mt-0.5">{coursesLivrees}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-2 py-2 lg:border-l lg:border-white/10">
                  <div className="p-2.5 bg-white/10 text-amber-400 rounded-xl shrink-0"><Clock size={20} /></div>
                  <div>
                    <p className="text-[9px] uppercase font-bold tracking-wider text-amber-200/70">En attente</p>
                    <p className="text-base font-bold text-white mt-0.5">{enAttenteCount}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-2 py-2 lg:border-l lg:border-white/10">
                  <div className="p-2.5 bg-white/10 text-purple-300 rounded-xl shrink-0"><Truck size={20} /></div>
                  <div>
                    <p className="text-[9px] uppercase font-bold tracking-wider text-purple-200/70">À collecter</p>
                    <p className="text-base font-bold text-white mt-0.5">{enCoursCollecteCount}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-2 py-2 lg:border-l lg:border-white/10">
                  <div className="p-2.5 bg-white/10 text-blue-300 rounded-xl shrink-0"><ArrowRightLeft size={20} /></div>
                  <div>
                    <p className="text-[9px] uppercase font-bold tracking-wider text-blue-200/70">En livraison</p>
                    <p className="text-base font-bold text-white mt-0.5">{enCoursLivraisonCount}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-2 py-2 lg:border-l lg:border-white/10">
                  <div className="p-2.5 bg-white/10 text-[#f3d06b] rounded-xl shrink-0"><TrendingUp size={20} /></div>
                  <div>
                    <p className="text-[9px] uppercase font-bold tracking-wider text-amber-200/70">Total</p>
                    <p className="text-base font-bold text-[#f3d06b] mt-0.5">{totalCommandes}</p>
                  </div>
                </div>
              </div>

              {/* LISTE DES COMMANDES */}
              <div className="space-y-4">
                {loading && <p className="text-gray-700 bg-white/80 p-3 rounded-lg text-sm font-medium w-fit">Chargement de vos commandes...</p>}
                {error && <p className="text-red-500 bg-white/80 p-3 rounded-lg text-sm font-medium w-fit">{error}</p>}

                {!loading && !error && currentCommandes.length === 0 && (
                  <div className="bg-white/90 backdrop-blur-xs rounded-2xl border border-dashed border-gray-300 p-12 text-center flex flex-col items-center justify-center space-y-3 shadow-xs">
                    <div className="p-4 bg-gray-50 text-gray-400 rounded-full">
                      <PackageX size={36} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-700">Aucune commande disponible</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {timeFilter === 'today'
                          ? "Aucune course enregistrée pour aujourd'hui."
                          : "Aucune course trouvée dans l'historique global."}
                      </p>
                    </div>
                  </div>
                )}

                {!loading &&
                  currentCommandes.map((commande) => (
                    <CommandeCard
                      key={commande.id_commande}
                      commande={commande}
                      onUpdateStatus={handleUpdateStatus}
                    />
                  ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
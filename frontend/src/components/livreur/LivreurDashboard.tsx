'use client';

import React, { useState, useEffect } from 'react';
import { CommandeResponse, StatutCommande } from '@/types/commande.types';
import { LivreurProfile } from '@/types/mission';
import { LivreurSidebar } from './LivreurSidebar';
import { DashboardHeader } from './DashboardHeader';
import { CommandeCard } from './CommandeCard';
import { getCommandesLivreurConnecte, updateStatutCommande } from '@/services/commande.service';
import { getMyself } from '@/services/livreur.service';
import { MapProfileLivreur } from '@/utils/livreur.utils';
import { PackageX, TrendingUp, CheckCircle2, Clock, Truck, Calendar, Globe, ArrowRightLeft } from 'lucide-react';
import { Livreur } from '@/types/livreur.types';

export function LivreurDashboard() {
  const [activeTab, setActiveTab] = useState<'commandes' | 'history'>('commandes');
  const [timeFilter, setTimeFilter] = useState<'today' | 'global'>('today');

  const [commandes, setCommandes] = useState<CommandeResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<LivreurProfile>({
    initials: '',
    name: '',
    status: 'En ligne',
    assignedCoursesCount: 0,
    completedCoursesCount: 0,
  });

  // Chargement du profil et des commandes connectées
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const [livreurResult, commandesResult] = await Promise.allSettled([
          getMyself(),
          getCommandesLivreurConnecte()
        ]);

        let commandesData: CommandeResponse[] = [];
        let livreurData: any = null;

        // Gestion des commandes
        if (commandesResult.status === 'fulfilled') {
          commandesData = commandesResult.value;
          setCommandes(commandesData);
        } else {
          console.error("Erreur chargement commandes:", commandesResult.reason);
        }

        // Gestion du profil livreur
        if (livreurResult.status === 'fulfilled') {
          livreurData = livreurResult.value;
        } else {
          console.warn("Avertissement : Impossible de charger le profil livreur (Erreur 500 du serveur). Utilisation d'un profil par défaut.");
        }

        // Sécurité : On n'appelle MapProfileLivreur qu'en gérant le cas où livreurData est null
        if (livreurData) {
          const generatedProfile = MapProfileLivreur(livreurData, commandesData);
          setProfile(generatedProfile);
        } else {
          setProfile((prev) => ({
            ...prev,
            assignedCoursesCount: commandesData.filter(
              (c) => c.statut_commande !== 'LIVREE' && c.statut_commande !== 'ANNULEE'
            ).length,
            completedCoursesCount: commandesData.filter(
              (c) => c.statut_commande === 'LIVREE'
            ).length,
          }));
        }

      } catch (err: any) {
        setError(err.response?.data?.detail || 'Erreur lors du chargement des données.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Fonction pour changer le statut d'une commande
  const handleUpdateStatus = async (id_commande: string, nouveauStatut: StatutCommande) => {
    try {
      await updateStatutCommande(id_commande, nouveauStatut);

      setCommandes((prevCommandes) => {
        const updated = prevCommandes.map((c) =>
          c.id_commande === id_commande ? { ...c, statut_commande: nouveauStatut as any } : c
        );

        setProfile((prev) => {
          const assignedCoursesCount = updated.filter(
            (c) => c.statut_commande !== 'LIVREE' && c.statut_commande !== 'ANNULEE'
          ).length;
          const completedCoursesCount = updated.filter(
            (c) => c.statut_commande === 'LIVREE'
          ).length;

          return {
            ...prev,
            assignedCoursesCount,
            completedCoursesCount,
          };
        });

        return updated;
      });
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erreur lors de la mise à jour du statut.');
    }
  };

  // FILTRAGE PAR TEMPS (Aujourd'hui vs Global) 
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
        onTabChange={(tab) => setActiveTab(tab as 'commandes' | 'history')}
        missionsCount={commandesActives.length}
        historyCount={historiqueCommandes.length}
        profile={profile}
      />

      {/* ZONE PRINCIPALE AVEC IMAGE DE FOND */}
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
              : 'Historique de mes courses'
          }
        />

        <div className="p-6 md:p-8 max-w-6xl w-full mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-700 bg-white/80 px-3 py-1 rounded-md backdrop-blur-xs inline-block shadow-xs">Vue d'ensemble</h2>
            </div>
            <div className="inline-flex bg-white/90 backdrop-blur-xs p-1.5 rounded-full shadow-xs border border-gray-200 gap-1">
              <button
                onClick={() => setTimeFilter('today')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${timeFilter === 'today'
                  ? 'bg-[#d4a017] text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <Calendar size={14} /> Aujourd'hui
              </button>
              <button
                onClick={() => setTimeFilter('global')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${timeFilter === 'global'
                  ? 'bg-[#0b3b29] text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <Globe size={14} /> Global
              </button>
            </div>
          </div>

          <div className="bg-[#0b3b29]/95 backdrop-blur-xs p-4 rounded-2xl shadow-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="p-2.5 bg-white/10 text-emerald-400 rounded-xl shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold tracking-wider text-emerald-200/70">Livrées</p>
                <p className="text-base font-bold text-white mt-0.5">{coursesLivrees}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 py-2 lg:border-l lg:border-white/10">
              <div className="p-2.5 bg-white/10 text-amber-400 rounded-xl shrink-0">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold tracking-wider text-amber-200/70">En attente</p>
                <p className="text-base font-bold text-white mt-0.5">{enAttenteCount}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 py-2 lg:border-l lg:border-white/10">
              <div className="p-2.5 bg-white/10 text-purple-300 rounded-xl shrink-0">
                <Truck size={20} />
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold tracking-wider text-purple-200/70">À collecter</p>
                <p className="text-base font-bold text-white mt-0.5">{enCoursCollecteCount}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 py-2 lg:border-l lg:border-white/10">
              <div className="p-2.5 bg-white/10 text-blue-300 rounded-xl shrink-0">
                <ArrowRightLeft size={20} />
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold tracking-wider text-blue-200/70">En livraison</p>
                <p className="text-base font-bold text-white mt-0.5">{enCoursLivraisonCount}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 py-2 lg:border-l lg:border-white/10">
              <div className="p-2.5 bg-white/10 text-[#f3d06b] rounded-xl shrink-0">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold tracking-wider text-amber-200/70">Total</p>
                <p className="text-base font-bold text-[#f3d06b] mt-0.5">{totalCommandes}</p>
              </div>
            </div>
          </div>

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
        </div>
      </main>
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import { Mission, LivreurProfile } from '@/types/mission';
import { LivreurSidebar } from './LivreurSidebar';
import { DashboardHeader } from './DashboardHeader';
import { MissionCard } from './MissionCard';

const mockProfile: LivreurProfile = {
  initials: 'KM',
  name: 'Koffi Mensah',
  status: 'En course',
  coursesCount: 12,
  rating: 4.8,
};

const activeMissionsData: Mission[] = [
  {
    id: 'CMD-2026-0047',
    date: '07/07/2026 · 14:32',
    pickup: 'Rue des Commerçants, Lomé',
    destination: 'Quartier Bè, Lomé',
    description: 'Documents administratifs',
    price: '1,500 F',
    status: 'en_livraison',
    statusLabel: 'En livraison',
    highlightBorder: true,
  },
  {
    id: 'CMD-2026-0045',
    date: '07/07/2026 · 13:10',
    pickup: 'Agoè Nyivé, Lomé',
    destination: 'Tokoin, Lomé',
    description: 'Pièce électronique',
    price: '3,500 F',
    status: 'assignee',
    statusLabel: 'Assignée',
  },
];

const historyMissionsData: Mission[] = [
  {
    id: 'CMD-2026-0042',
    date: '07/07/2026 · 11:02',
    pickup: 'Djidjolé, Lomé',
    destination: 'Agoè, Lomé',
    description: 'Sac marchandises',
    price: '2,500 F',
    status: 'livree',
    statusLabel: 'Livrée',
  },
  {
    id: 'CMD-2026-0039',
    date: '06/07/2026 · 09:15',
    pickup: 'Totsi, Lomé',
    destination: 'Kpogan, Lomé',
    description: 'Pièce mécanique',
    price: 'Prépayé',
    status: 'livree',
    statusLabel: 'Livrée',
  },
];

export function LivreurDashboard() {
  const [activeTab, setActiveTab] = useState<'missions' | 'history'>('missions');

  const currentMissions =
    activeTab === 'missions' ? activeMissionsData : historyMissionsData;

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#f4f7f5] overflow-hidden">
      <LivreurSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        missionsCount={activeMissionsData.length}
        historyCount={historyMissionsData.length}
        profile={mockProfile}
      />

      <main className="flex-1 overflow-y-auto bg-[#f4f7f5] w-full">
        <DashboardHeader
          title={
            activeTab === 'missions'
              ? 'Mes missions assignées'
              : 'Historique de mes courses'
          }
          statusText="Vous êtes actuellement En course — statut non disponible"
        />

        <div className="p-4 sm:p-6 md:p-8 max-w-4xl space-y-4">
          {currentMissions.map((mission) => (
            <MissionCard key={mission.id} mission={mission} />
          ))}
        </div>
      </main>
    </div>
  );
}
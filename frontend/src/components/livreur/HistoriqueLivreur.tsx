'use client';

import React, { useState } from 'react';
import { CommandeCard } from './CommandeCard';
import { CommandeResponse } from '@/types/commande.types';
import { History, PackageSearch } from 'lucide-react';

interface HistoriqueLivreurProps {
  commandes: CommandeResponse[];
}

export function HistoriqueLivreur({ commandes }: HistoriqueLivreurProps) {
  // Filtrer uniquement les commandes livrées ou terminées par le livreur
  const historiqueCommandes = commandes.filter(c => c.statut_commande === 'LIVREE');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
        <History className="text-[#0b3b29]" size={20} />
        <h2 className="text-base font-bold text-gray-900">Historique de mes livraisons ({historiqueCommandes.length})</h2>
      </div>

      {historiqueCommandes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <PackageSearch className="mx-auto text-gray-400 mb-2" size={32} />
          <p className="text-sm font-medium text-gray-600">Aucune mission terminée pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {historiqueCommandes.map((commande) => (
            <CommandeCard key={commande.id_commande} commande={commande} />
          ))}
        </div>
      )}
    </div>
  );
}
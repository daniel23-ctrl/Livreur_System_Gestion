import React from 'react';
import { Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StatutCommande } from '@/types/commande.types'; // Adapte le chemin selon ton projet

interface StatusBadgeProps {
  status: StatutCommande;
  label: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  // 1. En cours de livraison ou de collecte (badge violet avec icône camion)
  if (status === 'EN_COURS_DE_LIVRAISON' || status === 'EN_COURS_DE_COLLECTE') {
    return (
      <Badge className="bg-purple-100 hover:bg-purple-100 text-purple-700 font-medium px-3 py-1 text-xs rounded-full border-0 gap-1.5 shadow-none">
        <Truck size={13} />
        <span>{label}</span>
      </Badge>
    );
  }

  // 2. Assignée ou en attente (badge bleu)
  if (status === 'ASSIGNEE' || status === 'EN_ATTENTE') {
    return (
      <Badge className="bg-blue-100 hover:bg-blue-100 text-blue-700 font-medium px-3 py-1 text-xs rounded-full border-0 gap-1.5 shadow-none">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
        <span>{label}</span>
      </Badge>
    );
  }

  // 3. Annulée (badge rouge)
  if (status === 'ANNULEE') {
    return (
      <Badge className="bg-red-100 hover:bg-red-100 text-red-700 font-medium px-3 py-1 text-xs rounded-full border-0 gap-1.5 shadow-none">
        <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
        <span>{label}</span>
      </Badge>
    );
  }

  // 4. Livrée (badge vert par défaut)
  return (
    <Badge className="bg-emerald-100 hover:bg-emerald-100 text-emerald-800 font-medium px-3 py-1 text-xs rounded-full border-0 gap-1.5 shadow-none">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
      <span>{label}</span>
    </Badge>
  );
}
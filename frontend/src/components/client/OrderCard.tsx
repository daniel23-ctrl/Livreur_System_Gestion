import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Truck, Clock } from 'lucide-react';
import { CommandeResponse } from '@/types/commande.types';

const steps = ['Attente', 'Assignée', 'Collecte', 'Livraison', 'Livrée'];

function getStepFromStatus(statut: string): number {
  switch (statut) {
    case 'EN_ATTENTE': return 1;
    case 'ASSIGNEE': return 2;
    case 'EN_COURS_DE_COLLECTE': return 3;
    case 'EN_COURS_DE_LIVRAISON': return 4;
    case 'LIVREE': return 5;
    default: return 1;
  }
}

function getStatusConfig(statut: string) {
  switch (statut) {
    case 'EN_COURS_DE_LIVRAISON': return { label: 'En livraison', type: 'livraison' };
    case 'ASSIGNEE': return { label: 'Assignée', type: 'assignee' };
    case 'EN_COURS_DE_COLLECTE': return { label: 'En collecte', type: 'collecte' };
    case 'LIVREE': return { label: 'Livrée', type: 'livree' };
    default: return { label: 'En attente', type: 'attente' };
  }
}

interface OrderCardProps {
  order: CommandeResponse;
  readableRamassage: string;
  readableLivraison: string;
}

export function OrderCard({ order, readableRamassage, readableLivraison }: OrderCardProps) {
  const currentStep = getStepFromStatus(order.statut_commande);
  const statusConfig = getStatusConfig(order.statut_commande);

  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).replace(',', ' ·')
    : '';

  const driverName = order.livreur ? `${order.livreur.prenom} ${order.livreur.nom}` : null;
  const driverInitials = order.livreur ? `${order.livreur.prenom?.[0] || ''}${order.livreur.nom?.[0] || ''}`.toUpperCase() : '';

  return (
    <div className="bg-white rounded-xl border border-[#d4a017]/40 shadow-sm p-2.5 sm:p-4 space-y-2">
      {/* En-tête */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <div>
          <h3 className="font-bold text-xs sm:text-sm text-[#0b3b29] leading-tight">{order.reference}</h3>
          <p className="text-[10px] text-gray-400">{formattedDate}</p>
        </div>

        {statusConfig.type === 'livraison' ? (
          <Badge className="bg-purple-100 text-purple-700 font-medium px-2 py-0.5 text-[10px] rounded-md border-0 flex items-center gap-1 shadow-none">
            <Truck size={11} />
            <span>{statusConfig.label}</span>
          </Badge>
        ) : (
          <Badge className="bg-amber-100/70 text-amber-800 font-medium px-2 py-0.5 text-[10px] rounded-md border-0 flex items-center gap-1 shadow-none">
            <Clock size={11} />
            <span>{statusConfig.label}</span>
          </Badge>
        )}
      </div>

      {/* Adresses */}
      <div className="flex items-center text-[11px] font-medium text-gray-700 gap-1.5">
        <div className="flex items-center gap-1 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
          <span className="truncate">{readableRamassage}</span>
        </div>
        <span className="text-gray-400 shrink-0">&gt;</span>
        <div className="flex items-center gap-1 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#d4a017] shrink-0" />
          <span className="truncate">{readableLivraison}</span>
        </div>
      </div>

      {/* Barre de progression ultra-compacte */}
      <div className="pt-0.5">
        <div className="relative flex items-center justify-between px-1">
          <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-gray-200 -translate-y-1/2 z-0 rounded-full" />
          <div
            className="absolute top-1/2 left-2 h-0.5 bg-[#d4a017] -translate-y-1/2 z-0 rounded-full transition-all duration-300"
            style={{ width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - 16px)` }}
          />
          {steps.map((step, index) => {
            const isCompletedOrCurrent = index < currentStep;
            return (
              <div key={step} className="relative z-10 flex flex-col items-center">
                <div className={`w-2.5 h-2.5 rounded-full border border-white ${isCompletedOrCurrent ? 'bg-[#d4a017]' : 'bg-gray-300'}`} />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[9px] text-gray-400 mt-0.5 font-medium px-0.5">
          {steps.map((step) => (
            <span key={step} className="text-center">{step}</span>
          ))}
        </div>
      </div>

      {/* Pied de carte */}
      <div className="flex items-center justify-between pt-1.5 border-t border-gray-50">
        <div className="flex items-center gap-2 text-[11px] min-w-0 pr-2">
          <span className="text-gray-500 truncate">{order.description}</span>
          <span className="font-bold text-[#d4a017] shrink-0">
            {order.montant_a_percevoir ? `${order.montant_a_percevoir} F` : ''}
          </span>
        </div>

        {order.livreur && (
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-5 h-5 rounded-full bg-[#d4a017] text-emerald-950 font-bold text-[9px] flex items-center justify-center shrink-0">
              {driverInitials}
            </div>
            <span className="text-[11px] font-bold text-gray-800 max-w-[80px] truncate">{driverName}</span>
            {order.livreur.telephone && (
              <Button
                type="button"
                size="sm"
                onClick={() => window.location.href = `tel:${order.livreur?.telephone}`}
                className="bg-[#0b3b29] hover:bg-[#082c1f] text-white text-[10px] h-6 px-2 rounded-md flex items-center gap-1 shadow-none cursor-pointer"
              >
                <Phone size={10} className="fill-white stroke-none" />
                <span>Appeler</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
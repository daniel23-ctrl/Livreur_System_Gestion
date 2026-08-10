import React, { useEffect, useState } from 'react';
import { Phone, Truck, Clock, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getCommandesClient } from '@/services/commande.service'; 
import { CommandeResponse } from '@/types/commande.types';

const steps = ['Attente', 'Assignée', 'Collecte', 'Livraison', 'Livrée'];

// Fonction utilitaire pour mapper le statut backend vers l'étape du stepper (1 à 5)
function getStepFromStatus(statut: string): number {
  switch (statut) {
    case 'EN_ATTENTE':
      return 1;
    case 'ASSIGNEE':
      return 2;
    case 'EN_COURS_DE_COLLECTE':
      return 3;
    case 'EN_COURS_DE_LIVRAISON':
      return 4;
    case 'LIVREE':
      return 5;
    default:
      return 1;
  }
}

// Fonction pour formater les libellés et badges de statut
function getStatusConfig(statut: string) {
  switch (statut) {
    case 'EN_COURS_DE_LIVRAISON':
      return { label: 'En livraison', type: 'livraison' };
    case 'ASSIGNEE':
      return { label: 'Assignée', type: 'assignee' };
    case 'EN_COURS_DE_COLLECTE':
      return { label: 'En collecte', type: 'collecte' };
    case 'LIVREE':
      return { label: 'Livrée', type: 'livree' };
    default:
      return { label: 'En attente', type: 'attente' };
  }
}

export function OrdersView() {
  const [orders, setOrders] = useState<CommandeResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        const data = await getCommandesClient();
        setOrders(data);
      } catch (err: any) {
        setError("Erreur lors du chargement des commandes.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#d4a017]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500 text-sm">
        {error}
      </div>
    );
  }

  // Inverser la liste pour afficher les commandes les plus récentes en premier
  const reversedOrders = [...orders].reverse();

  return (
    <div className="w-full space-y-4">
      {/* En-tête de section */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-bold text-gray-900">
          {orders.length} commande(s)
        </h2>
      </div>

      {/* Liste des cartes de commande */}
      <div className="space-y-4">
        {reversedOrders.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-8">Aucune commande trouvée.</p>
        ) : (
          reversedOrders.map((order) => {
            const currentStep = getStepFromStatus(order.statut_commande);
            const statusConfig = getStatusConfig(order.statut_commande);
            
            // Formatage de la date (createdAt)
            const formattedDate = order.createdAt 
              ? new Date(order.createdAt).toLocaleString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }).replace(',', ' ·')
              : '';

            // Gestion des initiales du livreur si présent
            const driverName = order.livreur ? `${order.livreur.prenom} ${order.livreur.nom}` : null;
            const driverInitials = order.livreur ? `${order.livreur.prenom?.[0] || ''}${order.livreur.nom?.[0] || ''}`.toUpperCase() : '';

            return (
              <div
                key={order.id_commande}
                className="bg-white rounded-2xl border border-[#d4a017]/40 shadow-sm p-4 space-y-4"
              >
                {/* 1. Header de la commande */}
                <div className="flex items-start justify-between pb-3 border-b border-gray-100">
                  <div>
                    <h3 className="font-bold text-sm text-[#0b3b29]">
                      {order.reference}
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">{formattedDate}</p>
                  </div>

                  {statusConfig.type === 'livraison' ? (
                    <Badge className="bg-purple-100 hover:bg-purple-100 text-purple-700 font-medium px-2.5 py-1 text-xs rounded-lg border-0 flex items-center gap-1 shadow-none">
                      <Truck size={13} />
                      <span>{statusConfig.label}</span>
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100/70 hover:bg-amber-100/70 text-amber-800 font-medium px-2.5 py-1 text-xs rounded-lg border-0 flex items-center gap-1 shadow-none">
                      <Clock size={13} />
                      <span>{statusConfig.label}</span>
                    </Badge>
                  )}
                </div>

                {/* 2. Adresses A -> B */}
                <div className="flex items-center text-xs font-semibold text-gray-700 gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                    <span className="truncate">{order.adresse_ramassage}</span>
                  </div>
                  <span className="text-gray-400 text-xs shrink-0">&gt;</span>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-[#d4a017] shrink-0" />
                    <span className="truncate">{order.adresse_livraison}</span>
                  </div>
                </div>

                {/* 3. Stepper de statut (5 étapes) */}
                <div className="pt-2 pb-1">
                  <div className="relative flex items-center justify-between">
                    {/* Ligne de fond grisée */}
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0 rounded-full" />
                    
                    {/* Ligne de progression dorée */}
                    <div
                      className="absolute top-1/2 left-0 h-1 bg-[#d4a017] -translate-y-1/2 z-0 rounded-full transition-all duration-300"
                      style={{
                        width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                      }}
                    />

                    {/* Points d'étape */}
                    {steps.map((step, index) => {
                      const isCompletedOrCurrent = index < currentStep;
                      return (
                        <div
                          key={step}
                          className="relative z-10 flex flex-col items-center"
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded-full border-2 border-white ${
                              isCompletedOrCurrent
                                ? 'bg-[#d4a017]'
                                : 'bg-gray-300'
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Libellés sous les points */}
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1.5 font-medium">
                    {steps.map((step) => (
                      <span key={step} className="text-center">
                        {step}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 4. Footer (Description, Prix, Livreur & Bouton) */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-500 font-normal">
                      {order.description}
                    </span>
                    <span className="font-bold text-[#d4a017]">
                      {order.montant_a_percevoir ? `${order.montant_a_percevoir} F` : ''}
                    </span>
                  </div>

                  {order.livreur && (
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#d4a017] text-emerald-950 font-bold text-xs flex items-center justify-center">
                        {driverInitials}
                      </div>
                      <span className="text-xs font-bold text-gray-800">
                        {driverName}
                      </span>
                      {order.livreur.telephone && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => window.location.href = `tel:${order.livreur?.telephone}`}
                          className="bg-[#0b3b29] hover:bg-[#082c1f] text-white text-xs h-7 px-3 rounded-lg flex items-center gap-1.5 shadow-none ml-1"
                        >
                          <Phone size={11} className="fill-white stroke-none" />
                          <span>Appeler</span>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
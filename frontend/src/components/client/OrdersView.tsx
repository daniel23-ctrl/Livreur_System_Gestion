import React from 'react';
import { Phone, Truck, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Order {
  id: string;
  date: string;
  status: 'en_livraison' | 'en_attente' | 'livre';
  statusLabel: string;
  pickupAddress: string;
  deliveryAddress: string;
  currentStep: number; // 1 à 5
  description: string;
  price: string;
  driver?: {
    name: string;
    initials: string;
    phone: string;
  };
}

const steps = ['Attente', 'Assignée', 'Collecte', 'Livraison', 'Livrée'];

const sampleOrders: Order[] = [
  {
    id: 'CMD-2026-0047',
    date: '07/07/2026 · 14:32',
    status: 'en_livraison',
    statusLabel: 'En livraison',
    pickupAddress: 'Rue des Commerçants, Lomé',
    deliveryAddress: 'Quartier Bè, Lomé',
    currentStep: 4,
    description: 'Documents administratifs',
    price: '1,500 F',
    driver: {
      name: 'Koffi Mensah',
      initials: 'KM',
      phone: '90000000',
    },
  },
  {
    id: 'CMD-2026-0044',
    date: '07/07/2026 · 12:45',
    status: 'en_attente',
    statusLabel: 'En attente',
    pickupAddress: 'Nyékonakpoè, Lomé',
    deliveryAddress: 'Kégué, Lomé',
    currentStep: 1,
    description: 'Médicaments',
    price: '800 F',
  },
];

export function OrdersView() {
  return (
    <div className="w-full space-y-4">
      {/* En-tête de section */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-bold text-gray-900">
          {sampleOrders.length} commande(s)
        </h2>
        <span className="bg-[#fef6e0] text-[#b88a10] text-xs font-semibold px-3 py-1 rounded-full">
          Amavi Kodjo
        </span>
      </div>

      {/* Liste des cartes de commande */}
      <div className="space-y-4">
        {sampleOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-2xl border border-[#d4a017]/40 shadow-sm p-4 space-y-4"
          >
            {/* 1. Header de la commande */}
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-sm text-[#0b3b29]">
                  {order.id}
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">{order.date}</p>
              </div>

              {order.status === 'en_livraison' ? (
                <Badge className="bg-purple-100 hover:bg-purple-100 text-purple-700 font-medium px-2.5 py-1 text-xs rounded-lg border-0 flex items-center gap-1 shadow-none">
                  <Truck size={13} />
                  <span>{order.statusLabel}</span>
                </Badge>
              ) : (
                <Badge className="bg-amber-100/70 hover:bg-amber-100/70 text-amber-800 font-medium px-2.5 py-1 text-xs rounded-lg border-0 flex items-center gap-1 shadow-none">
                  <Clock size={13} />
                  <span>{order.statusLabel}</span>
                </Badge>
              )}
            </div>

            {/* 2. Adresses A -> B */}
            <div className="flex items-center text-xs font-semibold text-gray-700 gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                <span className="truncate">{order.pickupAddress}</span>
              </div>
              <span className="text-gray-400 text-xs shrink-0">&gt;</span>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-[#d4a017] shrink-0" />
                <span className="truncate">{order.deliveryAddress}</span>
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
                    width: `${((order.currentStep - 1) / (steps.length - 1)) * 100}%`,
                  }}
                />

                {/* Points d'étape */}
                {steps.map((step, index) => {
                  const isCompletedOrCurrent = index < order.currentStep;
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
                  {order.price}
                </span>
              </div>

              {order.driver && (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#d4a017] text-emerald-950 font-bold text-xs flex items-center justify-center">
                    {order.driver.initials}
                  </div>
                  <span className="text-xs font-bold text-gray-800">
                    {order.driver.name}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    className="bg-[#0b3b29] hover:bg-[#082c1f] text-white text-xs h-7 px-3 rounded-lg flex items-center gap-1.5 shadow-none ml-1"
                  >
                    <Phone size={11} className="fill-white stroke-none" />
                    <span>Appeler</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
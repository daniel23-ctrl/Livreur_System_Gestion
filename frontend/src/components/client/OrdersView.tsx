'use client';

import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getCommandesClient } from '@/services/commande.service'; 
import { CommandeResponse } from '@/types/commande.types';
import { OrderCard } from './OrderCard';
import { wsService } from '@/lib/socket';
import { getReadableAddress } from '@/utils/addresse';

export function OrdersView() {
  const [orders, setOrders] = useState<CommandeResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dictionnaire pour stocker les adresses lisibles par clé de coordonnées
  const [resolvedAddresses, setResolvedAddresses] = useState<Record<string, string>>({});

  const fetchOrders = async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);
      const data = await getCommandesClient();
      setOrders(data);
    } catch (err: any) {
      setError("Erreur lors du chargement des commandes.");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(true);

    const handleUpdate = () => {
      console.log("Mise à jour temps réel reçue ! Rechargement des commandes...");
      fetchOrders(false);
    };

    wsService.on('commandeUpdated', handleUpdate);

    return () => {
      wsService.off('commandeUpdated', handleUpdate);
    };
  }, []);

  // Résolution séquentielle globale de toutes les adresses pour éviter le 429
  useEffect(() => {
    if (orders.length === 0) return;

    let isMounted = true;

    async function resolveAllAddresses() {
      // Collecter toutes les adresses (ramassage et livraison) de toutes les commandes
      const coordsSet = new Set<string>();
      orders.forEach((order) => {
        if (order.adresse_ramassage) coordsSet.add(order.adresse_ramassage);
        if (order.adresse_livraison) coordsSet.add(order.adresse_livraison);
      });

      const coordsList = Array.from(coordsSet);

      for (const coords of coordsList) {
        if (!isMounted) break;
        // Si l'adresse n'est pas encore résolue
        if (!resolvedAddresses[coords]) {
          const readable = await getReadableAddress(coords);
          if (isMounted) {
            setResolvedAddresses((prev) => ({ ...prev, [coords]: readable }));
          }
          // Pause de 1.5 seconde entre chaque requête Nominatim
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      }
    }

    resolveAllAddresses();

    return () => {
      isMounted = false;
    };
  }, [orders]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#d4a017]" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-8 text-red-500 text-sm">{error}</div>;
  }

  const reversedOrders = [...orders].reverse();

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-bold text-gray-900">{orders.length} commande(s)</h2>
      </div>

      <div className="space-y-4">
        {reversedOrders.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-8">Aucune commande trouvée.</p>
        ) : (
          reversedOrders.map((order) => (
            <OrderCard 
              key={order.id_commande} 
              order={order} 
              readableRamassage={resolvedAddresses[order.adresse_ramassage] || order.adresse_ramassage}
              readableLivraison={resolvedAddresses[order.adresse_livraison] || order.adresse_livraison}
            />
          ))
        )}
      </div>
    </div>
  );
}
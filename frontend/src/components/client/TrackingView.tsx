'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Phone, Truck, Clock, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getCommandesClient } from '@/services/commande.service';
import { CommandeResponse } from '@/types/commande.types';
import { getReadableAddress } from '@/utils/addresse';

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

export function TrackingView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [allOrders, setAllOrders] = useState<CommandeResponse[]>([]);
  const [searching, setSearching] = useState(false);
  const [readableAddresses, setReadableAddresses] = useState<Record<string, { ramassage: string; livraison: string }>>({});
  const [hasSearched, setHasSearched] = useState(false);

  // Charger toutes les commandes du client et pré-calculer leurs adresses lisibles au montage
  useEffect(() => {
    async function fetchAllOrders() {
      try {
        setSearching(true);
        const commandes = await getCommandesClient();
        setAllOrders(commandes);

        // Convertir toutes les adresses en arrière-plan pour que la recherche fonctionne instantanément dessus
        const addressesMap: Record<string, { ramassage: string; livraison: string }> = {};
        for (const cmd of commandes) {
          addressesMap[cmd.reference] = {
            ramassage: cmd.adresse_ramassage,
            livraison: cmd.adresse_livraison,
          };
        }
        setReadableAddresses(addressesMap);

        // Lancer les requêtes de géocodage pour les rendre propres
        commandes.forEach(async (cmd) => {
          try {
            const [ramassage, livraison] = await Promise.all([
              getReadableAddress(cmd.adresse_ramassage),
              getReadableAddress(cmd.adresse_livraison),
            ]);
            setReadableAddresses((prev) => ({
              ...prev,
              [cmd.reference]: { ramassage, livraison },
            }));
          } catch (error) {
            console.error("Erreur de géocodage :", error);
          }
        });
      } catch (error) {
        console.error("Erreur lors du chargement des commandes :", error);
      } finally {
        setSearching(false);
      }
    }
    fetchAllOrders();
  }, []);

  // Gestion de l'état de recherche
  useEffect(() => {
    setHasSearched(searchQuery.trim().length > 0);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const query = searchQuery.trim().toLowerCase();

  // Filtrer les commandes en se basant sur les textes affichés (référence, description, adresses lisibles, etc.)
  const foundOrders = allOrders.filter((cmd) => {
    if (!query) return false;

    const reference = cmd.reference?.toLowerCase() || '';
    const description = cmd.description?.toLowerCase() || '';
    const nomDestinataire = cmd.nom_destinataire?.toLowerCase() || '';
    const telDestinataire = cmd.telephone_destinataire?.toLowerCase() || '';
    const telDemandeur = cmd.telephone_demandeur?.toLowerCase() || '';
    const instructions = cmd.instructions?.toLowerCase() || '';
    
    const addresses = readableAddresses[cmd.reference] || {
      ramassage: cmd.adresse_ramassage,
      livraison: cmd.adresse_livraison,
    };
    const adresseRamassage = addresses.ramassage.toLowerCase();
    const adresseLivraison = addresses.livraison.toLowerCase();

    const clientNom = cmd.client ? `${cmd.client.prenom || ''} ${cmd.client.nom || ''}`.toLowerCase() : '';
    const clientTel = cmd.client?.telephone?.toLowerCase() || '';
    const clientEmail = cmd.client?.email?.toLowerCase() || '';

    const livreurNom = cmd.livreur ? `${cmd.livreur.prenom || ''} ${cmd.livreur.nom || ''}`.toLowerCase() : '';
    const livreurTel = cmd.livreur?.telephone?.toLowerCase() || '';
    const livreurImmat = cmd.livreur?.immatriculation?.toLowerCase() || '';

    return (
      reference.includes(query) ||
      description.includes(query) ||
      nomDestinataire.includes(query) ||
      telDestinataire.includes(query) ||
      telDemandeur.includes(query) ||
      instructions.includes(query) ||
      adresseRamassage.includes(query) ||
      adresseLivraison.includes(query) ||
      clientNom.includes(query) ||
      clientTel.includes(query) ||
      clientEmail.includes(query) ||
      livreurNom.includes(query) ||
      livreurTel.includes(query) ||
      livreurImmat.includes(query)
    );
  });

  return (
    <div className="w-full space-y-4">
      <Card className="rounded-2xl sm:rounded-3xl shadow-sm border-gray-100 bg-white w-full">
        <CardHeader className="pb-3 pt-5 px-4 sm:px-6">
          <CardTitle className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Suivre une livraison
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6 pb-5">
          <form onSubmit={handleSearchSubmit} className="space-y-1.5">
            <p className="text-xs sm:text-sm text-gray-600">
              Entrez la référence, l'adresse ou le numéro de téléphone associé à votre commande.
            </p>
            <div className="flex gap-2 pt-2">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ex: Adidogome, CMD-2026..."
                className="h-11 rounded-xl bg-gray-50/70 border-gray-200 focus-visible:ring-[#C89D27] text-sm"
              />
              <Button
                type="submit"
                disabled={searching}
                className="h-11 px-4 bg-[#C89D27] hover:bg-[#b08920] text-emerald-950 rounded-xl font-semibold border-0 cursor-pointer"
              >
                {searching ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Affichage de la liste des commandes trouvées */}
      <div className="space-y-3">
        {foundOrders.map((order) => {
          const currentStep = getStepFromStatus(order.statut_commande);
          const statusConfig = getStatusConfig(order.statut_commande);
          const addresses = readableAddresses[order.reference] || {
            ramassage: order.adresse_ramassage,
            livraison: order.adresse_livraison,
          };

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
            <div key={order.reference} className="bg-white rounded-xl border border-[#d4a017]/40 shadow-sm p-2.5 sm:p-4 space-y-2 animate-in fade-in duration-200">
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
                  <span className="truncate">{addresses.ramassage}</span>
                </div>
                <span className="text-gray-400 shrink-0">&gt;</span>
                <div className="flex items-center gap-1 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d4a017] shrink-0" />
                  <span className="truncate">{addresses.livraison}</span>
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
        })}
      </div>

      {hasSearched && !searching && foundOrders.length === 0 && (
        <p className="text-center text-gray-500 text-sm py-4">Aucune commande ne correspond à cette recherche.</p>
      )}
    </div>
  );
}
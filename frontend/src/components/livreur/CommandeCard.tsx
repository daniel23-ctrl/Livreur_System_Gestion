'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CommandeResponse, StatutCommande } from '@/types/commande.types';
import { StatusBadge } from './StatusBadge';
import { Navigation, CheckCircle, PackageCheck, Play, Package, UserCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { getReadableAddress, isCoordinatesString } from '@/utils/addresse';

interface CommandeCardProps {
  commande: CommandeResponse;
  onUpdateStatus?: (id_commande: string, nouveauStatut: StatutCommande) => void;
}

function useReverseGeocode(coordsOrAddress: string) {
  const [displayText, setDisplayText] = useState(coordsOrAddress);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const resolve = async () => {
      if (isCoordinatesString(coordsOrAddress)) {
        setLoading(true);
        const readable = await getReadableAddress(coordsOrAddress);
        if (isMounted) {
          setDisplayText(readable);
          setLoading(false);
        }
      } else {
        setDisplayText(coordsOrAddress);
      }
    };

    resolve();
    return () => {
      isMounted = false;
    };
  }, [coordsOrAddress]);

  return { displayText, loading };
}

export function CommandeCard({ commande, onUpdateStatus }: CommandeCardProps) {
  const [showConfirmReject, setShowConfirmReject] = useState(false);

  const dateObj = commande.createdAt ? new Date(commande.createdAt) : new Date();
  const formattedDate = dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  const formattedTime = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const { displayText: ramassageText, loading: loadingRamassage } = useReverseGeocode(commande.adresse_ramassage);
  const { displayText: livraisonText, loading: loadingLivraison } = useReverseGeocode(commande.adresse_livraison);

  const openNavigation = (adresse: string) => {
    const encoded = encodeURIComponent(adresse);
    window.open(`https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${encoded}&travelmode=driving`, '_blank');
  };

  const handleConfirmReject = () => {
    if (onUpdateStatus) {
      onUpdateStatus(commande.id_commande, 'ANNULEE' as StatutCommande);
    }
    setShowConfirmReject(false);
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm transition-all border border-gray-200/70 overflow-hidden p-0 gap-0 relative">
      {/* --- MODALE DE CONFIRMATION DE REJET --- */}
      {showConfirmReject && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-4 text-center animate-in fade-in duration-200">
          <div className="p-2 bg-red-100 text-red-600 rounded-full mb-2">
            <AlertTriangle size={20} />
          </div>
          <h4 className="text-xs font-bold text-gray-900 mb-1">Confirmer le rejet de la commande</h4>
          <p className="text-[11px] text-gray-600 max-w-md mb-3">
            Vous êtes sur le point de rejeter la commande <span className="font-bold text-gray-900">{commande.reference}</span> ({commande.montant_a_percevoir} F).
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowConfirmReject(false)}
              className="h-7 px-3 text-xs rounded-full border-gray-300"
            >
              Annuler
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmReject}
              className="h-7 px-3 text-xs rounded-full bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              Oui, rejeter
            </Button>
          </div>
        </div>
      )}

      {/* --- EN-TÊTE --- */}
      <div className="bg-[#0b3b29] px-3 py-1.5 flex items-center justify-between border-b border-emerald-900/30 w-full">
        <div className="flex items-center gap-2">
            <div className="p-1 bg-white/10 rounded-md text-emerald-200">
               <Package size={13} />
            </div>
            <h3 className="font-extrabold text-xs text-white tracking-tight">
              {commande.reference}
            </h3>
             <span className="text-[10px] text-emerald-200 font-medium">
              | {formattedDate} à {formattedTime}
            </span>
        </div>
        <StatusBadge status={commande.statut_commande} label={commande.statut_commande.replace(/_/g, ' ')} />
      </div>

      <div className="p-2.5">
        {/* --- ADRESSES SUR UNE SEULE LIGNE (2 colonnes) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
          
          {/* Ramassage */}
          <div className="bg-gray-50/60 px-2.5 py-2 rounded-lg border border-gray-100 flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                 <UserCircle size={12} className="text-gray-400 shrink-0"/>
                 <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Ramassage :</span>
                 <span className="text-[11px] font-bold text-gray-900 truncate">
                   {commande.client?.nom || commande.client?.prenom || 'Client'} ({commande.telephone_demandeur || commande.client?.telephone || 'N/A'})
                 </span>
              </div>
              <p className="text-[11px] text-gray-700 truncate mt-0.5 flex items-center gap-1">
                {loadingRamassage ? (
                  <span className="flex items-center gap-1 text-gray-400 italic">
                    <Loader2 className="animate-spin" size={10} /> Traduction des coordonnées...
                  </span>
                ) : (
                  ramassageText
                )}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openNavigation(commande.adresse_ramassage)}
              className="h-6 px-2.5 bg-amber-50 hover:bg-amber-100 text-[#b88a10] border-amber-200 rounded-full text-[10px] font-bold shrink-0 flex items-center gap-1"
            >
               <Navigation size={11} /> Itinéraire
            </Button>
          </div>

          {/* Livraison */}
          <div className="bg-gray-50/60 px-2.5 py-2 rounded-lg border border-gray-100 flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                 <UserCircle size={12} className="text-gray-400 shrink-0"/>
                 <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Livraison :</span>
                 <span className="text-[11px] font-bold text-gray-900 truncate">
                   {commande.nom_destinataire || 'Destinataire'} ({commande.telephone_destinataire || 'N/A'})
                 </span>
              </div>
              <p className="text-[11px] text-gray-700 truncate mt-0.5 flex items-center gap-1">
                {loadingLivraison ? (
                  <span className="flex items-center gap-1 text-gray-400 italic">
                    <Loader2 className="animate-spin" size={10} /> Traduction des coordonnées...
                  </span>
                ) : (
                  livraisonText
                )}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openNavigation(commande.adresse_livraison)}
              className="h-6 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-[#0b3b29] border-emerald-200 rounded-full text-[10px] font-bold shrink-0 flex items-center gap-1"
            >
               <Navigation size={11} /> Itinéraire
            </Button>
          </div>
          
        </div>

        {/* --- DESCRIPTION, MONTANT ET ACTIONS --- */}
        <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-gray-100">
          <div className="flex-1 flex items-center gap-2 min-w-0">
              <span className="text-[11px] text-gray-600 truncate">
                {commande.description || 'Aucune description'}
              </span>
              <span className="text-[11px] font-bold text-[#b88a10] bg-amber-50 px-2 py-0.5 rounded-full shrink-0">
                  {commande.montant_a_percevoir} F
              </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {(commande.statut_commande === 'EN_ATTENTE' || commande.statut_commande === 'ASSIGNEE') && onUpdateStatus && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowConfirmReject(true)}
                  className="h-6 px-3 bg-red-50 hover:bg-red-100 text-red-600 border-red-200 rounded-full text-[10px] font-bold flex items-center gap-1"
                >
                  <XCircle size={11} /> Rejeter
                </Button>

                <Button
                  size="sm"
                  onClick={() => onUpdateStatus(commande.id_commande, 'EN_COURS_DE_COLLECTE')}
                  className="h-6 px-3.5 bg-[#0b3b29] text-white rounded-full text-[10px] font-bold hover:bg-[#082a1e] flex items-center gap-1"
                >
                  <Play size={11} /> Accepter / Collecter
                </Button>
              </>
            )}

            {commande.statut_commande === 'EN_COURS_DE_COLLECTE' && onUpdateStatus && (
              <Button
                size="sm"
                onClick={() => onUpdateStatus(commande.id_commande, 'EN_COURS_DE_LIVRAISON')}
                className="h-6 px-3.5 bg-blue-600 text-white rounded-full text-[10px] font-bold hover:bg-blue-700 flex items-center gap-1"
              >
                <PackageCheck size={11} /> Colis collecté
              </Button>
            )}

            {commande.statut_commande === 'EN_COURS_DE_LIVRAISON' && onUpdateStatus && (
              <Button
                size="sm"
                onClick={() => onUpdateStatus(commande.id_commande, 'LIVREE')}
                className="h-6 px-3.5 bg-emerald-600 text-white rounded-full text-[10px] font-bold hover:bg-emerald-700 flex items-center gap-1"
              >
                <CheckCircle size={11} /> Marquer livrée
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
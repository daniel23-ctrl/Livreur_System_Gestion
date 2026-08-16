'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { DeliveryDetailsForm } from '@/components/client/DeliveryDetailsForm';
import { TrackingView } from '@/components/client/TrackingView';
import { OrdersView } from '@/components/client/OrdersView';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { createCommande } from '@/services/commande.service';
import { CreateCommandePayload } from '@/types/commande.types';
import { getCurrentUser } from '@/services/auth.service';
import { LoginResponse } from '@/types/auth.types';
import { toast } from 'sonner';
import { wsService } from '@/lib/socket'; 

export default function ClientDashboard() {
  const [activeTab, setActiveTab] = useState<'send' | 'track' | 'orders'>('send');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [user, setUser] = useState<LoginResponse | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUser(getCurrentUser());

    // 1. Lancer la connexion WebSocket globale dès que le dashboard s'affiche
    wsService.connect();
  }, []);

  // État global du formulaire de livraison partagé avec l'enfant
  const [formData, setFormData] = useState({
    point_a: '',
    lat_a: '',
    lng_a: '',
    point_b: '',
    lat_b: '',
    lng_b: '',
    nom_destinataire: '',
    telephone_destinataire: '',
    telephone_demandeur: '',
    montant_a_percevoir: '',
    description: '',
    instructions: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.lat_a || !formData.lng_a || !formData.lat_b || !formData.lng_b) {
      toast.error("Coordonnées manquantes", {
        description: "Veuillez sélectionner des points de ramassage et de livraison valides (via GPS ou recherche).",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const payload: CreateCommandePayload = {
        description: formData.description,
        adresse_ramassage: `${formData.lng_a} ${formData.lat_a}`,
        adresse_livraison: `${formData.lng_b} ${formData.lat_b}`,
        nom_destinataire: formData.nom_destinataire,
        telephone_destinataire: formData.telephone_destinataire,
        telephone_demandeur: formData.telephone_demandeur || user?.telephone || '', 
        instructions: formData.instructions || null,
        montant_a_percevoir: Number(formData.montant_a_percevoir),
      };

      const response = await createCommande(payload);
      console.log("Commande créée avec succès :", response);

      toast.success("Commande enregistrée !", {
        description: "Votre demande de livraison a été envoyée avec succès.",
      });

      setFormData({
        point_a: '',
        lat_a: '',
        lng_a: '',
        point_b: '',
        lat_b: '',
        lng_b: '',
        nom_destinataire: '',
        telephone_destinataire: '',
        telephone_demandeur: '',
        montant_a_percevoir: '',
        description: '',
        instructions: '',
      });

      // Basculer vers l'onglet des commandes (instantané, sans détruire le composant)
      setActiveTab('orders');

    } catch (error: any) {
      console.error("Erreur lors de la création de la commande :", error);
      const errorMessage = error?.response?.data?.detail || error?.message || "Une erreur est survenue lors de l'envoi de la commande.";

      toast.error("Échec de la commande", {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <div
      className="min-h-screen bg-[#F4F1EA] text-gray-900"
      style={{
        backgroundImage: `url('/backdashboard.jpg')`,
        backgroundRepeat: 'repeat',
        backgroundSize: '350px',
      }}
    >
      <Header />

      <main className="max-w-xl mx-auto px-3 sm:px-4 py-4 sm:py-6 flex flex-col items-center">
        {/* Navigation Onglets Responsive */}
        <div className="w-full mb-4 sm:mb-6">
          <div className="w-full bg-white border border-gray-100 p-1 sm:p-1.5 rounded-2xl shadow-sm flex items-center justify-between text-xs sm:text-sm font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('send')}
              className={`flex-1 py-2.5 px-1 sm:px-3 rounded-xl transition-all text-center truncate ${
                activeTab === 'send'
                  ? 'bg-[#C89D27] text-emerald-950 shadow-sm font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Envoyer un colis
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('track')}
              className={`flex-1 py-2.5 px-1 sm:px-3 rounded-xl transition-all text-center truncate ${
                activeTab === 'track'
                  ? 'bg-[#C89D27] text-emerald-950 shadow-sm font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Suivre
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-2.5 px-1 sm:px-3 rounded-xl transition-all text-center truncate ${
                activeTab === 'orders'
                  ? 'bg-[#C89D27] text-emerald-950 shadow-sm font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mes commandes
            </button>
          </div>
        </div>

        {/* Contenu avec persistance des onglets (display: none/block) */}
        <div className="w-full">
          <div className={activeTab === 'send' ? 'block' : 'hidden'}>
            <form className="w-full space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
              <DeliveryDetailsForm formData={formData} setFormData={setFormData} />

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 sm:h-14 bg-[#C89D27] hover:bg-[#b08920] text-emerald-950 font-bold text-sm sm:text-base rounded-2xl flex items-center justify-center gap-2 shadow-md border-0 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    Envoyer ma demande
                    <ArrowRight size={18} />
                  </>
                )}
              </Button>
            </form>
          </div>

          <div className={activeTab === 'track' ? 'block' : 'hidden'}>
            <TrackingView />
          </div>

          <div className={activeTab === 'orders' ? 'block' : 'hidden'}>
            <OrdersView />
          </div>
        </div>
      </main>
    </div>
  );
}
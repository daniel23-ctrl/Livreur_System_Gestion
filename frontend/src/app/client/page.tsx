'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { UserInfoForm } from '@/components/client/UserInfoForm';
import { DeliveryDetailsForm } from '@/components/client/DeliveryDetailsForm';
import { TrackingView } from '@/components/client/TrackingView';
import { OrdersView } from '@/components/client/OrdersView';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function ClientDashboard() {
  const [activeTab, setActiveTab] = useState<'send' | 'track' | 'orders'>('send');

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

        {/* Contenu selon l'onglet sélectionné */}
        {activeTab === 'send' && (
          <form className="w-full space-y-4 sm:space-y-6" onSubmit={(e) => e.preventDefault()}>
            <UserInfoForm />
            <DeliveryDetailsForm />

            <Button
              type="submit"
              className="w-full h-12 sm:h-14 bg-[#C89D27] hover:bg-[#b08920] text-emerald-950 font-bold text-sm sm:text-base rounded-2xl flex items-center justify-center gap-2 shadow-md border-0"
            >
              Envoyer ma demande
              <ArrowRight size={18} />
            </Button>
          </form>
        )}

        {activeTab === 'track' && <TrackingView />}

        {activeTab === 'orders' && <OrdersView />}
      </main>
    </div>
  );
}
export function ClientTabs({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: any) => void }) {
  return (
    <div className="w-full mb-4">
      <div className="w-full bg-white/90 border border-gray-100 p-1 rounded-2xl shadow-sm grid grid-cols-3 gap-1 text-[11px] font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('send')}
          className={`py-2 px-1 rounded-xl transition-all text-center leading-tight ${
            activeTab === 'send'
              ? 'bg-[#d4a017] text-emerald-950 font-bold shadow-sm'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Envoyer un colis
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('track')}
          className={`py-2 px-1 rounded-xl transition-all text-center leading-tight ${
            activeTab === 'track'
              ? 'bg-[#d4a017] text-emerald-950 font-bold shadow-sm'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Suivre ma livraison
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`py-2 px-1 rounded-xl transition-all text-center leading-tight ${
            activeTab === 'orders'
              ? 'bg-[#d4a017] text-emerald-950 font-bold shadow-sm'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Mes commandes
        </button>
      </div>
    </div>
  );
}
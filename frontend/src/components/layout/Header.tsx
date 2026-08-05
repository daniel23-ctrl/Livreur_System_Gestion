import React from 'react';
import Image from 'next/image';
import { Phone, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="bg-[#0b3b29] text-white px-3 py-3">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
        {/* Logo & Titres */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="bg-white p-1 rounded-xl flex items-center justify-center w-10 h-10 shrink-0">
            <Image
              src="/KusiLogo.png"
              alt="Logo Kusi Livraison"
              width={32}
              height={32}
              className="object-contain w-full h-full"
              priority
            />
          </div>

          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white leading-tight truncate">
              Kusi Livraison
            </h1>
            <p className="text-[10px] text-emerald-200/80 leading-tight truncate">
              Portail Client Lomé, Togo
            </p>
          </div>
        </div>

        {/* Boutons d'action (Bouton Jaune Complet + Logout) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            type="button"
            className="bg-[#d4a017] hover:bg-[#b88a10] text-emerald-950 font-bold h-8 px-3 rounded-full text-[11px] flex items-center gap-1.5 shadow-none border-0"
          >
            <Phone size={12} className="fill-emerald-950 stroke-none" />
            <span>Nous appeler</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-emerald-200/70 hover:text-white h-8 w-8 rounded-full p-0"
          >
            <LogOut size={16} />
          </Button>
        </div>
      </div>
    </header>
  );
}
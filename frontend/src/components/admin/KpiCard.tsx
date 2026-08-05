import React from "react";

interface KpiCardProps {
  label: string;
  value: string | number;
  subtitle: string;
  iconBg: string;
  icon: React.ReactNode;
}

export default function KpiCard({ label, value, subtitle, iconBg, icon }: KpiCardProps) {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 lg:min-h-[120px] border border-gray-100 shadow-xs flex flex-col sm:flex-row justify-between w-full h-full gap-2 sm:gap-3">
      {/* En-tête mobile : Titre + Icône alignés à la même hauteur */}
      <div className="flex items-center justify-between sm:hidden w-full">
        <p className="text-[10px] font-semibold text-emerald-950 uppercase tracking-wider truncate">
          {label}
        </p>
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 [&_svg]:w-3 [&_svg]:h-3"
          style={{ backgroundColor: iconBg }}
        >
          {icon}
        </div>
      </div>

      {/* Bloc texte principal */}
      <div className="min-w-0 flex-1">
        {/* Titre (visible uniquement sur écran > sm) */}
        <p className="hidden sm:block text-xs font-semibold text-emerald-950 uppercase tracking-wider truncate">
          {label}
        </p>

        {/* Valeur : prend désormais 100% de la largeur disponible sur mobile */}
        <h3 className="text-base sm:text-xl lg:text-3xl font-bold text-gray-900 truncate leading-tight mt-0.5 sm:mt-1.5">
          {value}
        </h3>

        {/* Sous-titre */}
        <p className="text-[9px] sm:text-xs text-[#9CA3AF] truncate mt-0.5 sm:mt-1">
          {subtitle}
        </p>
      </div>

      {/* Icône Desktop (visible uniquement sur écran > sm) */}
      <div
        className="hidden sm:flex w-8 h-8 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl items-center justify-center shrink-0 [&_svg]:w-4 [&_svg]:h-4 lg:[&_svg]:w-6 lg:[&_svg]:h-6"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </div>
    </div>
  );
}
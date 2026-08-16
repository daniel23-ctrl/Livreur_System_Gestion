import React from "react";

interface KpiCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  iconBg: string;
  icon: React.ReactNode;
}

export default function KpiCard({ label, value, subtitle, iconBg, icon }: KpiCardProps) {
  return (
    <div className="flex items-center gap-3.5 px-4 py-3 flex-1 min-w-0">
      {/* Icône */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 [&_svg]:w-5 [&_svg]:h-5"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </div>

      {/* Texte */}
      <div className="min-w-0 flex-1 flex flex-col justify-center">
        <p className="text-[10px] sm:text-[11px] font-bold text-white uppercase tracking-wider truncate">
          {label}
        </p>
        <div className="flex items-baseline gap-1.5 mt-0.5">
          <h3 className="text-lg sm:text-xl font-extrabold text-white truncate leading-tight">
            {value}
          </h3>
          {subtitle && (
            <span className="text-[11px] text-white/70 font-medium truncate">
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
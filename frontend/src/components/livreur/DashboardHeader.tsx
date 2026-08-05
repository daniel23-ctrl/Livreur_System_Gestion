import React from 'react';

interface DashboardHeaderProps {
  title: string;
  statusText: string;
}

export function DashboardHeader({ title, statusText }: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-100 px-8 py-5">
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
      <div className="flex items-center gap-2 mt-1">
        <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
        <p className="text-xs text-amber-700/80 font-medium">{statusText}</p>
      </div>
    </header>
  );
}
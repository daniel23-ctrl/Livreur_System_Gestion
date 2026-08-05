import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mission } from '@/types/mission';
import { StatusBadge } from './StatusBadge';

interface MissionCardProps {
  mission: Mission;
}

export function MissionCard({ mission }: MissionCardProps) {
  return (
    <Card
      className={`bg-white rounded-2xl shadow-xs transition-all border-0 ${
        mission.highlightBorder
          ? 'ring-2 ring-[#d4a017]'
          : 'border border-gray-200/70'
      }`}
    >
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#0b3b29]">{mission.id}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">{mission.date}</p>
          </div>
          <StatusBadge status={mission.status} label={mission.statusLabel} />
        </div>
      </CardHeader>

      <div className="px-5">
        <Separator className="bg-gray-100" />
      </div>

      <CardContent className="p-5 pt-3">
        {/* Trajet (DE -> VERS) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3 items-center">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
              DE
            </span>
            <p className="text-xs font-bold text-gray-800">{mission.pickup}</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-xs hidden md:inline">&gt;</span>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                VERS
              </span>
              <p className="text-xs font-bold text-gray-800">{mission.destination}</p>
            </div>
          </div>
        </div>

        {/* Footer de la carte */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-gray-400 font-medium">
            {mission.description}
          </span>
          <span className="text-xs font-bold text-[#b88a10]">
            {mission.price}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
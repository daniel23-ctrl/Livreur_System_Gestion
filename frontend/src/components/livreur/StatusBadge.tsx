import React from 'react';
import { Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MissionStatus } from '@/types/mission';

interface StatusBadgeProps {
  status: MissionStatus;
  label: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  if (status === 'en_livraison') {
    return (
      <Badge className="bg-purple-100 hover:bg-purple-100 text-purple-700 font-medium px-3 py-1 text-xs rounded-full border-0 gap-1.5 shadow-none">
        <Truck size={13} />
        <span>{label}</span>
      </Badge>
    );
  }

  if (status === 'assignee') {
    return (
      <Badge className="bg-blue-100 hover:bg-blue-100 text-blue-700 font-medium px-3 py-1 text-xs rounded-full border-0 gap-1.5 shadow-none">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
        <span>{label}</span>
      </Badge>
    );
  }

  return (
    <Badge className="bg-emerald-100 hover:bg-emerald-100 text-emerald-800 font-medium px-3 py-1 text-xs rounded-full border-0 gap-1.5 shadow-none">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
      <span>{label}</span>
    </Badge>
  );
}
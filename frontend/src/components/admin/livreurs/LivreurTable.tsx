"use client";

import { Livreur } from "@/types/livreur.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Phone, Mail, Car, Bike, Trash2, Edit3, CheckCircle2, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LivreurTableProps {
  livreurs: Livreur[];
  isLoading?: boolean; 
  onEdit: (livreur: Livreur) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: string) => void;
  onRowClick: (livreur: Livreur) => void;
}

export function LivreurTable({ livreurs, isLoading = false, onEdit, onDelete, onToggleStatus, onRowClick }: LivreurTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-16 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-slate-500 font-medium text-sm">Chargement des livreurs...</p>
      </div>
    );
  }

  if (livreurs.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
        <p className="text-slate-500 font-medium">Aucun livreur trouvé.</p>
      </div>
    );
  }

  const renderVehicleIcon = (type: string, className: string = "w-4 h-4 text-emerald-700") => {
    const t = type?.toUpperCase() || "";
    if (t.includes("MOTO") || t.includes("SCOOTER") || t.includes("DEUX_ROUES")) {
      return <Bike className={className} />;
    }
    return <Car className={className} />;
  };

  // Inversion de l'ordre pour afficher les plus récents en haut
  const sortedLivreurs = [...livreurs].reverse();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <th className="py-4 px-6">Livreur</th>
              <th className="py-4 px-6">Contact</th>
              <th className="py-4 px-6">Véhicule & Immat.</th>
              <th className="py-4 px-6">État d'activité</th>
              <th className="py-4 px-6">Compte</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {sortedLivreurs.map((l) => {
              let statusBadgeColor = "bg-slate-100 text-slate-700 border-slate-200";
              if (l.etat_activite === "DISPONIBLE") statusBadgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
              if (l.etat_activite === "EN_COURSE") statusBadgeColor = "bg-amber-50 text-amber-700 border-amber-200";
              if (l.etat_activite === "HORS_LIGNE") statusBadgeColor = "bg-rose-50 text-rose-700 border-rose-200";

              return (
                <tr 
                  key={l.id} 
                  onClick={() => onRowClick(l)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-900 text-amber-400 flex items-center justify-center font-bold text-sm shadow-sm">
                        {l.prenom?.[0]}{l.nom?.[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{l.prenom} {l.nom}</div>
                        <div className="text-xs text-slate-400">ID: {l.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6 text-slate-600">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {l.telephone}
                    </div>
                    {l.email && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                        <Mail className="w-3.5 h-3.5" />
                        {String(l.email)}
                      </div>
                    )}
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {renderVehicleIcon(l.type_vehicule)}
                      <span className="font-medium text-slate-700">{l.type_vehicule}</span>
                    </div>
                    <div className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded mt-1 inline-block">
                      {l.immatriculation}
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <Badge variant="outline" className={`px-3 py-1 font-medium rounded-full ${statusBadgeColor}`}>
                      {l.etat_activite}
                    </Badge>
                  </td>

                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${l.est_actif ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${l.est_actif ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                      {l.est_actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl shadow-lg border-slate-100 w-48">
                        <DropdownMenuLabel>Supervision</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onToggleStatus(l.id, l.etat_activite)} className="gap-2 cursor-pointer">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Basculer l'état
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit(l)} className="gap-2 cursor-pointer">
                          <Edit3 className="w-4 h-4 text-blue-600" />
                          Modifier profil
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(l.id)} className="gap-2 text-rose-600 cursor-pointer focus:text-rose-600">
                          <Trash2 className="w-4 h-4" />
                          Archiver
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
"use client";

import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RotateCcw, Mail, Phone, Car } from "lucide-react";
import { Livreur } from "@/types/livreur.types";

interface LivreurArchiveRowProps {
  livreur: Livreur;
  onDesarchiver: (id: string) => void;
}

export function LivreurArchiveRow({ livreur, onDesarchiver }: LivreurArchiveRowProps) {
  return (
    <TableRow className="hover:bg-slate-50/50">
      <TableCell className="font-semibold text-slate-900">
        {livreur.prenom} {livreur.nom}
      </TableCell>
      <TableCell>
        <div className="text-sm text-slate-700 flex items-center gap-1">
          <Phone className="w-3.5 h-3.5 text-slate-400" /> {livreur.telephone}
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm text-slate-700 flex items-center gap-1">
          <Mail className="w-3.5 h-3.5 text-slate-400" /> {livreur.email || "N/A"}
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm text-slate-700 flex items-center gap-1">
          <Car className="w-3.5 h-3.5 text-slate-400" /> {livreur.type_vehicule} ({livreur.immatriculation})
        </div>
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDesarchiver(livreur.id)}
          className="gap-1.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Désarchiver
        </Button>
      </TableCell>
    </TableRow>
  );
}
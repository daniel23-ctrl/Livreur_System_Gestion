"use client";

import React, { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Commande, StatutCommande } from "@/types/admin.types";
import StatutBadge from "@/components/admin/StatutBadge";
import { Clock, RefreshCw } from "lucide-react";

interface DashboardCommandesTableProps {
  commandes: Commande[];
  lastRefresh: Date;
  onRefresh: () => void;
}

const FILTRES: { label: string; value: StatutCommande | "TOUTES" }[] = [
  { label: "Toutes", value: "TOUTES" },
  { label: "En attente", value: "EN_ATTENTE" },
  { label: "Assignée", value: "ASSIGNEE" },
  { label: "En cours", value: "EN_COURS_DE_LIVRAISON" },
  { label: "Livrée", value: "LIVREE" },
  { label: "Annulée", value: "ANNULEE" },
];

export const columns: ColumnDef<Commande>[] = [
  {
    accessorKey: "reference",
    header: "Référence",
    cell: ({ row }) => {
      const rawDate = row.original.createdAt || (row.original as unknown as Record<string, string>).created_at;
      const dateObj = rawDate ? new Date(rawDate as string | number | Date) : null;
      const isValid = dateObj && !isNaN(dateObj.getTime());
      const fullRef = row.original.reference || "";
      const shortRef = fullRef ? `#${fullRef.slice(-6)}` : "—";

      return (
        <div className="min-w-[120px]">
          <p className="font-bold text-xs lg:text-sm text-[#0b3b29] truncate" title={fullRef}>
            <span className="md:hidden">{shortRef}</span>
            <span className="hidden md:inline">{fullRef}</span>
          </p>
          <p className="text-[11px] lg:text-xs text-gray-400 flex items-center gap-1 mt-0.5 whitespace-nowrap">
            <Clock className="w-3 h-3 shrink-0" />
            {isValid
              ? dateObj.toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "nom_client",
    header: "Client",
    cell: ({ row }) => (
      <div className="min-w-[110px]">
        <p className="font-semibold text-[#1A1A1A] text-xs lg:text-sm truncate">
          {row.original.client?.nom || "Client inconnu"}
        </p>
        <p className="text-xs text-[#9CA3AF] whitespace-nowrap">
          +228 {row.original.telephone_demandeur}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "adresse_livraison",
    header: "Destination",
    cell: ({ row }) => (
      <div className="max-w-[200px] xl:max-w-[280px]">
        <p className="text-xs lg:text-sm text-[#374151] font-medium truncate" title={row.original.adresse_livraison}>
          {row.original.adresse_livraison}
        </p>
        <p className="text-xs text-[#9CA3AF] truncate" title={row.original.description}>
          {row.original.description}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "nom_livreur",
    header: "Livreur",
    cell: ({ row }) => {
      const livreur = row.original.livreur;
      const nomComplet = livreur 
        ? `${livreur.prenom ? livreur.prenom + " " : ""}${livreur.nom}`
        : null;

      return nomComplet ? (
        <p className="text-xs lg:text-sm font-semibold text-[#1A1A1A] truncate min-w-[90px]">
          {nomComplet}
        </p>
      ) : (
        <p className="text-xs lg:text-sm text-[#9CA3AF] italic whitespace-nowrap min-w-[90px]">
          Non assigné
        </p>
      );
    },
  },
  {
    accessorKey: "montant_a_percevoir",
    header: "Montant",
    cell: ({ row }) => (
      <p className="text-xs lg:text-sm font-semibold text-[#1A1A1A] whitespace-nowrap">
        {row.original.montant_a_percevoir > 0 ? (
          `${row.original.montant_a_percevoir.toLocaleString("fr-FR")} F`
        ) : (
          <span className="text-[#9CA3AF]">Prépayé</span>
        )}
      </p>
    ),
  },
  {
    accessorKey: "statut_commande",
    header: "Statut",
    cell: ({ row }) => (
      <div className="shrink-0">
        <StatutBadge statut={row.original.statut_commande} />
      </div>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex items-center gap-1 shrink-0">
        {row.original.statut_commande === "EN_ATTENTE" && (
          <button
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold bg-[#C49A1A] hover:opacity-90 transition-opacity"
            title="Affecter"
          >
            ↗
          </button>
        )}
      </div>
    ),
  },
];

export default function DashboardCommandesTable({
  commandes,
  lastRefresh,
  onRefresh,
}: DashboardCommandesTableProps) {
  const [filtre, setFiltre] = useState<StatutCommande | "TOUTES">("TOUTES");

  const data = React.useMemo(() => {
    if (filtre === "TOUTES") return commandes;
    return commandes.filter((c) => c.statut_commande === filtre);
  }, [commandes, filtre]);

  const compte = (statut: StatutCommande) =>
    commandes.filter((c) => c.statut_commande === statut).length;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-gray-100 bg-[#FAFAFA]">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-[#1A1A1A]">
            Commandes en temps réel
          </h2>
          <span className="flex items-center gap-1.5 text-xs font-medium text-green-600">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            LIVE
          </span>
        </div>
        <button
          onClick={onRefresh}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          title={`Dernière mise à jour : ${lastRefresh.toLocaleTimeString("fr-FR")}`}
        >
          <RefreshCw className="w-4 h-4 text-[#9CA3AF]" />
        </button>
      </div>

      {/* Onglets filtres */}
      <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-gray-50 overflow-x-auto no-scrollbar">
        {FILTRES.map(({ label, value }) => {
          const count = value === "TOUTES" ? commandes.length : compte(value as StatutCommande);
          const active = filtre === value;
          return (
            <button
              key={value}
              onClick={() => setFiltre(value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                active ? "bg-[#C49A1A] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Table - Ajustée pour occuper 100% de la largeur sans forcer de scrollbar inutile sur desktop */}
      <div className="overflow-x-auto flex-1 w-full">
        <table className="w-full text-left border-collapse min-w-[700px] xl:min-w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-[#FAFAFA] border-b border-gray-100">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-3 sm:px-4 py-3 text-[11px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-[#9CA3AF] text-sm">
                  Aucune commande
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 sm:px-4 py-3 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
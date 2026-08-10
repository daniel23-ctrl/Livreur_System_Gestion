"use client";

import React, { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Commande, StatutCommande } from "@/types/commande.types";
import StatutBadge from "@/components/admin/StatutBadge";
import { Clock, RefreshCw, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";

interface DashboardCommandesTableProps {
  commandes: Commande[];
  lastRefresh: Date;
  onRefresh: () => void;
  isLoading?: boolean;
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
        <div className="overflow-hidden min-w-[120px]">
          <p className="font-bold text-[11px] lg:text-xs text-[#0b3b29] truncate" title={fullRef}>
            <span className="md:hidden">{shortRef}</span>
            <span className="hidden md:inline">{fullRef}</span>
          </p>
          <p className="text-[10px] lg:text-[11px] text-gray-400 flex items-center gap-0.5 mt-0.5 truncate">
            <Clock className="w-2.5 h-2.5 shrink-0" />
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
      <div className="overflow-hidden min-w-[140px]">
        <p className="font-semibold text-[#1A1A1A] text-[11px] lg:text-xs truncate">
          {row.original.client?.nom || "Client inconnu"}
        </p>
        <p className="text-[10px] lg:text-[11px] text-[#9CA3AF] truncate">
          +228 {row.original.telephone_demandeur}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "adresse_livraison",
    header: "Destination",
    cell: ({ row }) => (
      <div className="overflow-hidden min-w-[160px]">
        <p className="text-[11px] lg:text-xs text-[#374151] font-medium truncate" title={row.original.adresse_livraison}>
          {row.original.adresse_livraison}
        </p>
        <p className="text-[10px] text-[#9CA3AF] truncate" title={row.original.description}>
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

      return (
        <div className="min-w-[120px]">
          {nomComplet ? (
            <p className="text-[11px] lg:text-xs font-semibold text-[#1A1A1A] truncate">
              {nomComplet}
            </p>
          ) : (
            <p className="text-[11px] lg:text-xs text-[#9CA3AF] italic truncate">
              Non assigné
            </p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "montant_a_percevoir",
    header: "Montant",
    cell: ({ row }) => (
      <div className="min-w-[90px]">
        <p className="text-[11px] lg:text-xs font-semibold text-[#1A1A1A] truncate">
          {row.original.montant_a_percevoir > 0 ? (
            `${row.original.montant_a_percevoir.toLocaleString("fr-FR")} F`
          ) : (
            <span className="text-[#9CA3AF]">Prépayé</span>
          )}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "statut_commande",
    header: "Statut",
    cell: ({ row }) => (
      <div className="truncate scale-95 origin-left min-w-[100px]">
        <StatutBadge statut={row.original.statut_commande} />
      </div>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex items-center justify-end min-w-[50px]">
        {row.original.statut_commande === "EN_ATTENTE" && (
          <Button
            size="icon"
            className="w-6 h-6 rounded-md text-white text-[10px] font-bold bg-[#C49A1A] hover:bg-[#b08915]"
            title="Affecter"
          >
            ↗
          </Button>
        )}
      </div>
    ),
  },
];

export default function DashboardCommandesTable({
  commandes,
  lastRefresh,
  onRefresh,
  isLoading = false,
}: DashboardCommandesTableProps) {
  const [filtre, setFiltre] = useState<StatutCommande | "TOUTES">("TOUTES");

  const data = React.useMemo(() => {
    const filtered = filtre === "TOUTES" 
      ? commandes 
      : commandes.filter((c) => c.statut_commande === filtre);
    
    return [...filtered].reverse();
  }, [commandes, filtre]);

  const compte = (statut: StatutCommande) =>
    commandes.filter((c) => c.statut_commande === statut).length;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 8,
      },
    },
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
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={isLoading}
          className="h-8 w-8 rounded-lg hover:bg-gray-200/60"
          title={`Dernière mise à jour : ${lastRefresh.toLocaleTimeString("fr-FR")}`}
        >
          <RefreshCw className={`w-4 h-4 text-[#9CA3AF] ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Onglets filtres */}
      <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-gray-50 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {FILTRES.map(({ label, value }) => {
          const count = value === "TOUTES" ? commandes.length : compte(value as StatutCommande);
          const active = filtre === value;
          return (
            <Button
              key={value}
              variant={active ? "default" : "secondary"}
              onClick={() => {
                setFiltre(value);
                table.setPageIndex(0);
              }}
              className={`h-8 px-3 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                active ? "bg-[#C49A1A] hover:bg-[#b08915] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {label} ({count})
            </Button>
          );
        })}
      </div>

      {/* Table avec Scroll Horizontal réactivé sur mobile */}
      <div className="w-full overflow-x-auto flex-1">
        <Table className="w-full min-w-[700px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-[#FAFAFA] border-b border-gray-100 hover:bg-[#FAFAFA]">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="px-3 py-3 text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider truncate"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody className="divide-y bg-white divide-gray-100">
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-16">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-7 h-7 animate-spin text-[#C49A1A]" />
                    <p className="text-sm text-slate-500 font-medium">Chargement des commandes...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-12 text-[#9CA3AF] text-sm">
                  Aucune commande
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-3 py-2.5 align-middle truncate">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Barre de Pagination */}
      {!isLoading && data.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-3 border-t border-gray-100 bg-[#FAFAFA] gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <p>
              Affichage de <span className="font-semibold text-[#1A1A1A]">{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</span> à{" "}
              <span className="font-semibold text-[#1A1A1A]">
                {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, data.length)}
              </span> sur{" "}
              <span className="font-semibold text-[#1A1A1A]">{data.length}</span> entrées
            </p>

            <div className="hidden md:flex items-center gap-2">
              <span>Lignes par page :</span>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[70px] rounded-lg border-gray-200 text-xs font-semibold text-[#1A1A1A] focus:ring-[#C49A1A]">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent>
                  {[5, 8, 10, 20, 30, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`} className="text-xs">
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              title="Première page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              title="Page précédente"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <span className="px-3 py-1 font-semibold text-[#1A1A1A] bg-white border border-gray-200 rounded-lg shadow-2xs">
              Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount() || 1}
            </span>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              title="Page suivante"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              title="Dernière page"
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
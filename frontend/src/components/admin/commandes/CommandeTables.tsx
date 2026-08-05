"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Search, RefreshCw, Clock, ChevronLeft, ChevronRight } from "lucide-react";

import { Commande, StatutCommande } from "@/types/admin.types";
import { CommandeDetails } from "@/types/commande.types";
import StatutBadge from "@/components/admin/StatutBadge";
import { CommandeDetailsDialog } from "@/components/admin/commandes/CommandeDetailDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const FILTRES: { label: string; value: StatutCommande | "TOUTES" }[] = [
  { label: "Toutes", value: "TOUTES" },
  { label: "En attente", value: "EN_ATTENTE" },
  { label: "Assignée", value: "ASSIGNEE" },
  { label: "En cours", value: "EN_COURS_DE_LIVRAISON" },
  { label: "Livrées", value: "LIVREE" },
  { label: "Annulées", value: "ANNULEE" },
];

interface CommandesTableProps {
  commandes: Commande[];
  totalPeriode: number;
  loading: boolean;
  search: string;
  setSearch: (v: string) => void;
  filtreStatut: StatutCommande | "TOUTES";
  setFiltreStatut: (v: StatutCommande | "TOUTES") => void;
  onRefresh: () => void;
  lastRefresh: Date;
}

export default function CommandesTable({
  commandes,
  totalPeriode,
  loading,
  search,
  setSearch,
  filtreStatut,
  setFiltreStatut,
  onRefresh,
  lastRefresh,
}: CommandesTableProps) {
  const [selectedCommande, setSelectedCommande] = React.useState<CommandeDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleOpenDetails = (commande: Commande) => {
    setSelectedCommande(commande as unknown as CommandeDetails);
    setIsModalOpen(true);
  };

  const columns = React.useMemo<ColumnDef<Commande>[]>(
    () => [
      {
        accessorKey: "reference",
        header: "Référence",
        cell: ({ row }) => {
          const rawDate =
            row.original.createdAt ||
            (row.original as unknown as Record<string, string>).created_at;
          const dateObj = rawDate ? new Date(rawDate as string | number | Date) : null;
          const isValid = dateObj && !isNaN(dateObj.getTime());

          return (
            <div className="min-w-[100px]">
              <p className="font-bold text-[11px] sm:text-xs text-[#0b3b29]">
                {row.original.reference}
              </p>
              <p className="text-[10px] sm:text-[11px] text-gray-400 flex items-center gap-1 mt-0.5 whitespace-nowrap">
                <Clock size={10} />
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
          <div className="min-w-[120px]">
            <p className="font-semibold text-[11px] sm:text-xs text-gray-900 truncate">
              {row.original.client?.prenom} {row.original.client?.nom}
            </p>
            <p className="text-[10px] sm:text-[11px] text-gray-400 truncate">
              {row.original.telephone_demandeur || row.original.client?.telephone || "N/A"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "adresse_livraison",
        header: "Destination",
        cell: ({ row }) => (
          <div className="min-w-[130px] max-w-[180px]">
            <p className="text-[11px] sm:text-xs text-gray-700 truncate">
              {row.original.adresse_livraison}
            </p>
            <p className="text-[10px] sm:text-[11px] text-gray-400 truncate">
              {row.original.description}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "nom_livreur",
        header: "Livreur",
        cell: ({ row }) => (
          <div className="min-w-[110px]">
            {row.original.livreur?.nom ? (
              <span className="text-[11px] sm:text-xs font-semibold text-gray-900 truncate block">
                {row.original.livreur.prenom} {row.original.livreur.nom}
              </span>
            ) : (
              <span className="text-[11px] sm:text-xs text-gray-400 italic">Non assigné</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "montant_a_percevoir",
        header: "Montant",
        cell: ({ row }) => (
          <p className="text-[11px] sm:text-xs font-bold text-gray-900 whitespace-nowrap">
            {row.original.montant_a_percevoir > 0 ? (
              `${row.original.montant_a_percevoir.toLocaleString("fr-FR")} F`
            ) : (
              <span className="text-emerald-700 font-semibold">Prépayé</span>
            )}
          </p>
        ),
      },
      {
        accessorKey: "statut_commande",
        header: "Statut",
        cell: ({ row }) => <StatutBadge statut={row.original.statut_commande} />,
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="text-right whitespace-nowrap">
            <Button
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDetails(row.original);
              }}
              className="h-6 sm:h-7 px-2 sm:px-2.5 text-[10px] sm:text-xs font-semibold text-[#0b3b29] bg-emerald-50 hover:bg-emerald-100 rounded-lg"
            >
              Détails
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: commandes,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-xs overflow-hidden w-full">
      {/* Search Bar + Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border-b border-gray-100 gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par Réf, Client, Téléphone..."
            className="pl-10 pr-4 h-9 text-xs bg-gray-50 rounded-xl transition-all outline-hidden border border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#DCA524] focus:bg-white w-full"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          <span className="text-[10px] sm:text-[11px] text-gray-400 sm:hidden">
            Màj : {lastRefresh.toLocaleTimeString("fr-FR")}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="h-8 sm:h-9 px-3 sm:w-9 sm:p-0 rounded-xl border-gray-200 text-xs gap-1.5"
            title={`Dernière màj : ${lastRefresh.toLocaleTimeString("fr-FR")}`}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span className="sm:hidden text-xs">Actualiser</span>
          </Button>
        </div>
      </div>

      {/* Badges de filtre (Scrollable) */}
      <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 border-b border-gray-100 overflow-x-auto no-scrollbar bg-gray-50/30">
        {FILTRES.map(({ label, value }) => {
          const active = filtreStatut === value;
          const count =
            value === "TOUTES"
              ? totalPeriode
              : commandes.filter((c) => c.statut_commande === value).length;

          return (
            <button
              key={value}
              onClick={() => setFiltreStatut(value)}
              className={`px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all ${
                active
                  ? "bg-[#0b3b29] text-white shadow-xs"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Table responsive */}
      <div className="overflow-x-auto w-full">
        <Table className="w-full min-w-[600px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-50/70 border-b border-gray-100">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider h-10 px-2.5 sm:px-4"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-[#DCA524] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-gray-400">Chargement des commandes...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => handleOpenDetails(row.original)}
                  className="odd:bg-white even:bg-[#FAFAFA] hover:bg-amber-50/40 cursor-pointer transition-colors border-b border-gray-100"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2.5 px-2.5 sm:px-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-12 text-xs text-gray-400">
                  Aucune commande trouvée
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination responsive */}
      {!loading && table.getPageCount() > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
          <span className="order-2 sm:order-1 text-[11px] sm:text-xs">
            Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 text-xs rounded-lg flex-1 sm:flex-none"
            >
              <ChevronLeft size={14} className="mr-1" /> Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 text-xs rounded-lg flex-1 sm:flex-none"
            >
              Suivant <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Dialog responsive */}
      <CommandeDetailsDialog
        commande={selectedCommande}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}
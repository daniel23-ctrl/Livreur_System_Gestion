"use client";

import { Search, Filter, Car } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterBarProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  vehicleFilter: string;
  setVehicleFilter: (val: string) => void;
}

export function LivreurFiltersBar({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  vehicleFilter,
  setVehicleFilter,
}: FilterBarProps) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 mb-2">
      {/* Recherche par nom / téléphone / email */}
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Rechercher par nom, téléphone, email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl"
        />
      </div>

      {/* Filtres par sélecteurs */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        {/* Filtre État d'activité */}
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value || "TOUT")}>
          <SelectTrigger className="w-full md:w-[190px] bg-slate-50 border-slate-200 rounded-xl">
            <Filter className="w-3.5 h-3.5 mr-2 text-emerald-800" />
            <SelectValue placeholder="État d'activité" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="TOUT STATUTS">TOUT (Statuts)</SelectItem>
            <SelectItem value="DISPONIBLE">Disponible</SelectItem>
            <SelectItem value="EN_COURSE">En cours</SelectItem>
            <SelectItem value="HORS_LIGNE">Hors ligne</SelectItem>
          </SelectContent>
        </Select>

        {/* Filtre Type de Véhicule */}
        <Select value={vehicleFilter} onValueChange={(value) => setVehicleFilter(value || "TOUT")}>
          <SelectTrigger className="w-full md:w-[170px] bg-slate-50 border-slate-200 rounded-xl">
            <Car className="w-3.5 h-3.5 mr-2 text-emerald-800" />
            <SelectValue placeholder="Véhicule" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="TOUT">TOUT (Véhicules)</SelectItem>
            <SelectItem value="MOTO">Moto</SelectItem>
            <SelectItem value="VOITURE">Voiture</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
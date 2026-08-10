"use client";

import { useEffect, useState } from "react";
import { getAll, updateEtatLivreur, archiverLivreur, restaurerLivreur } from "@/services/livreur.service";
import { Livreur } from "@/types/livreur.types";
import { LivreurStatsOverview } from "@/components/admin/livreurs/LivreurStatsOverview";
import { LivreurFiltersBar } from "@/components/admin/livreurs/LivreurFiltersBar";
import { LivreurTable } from "@/components/admin/livreurs/LivreurTable";
import { LivreurDetailsModal } from "@/components/admin/livreurs/LivreurDetailsModal";
import { LivreurFormModal } from "@/components/admin/livreurs/LivreurFormModal";
import { Button } from "@/components/ui/button";
import { UserPlus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function AdminLivreursPage() {
  const [livreurs, setLivreurs] = useState<Livreur[]>([]);
  const [loading, setLoading] = useState(true);

  // États pour les modales de détails et d'édition
  const [selectedLivreur, setSelectedLivreur] = useState<Livreur | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const [editingLivreur, setEditingLivreur] = useState<Livreur | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // État pour la modale de création (Nouveau Livreur)
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("TOUT");
  const [vehicleFilter, setVehicleFilter] = useState("TOUT");

  const fetchLivreurs = async () => {
    try {
      setLoading(true);
      const data = await getAll();
      setLivreurs(data);
    } catch (error) {
      toast.error("Erreur lors du chargement des livreurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLivreurs();
  }, []);

  const handleRowClick = (livreur: Livreur) => {
    setSelectedLivreur(livreur);
    setIsDetailsOpen(true);
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "DISPONIBLE" ? "HORS_LIGNE" : "DISPONIBLE";
    try {
      await updateEtatLivreur(id, nextStatus as any);
      toast.success(`État mis à jour : ${nextStatus}`);
      fetchLivreurs();
      
      if (selectedLivreur && selectedLivreur.id === id) {
        setSelectedLivreur({ ...selectedLivreur, etat_activite: nextStatus as any });
      }
    } catch (error) {
      toast.error("Impossible de modifier l'état du livreur");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await archiverLivreur(id);
      toast.success("Livreur archivé avec succès");
      setIsDetailsOpen(false);
      fetchLivreurs();
    } catch (error) {
      toast.error("Échec de l'archivage");
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await restaurerLivreur(id);
      toast.success("Livreur désarchivé avec succès");
      setIsDetailsOpen(false);
      fetchLivreurs();
    } catch (error) {
      toast.error("Échec du désarchivage");
    }
  };

  const handleEdit = (livreur: Livreur) => {
    setEditingLivreur(livreur);
    setIsEditOpen(true);
  };

  const filteredLivreurs = livreurs.filter((l) => {
    const matchesSearch =
      `${l.prenom || ""} ${l.nom || ""}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.telephone && l.telephone.includes(searchTerm)) ||
      (l.email && String(l.email).toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "TOUT" || l.etat_activite === statusFilter;
    const matchesVehicle = vehicleFilter === "TOUT" || l.type_vehicule === vehicleFilter;

    return matchesSearch && matchesStatus && matchesVehicle;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 w-full">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Supervision des Livreurs</h1>
          <p className="text-slate-500 mt-1">Gérez en temps réel la flotte, les états et les missions de vos livreurs.</p>
        </div>
        <div className="flex items-center gap-3 self-end lg:self-auto">
          <Button
            variant="outline"
            onClick={fetchLivreurs}
            className="rounded-xl border-slate-200 gap-2 hover:bg-slate-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          
          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white gap-2 shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Nouveau Livreur
          </Button>
        </div>
      </div>

      <LivreurStatsOverview livreurs={livreurs} />

      <LivreurFiltersBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        vehicleFilter={vehicleFilter}
        setVehicleFilter={setVehicleFilter}
      />

      {/* Transmission de l'état loading à la table */}
      <LivreurTable
        livreurs={filteredLivreurs}
        isLoading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        onRowClick={handleRowClick}
      />

      {/* Modale de détails */}
      <LivreurDetailsModal
        livreur={selectedLivreur}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRestore={handleRestore}
      />

      {/* Modale unifiée : Mode Édition */}
      <LivreurFormModal
        livreur={editingLivreur}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={fetchLivreurs}
        isCreation={false}
      />

      {/* Modale unifiée : Mode Création */}
      <LivreurFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchLivreurs}
        isCreation={true}
      />
    </div>
  );
}
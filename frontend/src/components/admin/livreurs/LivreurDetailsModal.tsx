"use client";

import { Livreur } from "@/types/livreur.types";

import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { Phone, Mail, Car, Bike, Edit3, Trash2, Archive, ArchiveRestore } from "lucide-react";
import { toast } from "sonner";

interface LivreurDetailsModalProps {
    livreur: Livreur | null;
    isOpen: boolean;
    onClose: () => void;
    onEdit: (livreur: Livreur) => void;
    onDelete: (id: string) => void; 
    onRestore: (id: string) => void; 
}

export function LivreurDetailsModal({
    livreur,
    isOpen,
    onClose,
    onEdit,
    onDelete,
    onRestore,
}: LivreurDetailsModalProps) {
    if (!livreur) return null;

    const renderVehicleIcon = (type: string, className: string = "w-4 h-4 text-emerald-800") => {
        const t = type?.toUpperCase() || "";
        if (t.includes("MOTO") || t.includes("SCOOTER") || t.includes("DEUX_ROUES")) {
            return <Bike className={className} />;
        }
        return <Car className={className} />;
    };

    const handleEdit = () => {
        onEdit(livreur);
        onClose(); 
    };

    const handleArchiveOrRestore = () => {
        const isArchived = !livreur.est_actif;

        if (isArchived) {
            toast(`Êtes-vous sûr de vouloir désarchiver le livreur ${livreur.prenom} ${livreur.nom} ?`, {
                icon: <ArchiveRestore className="w-4 h-4 text-emerald-600" />,
                action: {
                    label: "Confirmer",
                    onClick: () => {
                        onRestore(livreur.id);
                        onClose();
                    },
                },
                cancel: {
                    label: "Annuler",
                    onClick: () => {},
                },
                duration: Infinity,
            });
        } else {
            toast(`Êtes-vous sûr de vouloir archiver le livreur ${livreur.prenom} ${livreur.nom} ?`, {
                icon: <Archive className="w-4 h-4 text-amber-500" />,
                action: {
                    label: "Confirmer",
                    onClick: () => {
                        onDelete(livreur.id);
                        onClose();
                    },
                },
                cancel: {
                    label: "Annuler",
                    onClick: () => {},
                },
                duration: Infinity,
            });
        }
    };

    const isArchived = !livreur.est_actif;

    const getEtatBadgeStyle = (etat: string) => {
        switch (etat?.toUpperCase()) {
            case "DISPONIBLE":
                return "bg-emerald-900 text-white";
            case "HORS_LIGNE":
            default:
                return "bg-slate-800 text-slate-100";
        }
    };

    const getEtatDotStyle = (etat: string) => {
        switch (etat?.toUpperCase()) {
            case "DISPONIBLE":
                return "bg-emerald-400";
            case "HORS_LIGNE":
            default:
                return "bg-slate-400";
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xl rounded-3xl p-0 overflow-hidden bg-white shadow-2xl border-0 gap-0">
                
                {/* EN-TÊTE JAUNE DORÉ */}
                <div className="bg-amber-400 p-6 text-slate-900 relative">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block mb-1">
                                Détails du Livreur
                            </span>
                            <div className="flex items-center gap-2">
                                {renderVehicleIcon(livreur.type_vehicule, "w-5 h-5 text-slate-900")}
                                <DialogTitle className="text-xl font-extrabold text-slate-900">
                                    {livreur.prenom} {livreur.nom}
                                </DialogTitle>
                            </div>
                            <p className="text-xs text-slate-800 font-medium mt-1 font-mono">
                                ID : {livreur.id}
                            </p>
                        </div>

                        {/* BADGE DE STATUT DYNAMIQUE */}
                        <span className={`inline-flex flex-shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${getEtatBadgeStyle(livreur.etat_activite)}`}>
                            <span className={`w-2 h-2 rounded-full animate-pulse ${getEtatDotStyle(livreur.etat_activite)}`}></span>
                            {livreur.etat_activite}
                        </span>

                    </div>
                </div>

                {/* CORPS DE LA MODALE */}
                <div className="p-6 space-y-5">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                            <span className="text-xs font-medium text-slate-400 block mb-1">Téléphone</span>
                            <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
                                <Phone className="w-4 h-4 text-emerald-400" />
                                {livreur.telephone}
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                            <span className="text-xs font-medium text-slate-400 block mb-1">Email</span>
                            <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm truncate">
                                <Mail className="w-4 h-4 text-emerald-400" />
                                <span className="truncate" title={livreur.email ? String(livreur.email) : ""}>
                                    {livreur.email ? String(livreur.email) : "Non renseigné"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-medium text-slate-400 block mb-1">Véhicule assigné</span>
                            <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
                                {renderVehicleIcon(livreur.type_vehicule)}
                                {livreur.type_vehicule}
                            </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                            <span className="text-xs font-medium text-slate-400 block ">Immatriculation</span>
                            <span className="font-mono text-xs bg-white border border-slate-200 px-3 py-2 rounded-md text-slate-700 font-bold shadow-sm">
                                {livreur.immatriculation}
                            </span>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-medium text-slate-400 block mb-1">Statut du compte</span>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold ${livreur.est_actif ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'}`}>
                                <span className={`w-1.5 h-1.5 rounded-md ${livreur.est_actif ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                {livreur.est_actif ? 'Actif' : 'Inactif'}
                            </span>
                        </div>
                    </div>

                    {/* FOOTER AVEC BOUTONS D'ACTION */}
                    <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-5 border-t border-slate-100 mt-6">
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={handleEdit}
                                className="rounded-xl bg-emerald-50 text-emerald-950 hover:bg-emerald-100 gap-2 h-10 px-4 text-xs"
                            >
                                <Edit3 className="w-4 h-4" />
                                Modifier
                            </Button>

                            <Button
                                variant="outline"
                                onClick={handleArchiveOrRestore}
                                className={`rounded-xl gap-2 h-10 px-4 text-xs ${
                                    isArchived 
                                        ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50" 
                                        : "border-rose-200 text-rose-600 hover:bg-rose-50"
                                }`}
                            >
                                {isArchived ? <ArchiveRestore className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                                {isArchived ? "Désarchiver" : "Archiver"}
                            </Button>
                        </div>

                        <Button
                            onClick={onClose}
                            variant="secondary"
                            className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 h-10 px-6 shadow-sm text-xs w-full sm:w-auto"
                        >
                            Fermer
                        </Button>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    );
}
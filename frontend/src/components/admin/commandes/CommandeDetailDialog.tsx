"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Package,
    User,
    MapPin,
    Truck,
    Phone,
    Mail,
    FileText,
    DollarSign,
    Clock,
    Check,
} from "lucide-react";
import { CommandeDetails } from "@/types/commande.types";
import { StatutCommande } from "@/types/admin.types";
import { getDisponibles } from "@/services/livreur.service";
import { affecterLivreur } from "@/services/commande.service";
import { toast } from "sonner";
import { Livreur } from "@/types/livreur.types";


interface CommandeDetailsDialogProps {
    commande: CommandeDetails | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCommandeUpdated?: () => void;
}

interface StatutBadgeProps {
    statut: StatutCommande | string;
}

export function StatutBadge({ statut }: StatutBadgeProps) {
    const normalizedStatut = statut
        ?.toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") as StatutCommande;

    switch (normalizedStatut) {
        case "EN_ATTENTE":
            return (
                <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none text-[10px] px-2 py-0.5">
                    En attente
                </Badge>
            );

        case "ASSIGNEE":
            return (
                <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none text-[10px] px-2 py-0.5">
                    Assignée
                </Badge>
            );

        case "EN_COURS_DE_COLLECTE":
            return (
                <Badge className="bg-amber-600 hover:bg-amber-700 text-white border-none text-[10px] px-2 py-0.5">
                    Collecte en cours
                </Badge>
            );

        case "EN_COURS_DE_LIVRAISON":
            return (
                <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-none text-[10px] px-2 py-0.5">
                    Livraison en cours
                </Badge>
            );

        case "LIVREE":
            return (
                <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white border-none text-[10px] px-2 py-0.5">
                    Livrée
                </Badge>
            );

        case "ANNULEE":
            return <Badge variant="destructive" className="text-[10px] px-2 py-0.5">Annulée</Badge>;

        default:
            return <Badge variant="secondary" className="text-[10px] px-2 py-0.5">{statut || "Inconnu"}</Badge>;
    }
}

export function CommandeDetailsDialog({
    commande,
    open,
    onOpenChange,
    onCommandeUpdated,
}: CommandeDetailsDialogProps) {
    const [livreurs, setLivreurs] = useState<Livreur[]>([]);
    const [selectedLivreurId, setSelectedLivreurId] = useState<string>("");
    const [assigning, setAssigning] = useState(false);
    const [assignError, setAssignError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState(false);

    useEffect(() => {
        if (open) {
            setSelectedLivreurId("");
            setAssignError(null);
            setSuccessMessage(false);
            getDisponibles()
                .then((data) => setLivreurs(data))
                .catch(() => setLivreurs([]));
        }
    }, [open]);

    if (!commande) return null;

    const normalizedStatut = commande.statut_commande
        ?.toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const isEnAttente = normalizedStatut === "EN_ATTENTE";

    const handleAssign = async () => {
        if (!selectedLivreurId) return;
        setAssigning(true);
        setAssignError(null);
        setSuccessMessage(false);
        try {
            await affecterLivreur(String(commande.id_commande), { id_livreur: selectedLivreurId });
            
            // Récupérer les informations du livreur pour le message du toast
            const livreurAssigne = livreurs.find(
                (l) => String(l.id || l.id) === selectedLivreurId
            );
            const nomLivreur = livreurAssigne ? `${livreurAssigne.prenom} ${livreurAssigne.nom}` : "le livreur";

            // Déclenchement du toast global
            toast.success("Commande assignée", {
                description: `La commande ${commande.reference} a été assignée à ${nomLivreur}.`,
            });

            setSuccessMessage(true);
            if (onCommandeUpdated) {
                onCommandeUpdated();
            }
            setTimeout(() => {
                onOpenChange(false);
            }, 1500);
        } catch (error: any) {
            setAssignError(error?.response?.data?.detail || "Erreur lors de l'assignation du livreur.");
        } finally {
            setAssigning(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] sm:max-w-lg p-0 overflow-hidden rounded-2xl border border-slate-200 shadow-2xl max-h-[85vh] flex flex-col bg-white">

                {/* En-tête */}
                <div className="bg-emerald-950 text-white p-3.5 sm:p-4 rounded-t-2xl shrink-0">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-semibold tracking-wider text-emerald-300 uppercase">
                            Détails de la commande
                        </span>
                        <StatutBadge statut={commande.statut_commande} />
                    </div>

                    <DialogTitle className="text-xs sm:text-sm font-bold text-white mt-0.5 flex items-center gap-1.5">
                        <Package className="h-4 w-4 text-emerald-400 shrink-0" />
                        {commande.reference}
                    </DialogTitle>

                    {commande.createdAt && (
                        <DialogDescription className="text-emerald-200/80 text-[10px] sm:text-xs flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3 shrink-0" />
                            Créée le {new Date(commande.createdAt).toLocaleString("fr-FR")}
                        </DialogDescription>
                    )}
                </div>

                {/* Corps avec fond opaque et espacements optimisés */}
                <div className="p-3 sm:p-4 overflow-y-auto space-y-3 bg-slate-50/80">

                    {assignError && (
                        <div className="p-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg">
                            {assignError}
                        </div>
                    )}

                    {successMessage && (
                        <div className="flex items-center gap-3 p-3 bg-[#e6fcf5] border border-[#ccfbe8] rounded-2xl shadow-xs">
                            <div className="w-8 h-8 rounded-full border-2 border-emerald-600 flex items-center justify-center shrink-0">
                                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-emerald-950">
                                    Livreur attribué avec succès !
                                </h4>
                                <p className="text-[11px] text-emerald-800/80">
                                    Le livreur a bien été assigné à cette commande.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Section Client & Livreur côte à côte dès le mobile (grid-cols-2) */}
                    <div className="grid grid-cols-2 gap-2">
                        {/* Client */}
                        <div className="border border-slate-200/80 rounded-xl p-2.5 bg-white space-y-1.5 shadow-xs">
                            <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs border-b border-slate-100 pb-1.5">
                                <User className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                Client
                            </div>
                            {commande.client ? (
                                <div className="space-y-1 text-xs">
                                    <p className="font-semibold text-slate-800 truncate">
                                        {commande.client.prenom} {commande.client.nom}
                                    </p>

                                    {commande.telephone_demandeur && (
                                        <p className="text-emerald-950 text-[11px] flex items-center gap-1">
                                            <Phone className="h-3 w-3 shrink-0 text-slate-400" />
                                            {commande.telephone_demandeur}
                                        </p>
                                    )}

                                    {commande.client?.email && (
                                        <Badge variant="default" className="inline-flex mt-1 bg-emerald-100 px-1.5 py-0.5 rounded-md text-emerald-950 font-medium text-[9px] items-center gap-1 max-w-full">
                                            <Mail className="w-2.5 h-2.5 shrink-0" />
                                            <span className="truncate">{commande.client.email}</span>
                                        </Badge>
                                    )}
                                </div>
                            ) : (
                                <p className="text-[11px] text-slate-400 italic">
                                    Indisponible
                                </p>
                            )}
                        </div>

                        {/* Livreur */}
                        <div className="border border-slate-200/80 rounded-xl p-2.5 bg-white space-y-1.5 shadow-xs flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs border-b border-slate-100 pb-1.5">
                                    <Truck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                    Livreur
                                </div>
                                {commande.livreur ? (
                                    <div className="space-y-1 text-xs mt-1.5">
                                        <p className="font-semibold text-slate-800 truncate">
                                            {commande.livreur.prenom} {commande.livreur.nom}
                                        </p>
                                        {commande.livreur.telephone && (
                                            <p className="text-emerald-950 text-[11px] flex items-center gap-1">
                                                <Phone className="h-3 w-3 shrink-0 text-slate-400" />
                                                {commande.livreur.telephone}
                                            </p>
                                        )}
                                        {commande.livreur.immatriculation && (
                                            <Badge variant="default" className="text-[9px] mt-1 bg-emerald-100 px-1.5 py-0.5 rounded-md text-emerald-950 font-semibold truncate block">
                                                {commande.livreur.type_vehicule || "Véhicule"} : {commande.livreur.immatriculation}
                                            </Badge>
                                        )}
                                    </div>
                                ) : (
                                    <div className="mt-2 space-y-2">
                                        <p className="text-[10px] text-amber-600 font-medium italic">
                                            Non assigné
                                        </p>
                                        {isEnAttente && (
                                            
                                                <Select
                                                    value={selectedLivreurId}
                                                    onValueChange={(value) => setSelectedLivreurId(value || "")}
                                                >
                                                    <SelectTrigger className="w-full text-xs h-8 border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                                                        <SelectValue placeholder="Choisir un livreur">
                                                            {selectedLivreurId
                                                                ? (() => {
                                                                      const found = livreurs.find(
                                                                          (l) => String(l.id || l.id) === selectedLivreurId
                                                                      );
                                                                      return found ? (
                                                                          <span className="flex items-center gap-1.5 truncate">
                                                                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                                                                              <span>{found.prenom} {found.nom}</span>
                                                                              {found.telephone && <span className="text-slate-500 font-normal">({found.telephone})</span>}
                                                                          </span>
                                                                      ) : selectedLivreurId;
                                                                  })()
                                                                : "Choisir un livreur"}
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {livreurs.map((l: Livreur) => {
                                                            const id = String(l.id || l.id);
                                                            return (
                                                                <SelectItem key={id} value={id} className="text-xs">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                                                                        <span className="font-medium">{l.prenom} {l.nom}</span>
                                                                        {l.telephone && (
                                                                            <span className="text-slate-500 text-[11px]">({l.telephone})</span>
                                                                        )}
                                                                    </div>
                                                                </SelectItem>
                                                            );
                                                        })}
                                                    </SelectContent>
                                                </Select>
                                            
                                        )}
                                    </div>
                                )}
                            </div>

                            {isEnAttente && !commande.livreur && selectedLivreurId && (
                                <button
                                    onClick={handleAssign}
                                    disabled={assigning}
                                    className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold py-1.5 px-3 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {assigning ? "Assignation..." : "Assigner"}
                                </button>
                            )}
                        </div>
                    </div>

                    <Separator className="my-1 bg-slate-200" />

                    {/* Adresses de livraison */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            Adresses de livraison
                        </h4>

                        <div className="grid grid-cols-2 gap-2">
                            {commande.adresse_ramassage && (
                                <div className="p-2 bg-amber-50 border border-amber-200/60 rounded-lg">
                                    <span className="text-[9px] font-bold text-amber-800 uppercase tracking-wide block">
                                        Ramassage
                                    </span>
                                    <p className="text-[11px] text-slate-700 mt-0.5 font-medium leading-tight">
                                        {commande.adresse_ramassage}
                                    </p>
                                </div>
                            )}

                            <div className="p-2 bg-emerald-50 border border-emerald-200/60 rounded-lg">
                                <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wide block">
                                    Destination
                                </span>
                                <p className="text-[11px] text-slate-700 mt-0.5 font-medium leading-tight">
                                    {commande.adresse_livraison}
                                </p>
                                {commande.nom_destinataire && (
                                    <p className="text-[9px] text-slate-500 mt-0.5 truncate">
                                        {commande.nom_destinataire}
                                        {commande.telephone_destinataire && ` (${commande.telephone_destinataire})`}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Description et Montant */}
                    <div className="grid grid-cols-2 gap-2 items-stretch">
                        <div className="flex flex-col h-full space-y-1">
                            <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1 truncate">
                                <FileText className="h-3 w-3 text-slate-400 shrink-0" /> Description
                            </span>
                            <p className="flex-1 text-[11px] text-slate-800 bg-white p-2 rounded-lg border border-slate-200/80 flex items-center leading-tight">
                                {commande.description || "Aucune description"}
                            </p>
                        </div>

                        <div className="flex flex-col h-full space-y-1">
                            <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1 truncate">
                                <DollarSign className="h-3 w-3 text-slate-400 shrink-0" /> A percevoir
                            </span>
                            <div className="flex-1 bg-emerald-50 text-emerald-950 border border-emerald-200 p-2 rounded-lg text-xs font-extrabold flex items-center">
                                {commande.montant_a_percevoir
                                    ? `${commande.montant_a_percevoir.toLocaleString("fr-FR")} FCFA`
                                    : "Prépayé"}
                            </div>
                        </div>
                    </div>

                    {/* Instructions */}
                    {commande.instructions && (
                        <div className="p-2.5 bg-slate-100 rounded-lg text-[11px] text-slate-600 border border-slate-200">
                            <span className="font-bold text-slate-700">
                                Instructions :{" "}
                            </span>
                            {commande.instructions}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
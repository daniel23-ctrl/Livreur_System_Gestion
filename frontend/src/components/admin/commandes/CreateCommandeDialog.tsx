"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    User,
    MapPin,
    Phone,
    FileText,
    PackagePlus,
    CheckCircle2,
    Truck,
    ArrowRight,
    Banknote,
} from "lucide-react";
import { toast } from "sonner"; // Adapte selon ta bibliothèque de toast (ex: toast de sonner ou react-hot-toast)

import { Livreur } from "@/types/livreur.types";
import { CreateCommandePayload } from "@/types/commande.types";
import { affecterLivreur, createCommande } from "@/services/commande.service";

export interface CreateCommandeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    livreursEnLigne: Livreur[];
    onSuccess?: () => void;
}

export function CreateCommandeDialog({
    open,
    onOpenChange,
    livreursEnLigne = [],
    onSuccess,
}: CreateCommandeDialogProps) {
    const [step, setStep] = useState<"form" | "created">("form");
    const [loading, setLoading] = useState(false);
    const [createdCommandeId, setCreatedCommandeId] = useState<string | null>(null);
    const [selectedLivreurId, setSelectedLivreurId] = useState<string>("");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [formData, setFormData] = useState<CreateCommandePayload>({
        description: "",
        adresse_ramassage: "",
        adresse_livraison: "",
        nom_destinataire: "",
        telephone_destinataire: "",
        telephone_demandeur: "",
        instructions: "",
        montant_a_percevoir: 0,
    });

    const resetForm = () => {
        setErrorMsg(null);
        setStep("form");
        setCreatedCommandeId(null);
        setSelectedLivreurId("");
        setFormData({
            description: "",
            adresse_ramassage: "",
            adresse_livraison: "",
            nom_destinataire: "",
            telephone_destinataire: "",
            telephone_demandeur: "",
            instructions: "",
            montant_a_percevoir: 0,
        });
    };

    const handleDialogClose = (isOpen: boolean) => {
        if (!isOpen) {
            resetForm();
        }
        onOpenChange(isOpen);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);
        try {
            const payload: CreateCommandePayload = {
                ...formData,
                montant_a_percevoir: Number(formData.montant_a_percevoir) || 0,
                instructions: formData.instructions || null,
            };

            const newCommande = await createCommande(payload);

            if (newCommande?.id_commande) {
                setErrorMsg(null);
                setCreatedCommandeId(newCommande.id_commande);
                setStep("created");
                
                // Déclenchement du toast de succès de création
                toast.success("Commande créée avec succès !",
                    {description: "Vous pouvez maintenant assigner un livreur à cette commande."}
                );
                
                // Optionnel : déclencher le rafraîchissement global du parent si nécessaire
                if (onSuccess) onSuccess();
            }
        } catch (error: any) {
            console.error("Erreur de création de commande :", error);
            const message = error.response?.data?.detail || "Une erreur est survenue lors de la création.";
            setErrorMsg(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!createdCommandeId || !selectedLivreurId) return;
        setLoading(true);
        try {
            await affecterLivreur(createdCommandeId, { id_livreur: selectedLivreurId });
            
            // Déclenchement du toast de succès d'assignation
            toast.success("Livreur assigné avec succès à la commande !");
            
            if (onSuccess) onSuccess();
            handleDialogClose(false);
        } catch (error: any) {
            console.error("Erreur lors de l'assignation du livreur :", error);
            const message = error.response?.data?.detail || "Erreur lors de l'assignation du livreur.";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleDialogClose}>
            <DialogContent className="w-[95vw] sm:max-w-lg p-0 overflow-hidden rounded-2xl border border-slate-200 shadow-2xl max-h-[88vh] flex flex-col bg-white">
                
                {/* En-tête */}
                <div className="bg-emerald-950 text-white p-3.5 sm:p-4 rounded-t-2xl shrink-0">
                    <DialogTitle className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                        <PackagePlus className="h-5 w-5 text-amber-400 shrink-0" />
                        {step === "form" ? "Nouvelle commande" : "Commande créée !"}
                    </DialogTitle>
                    <DialogDescription className="text-emerald-200/80 text-[11px] sm:text-xs mt-0.5">
                        {step === "form"
                            ? "Remplissez les détails du colis et de la livraison"
                            : "La commande a été enregistrée avec succès"}
                    </DialogDescription>
                </div>

                {errorMsg && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 mb-2 mt-0 rounded-xl text-xs flex items-center gap-2 mx-4 mt-3">
                        <span className="font-bold">Erreur :</span> {errorMsg}
                    </div>
                )}

                {step === "form" ? (
                    <form
                        onSubmit={handleCreate}
                        className="p-3 sm:p-4 overflow-y-auto space-y-3 bg-slate-50/80 flex-1"
                    >
                        {/* Section Demandeur */}
                        <div className="border border-slate-200/80 rounded-xl p-3 bg-white space-y-2.5 shadow-xs">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 border-b border-slate-100 pb-1">
                                <User className="w-3 h-3 text-emerald-600" /> Informations demandeur
                            </span>

                            <div className="space-y-1">
                                <Label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-slate-400" /> Téléphone du demandeur
                                </Label>
                                <Input
                                    name="telephone_demandeur"
                                    type="tel"
                                    maxLength={8}
                                    placeholder="92345678"
                                    value={formData.telephone_demandeur}
                                    onChange={handleChange}
                                    required
                                    className="h-8 text-xs bg-slate-50/50 border-slate-200"
                                />
                            </div>
                        </div>

                        {/* Section Trajet et Destinataire */}
                        <div className="border border-slate-200/80 rounded-xl p-3 bg-white space-y-2.5 shadow-xs">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 border-b border-slate-100 pb-1">
                                <MapPin className="w-3 h-3 text-emerald-600" /> Trajet et Destinataire
                            </span>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-bold text-emerald-700 truncate">Point A — Ramassage</Label>
                                    <Input
                                        name="adresse_ramassage"
                                        placeholder="Adidogomé, rue 12, Lomé"
                                        value={formData.adresse_ramassage}
                                        onChange={handleChange}
                                        required
                                        className="h-8 text-xs bg-emerald-50/30 border-emerald-200"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-[10px] font-bold text-amber-700 truncate">Point B — Destination</Label>
                                    <Input
                                        name="adresse_livraison"
                                        placeholder="Bè, avenue du Port, Lomé"
                                        value={formData.adresse_livraison}
                                        onChange={handleChange}
                                        required
                                        className="h-8 text-xs bg-amber-50/30 border-amber-200"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <Label className="text-[11px] font-semibold text-slate-700">Nom Destinataire</Label>
                                    <Input
                                        name="nom_destinataire"
                                        placeholder="Kofi Mensah"
                                        value={formData.nom_destinataire}
                                        onChange={handleChange}
                                        required
                                        className="h-8 text-xs bg-slate-50/50 border-slate-200"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-[11px] font-semibold text-slate-700">Tél Destinataire</Label>
                                    <Input
                                        name="telephone_destinataire"
                                        type="tel"
                                        maxLength={8}
                                        placeholder="90123456"
                                        value={formData.telephone_destinataire}
                                        onChange={handleChange}
                                        required
                                        className="h-8 text-xs bg-slate-50/50 border-slate-200"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section Détails du colis & Financier */}
                        <div className="border border-slate-200/80 rounded-xl p-3 bg-white space-y-2.5 shadow-xs">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 border-b border-slate-100 pb-1">
                                <FileText className="w-3 h-3 text-emerald-600" /> Contenu et Règlement
                            </span>

                            <div className="space-y-1">
                                <Label className="text-[11px] font-semibold text-slate-700">Description du colis</Label>
                                <Textarea
                                    name="description"
                                    rows={2}
                                    placeholder="Colis fragile - vêtements"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    className="text-xs bg-slate-50/50 border-slate-200 resize-none min-h-[45px]"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                                    <Banknote className="w-3.5 h-3.5 text-emerald-600" /> Montant à percevoir (FCFA)
                                </Label>
                                <Input
                                    name="montant_a_percevoir"
                                    type="number"
                                    min={0}
                                    placeholder="1500"
                                    value={formData.montant_a_percevoir || ""}
                                    onChange={handleChange}
                                    className="h-8 text-xs bg-slate-50/50 border-slate-200"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2.5 h-auto rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? "Création..." : <>Envoyer ma demande <ArrowRight className="w-4 h-4" /></>}
                        </Button>
                    </form>
                ) : (
                    /* ÉTAPE 2 : ASSIGNATION LIVREUR */
                    <div className="p-4 space-y-4 bg-slate-50/80 flex-1">
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3">
                            <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                            <div>
                                <h4 className="text-xs font-bold text-emerald-950">
                                    Commande enregistrée !
                                </h4>
                                <p className="text-[11px] text-emerald-800">
                                    Voulez-vous lui attribuer immédiatement un livreur ?
                                </p>
                            </div>
                        </div>

                        <div className="border border-slate-200 bg-white rounded-xl p-3 space-y-2 shadow-xs">
                            <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <Truck className="w-4 h-4 text-emerald-600" />
                                Sélectionner un livreur en ligne
                            </Label>

                            <Select
                                value={selectedLivreurId}
                                onValueChange={(val: string | null) => setSelectedLivreurId(val || "")}
                            >
                                <SelectTrigger className="w-full focus-visible:ring-emerald-500 h-9 text-xs bg-slate-50/50 border-slate-200">
                                    <SelectValue placeholder="-- Choisir un livreur connecté --" />
                                </SelectTrigger>
                                <SelectContent className="max-h-48">
                                    {livreursEnLigne.length > 0 ? (
                                        livreursEnLigne.map((livreur) => (
                                            <SelectItem key={livreur.id} value={livreur.id} className="text-xs">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                                                    <span>{livreur.prenom} {livreur.nom}</span>
                                                    {livreur.telephone && (
                                                        <span className="text-slate-400 text-[10px]">({livreur.telephone})</span>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-2 text-xs text-slate-400 text-center italic">
                                            Aucun livreur disponible actuellement
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>

                            <Button
                                onClick={handleAssign}
                                disabled={!selectedLivreurId || loading}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 h-auto rounded-lg shadow-sm mt-2 transition-all"
                            >
                                {loading ? "Assignation..." : "Assigner le livreur"}
                            </Button>
                        </div>

                        <div className="pt-1 text-center">
                            <Button
                                variant="ghost"
                                onClick={() => handleDialogClose(false)}
                                className="text-xs text-slate-500 hover:text-slate-800"
                            >
                                Fermer sans assigner pour l'instant
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
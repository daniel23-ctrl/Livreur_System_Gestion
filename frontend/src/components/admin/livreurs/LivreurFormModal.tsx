"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Livreur, LivreurCreatePayload } from "@/types/livreur.types";
import { updateLivreur, createLivreur } from "@/services/livreur.service";
import { livreurSchema, LivreurFormValues } from "@/lib/validation/livreur.shema";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
    Edit3, 
    UserPlus, 
    Loader2, 
    AlertCircle, 
    User, 
    Phone, 
    Mail, 
    Car, 
    Hash,
    Lock,
    Eye,
    EyeOff
} from "lucide-react";

interface LivreurFormModalProps {
    livreur?: Livreur | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    isCreation?: boolean;
}

export function LivreurFormModal({ 
    livreur = null, 
    isOpen, 
    onClose, 
    onSuccess, 
    isCreation = false 
}: LivreurFormModalProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<LivreurFormValues>({
        resolver: zodResolver(livreurSchema),
        mode: "onBlur", 
        defaultValues: {
            prenom: "",
            nom: "",
            telephone: "",
            email: "",
            mot_de_passe: "",
            confirmation_mot_de_passe: "",
            type_vehicule: undefined,
            immatriculation: "",
        },
    });

    const typeVehiculeValue = watch("type_vehicule");

    useEffect(() => {
        if (isOpen) {
            if (isCreation) {
                reset({
                    prenom: "",
                    nom: "",
                    telephone: "",
                    email: "",
                    mot_de_passe: "",
                    confirmation_mot_de_passe: "",
                    type_vehicule: undefined,
                    immatriculation: "",
                });
            } else if (livreur) {
                reset({
                    prenom: livreur.prenom || "",
                    nom: livreur.nom || "",
                    telephone: livreur.telephone || "",
                    email: livreur.email ? String(livreur.email) : "",
                    mot_de_passe: "",
                    confirmation_mot_de_passe: "",
                    type_vehicule: livreur.type_vehicule || undefined,
                    immatriculation: livreur.immatriculation || "",
                });
            }
        }
    }, [isOpen, livreur, isCreation, reset]);

    if (!isCreation && !livreur) return null;

    const onSubmit = async (data: LivreurFormValues) => {
        try {
            if (isCreation) {
                const payload: LivreurCreatePayload = {
                    nom: data.nom,
                    prenom: data.prenom,
                    telephone: data.telephone,
                    mot_de_passe: data.mot_de_passe || "",
                    email: data.email || undefined,
                    type_vehicule: data.type_vehicule as "MOTO" | "VOITURE",
                    immatriculation: data.immatriculation,
                };

                await createLivreur(payload);
                toast.success("Livreur créé avec succès !");
            } else if (livreur) {
                const updateData = {
                    nom: data.nom,
                    prenom: data.prenom,
                    telephone: data.telephone,
                    mot_de_passe: data.mot_de_passe || undefined,
                    email: data.email || undefined,
                    type_vehicule: data.type_vehicule as "MOTO" | "VOITURE",
                    immatriculation: data.immatriculation,
                };

                await updateLivreur(livreur.id, updateData);
                toast.success("Livreur modifié avec succès !");
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            const errorData = error.response?.data;
            let errorMessage = "";

            if (typeof errorData === "string") {
                errorMessage = errorData;
            } else if (errorData?.message) {
                errorMessage = errorData.message;
            } else if (errorData?.detail) {
                if (Array.isArray(errorData.detail)) {
                    errorMessage = errorData.detail.map((err: any) => `${err.loc?.join(' -> ')}: ${err.msg}`).join(', ');
                } else {
                    errorMessage = errorData.detail;
                }
            } else {
                errorMessage = error.message;
            }

            const defaultTitle = isCreation 
                ? "Erreur lors de la création du livreur" 
                : "Erreur lors de la modification du livreur";

            toast.error(errorMessage ? `${errorMessage}` : defaultTitle);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg rounded-3xl p-0 bg-white shadow-2xl border-0 overflow-hidden">
                <div className="bg-[#0d4732] px-6 pt-6 pb-5 text-white relative">
                    <DialogHeader className="space-y-1 text-left">
                        <span className="text-xs font-semibold tracking-wider text-emerald-200 uppercase">
                            {isCreation ? "NOUVEAU" : "MODIFICATION"}
                        </span>
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-md bg-white/10 text-white backdrop-blur-sm">
                                {isCreation ? <UserPlus className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
                            </div>
                            <DialogTitle className="text-xl font-bold text-white">
                                {isCreation ? "Ajouter un Livreur" : "Modifier le Livreur"}
                            </DialogTitle>
                        </div>
                        {!isCreation && livreur && (
                            <p className="text-xs text-emerald-200 pt-0.5">
                                ID : {livreur.id}
                            </p>
                        )}
                    </DialogHeader>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6 max-h-[75vh] overflow-y-auto">
                    {/* Prénom & Nom */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="prenom" className="text-xs font-semibold text-slate-600">Prénom</Label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                    <User className="w-4 h-4" />
                                </span>
                                <Input
                                    id="prenom"
                                    {...register("prenom")}
                                    className="rounded-md pl-9 pr-3 py-2 text-sm focus-visible:ring-1 focus-visible:ring-[#0d4732] outline-none border-slate-200"
                                    placeholder="Ex: Jean"
                                />
                            </div>
                            {errors.prenom && (
                                <p className="text-[11px] text-red-500 flex items-center gap-1 mt-1">
                                    <AlertCircle className="w-3 h-3" /> {errors.prenom.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="nom" className="text-xs font-semibold text-slate-600">Nom</Label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                    <User className="w-4 h-4" />
                                </span>
                                <Input
                                    id="nom"
                                    {...register("nom")}
                                    className="rounded-md pl-9 pr-3 py-2 text-sm focus-visible:ring-1 focus-visible:ring-[#0d4732] outline-none border-slate-200"
                                    placeholder="Ex: Dupont"
                                />
                            </div>
                            {errors.nom && (
                                <p className="text-[11px] text-red-500 flex items-center gap-1 mt-1">
                                    <AlertCircle className="w-3 h-3" /> {errors.nom.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Téléphone & Email */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="telephone" className="text-xs font-semibold text-slate-600">Téléphone</Label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                    <Phone className="w-4 h-4" />
                                </span>
                                <Input
                                    id="telephone"
                                    {...register("telephone")}
                                    className={`rounded-md pl-9 pr-3 py-2 text-sm focus-visible:ring-1 outline-none border-slate-200 ${
                                        errors.telephone ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-[#0d4732]"
                                    }`}
                                    placeholder="90000000"
                                />
                            </div>
                            {errors.telephone && (
                                <p className="text-[11px] text-red-500 flex items-center gap-1 mt-1">
                                    <AlertCircle className="w-3 h-3" /> {errors.telephone.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs font-semibold text-slate-600">Email</Label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                    <Mail className="w-4 h-4" />
                                </span>
                                <Input
                                    id="email"
                                    type="email"
                                    {...register("email")}
                                    className={`rounded-md pl-9 pr-3 py-2 text-sm focus-visible:ring-1 outline-none border-slate-200 ${
                                        errors.email ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-[#0d4732]"
                                    }`}
                                    placeholder="jean@example.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-[11px] text-red-500 flex items-center gap-1 mt-1">
                                    <AlertCircle className="w-3 h-3" /> {errors.email.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Mot de passe & Confirmation */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="mot_de_passe" className="text-xs font-semibold text-slate-600">
                                Mot de passe {isCreation ? "" : "(laisser vide)"}
                            </Label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                    <Lock className="w-4 h-4" />
                                </span>
                                <Input
                                    id="mot_de_passe"
                                    type={showPassword ? "text" : "password"}
                                    {...register("mot_de_passe")}
                                    className={`rounded-md pl-9 pr-10 py-2 text-sm focus-visible:ring-1 outline-none border-slate-200 ${
                                        errors.mot_de_passe ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-[#0d4732]"
                                    }`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.mot_de_passe && (
                                <p className="text-[11px] text-red-500 flex items-center gap-1 mt-1">
                                    <AlertCircle className="w-3 h-3" /> {errors.mot_de_passe.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="confirmation_mot_de_passe" className="text-xs font-semibold text-slate-600">
                                Confirmer le mot de passe
                            </Label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                    <Lock className="w-4 h-4" />
                                </span>
                                <Input
                                    id="confirmation_mot_de_passe"
                                    type={showConfirmPassword ? "text" : "password"}
                                    {...register("confirmation_mot_de_passe")}
                                    className={`rounded-md pl-9 pr-10 py-2 text-sm focus-visible:ring-1 outline-none border-slate-200 ${
                                        errors.confirmation_mot_de_passe ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-[#0d4732]"
                                    }`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.confirmation_mot_de_passe && (
                                <p className="text-[11px] text-red-500 flex items-center gap-1 mt-1">
                                    <AlertCircle className="w-3 h-3" /> {errors.confirmation_mot_de_passe.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Type de véhicule & Immatriculation */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="type_vehicule" className="text-xs font-semibold text-slate-600">Type de véhicule</Label>
                            <Select
                                value={typeVehiculeValue}
                                onValueChange={
                                    (value) => setValue("type_vehicule", value as "MOTO" | "VOITURE", { shouldDirty: true, shouldValidate: true })
                                }
                            >
                                <SelectTrigger className="rounded-md pl-3 pr-3 py-2 text-sm w-full focus-visible:ring-1 focus-visible:ring-[#0d4732] outline-none border-slate-200">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Car className="w-4 h-4 text-slate-400" />
                                        <SelectValue placeholder="Sélectionner" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="MOTO">MOTO</SelectItem>
                                    <SelectItem value="VOITURE">VOITURE</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.type_vehicule && (
                                <p className="text-[11px] text-red-500 flex items-center gap-1 mt-1">
                                    <AlertCircle className="w-3 h-3" /> {errors.type_vehicule.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="immatriculation" className="text-xs font-semibold text-slate-600">Immatriculation</Label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                    <Hash className="w-4 h-4" />
                                </span>
                                <Input
                                    id="immatriculation"
                                    {...register("immatriculation")}
                                    className="rounded-md pl-9 pr-3 py-2 text-sm focus-visible:ring-1 focus-visible:ring-[#0d4732] outline-none border-slate-200"
                                    placeholder="Ex: AB-123-CD"
                                />
                            </div>
                            {errors.immatriculation && (
                                <p className="text-[11px] text-red-500 flex items-center gap-1 mt-1">
                                    <AlertCircle className="w-3 h-3" /> {errors.immatriculation.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="rounded-xl px-4 py-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || (!isCreation && !isDirty)}
                            className="rounded-xl px-5 py-2 bg-[#0d4732] hover:bg-[#0a3827] text-white gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isCreation ? "Créer" : "Enregistrer"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
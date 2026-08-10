"use client";

import React, { useState } from "react";
import { KeyRound, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger
} from "@/components/ui/dialog";
import { updateAdminProfile } from "@/services/admin.service";
import { toast } from "sonner";

export default function ChangeMotDePasse() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [passwordData, setPasswordData] = useState({
        ancien_mot_de_passe: "",
        nouveau_mot_de_passe: "",
        confirmer_mot_de_passe: "",
    });

    const isFormValid = 
        passwordData.ancien_mot_de_passe.trim() !== "" &&
        passwordData.nouveau_mot_de_passe.trim() !== "" &&
        passwordData.confirmer_mot_de_passe.trim() !== "" &&
        passwordData.nouveau_mot_de_passe === passwordData.confirmer_mot_de_passe;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.nouveau_mot_de_passe !== passwordData.confirmer_mot_de_passe) {
            toast.error("Les nouveaux mots de passe ne correspondent pas.");
            return;
        }

        setLoading(true);
        try {
            await updateAdminProfile({
                ancien_mot_de_passe: passwordData.ancien_mot_de_passe,
                nouveau_mot_de_passe: passwordData.nouveau_mot_de_passe,
            });

            toast.success("Mot de passe modifié avec succès !");
            setIsOpen(false);
            setPasswordData({
                ancien_mot_de_passe: "",
                nouveau_mot_de_passe: "",
                confirmer_mot_de_passe: "",
            });
        } catch (error: any) {
            console.error("Erreur changement mot de passe:", error);
            const errorMsg = error.response?.data?.detail || "Erreur lors de la modification du mot de passe.";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger >
                <Button
                    type="button"
                    className="bg-[#0B3B29] text-white hover:bg-[#0B3B29]/90 gap-2  w-full sm:w-auto"
                >
                    <Lock className="w-4 h-4 text-[#DCA524]" /> Modifier le mot de passe
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md overflow-hidden p-0 bg-white">
                <form onSubmit={handleSubmit}>
                    {/* En-tête coloré en jaune doré avec gestion du fond et du padding */}
                    <div className="bg-[#DCA524] p-6 text-slate-900">
                        <DialogHeader className="space-y-1.5 text-left">
                            <DialogTitle className="flex items-center gap-2 text-slate-900 font-bold">
                                <KeyRound className="w-5 h-5 text-slate-900" /> Changer votre mot de passe
                            </DialogTitle>
                            <DialogDescription className="text-slate-900/90 text-xs text-emrold-900">
                                Saisissez votre actuel mot de passe  puis le nouveau sécurisé.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    {/* Corps du formulaire */}
                    <div className="p-6 space-y-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="ancien" className="text-xs font-semibold text-slate-700">Ancien mot de passe</Label>
                            <Input
                                id="ancien"
                                type="password"
                                required
                                placeholder="••••••••"
                                value={passwordData.ancien_mot_de_passe}
                                onChange={(e) => setPasswordData({ ...passwordData, ancien_mot_de_passe: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="nouveau" className="text-xs font-semibold text-slate-700">Nouveau mot de passe</Label>
                            <Input
                                id="nouveau"
                                type="password"
                                required
                                placeholder="••••••••"
                                value={passwordData.nouveau_mot_de_passe}
                                onChange={(e) => setPasswordData({ ...passwordData, nouveau_mot_de_passe: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="confirmer" className="text-xs font-semibold text-slate-700">Confirmer le nouveau mot de passe</Label>
                            <Input
                                id="confirmer"
                                type="password"
                                required
                                placeholder="••••••••"
                                value={passwordData.confirmer_mot_de_passe}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmer_mot_de_passe: e.target.value })}
                            />
                            {passwordData.confirmer_mot_de_passe && passwordData.nouveau_mot_de_passe !== passwordData.confirmer_mot_de_passe && (
                                <p className="text-[11px] text-red-500 font-medium pt-1">Les mots de passe ne correspondent pas.</p>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="px-6 pb-6 pt-2 gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsOpen(false)}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !isFormValid}
                            className="bg-[#0B3B29] text-white hover:bg-[#0B3B29]/90 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Modification..." : "Mettre à jour le mot de passe"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
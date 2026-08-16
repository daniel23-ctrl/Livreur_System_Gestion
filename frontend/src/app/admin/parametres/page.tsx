"use client";

import React, { useState, useEffect } from "react";
import { Settings, User, Building, Save, ShieldCheck, Pencil, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { updateAdminProfile } from "@/services/admin.service";
import { ClientUpdate } from "@/types/auth.types";
import { toast } from "sonner";
import ChangeMotDePasse from "@/components/admin/parametres/ChangeMotDePasse";
import { useAdmin } from "@/contexts/AdminContext"; 

export default function ParametresSysteme() {
  const { adminProfile, role, chargerDonnees } = useAdmin(); // Utilisation du contexte global

  const [loading, setLoading] = useState(false);

  // États d'édition pour chaque section
  const [isEditingProfil, setIsEditingProfil] = useState(false);
  const [isEditingSysteme, setIsEditingSysteme] = useState(false);

  // État local pour les paramètres personnels synchronisé avec le contexte
  const [profil, setProfil] = useState<ClientUpdate>({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
  });

  // État pour les paramètres système basiques
  const [systeme, setSysteme] = useState({
    nomEntreprise: "KUSI",
    modeMaintenance: false,
  });

  // Met à jour l'état local du profil dès que adminProfile change dans le contexte
  useEffect(() => {
    if (adminProfile) {
      setProfil({
        nom: adminProfile.nom || "",
        prenom: adminProfile.prenom || "",
        email: adminProfile.email || "",
        telephone: adminProfile.telephone || "",
      });
    }
  }, [adminProfile]);

  const handleProfilChange = (field: keyof ClientUpdate, value: string) => {
    setProfil((prev) => ({ ...prev, [field]: value }));
  };

  const handleSystemeChange = (field: string, value: any) => {
    setSysteme((prev) => ({ ...prev, [field]: value }));
  };

  // Enregistrement des modifications du profil
  const handleSaveProfil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);

    try {
      const payload: ClientUpdate = {
        nom: profil.nom,
        prenom: profil.prenom,
        email: profil.email,
        telephone: profil.telephone,
      };

      await updateAdminProfile(payload);
      toast.success("Profil mis à jour avec succès !");
      setIsEditingProfil(false);
      
      // Recharge les données globales pour synchroniser instantanément l'interface
      await chargerDonnees(false);
    } catch (error: any) {
      console.error("Erreur mise à jour profil:", error);
      const errorMsg = error.response?.data?.detail || "Erreur lors de la mise à jour du profil.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Enregistrement spécifique pour les paramètres système
  const handleSaveSysteme = () => {
    if (loading) return;
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsEditingSysteme(false);
      toast.success("Paramètres système mis à jour avec succès !");
    }, 800);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* En-tête principal */}
      <div className="bg-[#0B3B29] text-white px-6 py-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/10 text-[#DCA524]">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-wide uppercase">
              Paramètres
            </h2>
            <p className="text-xs text-white/70 font-medium">
              Gérez votre profil et les configurations de l'application
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Section 1 : Paramètres Personnels */}
        <form onSubmit={handleSaveProfil} className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden p-6 space-y-5 relative">
          <div className="absolute top-6 right-6 flex items-center gap-2 flex-wrap justify-end">
            {isEditingProfil && (
              <Button
                type="submit"
                disabled={loading}
                size="sm"
                className="bg-[#DCA524] text-white hover:bg-[#c4921f] font-semibold gap-1.5 shadow-2xs"
              >
                <Save className="w-3.5 h-3.5" /> {loading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditingProfil(!isEditingProfil)}
              className="gap-1.5 text-slate-700 border-slate-200 hover:bg-slate-50 font-medium shadow-2xs"
            >
              {isEditingProfil ? (
                <>
                  <X className="w-3.5 h-3.5 text-red-500" /> Annuler
                </>
              ) : (
                <>
                  <Pencil className="w-3.5 h-3.5 text-[#0B3B29]" /> Modifier
                </>
              )}
            </Button>
            <ChangeMotDePasse />
          </div>

          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 pr-[380px]">
            <div className="p-2 rounded-lg bg-[#0B3B29]/10 text-[#0B3B29]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Paramètres Personnels</h3>
              <p className="text-xs text-slate-500">Vos informations personnelles et sécurité</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nom" className="text-slate-700 font-medium">Nom</Label>
              <Input
                id="nom"
                value={profil.nom || ""}
                disabled={!isEditingProfil}
                onChange={(e) => handleProfilChange("nom", e.target.value)}
                className={isEditingProfil ? "bg-slate-50/50 border-slate-200 p-2" : "p-2 bg-slate-100 border-slate-200 text-slate-700 cursor-not-allowed"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prenom" className="text-slate-700 font-medium">Prénom</Label>
              <Input
                id="prenom"
                value={profil.prenom || ""}
                disabled={!isEditingProfil}
                onChange={(e) => handleProfilChange("prenom", e.target.value)}
                className={isEditingProfil ? "bg-slate-50/50 border-slate-200 p-2" : "p-2 bg-slate-100 border-slate-200 text-slate-700 cursor-not-allowed"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={profil.email || ""}
                disabled={!isEditingProfil}
                onChange={(e) => handleProfilChange("email", e.target.value)}
                className={isEditingProfil ? "bg-slate-50/50 border-slate-200 p-2" : "p-2 bg-slate-100 border-slate-200 text-slate-700 cursor-not-allowed"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telephone" className="text-slate-700 font-medium">Téléphone</Label>
              <Input
                id="telephone"
                value={profil.telephone || ""}
                disabled={!isEditingProfil}
                onChange={(e) => handleProfilChange("telephone", e.target.value)}
                className={isEditingProfil ? "bg-slate-50/50 border-slate-200 p-2" : "p-2 bg-slate-100 border-slate-200 text-slate-700 cursor-not-allowed"}
              />
            </div>

            <div className="space-y-2 md:col-span-2 pt-2">
              <Label htmlFor="role" className="text-slate-700 font-medium flex items-center gap-1.5 mb-2">
                <ShieldCheck className="w-4 h-4 text-[#0B3B29]" /> Rôle (Non modifiable)
              </Label>
              <Input
                id="role"
                value={role}
                disabled
                className="bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed font-medium uppercase text-xs tracking-wider p-2"
              />
            </div>
          </div>
        </form>

        {/* Section 2 : Paramètres Système */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden p-6 space-y-5 relative">
          <div className="absolute top-6 right-6 flex items-center gap-2">
            {isEditingSysteme && (
              <Button
                type="button"
                onClick={handleSaveSysteme}
                disabled={loading}
                size="sm"
                className="bg-[#DCA524] text-white hover:bg-[#c4921f] font-semibold gap-1.5 shadow-2xs"
              >
                <Save className="w-3.5 h-3.5" /> {loading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditingSysteme(!isEditingSysteme)}
              className="gap-1.5 text-slate-700 border-slate-200 hover:bg-slate-50 font-medium shadow-2xs"
            >
              {isEditingSysteme ? (
                <>
                  <X className="w-3.5 h-3.5 text-red-500" /> Annuler
                </>
              ) : (
                <>
                  <Pencil className="w-3.5 h-3.5 text-[#0B3B29]" /> Modifier
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 pr-36">
            <div className="p-2 rounded-lg bg-[#0B3B29]/10 text-[#0B3B29]">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Paramètres Système</h3>
              <p className="text-xs text-slate-500">Configurations générales de la plateforme</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nomEntreprise" className="text-slate-700 font-medium">Nom de l'application / Structure</Label>
              <Input
                id="nomEntreprise"
                value={systeme.nomEntreprise}
                disabled={!isEditingSysteme}
                onChange={(e) => handleSystemeChange("nomEntreprise", e.target.value)}
                className={isEditingSysteme ? "bg-slate-50/50 border-slate-200 p-2" : "p-2 bg-slate-100 border-slate-200 text-slate-700 cursor-not-allowed"}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/40 border border-amber-100">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold text-amber-900">Mode Maintenance</Label>
                <p className="text-xs text-amber-700/70">Restreint l'accès temporaire de l'application</p>
              </div>
              <Switch
                checked={systeme.modeMaintenance}
                disabled={!isEditingSysteme}
                onCheckedChange={(val) => handleSystemeChange("modeMaintenance", val)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
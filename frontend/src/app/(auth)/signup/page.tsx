"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { inscriptionSchema, InscriptionFormData } from "@/lib/validation/auth.schema";
import { inscrireClient } from "@/services/auth.service";
import { AxiosError } from "axios";

export default function InscriptionPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InscriptionFormData>({
    resolver: zodResolver(inscriptionSchema),
    defaultValues: {
      prenom: "",
      nom: "",
      email: "",
      telephone: "",
      motDePasse: "",
      confirmer: "",
    },
  });

  const inputClass =
    "h-11 pl-10 bg-[#FAFAFA] border-[#E5E7EB] focus:border-[#C49A1A] focus-visible:ring-2 focus-visible:ring-[#C49A1A]/30 text-[#1A1A1A] placeholder:text-[#9CA3AF]";

  async function onSubmit(data: InscriptionFormData) {
    setServerError("");
    try {
      await inscrireClient({
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        telephone: data.telephone || undefined,
        mot_de_passe: data.motDePasse,
      });
      router.push("/auth/login?inscrit=1");
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail: string }>;
      setServerError(axiosErr.response?.data?.detail || "Une erreur est survenue.");
    }
  }

  return (
    <div className="w-full bg-white/95 backdrop-blur-md rounded-2xl border border-white/20 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1A1A1A]">Créer un compte</h2>
        <p className="text-sm mt-1 text-[#6B7280]">Rejoignez la plateforme KUSI.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Prénom + Nom */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="prenom" className="text-sm font-medium text-[#374151]">Prénom</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <Input id="prenom" placeholder="Amavi" {...register("prenom")} className={`${inputClass} ${errors.prenom ? "border-red-400 focus:border-red-500" : ""}`} />
            </div>
            {errors.prenom && <p className="text-xs text-red-500 font-medium">{errors.prenom.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nom" className="text-sm font-medium text-[#374151]">Nom</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <Input id="nom" placeholder="Kodjo" {...register("nom")} className={`${inputClass} ${errors.nom ? "border-red-400 focus:border-red-500" : ""}`} />
            </div>
            {errors.nom && <p className="text-xs text-red-500 font-medium">{errors.nom.message}</p>}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-[#374151]">Adresse email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <Input id="email" type="email" placeholder="amavi@exemple.com" {...register("email")} className={`${inputClass} ${errors.email ? "border-red-400 focus:border-red-500" : ""}`} />
          </div>
          {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>}
        </div>

        {/* Téléphone */}
        <div className="space-y-1.5">
          <Label htmlFor="telephone" className="text-sm font-medium text-[#374151]">
            Téléphone (8 chiffres) <span className="text-[#9CA3AF] font-normal">(optionnel)</span>
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <Input id="telephone" type="tel" maxLength={8} placeholder="90123456" {...register("telephone")} className={`${inputClass} ${errors.telephone ? "border-red-400 focus:border-red-500" : ""}`} />
          </div>
          {errors.telephone && <p className="text-xs text-red-500 font-medium">{errors.telephone.message}</p>}
        </div>

        {/* Mot de passe */}
        <div className="space-y-1.5">
          <Label htmlFor="motDePasse" className="text-sm font-medium text-[#374151]">Mot de passe</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <Input id="motDePasse" type={showPassword ? "text" : "password"} placeholder="••••••••" {...register("motDePasse")} className={`${inputClass} pr-10 ${errors.motDePasse ? "border-red-400 focus:border-red-500" : ""}`} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151]">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.motDePasse && <p className="text-xs text-red-500 font-medium">{errors.motDePasse.message}</p>}
        </div>

        {/* Confirmer le mot de passe */}
        <div className="space-y-1.5">
          <Label htmlFor="confirmer" className="text-sm font-medium text-[#374151]">Confirmer le mot de passe</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <Input id="confirmer" type={showConfirm ? "text" : "password"} placeholder="••••••••" {...register("confirmer")} className={`${inputClass} pr-10 ${errors.confirmer ? "border-red-400 focus:border-red-500" : ""}`} />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151]">
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmer && <p className="text-xs text-red-500 font-medium">{errors.confirmer.message}</p>}
        </div>

        {/* Erreur Serveur */}
        {serverError && (
          <div className="text-sm px-4 py-3 rounded-lg bg-red-50 text-red-600 border border-red-200">{serverError}</div>
        )}

        {/* Bouton Submit */}
        <Button type="submit" disabled={isSubmitting} className="w-full h-11 rounded-xl text-sm font-semibold text-white border-0 shadow-md transition-all mt-2" style={{ backgroundColor: isSubmitting ? "#D4AB30" : "#C49A1A" }}>
          {isSubmitting ? "Création en cours..." : "Créer mon compte"}
        </Button>
      </form>

      <p className="text-center text-sm mt-6 text-[#6B7280]">
        Déjà un compte ?{" "}
        <Link href="/auth/login" className="font-semibold hover:underline" style={{ color: "#1A4731" }}>
          Se connecter
        </Link>
      </p>
    </div>
  );
}
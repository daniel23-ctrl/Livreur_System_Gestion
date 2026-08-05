"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, LoginFormData } from "@/lib/validation/auth.schema";
import { login } from "@/services/auth.service";
import { AxiosError } from "axios";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifiant: "",
      motDePasse: "",
    },
  });

  const inputClass =
    "h-11 pl-10 bg-[#FAFAFA] border-[#E5E7EB] focus:border-[#C49A1A] focus-visible:ring-2 focus-visible:ring-[#C49A1A]/30 text-[#1A1A1A] placeholder:text-[#9CA3AF]";

  async function onSubmit(data: LoginFormData) {
  setServerError("");
  try {
    const res = await login({
      identifiant: data.identifiant,
      mot_de_passe: data.motDePasse,
    });

    // Redirection dynamique selon le rôle retourné par l'API
    switch (res?.role) {
      case "ADMINISTRATEUR":
        router.push("/admin/dashboard");
        break;
      case "LIVREUR":
        router.push("/livreur");
        break;
      case "CLIENT":
        router.push("/client"); 
        break;
      default:
        // En cas de rôle non reconnu ou par défaut
        router.push("/admin/dashboard");
        break;
    }
  } catch (err) {
    const axiosErr = err as AxiosError<{ detail: string }>;
    setServerError(axiosErr.response?.data?.detail || "Identifiants incorrects.");
  }
}

  return (
    <div className="w-full bg-white/95 backdrop-blur-md rounded-2xl border border-white/20 p-6 sm:p-8 shadow-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1A1A1A]">Connexion</h2>
        <p className="text-sm mt-1 text-[#6B7280]">Accédez à votre espace KUSI.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email ou Téléphone */}
        <div className="space-y-1.5">
          <Label htmlFor="identifiant" className="text-sm font-medium text-[#374151]">
            Email ou Téléphone
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <Input
              id="identifiant"
              placeholder="email@exemple.com ou 90123456"
              {...register("identifiant")}
              className={`${inputClass} ${errors.identifiant ? "border-red-400 focus:border-red-500 focus-visible:ring-red-200" : ""}`}
            />
          </div>
          {errors.identifiant && (
            <p className="text-xs text-red-500 font-medium">{errors.identifiant.message}</p>
          )}
        </div>

        {/* Mot de passe */}
        <div className="space-y-1.5">
          <Label htmlFor="motDePasse" className="text-sm font-medium text-[#374151]">
            Mot de passe
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <Input
              id="motDePasse"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("motDePasse")}
              className={`${inputClass} pr-10 ${errors.motDePasse ? "border-red-400 focus:border-red-500 focus-visible:ring-red-200" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151]"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.motDePasse && (
            <p className="text-xs text-red-500 font-medium">{errors.motDePasse.message}</p>
          )}
        </div>

        {/* Erreur Serveur (Backend) */}
        {serverError && (
          <div className="text-sm px-4 py-3 rounded-lg bg-red-50 text-red-600 border border-red-200">
            {serverError}
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 rounded-xl text-sm font-semibold text-white border-0 shadow-md transition-all mt-2"
          style={{ backgroundColor: isSubmitting ? "#D4AB30" : "#C49A1A" }}
        >
          {isSubmitting ? "Connexion..." : "Se connecter"}
        </Button>
      </form>

      <p className="text-center text-sm mt-6 text-[#6B7280]">
        Pas encore de compte ?{" "}
        <Link href="/auth/signup" className="font-semibold hover:underline" style={{ color: "#1A4731" }}>
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
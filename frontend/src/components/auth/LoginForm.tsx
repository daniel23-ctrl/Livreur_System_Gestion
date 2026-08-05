"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Bike, UserCircle, Eye, EyeOff, Lock, Mail } from "lucide-react";

import { Role } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ROLES: { id: Role; label: string; icon: React.ElementType; placeholder: string }[] = [
  { id: "admin", label: "Admin", icon: Shield, placeholder: "admin@kauza.tg" },
  { id: "livreur", label: "Livreur", icon: Bike, placeholder: "livreur@kauza.tg" },
  { id: "client", label: "Client", icon: UserCircle, placeholder: "client@gmail.com" },
];

export function LoginForm() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const activeRoleConfig = ROLES.find((r) => r.id === role)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulation de connexion avant l'intégration FastAPI
    setTimeout(() => {
      setLoading(false);
      if (role === "admin") router.push("/admin");
      else if (role === "livreur") router.push("/livreur");
      else router.push("/client");
    }, 1000);
  };

  return (
    <Card className="w-full max-w-md shadow-lg border-slate-200/80 bg-white">
      <CardHeader className="space-y-2 text-center pb-6">
        <div className="mx-auto w-12 h-12 rounded-full bg-[#1A4731]/10 flex items-center justify-center mb-1">
          <span className="text-xl font-black text-[#1A4731]">K</span>
        </div>
        <CardTitle className="text-2xl font-bold text-[#1A4731]">
          Connexion KAUZA
        </CardTitle>
        <CardDescription className="text-slate-500 text-sm">
          Choisissez votre rôle et identifiez-vous pour accéder à votre espace
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Sélecteur de Rôles en Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-[#F4F7F5] rounded-xl mb-6">
          {ROLES.map((r) => {
            const Icon = r.icon;
            const isSelected = role === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  isSelected
                    ? "bg-white text-[#1A4731] shadow-sm font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isSelected ? "text-[#C9A227]" : "text-slate-400"
                  }`}
                />
                {r.label}
              </button>
            );
          })}
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Champ Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-medium text-slate-700">
              Adresse Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                required
                placeholder={activeRoleConfig.placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 bg-[#F4F7F5]/50 border-slate-200 focus:border-[#1A4731] focus:ring-[#1A4731]/20"
              />
            </div>
          </div>

          {/* Champ Mot de passe */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-medium text-slate-700">
                Mot de passe
              </Label>
              <a
                href="#"
                className="text-xs font-medium text-[#1A4731] hover:underline"
              >
                Oublié ?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 pr-10 bg-[#F4F7F5]/50 border-slate-200 focus:border-[#1A4731] focus:ring-[#1A4731]/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Bouton de soumission */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1A4731] hover:bg-[#1A4731]/90 text-white font-semibold py-5 rounded-lg shadow transition-colors mt-2"
          >
            {loading ? "Connexion en cours..." : `Se connecter en tant qu'${activeRoleConfig.label}`}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-slate-100 pt-4 pb-6">
        <p className="text-xs text-slate-500">
          Pas encore de compte ?{" "}
          <a href="/signup" className="font-semibold text-[#1A4731] hover:underline">
            Créer un compte
          </a>
        </p>
      </CardFooter>
    </Card>
  );
}
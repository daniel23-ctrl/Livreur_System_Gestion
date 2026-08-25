import { z } from "zod";

// Regex pour vérifier un numéro à 8 chiffres (Togo)
const phoneRegex = /^(9[0-9]|7[0-9]|2[2-7])[0-9]{6}$/;

// Regex simple pour valider un email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


export const loginSchema = z.object({
  identifiant: z
    .string()
    .min(1, "L'identifiant est requis")
    .refine(
      (val) => emailRegex.test(val) || phoneRegex.test(val),
      "Entrez une adresse email valide ou un numéro à 8 chiffres"
    ),
  motDePasse: z
    .string()
    .min(1, "Le mot de passe est requis"),
});

export type LoginFormData = z.infer<typeof loginSchema>;


export const inscriptionSchema = z
  .object({
    prenom: z.string().min(3, "Le prénom doit contenir au moins 3 caractères"),
    nom: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
    email: z.string().email("Email invalide").optional().or(z.literal("")),
    telephone: z
      .string()
      .min(1, "Le téléphone est requis")
      .regex(phoneRegex, "Numéro togolais invalide (doit commencer par 9, 7 ou 2, et contenir 8 chiffres)"),
    motDePasse: z
      .string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    confirmer: z
      .string()
      .min(1, "Veuillez confirmer le mot de passe"),
  })
  .refine((data) => data.motDePasse === data.confirmer, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmer"], // L'erreur sera attachée au champ 'confirmer'
  });

export type InscriptionFormData = z.infer<typeof inscriptionSchema>;
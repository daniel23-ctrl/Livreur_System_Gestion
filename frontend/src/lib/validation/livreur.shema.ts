import { z } from "zod";

const phoneRegex = /^(9[0-9]|7[0-9]|2[2-7])[0-9]{6}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function livreurSchema(isCreation: boolean) {
    return z
        .object({
            prenom: z
                .string()
                .min(1, "Le prénom est requis")
                .min(3, "Le prénom doit contenir au moins 3 caractères"),

            nom: z
                .string()
                .min(1, "Le nom est requis")
                .min(3, "Le nom doit contenir au moins 3 caractères"),

            telephone: z
                .string()
                .min(1, "Le téléphone est requis")
                .regex(phoneRegex, "Un numéro togolais  commence par 9, 7 ou 2, et contient 8 chiffres"),

            email: z
                .string()
                .optional()
                .refine(
                    (val) => !val || emailRegex.test(val),
                    "Adresse email invalide"
                ),

            mot_de_passe: isCreation
                ? z
                    .string()
                    .min(1, "Le mot de passe est requis")
                    .min(6, "Le mot de passe doit contenir au moins 6 caractères")
                : z
                    .string()
                    .optional()
                    .refine(
                        (val) => !val || val.length >= 6,
                        "Le mot de passe doit contenir au moins 6 caractères"
                    ),

            confirmation_mot_de_passe: z.string().optional(),

            type_vehicule: z.enum(["MOTO", "VOITURE"], {
                message: "Le type de véhicule est requis",
            }),

            immatriculation: z
                .string()
                .min(1, "L'immatriculation est requise"),
        })
        .superRefine((data, ctx) => {
            if (isCreation) {
                if (!data.confirmation_mot_de_passe) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "La confirmation du mot de passe est requise",
                        path: ["confirmation_mot_de_passe"],
                    });
                } else if (data.mot_de_passe !== data.confirmation_mot_de_passe) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Les mots de passe ne correspondent pas",
                        path: ["confirmation_mot_de_passe"],
                    });
                }
            } else {
                if (data.mot_de_passe && data.mot_de_passe !== data.confirmation_mot_de_passe) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Les mots de passe ne correspondent pas",
                        path: ["confirmation_mot_de_passe"],
                    });
                }
            }
        });
}

export type LivreurFormValues = z.infer<ReturnType<typeof livreurSchema>>;
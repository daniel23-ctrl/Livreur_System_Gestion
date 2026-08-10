import * as z from "zod";

export const livreurSchema = z.object({
    prenom: z.string().min(1, "Le prénom est requis"),
    nom: z.string().min(1, "Le nom est requis"),
    telephone: z.string().min(1, "Le téléphone est requis"),
    email: z.string().email("Email invalide").optional().or(z.literal("")),
    mot_de_passe: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères").optional().or(z.literal("")),
    confirmation_mot_de_passe: z.string().optional().or(z.literal("")),
    type_vehicule: z.enum(["MOTO", "VOITURE"] as const).refine((val) => !!val, {
        message: "Le type de véhicule est requis",
    }),
    immatriculation: z.string().min(1, "L'immatriculation est requise"),
}).refine((data) => {
    // Si un mot de passe est renseigné, la confirmation doit correspondre
    if (data.mot_de_passe && data.mot_de_passe !== data.confirmation_mot_de_passe) {
        return false;
    }
    return true;
}, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmation_mot_de_passe"],
});

export type LivreurFormValues = z.infer<typeof livreurSchema>;
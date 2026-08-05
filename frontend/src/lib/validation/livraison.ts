import { z } from "zod";

const phoneRegex = /^[0-9]{8}$/;

export const livraisonSchema = z.object({
  prenom: z.string().min(2, "Le prénom est requis"),
  nom: z.string().min(2, "Le nom est requis"),
  telephone: z.string().regex(phoneRegex, "Le téléphone doit contenir 8 chiffres"),
  pointA: z.string().min(3, "L'adresse de ramassage est requise"),
  pointB: z.string().min(3, "L'adresse de destination est requise"),
  description: z.string().min(3, "Veuillez décrire brièvement le colis"),
  telephoneDestinataire: z
    .string()
    .regex(phoneRegex, "Le téléphone du destinataire doit contenir 8 chiffres"),
});

export type LivraisonFormData = z.infer<typeof livraisonSchema>;
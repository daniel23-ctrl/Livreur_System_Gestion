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


const tgPhoneRegex = /^(?:2[2-5]|7[019]|9[0-36-9])\d{6}$/;
// Regex pour s'assurer qu'il y a uniquement des chiffres (pas de lettres, pas de points, pas de signes négatifs)
const integerOnlyRegex = /^\d+$/;

export const deliverySchema = z.object({
  point_a: z.string().min(3, "L'adresse de ramassage est requise"),
  point_b: z.string().min(3, "L'adresse de destination est requise"),
  nom_destinataire: z.string().min(2, "Le nom du destinataire est requis"),
  
  telephone_demandeur: z
    .string()
    .regex(tgPhoneRegex, "Numéro togolais invalide (ex: 90XXXXXX)"),
    
  telephone_destinataire: z
    .string()
    .regex(tgPhoneRegex, "Numéro togolais invalide (ex: 90XXXXXX)"),
    
  // On valide que ce sont uniquement des chiffres, puis on convertit en nombre entier pour la BDD
  montant_a_percevoir: z
    .string()
    .min(1, "Le montant est requis")
    .regex(integerOnlyRegex, "Le montant doit être un nombre entier valide (pas de lettres ni de symboles)")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 0, "Le montant ne peut pas être négatif"),

  description: z.string().min(3, "La description du colis est requise"),
  instructions: z.string().optional(),
})
.refine((data) => data.point_a.trim().toLowerCase() !== data.point_b.trim().toLowerCase(), {
  message: "Les adresses ne peuvent pas être identiques.",
  path: ["point_b"],
})
.refine((data) => data.telephone_demandeur !== data.telephone_destinataire, {
  message: "Les téléphones ne peuvent pas être identiques.",
  path: ["telephone_destinataire"],
});

export type DeliveryFormData = z.infer<typeof deliverySchema>;
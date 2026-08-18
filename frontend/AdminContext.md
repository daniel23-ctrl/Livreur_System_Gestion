# Résumé des Modifications : Intégration de la conversion d'adresses dans le `AdminContext`

## 1. Contexte et Problématique
Dans notre application de gestion de livraison, les commandes stockent souvent des coordonnées géographiques brutes (latitude et longitude) pour les adresses de ramassage et de livraison. 
Puisque les différentes pages de l'interface administrateur lisent les données directement depuis le **`AdminContext`**, la conversion de ces coordonnées en adresses textuelles lisibles (`quartier, rue, ville`) devait se faire directement au niveau central du contexte.

---

## 2. Solutions Apportées

### A. Utilisation de l'utilitaire de géocodage inversé (`getReadableAddress`)
Nous avons réutilisé l'utilitaire basé sur l'API publique OpenStreetMap (Nominatim), qui gère :
* Le formatage des coordonnées (permutation de la latitude et de la longitude selon les spécificités locales, par exemple au Togo).
* Un système de **mise en cache (`addressCache`)** pour éviter les requêtes réseau superflues et répétitives.
* Une gestion des délais d'attente (`AbortController`) pour ne pas bloquer l'application en cas de lenteur réseau.

### B. Mise à jour du `AdminProvider`
Dans la fonction de chargement globale (`chargerDonnees`), les commandes brutes récupérées depuis l'API sont maintenant enrichies de manière asynchrone avant d'être injectées dans le state React.

---

## 3. Extrait du Code Modifié (`AdminContext.tsx`)

Voici comment les adresses sont interceptées et transformées à la volée lors de la récupération des données ou des mises à jour par WebSockets :

```tsx
// 1. Importation de l'utilitaire d'adresse
import { getReadableAddress } from "@/utils/addresse";

// ... à l'intérieur de AdminProvider :

const chargerDonnees = useCallback(async (showLoader = false) => {
  try {
    if (showLoader) setLoading(true);

    // Récupération des données brutes (Commandes, Livreurs, etc.)
    const [cmdRes, actifsRes, inactifsRes, connectesRes, adminData] = await Promise.all([
      axiosInstance.get(API.commandes.all),
      getActifs(),
      getInactifs(),
      getConnectes(),
      adminId ? getAdminById(adminId).catch(() => null) : Promise.resolve(null),
    ]);

    const rawCommandes: Commande[] = cmdRes.data;

    // 2. Transformation asynchrone des adresses de ramassage et de livraison
    const commandesAvecAdressesLisibles = await Promise.all(
      rawCommandes.map(async (cmd) => {
        const adresseRamassageLisible = cmd.adresse_ramassage 
          ? await getReadableAddress(cmd.adresse_ramassage) 
          : cmd.adresse_ramassage;

        const adresseLivraisonLisible = cmd.adresse_livraison 
          ? await getReadableAddress(cmd.adresse_livraison) 
          : cmd.adresse_livraison;

        return {
          ...cmd,
          adresse_ramassage: adresseRamassageLisible,
          adresse_livraison: adresseLivraisonLisible,
        };
      })
    );

    // 3. Mise à jour du state global
    setCommandes(commandesAvecAdressesLisibles);
    // ... mise à jour des autres states (livreurs, profil, etc.)

  } catch (error) {
    console.error("Erreur lors de la synchronisation globale :", error);
  } finally {
    if (showLoader) setLoading(false);
  }
}, []);
---

## 5. Impact sur les Pages de l'Application

Puisque les pages de l'interface administrateur (comme le tableau de bord, la liste des commandes ou les détails d'une commande) récupèrent les données directement via le hook `useAdmin()`, **aucune modification de code n'est nécessaire dans les pages elles-mêmes**.

### Fonctionnement côté Composant (Exemple)

Lorsqu'une page affiche les adresses d'une commande :

```tsx
// Exemple dans un composant de tableau de bord ou de liste
import { useAdmin } from "@/context/AdminContext";

export function ListeCommandes() {
  const { commandes } = useAdmin();

  return (
    <ul>
      {commandes.map((cmd) => (
        <li key={cmd.id_commande}>
          {/* Affiche directement l'adresse lisible (ex: "Quartier Adidogomé, Lomé") */}
          <p>Ramassage : {cmd.adresse_ramassage}</p>
          <p>Livraison : {cmd.adresse_livraison}</p>
        </li>
      ))}
    </ul>
  );
}
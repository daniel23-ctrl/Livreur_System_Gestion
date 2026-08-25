const API = {
  auth: {
    login: "/api/auth/login",
    inscription: "/api/auth/inscription",
    inscriptionLivreur: "/api/livreurs",
    logout: "/api/auth/logout",
    verifierOtp: "/api/auth/verifier-otp",
    renvoyerOtp: (utilisateurId: string) => `/api/auth/renvoyer-otp/${utilisateurId}`,
  },
  admin: {
    base: "/api/admins",
    recuperer: (id: string) => `/api/admins/${id}`,
    modifierMe: "/api/admins/me",
  },
  livreurs: {
    base: "/api/livreurs",
    disponibles: "/api/livreurs/disponibles",
    actifs: "/api/livreurs/actifs",
    connectes: "/api/livreurs/connectes",
    inactifs: "/api/livreurs/inactifs",
    moi: "/api/livreurs/moi",
    modifierMonProfil: "/api/livreurs/moi", // <--- Route dédiée pour le livreur connecté
    changerMotDePasse: "/api/livreurs/moi/mot-de-passe", // <--- Route dédiée pour le mot de passe
    modifier: (id: string) => `/api/livreurs/${id}`,
    detail: (id: string) => `/api/livreurs/${id}`,
    supprimer: (id: string) => `/api/livreurs/${id}`,
    etat: (id: string) => `/api/livreurs/${id}/etat`,
    restaurer: (id: string) => `/api/livreurs/${id}/restore`,
  },
  commandes: {
    base: "/api/commandes",
    all: "/api/commandes/all",
    mesCommandes: "/api/commandes",
    livreur: `/api/commandes/livreur`,
    detail: (id: string) => `/api/commandes/${id}`,
    parReference: (ref: string) => `/api/commandes/reference/${ref}`,
    statut: (id: string) => `/api/commandes/${id}/statut`,
    affecter: (id_commande: string) => `/api/commandes/${id_commande}/livreur`,
    suiviPublic: (ref: string) => `/api/commandes/suivi/${ref}`,
  },
  notifications: {
  all: "/api/notifications",
  parCommande: (idCommande: string) => `/api/notifications/${idCommande}`,
  mesNotificationsLivreur: "/api/notifications/livreur/mes-notifications",
  mesNotificationsClient: "/api/notifications/client/mes-notifications",
},
} as const;

export default API;
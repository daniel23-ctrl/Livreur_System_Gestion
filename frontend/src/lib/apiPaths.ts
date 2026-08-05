const API = {
  auth: {
    login: "/api/auth/login",
    inscription: "/api/auth/inscription",
    inscriptionLivreur: "/api/livreurs",
    logout: "/api/auth/logout",
  },
  livreurs: {
    base: "/api/livreurs",
    disponibles: "/api/livreurs/disponibles",
    actifs : "/api/livreurs/actifs",
    moi: "/api/livreurs/moi",
    detail: (id: string) => `/api/livreurs/${id}`,
    etat: (id: string) => `/api/livreurs/${id}/etat`,
  },
  commandes: {
    base: "/api/commandes",
    all: "/api/commandes/all",
    mesCommandes: "/api/commandes",
    detail: (id: string) => `/api/commandes/${id}`,
    parReference: (ref: string) => `/api/commandes/reference/${ref}`,
    statut: (id: string) => `/api/commandes/${id}/statut`,
    affecter: (id_commande: string) => `/api/commandes/${id_commande}/livreur`,
    suiviPublic: (ref: string) => `/api/commandes/suivi/${ref}`,
  },
  notifications: {
    base: "/api/notifications",
    parCommande: (id: string) => `/api/notifications/${id}`,
  },
} as const;

export default API;
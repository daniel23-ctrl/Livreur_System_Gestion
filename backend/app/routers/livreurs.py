from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db

from app.schemas.livreur import (
    LivreurCreate,
    LivreurResponse,
    LivreurUpdate,
    LivreurEtatUpdate,
    LivreurProfilUpdate,
)

from app.services.livreur_service import (
    creer_livreur,
    lister_livreurs,
    lister_livreurs_actifs,
    lister_livreurs_inactifs,
    retaurer_livreur,
    trouver_livreur,
    archiver_livreur,
    modifier_livreur,
    changer_etat_livreur,
    modifier_mon_profil,
    lister_livreurs_disponibles,
    trouver_livreur_par_id
)

from app.dependencies import require_admin, require_livreur 
from app.models.utilisateur import Utilisateur

router = APIRouter(prefix="/api/livreurs", tags=["Livreurs"])

@router.post("/", response_model=LivreurResponse)
async def nouveau_livreur(data: LivreurCreate, db: AsyncSession = Depends(get_db), current_user: Utilisateur = Depends(require_admin)):
    """Crée un nouveau livreur — Admin uniquement"""
    return await creer_livreur(db, data)
    
@router.get("/moi", response_model=LivreurResponse)
async def mon_profil_livreur(
    db: AsyncSession = Depends(get_db), 
    current_user: Utilisateur = Depends(require_livreur)
):
    """Récupérer le profil du livreur connecté via le service"""
    # Appel propre du service sans logique lourde dans la route
    return await trouver_livreur(db, current_user.id)

@router.get("/disponibles", response_model=list[LivreurResponse])
async def liste_livreurs_disponibles(db: AsyncSession = Depends(get_db), current_user: Utilisateur = Depends(require_admin)):
    """Liste tous les livreurs disponibles pour l'assignation — Admin uniquement"""
    return await lister_livreurs_disponibles(db)

@router.get("/actifs", response_model=list[LivreurResponse])
async def liste_livreurs_actifs(db: AsyncSession = Depends(get_db), current_user: Utilisateur = Depends(require_admin)):
    """Liste tous les livreurs actifs , Admin uniquement"""
    return await lister_livreurs_actifs(db)

@router.get("/inactifs", response_model=list[LivreurResponse])
async def liste_livreurs_inactifs(db: AsyncSession = Depends(get_db), current_user: Utilisateur = Depends(require_admin)):
    """Liste tous les livreurs inactifs , Admin uniquement"""
    return await lister_livreurs_inactifs(db)

@router.get("/", response_model=list[LivreurResponse])
async def liste_livreurs(db: AsyncSession = Depends(get_db), current_user: Utilisateur = Depends(require_admin)):
    """Liste tous les livreurs , Admin uniquement"""
    return await lister_livreurs(db)

@router.get("/{id}", response_model=LivreurResponse)
async def detail_livreur(id: str, db: AsyncSession = Depends(get_db), current_user: Utilisateur = Depends(require_admin)):
    """Détail d'un livreur — Admin uniquement"""
    livreur = await trouver_livreur_par_id(db, id)
    if not livreur:
        raise HTTPException(status_code=404, detail="Livreur non trouvé")
    return livreur

@router.put("/{id}", response_model=LivreurResponse)
async def update_livreur(id: str, data: LivreurUpdate, db: AsyncSession = Depends(get_db), current_user: Utilisateur = Depends(require_admin)):
    """Modifier un livreur — Admin uniquement"""
    livreur = await modifier_livreur(db, id, data)
    if not livreur:
        raise HTTPException(status_code=404, detail="Livreur non trouvé")
    return livreur

@router.patch("/{id}/etat", response_model=LivreurResponse)
async def update_etat_livreur(id: str, data: LivreurEtatUpdate, db: AsyncSession = Depends(get_db), current_user: Utilisateur = Depends(require_admin)):
    """Changer l'état d'un livreur — Admin uniquement"""
    livreur = await changer_etat_livreur(db, id, data.etat_activite)
    if not livreur:
        raise HTTPException(status_code=404, detail="Livreur non trouvé")
    return livreur

@router.patch("/{id}/restore", response_model=LivreurResponse)
async def restaurer_livreur(
    id: str, 
    db: AsyncSession = Depends(get_db), 
    current_user: Utilisateur = Depends(require_admin)
):
    """Restaurer un livreur archivé — Admin uniquement"""
    livreur = await retaurer_livreur(db, id)
    if not livreur:
        raise HTTPException(status_code=404, detail="Livreur non trouvé")
    return livreur

@router.patch("/moi", response_model=LivreurResponse)
async def update_mon_profil(data: LivreurProfilUpdate, db: AsyncSession = Depends(get_db), current_user: Utilisateur = Depends(require_livreur)):
    """Le livreur modifie son propre profil"""
    livreur = await modifier_mon_profil(db, current_user.id, data)
    if not livreur:
        raise HTTPException(status_code=404, detail="Livreur non trouvé")
    return livreur

@router.delete("/{id}")
async def supprimer_livreur(id: str, db: AsyncSession = Depends(get_db), current_user: Utilisateur = Depends(require_admin)):
    """Archive un livreur — Admin uniquement"""
    livreur = await archiver_livreur(db, id)
    if not livreur:
        raise HTTPException(status_code=404, detail="Livreur non trouvé")
    return {
        "message": "Livreur archivé avec succès"
    }
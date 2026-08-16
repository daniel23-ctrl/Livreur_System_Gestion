from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db

from app.schemas.livreur import (
    ChangerMotDePasseSchema,
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
    lister_livreurs_connectes,
    lister_livreurs_inactifs,
    modifier_mot_de_passe_livreur,
    retaurer_livreur,
    trouver_livreur,
    archiver_livreur,
    modifier_livreur,
    changer_etat_livreur,
    modifier_mon_profil,
    trouver_livreur_par_id
)

from app.dependencies import require_admin, require_livreur,require_livreur_ou_admin
from app.models.utilisateur import Utilisateur

router = APIRouter(prefix="/api/livreurs", tags=["Livreurs"])

@router.post("/", response_model=LivreurResponse)
async def nouveau_livreur(
    request: Request,
    data: LivreurCreate, 
    db: AsyncSession = Depends(get_db), 
    current_user: Utilisateur = Depends(require_admin)
):
    """Crée un nouveau livreur — Admin uniquement"""
    livreur = await creer_livreur(db, data)
    
    # Diffusion WebSocket ciblée
    ws_manager = request.app.state.ws_manager
    await ws_manager.broadcast("livreurCreated", {
        "id": livreur.id, 
        "nom": livreur.nom
    })
    
    return livreur
    
@router.get("/moi", response_model=LivreurResponse)
async def mon_profil_livreur(
    db: AsyncSession = Depends(get_db), 
    current_user: Utilisateur = Depends(require_livreur)
):
    """Récupérer le profil du livreur connecté via le service"""
    return await trouver_livreur(db, current_user.id)

@router.put("/moi/mot-de-passe", status_code=status.HTTP_200_OK)
async def changer_mon_mot_de_passe(
    data: ChangerMotDePasseSchema,
    db: AsyncSession = Depends(get_db),
    current_user: Utilisateur = Depends(require_livreur)
):
    """Route dédiée pour modifier uniquement le mot de passe du livreur connecté"""
    await modifier_mot_de_passe_livreur(db, current_user.id, data)
    return {"message": "Mot de passe mis à jour avec succès."}

@router.get("/connectes", response_model=list[LivreurResponse])
async def liste_livreurs_disponibles(db: AsyncSession = Depends(get_db), current_user: Utilisateur = Depends(require_admin)):
    """Liste tous les livreurs disponibles pour l'assignation — Admin uniquement"""
    return await lister_livreurs_connectes(db)

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
async def update_livreur(
    request: Request,
    id: str, 
    data: LivreurProfilUpdate, 
    db: AsyncSession = Depends(get_db), 
    current_user: Utilisateur = Depends(require_livreur_ou_admin)
):
    """Modifier un livreur — Admin uniquement"""
    livreur = await modifier_livreur(db, id, data)
    if not livreur:
        raise HTTPException(status_code=404, detail="Livreur non trouvé")
        
    # Diffusion WebSocket ciblée
    ws_manager = request.app.state.ws_manager
    await ws_manager.broadcast("livreurUpdated", {
        "id": livreur.id, 
        "nom": livreur.nom
    })
    
    return livreur

@router.patch("/{id}/etat", response_model=LivreurResponse)
async def update_etat_livreur(
    request: Request,
    id: str, 
    data: LivreurEtatUpdate, 
    db: AsyncSession = Depends(get_db), 
    current_user: Utilisateur = Depends(require_admin)
):
    """Changer l'état d'un livreur — Admin uniquement"""
    livreur = await changer_etat_livreur(db, id, data.etat_activite)
    if not livreur:
        raise HTTPException(status_code=404, detail="Livreur non trouvé")
        
    # Diffusion WebSocket ciblée avec l'identifiant, le nom, le prénom et le nouvel état
    ws_manager = request.app.state.ws_manager
    await ws_manager.broadcast("livreurEtatUpdated", {
        "id": livreur.id, 
        "nom": livreur.nom,
        "prenom": livreur.prenom,
        "etat_activite": livreur.etat_activite
    })
    
    return livreur

@router.patch("/{id}/restore", response_model=LivreurResponse)
async def restaurer_livreur(
    request: Request,
    id: str, 
    db: AsyncSession = Depends(get_db), 
    current_user: Utilisateur = Depends(require_admin)
):
    """Restaurer un livreur archivé — Admin uniquement"""
    livreur = await retaurer_livreur(db, id)
    if not livreur:
        raise HTTPException(status_code=404, detail="Livreur non trouvé")
        
    # Diffusion WebSocket avec l'événement spécifique livreurRestore
    ws_manager = request.app.state.ws_manager
    await ws_manager.broadcast("livreurRestore", {
        "id": livreur.id,
        "nom": livreur.nom,
        "prenom": livreur.prenom
    })
    
    return livreur

@router.patch("/moi", response_model=LivreurResponse)
async def update_mon_profil(
    request: Request,
    data: LivreurProfilUpdate, 
    db: AsyncSession = Depends(get_db), 
    current_user: Utilisateur = Depends(require_livreur)
):
    """Le livreur modifie son propre profil"""
    livreur = await modifier_mon_profil(db, current_user.id, data)
    if not livreur:
        raise HTTPException(status_code=404, detail="Livreur non trouvé")
        
    # Diffusion WebSocket ciblée
    ws_manager = request.app.state.ws_manager
    await ws_manager.broadcast("livreurUpdated", {"id": livreur.id})
    
    return livreur


@router.delete("/{id}")
async def supprimer_livreur(
    request: Request,
    id: str, 
    db: AsyncSession = Depends(get_db), 
    current_user: Utilisateur = Depends(require_admin)
):
    """Archive un livreur — Admin uniquement"""
    livreur = await archiver_livreur(db, id)
    if not livreur:
        raise HTTPException(status_code=404, detail="Livreur non trouvé")
        
    # Diffusion WebSocket directe avec le modèle retourné
    ws_manager = request.app.state.ws_manager
    await ws_manager.broadcast("livreurArchived", {
        "id": str(livreur.id),      # ou livreur.id_livreur selon votre schéma exact
        "nom": livreur.nom,
        "prenom": livreur.prenom
    })
    
    return {
        "message": "Livreur archivé avec succès"
    }
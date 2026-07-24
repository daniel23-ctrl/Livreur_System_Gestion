from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.livreur import LivreurCreate, LivreurResponse
from app.services.livreur_service import (
    creer_livreur,
    lister_livreurs,
    trouver_livreur,
    archiver_livreur
)
from app.dependencies import require_admin
from app.models.utilisateur import Utilisateur

router = APIRouter(prefix="/api/livreurs", tags=["Livreurs"])

@router.post("/", response_model=LivreurResponse)
async def nouveau_livreur( data: LivreurCreate, db: AsyncSession = Depends(get_db), current_user: Utilisateur = Depends(require_admin) ):

    """Crée un nouveau livreur — Admin uniquement"""
    try:
        return await creer_livreur(db, data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    

@router.get("/", response_model=list[LivreurResponse])
async def liste_livreurs( db: AsyncSession = Depends(get_db), current_user: Utilisateur = Depends(require_admin)):
    
    """Liste tous les livreurs — Admin uniquement"""
    return await lister_livreurs(db)

@router.get("/{id}", response_model=LivreurResponse)
async def detail_livreur(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Utilisateur = Depends(require_admin)
):
    """Détail d'un livreur — Admin uniquement"""
    livreur = await trouver_livreur(db, id)
    if not livreur:
        raise HTTPException(status_code=404, detail="Livreur non trouvé")
    return livreur

@router.delete("/{id}")
async def supprimer_livreur( id: str, db: AsyncSession = Depends(get_db), current_user: Utilisateur = Depends(require_admin) ):

    """Archive un livreur — Admin uniquement"""

    livreur = await archiver_livreur(db, id)
    if not livreur:
        raise HTTPException(status_code=404, detail="Livreur non trouvé")
    return {"message": "Livreur archivé avec succès"}
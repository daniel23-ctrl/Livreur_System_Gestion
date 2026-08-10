
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db

from app.schemas.client import ClientResponse, ClientUpdate

from app.services.admin_service import (
    trouver_admin,
    modifier_admin
)

import app.models.utilisateur as Utilisateur
from app.dependencies import require_admin

router = APIRouter(prefix="/api/admins", tags=["Admins"])

@router.patch("/me", response_model=ClientResponse)
async def modifier_profil(data: ClientUpdate, db: AsyncSession = Depends(get_db), current_user: Utilisateur = Depends(require_admin)):
    """Modifie le profil de l'administrateur connecté"""
    # On utilise directement l'ID de l'utilisateur connecté via current_user
    admin = await modifier_admin(db, current_user.id, data)
    
    if not admin:
        raise HTTPException(
            status_code=404,
            detail="Administrateur non trouvé"
        )
        
    return admin


@router.get("/{id}", response_model=ClientResponse)
async def trouver_admin_par_id(id: str, db: AsyncSession = Depends(get_db), current_user: Utilisateur = Depends(require_admin)):
    """Trouve un administrateur par son ID — Admin uniquement"""
    admin = await trouver_admin(db, id)
    if not admin:
        raise HTTPException(status_code=404, detail="Administrateur non trouvé")
    return admin



from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.client import ClientResponse,ClientUpdate


import app.schemas.client as client_schemas
from app.services.client_service import (
    creer_client,
    lister_clients,
    trouver_client,
    
)

import app.models.utilisateur as Utilisateur
from app.dependencies import require_admin,  require_client_ou_admin

router = APIRouter(prefix="/api/clients", tags=["Clients"])

@router.get("/", response_model=list[ClientResponse])
async def lister_tous_les_clients(db: AsyncSession = Depends(get_db), current_user: Utilisateur = Depends(require_admin)):
    """Liste tous les clients — Admin uniquement"""
    return await lister_clients(db)

@router.get("/{id}", response_model=ClientResponse)
async def trouver_client_par_id(id: str, db: AsyncSession = Depends(get_db), current_user: Utilisateur = Depends(require_client_ou_admin)):
    """Trouve un client par son ID — Admin uniquement"""
    client = await trouver_client(db, id)
    if not client:
        raise HTTPException(status_code=404, detail="Client non trouvé")
    return client


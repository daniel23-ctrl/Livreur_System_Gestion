from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.auth import LoginSchema, TokenSchema
from app.schemas.client import ClientCreate, ClientResponse
from app.services.auth_service import login
from app.services.client_service import creer_client

router = APIRouter(prefix="/api/auth", tags=["Authentification"])

@router.post("/login", response_model=TokenSchema)
async def connexion(login_data: LoginSchema, db: AsyncSession = Depends(get_db)):
    """Connexion pour tous les utilisateurs"""
    try:
        return await login(db, login_data)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.post("/inscription", response_model=ClientResponse)
async def inscription_client(data: ClientCreate, db: AsyncSession = Depends(get_db)):
    """Inscription publique d'un client"""
    try:
        return await creer_client(db, data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
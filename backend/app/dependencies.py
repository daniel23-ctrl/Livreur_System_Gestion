from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import decoder_token
from app.models.utilisateur import Utilisateur, RoleEnum

token_extrait = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_user( token: str = Depends(token_extrait), db: AsyncSession = Depends(get_db) ) -> Utilisateur:

    """Récupère l'utilisateur connecté depuis le token JWT"""
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token invalide ou expiré",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decoder_token(token)
    if payload is None:
        raise credentials_exception
    
    user_id = payload.get("sub")
    role = payload.get("role")
    
    if user_id is None or role is None:
        raise credentials_exception
    
    resultat = await db.execute(
        select(Utilisateur).where(Utilisateur.id == user_id)
    )
    utilisateur = resultat.scalar_one_or_none()
    
    if utilisateur is None:
        raise credentials_exception
    
    return utilisateur

async def require_admin( current_user: Utilisateur = Depends(get_current_user)) -> Utilisateur:

    """Vérifie que l'utilisateur est un administrateur"""

    if current_user.role != RoleEnum.ADMINISTRATEUR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès interdit — Administrateur uniquement"
        )
    
    return current_user

async def require_livreur(
    current_user: Utilisateur = Depends(get_current_user)
) -> Utilisateur:
    """Vérifie que l'utilisateur est un livreur"""
    if current_user.role != RoleEnum.LIVREUR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès interdit , Livreur uniquement"
        )
    return current_user

async def require_client(
    current_user: Utilisateur = Depends(get_current_user)
) -> Utilisateur:
    """Vérifie que l'utilisateur est un client"""
    if current_user.role != RoleEnum.CLIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès interdit , Client uniquement"
        )
    return current_user
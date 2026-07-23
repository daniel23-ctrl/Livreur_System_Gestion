from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.utilisateur import Utilisateur, RoleEnum
from app.schemas.admin import AdminCreate
from app.core.security import hacher_mot_de_passe

async def creer_admin(db: AsyncSession, data: AdminCreate) -> Utilisateur:
    """Crée un compte administrateur — usage interne uniquement"""
    nouvel_utilisateur = Utilisateur(
        nom=data.nom,
        prenom=data.prenom,
        email=data.email,
        mot_de_passe=hacher_mot_de_passe(data.mot_de_passe),
        role=RoleEnum.ADMINISTRATEUR
    )
    db.add(nouvel_utilisateur)
    await db.commit()
    await db.refresh(nouvel_utilisateur)
    return nouvel_utilisateur

async def trouver_admin(db: AsyncSession, id: str) -> Utilisateur | None:
    """Cherche un admin par son id"""
    resultat = await db.execute(
        select(Utilisateur).where(
            Utilisateur.id == id,
            Utilisateur.role == RoleEnum.ADMINISTRATEUR
        )
    )
    return resultat.scalar_one_or_none()
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.models.utilisateur import Utilisateur, RoleEnum
from app.schemas.client import ClientCreate
from app.core.security import hacher_mot_de_passe
from app.services.otp_service import generer_et_envoyer_otp  

async def creer_client(db: AsyncSession, data: ClientCreate) -> Utilisateur:
    """Crée un compte client et envoie un code OTP si téléphone fourni"""
    nouvel_utilisateur = Utilisateur(
        nom=data.nom,
        prenom=data.prenom,
        email=data.email,
        telephone=data.telephone,
        mot_de_passe=hacher_mot_de_passe(data.mot_de_passe),
        role=RoleEnum.CLIENT
    )
    db.add(nouvel_utilisateur)
    await db.commit()
    await db.refresh(nouvel_utilisateur)

    if nouvel_utilisateur.telephone:
        await generer_et_envoyer_otp(db, nouvel_utilisateur)

    return nouvel_utilisateur

async def trouver_client(db: AsyncSession, id: str) -> Utilisateur | None:
    """Cherche un client par son id"""
    resultat = await db.execute(
        select(Utilisateur).where(
            Utilisateur.id == id,
            Utilisateur.role == RoleEnum.CLIENT
        )
    )
    return resultat.scalar_one_or_none()

async def lister_clients(db: AsyncSession) -> list[Utilisateur]:
    """Retourne tous les clients"""
    resultat = await db.execute(
        select(Utilisateur).where(Utilisateur.role == RoleEnum.CLIENT)
    )
    return resultat.scalars().all()
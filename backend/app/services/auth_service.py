from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.models.utilisateur import Utilisateur
from app.schemas.auth import LoginSchema, TokenSchema
from app.core.security import verifier_mot_de_passe, creer_token

async def login(db: AsyncSession, login_data: LoginSchema) -> TokenSchema:
    """Authentifie un utilisateur"""
    identifiant = login_data.identifiant.strip()

    resultat = await db.execute(
        select(Utilisateur).where(
            or_(
                Utilisateur.email == identifiant,
                Utilisateur.telephone == identifiant
            )
        )
    )
    utilisateur = resultat.scalar_one_or_none()

    if not utilisateur or not verifier_mot_de_passe(
        login_data.mot_de_passe, utilisateur.mot_de_passe
    ):
        raise ValueError("Identifiants invalides")

    return TokenSchema(
        access_token=creer_token({
            "sub": utilisateur.id,
            "role": utilisateur.role.value
        }),
        id=utilisateur.id,
        role=utilisateur.role,
        nom=utilisateur.nom,
        prenom=utilisateur.prenom
    )
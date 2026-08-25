from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from fastapi import HTTPException, status
from app.models.utilisateur import Utilisateur
from app.schemas.auth import LoginSchema, TokenSchema
from app.core.security import verifier_mot_de_passe, creer_token
from app.models.utilisateur import RoleEnum  # Assurez-vous d'importer votre RoleEnum

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
    utilisateur : Utilisateur = resultat.scalar_one_or_none()

    if not utilisateur or not verifier_mot_de_passe(
        login_data.mot_de_passe, utilisateur.mot_de_passe
    ):
        raise ValueError("Identifiants invalides")

    # --- VÉRIFICATION CIBLÉE AUX CLIENTS ---
    # Si c'est un CLIENT et que son téléphone n'est pas vérifié, on bloque.
    # Les autres rôles (LIVREUR, ADMINISTRATEUR) ignorent cette condition.
    if utilisateur.role == RoleEnum.CLIENT and not utilisateur.telephone_verifie:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Veuillez vérifier votre numéro de téléphone avant de vous connecter."
        )

    return TokenSchema(
        access_token=creer_token({
            "sub": utilisateur.id,
            "role": utilisateur.role.value
        }),
        id=utilisateur.id,
        role=utilisateur.role,
        nom=utilisateur.nom,
        prenom=utilisateur.prenom,
        telephone=utilisateur.telephone
    )
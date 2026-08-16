from fastapi import HTTPException
from app.schemas.client import ClientResponse, ClientUpdate
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.utilisateur import Utilisateur, RoleEnum
from app.schemas.admin import AdminCreate
from app.core.security import hacher_mot_de_passe, verifier_mot_de_passe

async def creer_admin(db: AsyncSession, data: AdminCreate) -> ClientResponse:
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

    return _to_client_response(nouvel_utilisateur)

async def trouver_admin(db: AsyncSession, id: str) -> ClientResponse | None:
    """Cherche un admin par son id"""
    resultat = await db.execute(
        select(Utilisateur).where(
            Utilisateur.id == id,
            Utilisateur.role == RoleEnum.ADMINISTRATEUR
        )
    )
    utilisateur = resultat.scalar_one_or_none()
    if utilisateur:
        return _to_client_response(utilisateur)
    return None

async def modifier_admin(db: AsyncSession, id: str, data: ClientUpdate) -> ClientResponse | None:
    """Modifie un compte administrateur avec vérification de l'ancien mot de passe"""
    # 1. Récupérer l'objet SQLAlchemy brut
    resultat = await db.execute(
        select(Utilisateur).where(
            Utilisateur.id == id,
            Utilisateur.role == RoleEnum.ADMINISTRATEUR
        )
    )
    utilisateur = resultat.scalar_one_or_none()
    if not utilisateur:
        return None

    # 2. Gestion de la modification du mot de passe
    if data.nouveau_mot_de_passe:
        # L'ancien mot de passe est obligatoire pour en définir un nouveau
        if not data.ancien_mot_de_passe:
            raise HTTPException(
                status_code=400, 
                detail="L'ancien mot de passe est requis pour définir un nouveau mot de passe."
            )
        
        # Vérifier si l'ancien mot de passe est correct
        if not verifier_mot_de_passe(data.ancien_mot_de_passe, utilisateur.mot_de_passe):
            raise HTTPException(
                status_code=400, 
                detail="L'ancien mot de passe est incorrect."
            )
        
        # Mettre à jour avec le nouveau mot de passe haché
        utilisateur.mot_de_passe = hacher_mot_de_passe(data.nouveau_mot_de_passe)

    # 3. Mettre à jour les autres champs fournis (nom, prénom, email, téléphone)
    update_data = data.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        # On ignore les champs liés au mot de passe car ils ont déjà été traités
        if key in ["ancien_mot_de_passe", "nouveau_mot_de_passe"]:
            continue
        setattr(utilisateur, key, value)

    # 4. Sauvegarder en base de données
    await db.commit()
    await db.refresh(utilisateur)

    # 5. Retourner la réponse convertie
    return _to_client_response(utilisateur)


def _to_client_response(utilisateur):
    return ClientResponse(
        id=utilisateur.id,  
        nom=utilisateur.nom,
        prenom=utilisateur.prenom,
        email=utilisateur.email,
        telephone=utilisateur.telephone,
        role=utilisateur.role
    )
    

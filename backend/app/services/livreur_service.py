from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.utilisateur import Utilisateur, RoleEnum
from app.models.livreur import Livreur, EtatActiviteEnum
from app.schemas.livreur import LivreurCreate
from app.core.security import hacher_mot_de_passe

async def creer_livreur(db: AsyncSession, data: LivreurCreate) -> Utilisateur:
    """Crée un compte livreur — réservé à l'administrateur"""
    nouvel_utilisateur = Utilisateur(
        nom=data.nom,
        prenom=data.prenom,
        email=data.email,
        telephone=data.telephone,
        mot_de_passe=hacher_mot_de_passe(data.mot_de_passe),
        role=RoleEnum.LIVREUR
    )
    db.add(nouvel_utilisateur)
    await db.flush()

    nouveau_livreur = Livreur(
        id_livreur=nouvel_utilisateur.id,
        type_vehicule=data.type_vehicule,
        immatriculation=data.immatriculation,
    )
    db.add(nouveau_livreur)
    await db.commit()
    await db.refresh(nouvel_utilisateur)
    return nouvel_utilisateur

async def lister_livreurs(db: AsyncSession) -> list[Utilisateur]:
    """Retourne tous les livreurs actifs"""
    resultat = await db.execute(
        select(Utilisateur).where(
            Utilisateur.role == RoleEnum.LIVREUR,
        )
    )
    return resultat.scalars().all()

async def trouver_livreur(db: AsyncSession, id: str) -> Utilisateur | None:
    """Cherche un livreur par son id"""
    resultat = await db.execute(
        select(Utilisateur).where(
            Utilisateur.id == id,
            Utilisateur.role == RoleEnum.LIVREUR
        )
    )
    return resultat.scalar_one_or_none()

async def archiver_livreur(db: AsyncSession, id: str) -> Utilisateur | None:
    """Archive un livreur — soft delete"""
    livreur = await trouver_livreur(db, id)
    if not livreur:
        return None
    livreur_profil = await db.execute(
        select(Livreur).where(Livreur.id_livreur == id)
    )
    profil = livreur_profil.scalar_one_or_none()
    if profil:
        profil.est_actif = False
        profil.etat_activite = EtatActiviteEnum.HORS_LIGNE
    await db.commit()
    await db.refresh(livreur)
    return livreur
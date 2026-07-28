
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.utilisateur import Utilisateur, RoleEnum
from app.schemas.livreur import LivreurCreate, LivreurProfilUpdate, LivreurResponse, LivreurUpdate
from app.core.security import hacher_mot_de_passe
from sqlalchemy.orm import selectinload
from app.models.livreur import Livreur, EtatActiviteEnum

async def creer_livreur(db: AsyncSession, data: LivreurCreate) -> LivreurResponse:
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
    await db.refresh(nouveau_livreur)

    # Retourner un dict combinant les deux objets
    return LivreurResponse(
        id=nouvel_utilisateur.id,
        nom=nouvel_utilisateur.nom,
        prenom=nouvel_utilisateur.prenom,
        email=nouvel_utilisateur.email,
        telephone=nouvel_utilisateur.telephone,
        role=nouvel_utilisateur.role,
        type_vehicule=nouveau_livreur.type_vehicule,
        immatriculation=nouveau_livreur.immatriculation,
        etat_activite=nouveau_livreur.etat_activite,
        est_actif=nouveau_livreur.est_actif,
    )

async def lister_livreurs(db: AsyncSession) -> list[LivreurResponse]:

    resultat = await db.execute(
        select(Livreur).options(
            selectinload(Livreur.utilisateur)
        )
    )

    livreurs = resultat.scalars().all()

    return [
        LivreurResponse(
            id=l.utilisateur.id,
            nom=l.utilisateur.nom,
            prenom=l.utilisateur.prenom,
            email=l.utilisateur.email,
            telephone=l.utilisateur.telephone,
            role=l.utilisateur.role,
            type_vehicule=l.type_vehicule,
            immatriculation=l.immatriculation,
            etat_activite=l.etat_activite,
            est_actif=l.est_actif,
        )
        for l in livreurs
    ]

async def lister_livreurs_actifs(db: AsyncSession) -> list[LivreurResponse]:

    resultat = await db.execute(
        select(Livreur).where(
            Livreur.est_actif == True  
        ).options(
            selectinload(Livreur.utilisateur)
        )
    )
    livreurs = resultat.scalars().all()

    return [
        LivreurResponse(
            id=l.utilisateur.id,
            nom=l.utilisateur.nom,
            prenom=l.utilisateur.prenom,
            email=l.utilisateur.email,
            telephone=l.utilisateur.telephone,
            role=l.utilisateur.role,
            type_vehicule=l.type_vehicule,
            immatriculation=l.immatriculation,
            etat_activite=l.etat_activite,
            est_actif=l.est_actif,
        )
        for l in livreurs
    ]

async def trouver_livreur(db: AsyncSession, id: str) -> LivreurResponse | None:
    """Cherche un livreur par son id"""
    resultat = await db.execute(
        select(Livreur).where(
            Livreur.id_livreur == id
        ).options(selectinload(Livreur.utilisateur))
    )
    livreur = resultat.scalar_one_or_none()

    if not livreur:
        return None

    return LivreurResponse(
        id=livreur.utilisateur.id,
        nom=livreur.utilisateur.nom,
        prenom=livreur.utilisateur.prenom,
        email=livreur.utilisateur.email,
        telephone=livreur.utilisateur.telephone,
        role=livreur.utilisateur.role,
        type_vehicule=livreur.type_vehicule,
        immatriculation=livreur.immatriculation,
        etat_activite=livreur.etat_activite,
        est_actif=livreur.est_actif,
    )   

async def modifier_mon_profil( db: AsyncSession, id: str, data: LivreurProfilUpdate ) -> LivreurResponse | None:
    """Le livreur modifie son propre profil"""
    resultat = await db.execute(
        select(Livreur).where(Livreur.id_livreur == id)
        .options(selectinload(Livreur.utilisateur))
    )
    livreur = resultat.scalar_one_or_none()

    if not livreur:
        return None

    # Modifier les champs utilisateur
    if data.nom is not None:
        livreur.utilisateur.nom = data.nom
    if data.prenom is not None:
        livreur.utilisateur.prenom = data.prenom
    if data.telephone is not None:
        livreur.utilisateur.telephone = data.telephone
    if data.email is not None:
        livreur.utilisateur.email = data.email

    # Modifier les champs livreur
    if data.type_vehicule is not None:
        livreur.type_vehicule = data.type_vehicule
    if data.immatriculation is not None:
        livreur.immatriculation = data.immatriculation

    await db.commit()
    await db.refresh(livreur)
    await db.refresh(livreur.utilisateur)

    return LivreurResponse(
        id=livreur.utilisateur.id,
        nom=livreur.utilisateur.nom,
        prenom=livreur.utilisateur.prenom,
        email=livreur.utilisateur.email,
        telephone=livreur.utilisateur.telephone,
        role=livreur.utilisateur.role,
        type_vehicule=livreur.type_vehicule,
        immatriculation=livreur.immatriculation,
        etat_activite=livreur.etat_activite,
        est_actif=livreur.est_actif,
    )

async def archiver_livreur(db: AsyncSession, id: str) -> dict | None:

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
    
    return {
        "message": "Livreur archivé avec succès",
    }

async def modifier_livreur(db: AsyncSession, id: str, data: LivreurUpdate) -> LivreurResponse | None:
    """Admin modifie les infos d'un livreur"""
    resultat = await db.execute(
        select(Livreur).where(Livreur.id_livreur == id)
        .options(selectinload(Livreur.utilisateur))
    )
    livreur = resultat.scalar_one_or_none()
    if not livreur:
        return None
    if data.type_vehicule is not None:
        livreur.type_vehicule = data.type_vehicule
    if data.immatriculation is not None:
        livreur.immatriculation = data.immatriculation
    if data.telephone is not None:
        livreur.utilisateur.telephone = data.telephone
    if data.email is not None:
        livreur.utilisateur.email = data.email
    await db.commit()
    await db.refresh(livreur)
    await db.refresh(livreur.utilisateur)
    return LivreurResponse(
        id=livreur.utilisateur.id,
        nom=livreur.utilisateur.nom,
        prenom=livreur.utilisateur.prenom,
        email=livreur.utilisateur.email,
        telephone=livreur.utilisateur.telephone,
        role=livreur.utilisateur.role,
        type_vehicule=livreur.type_vehicule,
        immatriculation=livreur.immatriculation,
        etat_activite=livreur.etat_activite,
        est_actif=livreur.est_actif,
    )

async def changer_etat_livreur(db: AsyncSession, id: str, etat: EtatActiviteEnum) -> LivreurResponse | None:
    """Change l'état d'activité d'un livreur"""
    resultat = await db.execute(
        select(Livreur).where(Livreur.id_livreur == id)
        .options(selectinload(Livreur.utilisateur))
    )
    livreur = resultat.scalar_one_or_none()
    if not livreur:
        return None
    livreur.etat_activite = etat
    await db.commit()
    await db.refresh(livreur)
    return LivreurResponse(
        id=livreur.utilisateur.id,
        nom=livreur.utilisateur.nom,
        prenom=livreur.utilisateur.prenom,
        email=livreur.utilisateur.email,
        telephone=livreur.utilisateur.telephone,
        role=livreur.utilisateur.role,
        type_vehicule=livreur.type_vehicule,
        immatriculation=livreur.immatriculation,
        etat_activite=livreur.etat_activite,
        est_actif=livreur.est_actif,
    )
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.models.utilisateur import Utilisateur, RoleEnum
from app.schemas.livreur import ChangerMotDePasseSchema, LivreurCreate, LivreurProfilUpdate, LivreurResponse, LivreurUpdate
from app.core.security import hacher_mot_de_passe
from sqlalchemy.orm import selectinload, joinedload
from app.models.livreur import Livreur, EtatActiviteEnum
from app.core.security import verifier_mot_de_passe, hacher_mot_de_passe


def _to_livreur_response(livreur: Livreur) -> LivreurResponse:
    """Convertit un objet SQLAlchemy Livreur (avec sa relation utilisateur) en schéma Pydantic"""
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

async def creer_livreur(db: AsyncSession, data: LivreurCreate) -> LivreurResponse:
    """Crée un compte livreur — réservé à l'administrateur"""
    try:
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
        
        # Recharger l'objet avec sa relation utilisateur pour le mapper correctement
        stmt = select(Livreur).options(selectinload(Livreur.utilisateur)).where(Livreur.id_livreur == nouvel_utilisateur.id)
        result = await db.execute(stmt)
        livreur_cree = result.scalar_one()

    except IntegrityError as e:
        await db.rollback()
        error_message = str(e.orig)
        
        if "utilisateurs_email_key" in error_message or "email" in error_message.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cet email est déjà utilisé par un autre compte."
            )
        elif "utilisateurs_telephone_key" in error_message or "telephone" in error_message.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ce numéro de téléphone est déjà utilisé par un autre compte."
            )
        elif "immatriculation" in error_message.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cette immatriculation est déjà enregistrée."
            )
        
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Une erreur d'intégrité est survenue lors de la création."
        )

    return _to_livreur_response(livreur_cree)

async def lister_livreurs(db: AsyncSession) -> list[LivreurResponse]:
    resultat = await db.execute(
        select(Livreur).options(
            selectinload(Livreur.utilisateur)
        )
    )
    livreurs = resultat.scalars().all()
    return [_to_livreur_response(l) for l in livreurs]

async def lister_livreurs_actifs(db: AsyncSession) -> list[LivreurResponse]:
    resultat = await db.execute(
        select(Livreur).where(
            Livreur.est_actif == True  
        ).options(
            selectinload(Livreur.utilisateur)
        )
    )
    livreurs = resultat.scalars().all()
    return [_to_livreur_response(l) for l in livreurs]

async def lister_livreurs_connectes(db: AsyncSession) -> list[LivreurResponse]:
    resultat = await db.execute(
        select(Livreur).where(
            Livreur.est_actif == True,
            or_(
                Livreur.etat_activite == EtatActiviteEnum.DISPONIBLE,
                Livreur.etat_activite == EtatActiviteEnum.EN_COURSE
            )
        ).options(
            selectinload(Livreur.utilisateur)
        )
    )
    livreurs = resultat.scalars().all()
    return [_to_livreur_response(l) for l in livreurs]

async def trouver_livreur(db: AsyncSession, id: str) -> LivreurResponse:
    """Trouve un unique livreur lié à un ID utilisateur spécifique (pour le profil connecté)"""
    resultat = await db.execute(
        select(Livreur)
        .where(Livreur.id_livreur == id)  
        .options(selectinload(Livreur.utilisateur))
    )
    livreur = resultat.scalar_one_or_none()

    if not livreur:
        raise HTTPException(status_code=404, detail="Profil livreur non trouvé")

    return _to_livreur_response(livreur)

async def trouver_livreur_par_id(db: AsyncSession, id_livreur: str) -> LivreurResponse:
    """Trouve un unique livreur lié à un ID livreur spécifique (pour l'admin)"""
    resultat = await db.execute(
        select(Livreur)
        .where(Livreur.id_livreur == id_livreur)
        .options(selectinload(Livreur.utilisateur))
    )
    livreur = resultat.scalar_one_or_none()
    if not livreur:
        raise HTTPException(
            status_code=404, 
            detail="Livreur non trouvé")
    
    return _to_livreur_response(livreur)

async def modifier_mon_profil(db: AsyncSession, id: str, data: LivreurProfilUpdate) -> LivreurResponse | None:
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

    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        error_message = str(e.orig)
        if "utilisateurs_email_key" in error_message or "email" in error_message.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cet email est déjà utilisé par un autre compte."
            )
        elif "utilisateurs_telephone_key" in error_message or "telephone" in error_message.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ce numéro de téléphone est déjà utilisé."
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erreur lors de la mise à jour du profil."
        )

    await db.refresh(livreur)
    await db.refresh(livreur.utilisateur)

    return _to_livreur_response(livreur)

async def archiver_livreur(db: AsyncSession, id: str) -> LivreurResponse | None:
    """Archive un livreur — soft delete"""
    livreur_profil = await db.execute(
        select(Livreur).where(Livreur.id_livreur == id).options(selectinload(Livreur.utilisateur))
    )
    profil = livreur_profil.scalar_one_or_none()

    if not profil:
        return None
    
    profil.est_actif = False
    profil.etat_activite = EtatActiviteEnum.HORS_LIGNE

    await db.commit()
    await db.refresh(profil)
    await db.refresh(profil.utilisateur)
    
    return _to_livreur_response(profil)

async def modifier_livreur(db: AsyncSession, id: str, data: LivreurProfilUpdate) -> LivreurResponse | None:
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
        
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        error_message = str(e.orig)
        if "utilisateurs_email_key" in error_message or "email" in error_message.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cet email est déjà utilisé par un autre compte."
            )
        elif "utilisateurs_telephone_key" in error_message or "telephone" in error_message.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ce numéro de téléphone est déjà utilisé."
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erreur lors de la modification du livreur."
        )

    await db.refresh(livreur)
    await db.refresh(livreur.utilisateur)
    return _to_livreur_response(livreur)

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
    await db.refresh(livreur.utilisateur)
    return _to_livreur_response(livreur)

async def lister_livreurs_inactifs(db: AsyncSession) -> list[LivreurResponse]:
    """Liste tous les livreurs inactifs — Admin uniquement"""
    resultat = await db.execute(
        select(Livreur).where(Livreur.est_actif == False)
        .options(selectinload(Livreur.utilisateur))
    )
    livreurs = resultat.scalars().all()
    return [_to_livreur_response(l) for l in livreurs]

async def retaurer_livreur(db: AsyncSession, id: str) -> LivreurResponse | None:
    """Restaure un livreur archivé"""
    stmt = select(Livreur).options(selectinload(Livreur.utilisateur)).where(Livreur.id_livreur == id)
    result = await db.execute(stmt)
    profil: Livreur = result.scalar_one_or_none()

    if not profil:
        return None
    
    profil.est_actif = True
    profil.etat_activite = EtatActiviteEnum.HORS_LIGNE

    await db.commit()
    await db.refresh(profil)
    await db.refresh(profil.utilisateur)
    
    return _to_livreur_response(profil)

async def modifier_mot_de_passe_livreur(db: AsyncSession, id_utilisateur: str, data: ChangerMotDePasseSchema) -> bool:
    """Permet à un livreur de modifier son mot de passe en vérifiant l'ancien"""
    resultat = await db.execute(
        select(Utilisateur).where(Utilisateur.id == id_utilisateur)
    )
    utilisateur = resultat.scalar_one_or_none()

    if not utilisateur:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé.")

    # Vérifier si l'ancien mot de passe est correct
    if not verifier_mot_de_passe(data.ancien_mot_de_passe, utilisateur.mot_de_passe):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="L'ancien mot de passe est incorrect."
        )

    # Hacher et enregistrer le nouveau mot de passe
    utilisateur.mot_de_passe = hacher_mot_de_passe(data.nouveau_mot_de_passe)
    
    await db.commit()
    return True
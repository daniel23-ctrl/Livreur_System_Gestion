from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.client import ClientCreate, ClientResponse
from app.services.auth_service import login
from app.services.livreur_service import changer_etat_livreur
from app.models.livreur import EtatActiviteEnum
from app.models.utilisateur import RoleEnum, Utilisateur
from app.dependencies import get_current_user
from app.schemas.auth import LoginSchema, TokenSchema, VerifierOTPSchema  
from app.services.otp_service import verifier_code_otp, generer_et_envoyer_otp  
from app.services.client_service import trouver_client, creer_client
from sqlalchemy.exc import IntegrityError


router = APIRouter(prefix="/api/auth", tags=["Authentification"])

@router.post("/login", response_model=TokenSchema)
async def connexion(login_data: LoginSchema, db: AsyncSession = Depends(get_db)):
    """Connexion pour tous les utilisateurs"""
    try:
        result = await login(db, login_data)
        
        if result.role == RoleEnum.LIVREUR:
            await changer_etat_livreur(db, result.id, EtatActiviteEnum.DISPONIBLE)
        return result
    
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    
@router.post("/inscription", response_model=ClientResponse)
async def inscription_client(data: ClientCreate, db: AsyncSession = Depends(get_db)):
    """Inscription publique d'un client"""
    try:
        return await creer_client(db, data)
    except IntegrityError as e:
        # On fait un rollback pour nettoyer la session de la base de données
        await db.rollback()
        
        error_message = str(e)
        # On analyse le message de PostgreSQL pour savoir si c'est l'email ou le téléphone
        if "utilisateurs_telephone_key" in error_message:
            raise HTTPException(
                status_code=400, 
                detail="Ce numéro de téléphone est déjà associé à un compte."
            )
        elif "utilisateurs_email_key" in error_message:
            raise HTTPException(
                status_code=400, 
                detail="Cette adresse email est déjà utilisée."
            )
        else:
            raise HTTPException(
                status_code=400, 
                detail="Erreur lors de l'inscription. Données déjà existantes."
            )
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=400, 
            detail="Une erreur interne est survenue. Veuillez réessayer."
        )

@router.post("/logout")
async def deconnexion(
    db: AsyncSession = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    """Déconnexion — passe le livreur en HORS_LIGNE"""
    if current_user.role == RoleEnum.LIVREUR:
        await changer_etat_livreur(db, current_user.id, EtatActiviteEnum.HORS_LIGNE)
    return {"message": "Déconnexion réussie"}

@router.post("/verifier-otp")
async def verifier_otp(data: VerifierOTPSchema, db: AsyncSession = Depends(get_db)):
    """Vérifie le code OTP reçu par SMS"""
    try:
        await verifier_code_otp(db, data.utilisateur_id, data.code)
        return {"message": "Numéro de téléphone vérifié avec succès"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/renvoyer-otp/{utilisateur_id}")
async def renvoyer_otp(utilisateur_id: str, db: AsyncSession = Depends(get_db)):
    """Renvoie un nouveau code OTP"""
    utilisateur = await trouver_client(db, utilisateur_id)
    if utilisateur is None:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    if not utilisateur.telephone:
        raise HTTPException(status_code=400, detail="Aucun numéro de téléphone associé")

    await generer_et_envoyer_otp(db, utilisateur)
    return {"message": "Nouveau code envoyé"}
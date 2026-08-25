from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.notification import NotificationResponse
from app.services.notification_service import (
    lister_notifications,
    lister_notifications_par_client,
    lister_notifications_par_commande,
    lister_notifications_par_livreur
)
from app.dependencies import require_admin, require_client, require_livreur
from app.models.utilisateur import Utilisateur

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("/", response_model=list[NotificationResponse])
async def liste_notifications(db: AsyncSession = Depends(get_db),current_user: Utilisateur = Depends(require_admin)):
    """Liste toutes les notifications — Admin uniquement"""
    return await lister_notifications(db)

@router.get("/livreur/mes-notifications", response_model=list[NotificationResponse])
async def mes_notifications_livreur(
    db: AsyncSession = Depends(get_db),
    current_user: Utilisateur = Depends(require_livreur)
):
    """Liste les notifications liées aux commandes du livreur connecté"""
    return await lister_notifications_par_livreur(db, current_user.id)

@router.get("/client/mes-notifications", response_model=list[NotificationResponse])
async def mes_notifications_client(
    db: AsyncSession = Depends(get_db),
    current_user: Utilisateur = Depends(require_client)
):
    """Liste les notifications liées aux commandes du client connecté"""
    return await lister_notifications_par_client(db, current_user.id)


@router.get("/{id_commande}", response_model=list[NotificationResponse])
async def notifications_par_commande(id_commande: str,db: AsyncSession = Depends(get_db),current_user: Utilisateur = Depends(require_admin)):
    """Liste les notifications d'une commande — Admin uniquement"""
    notifications = await lister_notifications_par_commande(db, id_commande)
    if not notifications:
        raise HTTPException(status_code=404, detail="Aucune notification trouvée")
    return notifications



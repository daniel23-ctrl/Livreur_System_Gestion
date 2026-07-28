from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.notification import Notification, StatutEnvoiEnum, DeclencheurEnum
from app.schemas.notification import NotificationResponse
import africastalking

from app.core.config import settings

africastalking.initialize(
    username=settings.AFRICAS_TALKING_USERNAME,
    api_key=settings.AFRICAS_TALKING_API_KEY
)
sms = africastalking.SMS

async def envoyer_sms( db: AsyncSession, id_commande: str, telephone: str, message: str, declencheur: DeclencheurEnum ) -> NotificationResponse:
    """Envoie un SMS et journalise le résultat"""

    # Créer la notification en attente
    notification = Notification(
        id_commande=id_commande,
        telephone_destinataire=telephone,
        message=message,
        statut_envoi=StatutEnvoiEnum.EN_ATTENTE,
        declencheur=declencheur
    )
    db.add(notification)
    await db.flush()

    # Tentative d'envoi SMS — asynchrone et non bloquant
    try:
        sms.send(message, [f"+228{telephone}"])
        notification.statut_envoi = StatutEnvoiEnum.ENVOYE
        notification.envoye_le = datetime.utcnow()
    except Exception:
        # Échec SMS — on journalise sans bloquer le système
        notification.statut_envoi = StatutEnvoiEnum.ECHEC

    await db.commit()
    await db.refresh(notification)
    return _to_response(notification)

async def envoyer_sms_assignation( db: AsyncSession,id_commande: str,telephone_client: str,nom_livreur: str,telephone_livreur: str) -> NotificationResponse:
    """SMS envoyé au client lors de l'assignation d'un livreur"""

    message = (
        f"Votre colis a été pris en charge. "
        f"Votre livreur est {nom_livreur} — "
        f"Tel : {telephone_livreur}. "
        f"Référence : {id_commande[:8].upper()}"
    )
    return await envoyer_sms(
        db, id_commande, telephone_client,
        message, DeclencheurEnum.ASSIGNEE
    )

async def envoyer_sms_livraison(
    db: AsyncSession,
    id_commande: str,
    telephone_client: str,
    nom_livreur: str
) -> NotificationResponse:
    """SMS envoyé au client lors de la mise en livraison"""
    message = (
        f"Votre livreur {nom_livreur} est en route "
        f"pour vous livrer votre colis. "
        f"Référence : {id_commande[:8].upper()}"
    )
    return await envoyer_sms(
        db, id_commande, telephone_client,
        message, DeclencheurEnum.EN_COURS_DE_LIVRAISON
    )

async def lister_notifications(db: AsyncSession) -> list[NotificationResponse]:
    """Liste toutes les notifications — Admin uniquement"""
    resultat = await db.execute(select(Notification))
    notifications = resultat.scalars().all()
    return [_to_response(n) for n in notifications]

async def lister_notifications_par_commande( db: AsyncSession, id_commande: str ) -> list[NotificationResponse]:
    """Liste les notifications d'une commande"""
    resultat = await db.execute(
        select(Notification).where(Notification.id_commande == id_commande)
    )
    notifications = resultat.scalars().all()
    return [_to_response(n) for n in notifications]

def _to_response(notification: Notification) -> NotificationResponse:
    return NotificationResponse(
        id_notification=notification.id_notification,
        id_commande=notification.id_commande,
        telephone_destinataire=notification.telephone_destinataire,
        message=notification.message,
        statut_envoi=notification.statut_envoi,
        declencheur=notification.declencheur,
        envoye_le=notification.envoye_le,
        createdAt=notification.createdAt
    )
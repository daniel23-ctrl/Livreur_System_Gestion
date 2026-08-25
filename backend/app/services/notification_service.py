from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.notification import Notification, StatutEnvoiEnum, DeclencheurEnum
from app.schemas.notification import NotificationResponse
from app.services.sms_service import envoyer_sms as envoyer_sms_brut  # fonction http.client fiable, déjà testée


async def envoyer_sms(
    db: AsyncSession,
    id_commande: str,
    telephone: str,
    message: str,
    declencheur: DeclencheurEnum,
    ws_manager=None,
) -> NotificationResponse:
    """Envoie un SMS et journalise le résultat"""

    notification = Notification(
        id_commande=id_commande,
        telephone_destinataire=telephone,
        message=message,
        statut_envoi=StatutEnvoiEnum.EN_ATTENTE,
        declencheur=declencheur,
    )
    db.add(notification)
    await db.flush()

    # Envoi réel via http.client (contourne le bug SSL du SDK)
    succes = envoyer_sms_brut(telephone, message)

    if succes:
        notification.statut_envoi = StatutEnvoiEnum.ENVOYE
        notification.envoye_le = datetime.utcnow()
    else:
        notification.statut_envoi = StatutEnvoiEnum.ECHEC

    await db.commit()
    await db.refresh(notification)

    reponse = _to_response(notification)

    # Diffusion temps réel — admin, client, livreur perçoivent la notification
    if ws_manager:
        await ws_manager.broadcast("notificationCreated", reponse.model_dump(mode="json"))

    return reponse


async def envoyer_sms_assignation(
    db: AsyncSession,
    id_commande: str,
    telephone_client: str,
    nom_livreur: str,
    telephone_livreur: str,
    ws_manager=None,
) -> NotificationResponse:
    """SMS envoyé au client lors de l'assignation d'un livreur"""
    message = (
        f"Votre colis a été pris en charge. "
        f"Votre livreur est {nom_livreur} — "
        f"Tel : {telephone_livreur}. "
        f"Référence : {id_commande[:8].upper()}"
    )
    return await envoyer_sms(
        db, id_commande, telephone_client,
        message, DeclencheurEnum.ASSIGNEE, ws_manager
    )

from app.models.commande import Commande

async def lister_notifications_par_livreur(
    db: AsyncSession, id_livreur: str
) -> list[NotificationResponse]:
    """Liste les notifications des commandes assignées à ce livreur"""
    resultat = await db.execute(
        select(Notification)
        .join(Commande, Commande.id_commande == Notification.id_commande)
        .where(Commande.id_livreur == id_livreur)
    )
    notifications = resultat.scalars().all()
    return [_to_response(n) for n in notifications]

async def envoyer_sms_livraison(
    db: AsyncSession,
    id_commande: str,
    telephone_client: str,
    nom_livreur: str,
    ws_manager=None,
) -> NotificationResponse:
    """SMS envoyé au client lors de la mise en livraison"""
    message = (
        f"Votre livreur {nom_livreur} est en route "
        f"pour vous livrer votre colis. "
        f"Référence : {id_commande[:8].upper()}"
    )
    return await envoyer_sms(
        db, id_commande, telephone_client,
        message, DeclencheurEnum.EN_COURS_DE_LIVRAISON, ws_manager
    )


async def lister_notifications(db: AsyncSession) -> list[NotificationResponse]:
    """Liste toutes les notifications — Admin uniquement"""
    resultat = await db.execute(select(Notification))
    notifications = resultat.scalars().all()
    return [_to_response(n) for n in notifications]


async def lister_notifications_par_commande(
    db: AsyncSession, id_commande: str
) -> list[NotificationResponse]:
    """Liste les notifications d'une commande"""
    resultat = await db.execute(
        select(Notification).where(Notification.id_commande == id_commande)
    )
    notifications = resultat.scalars().all()
    return [_to_response(n) for n in notifications]

async def lister_notifications_par_client(
    db: AsyncSession, id_client: str
) -> list[NotificationResponse]:
    """Liste les notifications des commandes du client connecté"""
    resultat = await db.execute(
        select(Notification)
        .join(Commande, Commande.id_commande == Notification.id_commande)
        .where(Commande.id_client == id_client)
    )
    notifications = resultat.scalars().all()
    return [_to_response(n) for n in notifications]

async def envoyer_sms_nouvelle_mission_livreur(
    db: AsyncSession,
    id_commande: str,
    telephone_livreur: str,
    reference_commande: str,
    ws_manager=None,
) -> NotificationResponse:
    """SMS envoyé au livreur lorsqu'une nouvelle mission lui est assignée"""
    message = (
        f"Nouvelle mission assignée ({reference_commande}). "
        f"Consultez l'application KUSI pour les détails."
    )
    return await envoyer_sms(
        db, id_commande, telephone_livreur,
        message, DeclencheurEnum.ASSIGNEE, ws_manager
    )
    
def _to_response(notification: Notification) -> NotificationResponse:
    return NotificationResponse(
        id_notification=notification.id_notification,
        id_commande=notification.id_commande,
        telephone_destinataire=notification.telephone_destinataire,
        message=notification.message,
        statut_envoi=notification.statut_envoi,
        declencheur=notification.declencheur,
        envoye_le=notification.envoye_le,
        createdAt=notification.createdAt,
    )
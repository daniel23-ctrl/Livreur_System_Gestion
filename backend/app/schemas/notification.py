from pydantic import BaseModel
from app.models.notification import StatutEnvoiEnum, DeclencheurEnum
from datetime import datetime

class NotificationResponse(BaseModel):
    id_notification: str
    id_commande: str
    telephone_destinataire: str
    message: str
    statut_envoi: StatutEnvoiEnum
    declencheur: DeclencheurEnum
    envoye_le: datetime | None = None
    createdAt: datetime

    class Config:
        from_attributes = True
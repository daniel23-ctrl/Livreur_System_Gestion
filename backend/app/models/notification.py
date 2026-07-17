import uuid
import enum
from datetime import datetime
from sqlalchemy import String, Enum, DateTime, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class StatutEnvoiEnum(str, enum.Enum):
    EN_ATTENTE = "EN_ATTENTE"
    ENVOYE = "ENVOYE"
    ECHEC = "ECHEC"

class DeclencheurEnum(str, enum.Enum):
    ASSIGNEE = "ASSIGNEE"
    EN_COURS_DE_LIVRAISON = "EN_COURS_DE_LIVRAISON"

class Notification(Base):
    __tablename__ = "notifications"

    id_notification: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    id_commande: Mapped[str] = mapped_column(
        String, ForeignKey("commandes.id_commande"), nullable=False
    )
    telephone_destinataire: Mapped[str] = mapped_column(String(8), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    statut_envoi: Mapped[StatutEnvoiEnum] = mapped_column(
        Enum(StatutEnvoiEnum), default=StatutEnvoiEnum.EN_ATTENTE, nullable=False
    )
    declencheur: Mapped[DeclencheurEnum] = mapped_column(
        Enum(DeclencheurEnum), nullable=False
    )
    envoye_le: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    createdAt: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relation
    commande: Mapped["Commande"] = relationship("Commande", back_populates="notifications")
import uuid
import enum
from datetime import datetime
from sqlalchemy import String, Enum, DateTime, Float, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class StatutCommandeEnum(str, enum.Enum):
    EN_ATTENTE = "EN_ATTENTE"
    ASSIGNEE = "ASSIGNEE"
    EN_COURS_DE_COLLECTE = "EN_COURS_DE_COLLECTE"
    EN_COURS_DE_LIVRAISON = "EN_COURS_DE_LIVRAISON"
    LIVREE = "LIVREE"

class Commande(Base):
    __tablename__ = "commandes"

    id_commande: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    reference: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    adresse_ramassage: Mapped[str] = mapped_column(Text, nullable=False)
    adresse_livraison: Mapped[str] = mapped_column(Text, nullable=False)
    nom_destinataire: Mapped[str] = mapped_column(String(200), nullable=False)
    telephone_destinataire: Mapped[str] = mapped_column(String(8), nullable=False)
    telephone_demandeur: Mapped[str] = mapped_column(String(8), nullable=False)
    instructions: Mapped[str | None] = mapped_column(Text, nullable=True)
    montant_a_percevoir: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    statut_commande: Mapped[StatutCommandeEnum] = mapped_column(
        Enum(StatutCommandeEnum), default=StatutCommandeEnum.EN_ATTENTE, nullable=False
    )

    # Clés étrangères
    id_livreur: Mapped[str | None] = mapped_column(
        String, ForeignKey("livreurs.id_livreur"), nullable=True
    )
    id_client: Mapped[str | None] = mapped_column(
        String, ForeignKey("utilisateurs.id"), nullable=True
    )

    createdAt: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updatedAt: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relations
    livreur: Mapped["Livreur"] = relationship("Livreur", back_populates="commandes")
    client: Mapped["Utilisateur"] = relationship("Utilisateur", foreign_keys=[id_client])
    notifications: Mapped[list["Notification"]] = relationship(
        "Notification", back_populates="commande"
    )
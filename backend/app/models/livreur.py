import enum
from sqlalchemy import String, Enum, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class EtatActiviteEnum(str, enum.Enum):
    HORS_LIGNE = "HORS_LIGNE"
    DISPONIBLE = "DISPONIBLE"
    EN_COURSE = "EN_COURSE"

class VehiculeEnum(str, enum.Enum):
    MOTO = "MOTO"
    VOITURE = "VOITURE"

class Livreur(Base):
    __tablename__ = "livreurs"

    id_livreur: Mapped[str] = mapped_column(
        String, ForeignKey("utilisateurs.id"), primary_key=True
    )
    type_vehicule: Mapped[VehiculeEnum] = mapped_column(
        Enum(VehiculeEnum), nullable=False
    )
    immatriculation: Mapped[str] = mapped_column(
        String(20), unique=True, nullable=False
    )
    etat_activite: Mapped[EtatActiviteEnum] = mapped_column(
        Enum(EtatActiviteEnum), default=EtatActiviteEnum.HORS_LIGNE, nullable=False
    )
    est_actif: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relations
    utilisateur: Mapped["Utilisateur"] = relationship("Utilisateur")
    commandes: Mapped[list["Commande"]] = relationship("Commande", back_populates="livreur")
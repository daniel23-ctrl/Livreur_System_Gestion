import uuid
from datetime import datetime
from sqlalchemy import String, Enum, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
import enum

# Les rôles possibles
class RoleEnum(str, enum.Enum):
    ADMINISTRATEUR = "ADMINISTRATEUR"
    LIVREUR = "LIVREUR"
    CLIENT = "CLIENT"

class Utilisateur(Base):
    __tablename__ = "utilisateurs"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    nom: Mapped[str] = mapped_column(String(100), nullable=False)
    prenom: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    telephone: Mapped[str | None] = mapped_column(String(8), unique=True, nullable=True)
    mot_de_passe: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[RoleEnum] = mapped_column(Enum(RoleEnum), nullable=False)
    createdAt: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updatedAt: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
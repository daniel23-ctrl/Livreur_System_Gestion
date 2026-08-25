import uuid
import enum
from datetime import datetime
from sqlalchemy import String, Enum, DateTime, ForeignKey, Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class CanalOTP(str, enum.Enum):
    EMAIL = "EMAIL"
    SMS = "SMS"


class ObjectifOTP(str, enum.Enum):
    VERIFICATION_INSCRIPTION = "VERIFICATION_INSCRIPTION"
    REINITIALISATION_MDP = "REINITIALISATION_MDP"


class CodeOTP(Base):
    __tablename__ = "codes_otp"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    utilisateur_id: Mapped[str] = mapped_column(
        String, ForeignKey("utilisateurs.id", ondelete="CASCADE"), nullable=False
    )
    code: Mapped[str] = mapped_column(String(255), nullable=False)  # code HACHÉ (bcrypt), jamais en clair
    canal: Mapped[CanalOTP] = mapped_column(Enum(CanalOTP), nullable=False)
    objectif: Mapped[ObjectifOTP] = mapped_column(Enum(ObjectifOTP), nullable=False)
    expire_le: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    utilise: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    tentatives: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    cree_le: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
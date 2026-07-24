from pydantic import BaseModel, EmailStr
from app.models.utilisateur import RoleEnum

class ClientCreate(BaseModel):
    """Données pour créer un compte client"""
    nom: str
    prenom: str
    email: EmailStr | None = None
    telephone: str | None = None
    mot_de_passe: str

class ClientResponse(BaseModel):
    """Données renvoyées après création client"""
    id: str
    nom: str
    prenom: str
    email: EmailStr | None = None
    telephone: str | None = None
    role: RoleEnum

    class Config:
        from_attributes = True
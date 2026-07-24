from pydantic import BaseModel, EmailStr
from app.models.utilisateur import RoleEnum

class AdminCreate(BaseModel):
    """Données pour créer un compte administrateur"""
    nom: str
    prenom: str
    email: EmailStr
    mot_de_passe: str

class AdminResponse(BaseModel):
    """Données renvoyées après création admin"""
    id: str
    nom: str
    prenom: str
    email: EmailStr
    role: RoleEnum

    class Config:
        from_attributes = True
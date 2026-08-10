from pydantic import BaseModel, EmailStr, Field
from app.models.utilisateur import RoleEnum

class ClientCreate(BaseModel):
    """Données pour créer un compte client"""
    nom: str
    prenom: str
    email: EmailStr | None = None
    telephone: str | None = None
    mot_de_passe: str

class ClientResponse(BaseModel):
    """Données renvoyées après création/lecture client"""
    id_utilisateur: str = Field(validation_alias="id")
    nom: str
    prenom: str 
    email: EmailStr | None = None
    telephone: str | None = None
    role: RoleEnum

    model_config = {"from_attributes": True} 

class ClientUpdate(BaseModel):
    """Données pour mettre à jour un compte client/admin"""
    nom: str | None = None
    prenom: str | None = None
    email: EmailStr | None = None
    telephone: str | None = None
    ancien_mot_de_passe: str | None = None
    nouveau_mot_de_passe: str | None = None
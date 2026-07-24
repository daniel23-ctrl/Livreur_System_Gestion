from pydantic import BaseModel
from app.models.utilisateur import RoleEnum

class LoginSchema(BaseModel):
    """Données reçues lors de la connexion"""
    identifiant: str  # email ou téléphone
    mot_de_passe: str

class TokenSchema(BaseModel):
    """Données renvoyées après connexion réussie"""
    access_token: str
    token_type: str = "bearer"
    role: RoleEnum
    nom: str
    prenom: str


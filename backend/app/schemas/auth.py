from pydantic import BaseModel
from app.models.utilisateur import RoleEnum

class LoginSchema(BaseModel):
    identifiant: str
    mot_de_passe: str

class TokenSchema(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: RoleEnum
    id: str        
    nom: str
    prenom: str
from pydantic import BaseModel, EmailStr
from app.models.utilisateur import RoleEnum
from app.models.livreur import VehiculeEnum, EtatActiviteEnum

class LivreurCreate(BaseModel):
    """Données pour créer un compte livreur"""
    nom: str
    prenom: str
    telephone: str
    email: EmailStr | None = None
    mot_de_passe: str
    type_vehicule: VehiculeEnum
    immatriculation: str

class LivreurResponse(BaseModel):
    """Données renvoyées après création livreur"""
    id: str
    nom: str
    prenom: str
    telephone: str
    email: EmailStr | None = None
    role: RoleEnum
    type_vehicule: VehiculeEnum
    immatriculation: str
    etat_activite: EtatActiviteEnum
    est_actif: bool

    class Config:
        from_attributes = True
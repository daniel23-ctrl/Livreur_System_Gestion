from pydantic import BaseModel, EmailStr
from app.models.utilisateur import RoleEnum
from app.models.livreur import VehiculeEnum, EtatActiviteEnum

class LivreurCreate(BaseModel):
    nom: str
    prenom: str
    telephone: str
    email: EmailStr | None = None
    mot_de_passe: str
    type_vehicule: VehiculeEnum
    immatriculation: str

class LivreurUpdate(BaseModel):
    """Données modifiables d'un livreur"""
    telephone: str | None = None
    email: EmailStr | None = None
    type_vehicule: VehiculeEnum | None = None
    immatriculation: str | None = None

class LivreurEtatUpdate(BaseModel):
    """Changement d'état du livreur"""
    etat_activite: EtatActiviteEnum

class LivreurResponse(BaseModel):
    id: str
    nom: str | None = None
    prenom: str | None = None
    telephone: str | None = None
    email: EmailStr | None = None
    role: RoleEnum | None = None
    type_vehicule: VehiculeEnum
    immatriculation: str
    etat_activite: EtatActiviteEnum
    est_actif: bool

    class Config:
        from_attributes = True
        
class LivreurProfilUpdate(BaseModel):

    """Ce que le livreur peut modifier lui-même"""

    nom: str | None = None
    prenom: str | None = None
    telephone: str | None = None
    email: EmailStr | None = None
    type_vehicule: VehiculeEnum | None = None
    immatriculation: str | None = None


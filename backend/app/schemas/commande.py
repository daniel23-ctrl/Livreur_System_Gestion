from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.commande import StatutCommandeEnum
from app.schemas.livreur import LivreurResponse as LivreurInfo

class ClientResponse(BaseModel):
    id_utilisateur: str
    nom: str
    prenom: str
    email: str | None = None
    telephone: str | None = None

    model_config = ConfigDict(from_attributes=True)


class CommandeCreate(BaseModel):
    description: str
    adresse_ramassage: str
    adresse_livraison: str
    nom_destinataire: str
    telephone_destinataire: str
    telephone_demandeur: str
    instructions: str | None = None
    montant_a_percevoir: float = 0.0


class AssignerLivreurSchema(BaseModel):
    id_livreur: str


class CommandeUpdate(BaseModel):
    description: str | None = None
    adresse_ramassage: str | None = None
    adresse_livraison: str | None = None
    nom_destinataire: str | None = None
    telephone_destinataire: str | None = None
    telephone_demandeur: str | None = None
    instructions: str | None = None
    montant_a_percevoir: float | None = None



class CommandeResponse(BaseModel):
    id_commande: str
    id_client: str | None = None
    client: ClientResponse | None = None  
    id_livreur: str | None = None
    livreur : LivreurInfo | None = None  
    reference: str
    description: str
    adresse_ramassage: str
    adresse_livraison: str
    nom_destinataire: str
    telephone_destinataire: str
    telephone_demandeur: str
    instructions: str | None = None
    montant_a_percevoir: float
    statut_commande: StatutCommandeEnum

    # Dates
    createdAt: datetime | None = None
    updatedAt: datetime | None = None

    # Support Pydantic v2 & v1
    model_config = ConfigDict(from_attributes=True)
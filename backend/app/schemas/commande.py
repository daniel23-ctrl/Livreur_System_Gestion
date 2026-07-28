from pydantic import BaseModel
from app.models.commande import StatutCommandeEnum

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
    id_livreur: str | None = None
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

    class Config:
        from_attributes = True
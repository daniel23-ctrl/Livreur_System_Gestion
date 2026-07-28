from pydantic import BaseModel
from app.models.commande import  StatutCommandeEnum


class CommandeCreate(BaseModel):
    """Données nécessaires pour créer une commande"""
    id_client: str | None = None
    description: str
    adresse_ramassage: str
    adresse_livraison: str
    nom_destinataire: str
    telephone_destinataire: str
    telephone_demandeur: str
    instructions: str | None = None
    montant_a_percevoir: float = 0.0

class CommandeResponse(BaseModel):
    """Réponse après la création d'une commande"""
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

class CommandeUpdate(BaseModel):
    """Données modifiables d'une commande"""
    description: str | None = None
    adresse_ramassage: str | None = None
    adresse_livraison: str | None = None
    nom_destinataire: str | None = None
    telephone_destinataire: str | None = None
    telephone_demandeur: str | None = None
    instructions: str | None = None
    montant_a_percevoir: float | None = None
    statut_commande: StatutCommandeEnum | None = None

from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from app.models.commande import Commande, StatutCommandeEnum
from app.schemas.commande import CommandeResponse, CommandeCreate, CommandeUpdate
import uuid

def generate_reference() -> str:
    """Génère une référence unique pour une commande"""
    ref_prefix = "CMD"
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_suffix = uuid.uuid4().hex[:6].upper()
    return f"{ref_prefix}-{timestamp}-{random_suffix}"

async def creer_commande(db: AsyncSession, data: CommandeCreate) -> CommandeResponse:
    """Crée une nouvelle commande"""
    while True:
        nouvelle_commande = Commande(
            id_client=data.id_client,
            description=data.description,
            # Générer une référence  pour la commande
            reference=generate_reference(),
            adresse_ramassage=data.adresse_ramassage,
            adresse_livraison=data.adresse_livraison,
            nom_destinataire=data.nom_destinataire,
            telephone_destinataire=data.telephone_destinataire,
            telephone_demandeur=data.telephone_demandeur,
            instructions=data.instructions,
            montant_a_percevoir=data.montant_a_percevoir,
            statut_commande=StatutCommandeEnum.EN_ATTENTE
        )
        db.add(nouvelle_commande)
        # Vérifier si l'erreur est due à une référence dupliquée
        try:
            await db.commit()
            await db.refresh(nouvelle_commande)
            break  
        except IntegrityError as e:
            await db.rollback()
            continue  

    return CommandeResponse(
        id_commande=nouvelle_commande.id_commande,
        id_client=nouvelle_commande.id_client,
        reference=nouvelle_commande.reference,  
        description=nouvelle_commande.description,
        adresse_ramassage=nouvelle_commande.adresse_ramassage,
        adresse_livraison=nouvelle_commande.adresse_livraison,
        nom_destinataire=nouvelle_commande.nom_destinataire,
        telephone_destinataire=nouvelle_commande.telephone_destinataire,
        telephone_demandeur=nouvelle_commande.telephone_demandeur,
        instructions=nouvelle_commande.instructions,
        montant_a_percevoir=nouvelle_commande.montant_a_percevoir,
        statut_commande=nouvelle_commande.statut_commande
    )

async def trouver_commande(db: AsyncSession, id_commande: str) -> CommandeResponse | None:
    """Trouve une commande par son id"""
    resultat = await db.execute(
        select(Commande).where(Commande.id_commande == id_commande)
    )
    commande = resultat.scalar_one_or_none()

    if not commande:
        return None
    
    return CommandeResponse(
        id_commande=commande.id_commande,
        id_client=commande.id_client,
        reference=commande.reference,
        description=commande.description,
        adresse_ramassage=commande.adresse_ramassage,
        adresse_livraison=commande.adresse_livraison,
        nom_destinataire=commande.nom_destinataire,
        telephone_destinataire=commande.telephone_destinataire,
        telephone_demandeur=commande.telephone_demandeur,
        instructions=commande.instructions,
        montant_a_percevoir=commande.montant_a_percevoir,
        statut_commande=commande.statut_commande
    )

async def lister_commandes(db: AsyncSession) -> list[CommandeResponse]:
    """Liste toutes les commandes"""
    resultat = await db.execute(select(Commande))
    commandes = resultat.scalars().all()
    
    return [
        CommandeResponse(
            id_commande=c.id_commande,
            id_client=c.id_client,
            reference=c.reference,
            description=c.description,
            adresse_ramassage=c.adresse_ramassage,
            adresse_livraison=c.adresse_livraison,
            nom_destinataire=c.nom_destinataire,
            telephone_destinataire=c.telephone_destinataire,
            telephone_demandeur=c.telephone_demandeur,
            instructions=c.instructions,
            montant_a_percevoir=c.montant_a_percevoir,
            statut_commande=c.statut_commande
        )
        for c in commandes
    ]

async def lister_commandes_par_client(db: AsyncSession, id_client: str) -> list[CommandeResponse]:
    """Liste toutes les commandes d'un client spécifique"""
    resultat = await db.execute(
        select(Commande).where(Commande.id_client == id_client)
    )
    commandes = resultat.scalars().all()
    
    return [
        CommandeResponse(
            id_commande=c.id_commande,
            id_client=c.id_client,
            reference=c.reference,
            description=c.description,
            adresse_ramassage=c.adresse_ramassage,
            adresse_livraison=c.adresse_livraison,
            nom_destinataire=c.nom_destinataire,
            telephone_destinataire=c.telephone_destinataire,
            telephone_demandeur=c.telephone_demandeur,
            instructions=c.instructions,
            montant_a_percevoir=c.montant_a_percevoir,
            statut_commande=c.statut_commande
        )
        for c in commandes
    ]

async def lister_commandes_par_statut(db: AsyncSession, statut: StatutCommandeEnum) -> list[CommandeResponse]:
    """Liste toutes les commandes avec un statut spécifique"""
    resultat = await db.execute(
        select(Commande).where(Commande.statut_commande == statut)
    )
    commandes = resultat.scalars().all()
    
    return [
        CommandeResponse(
            id_commande=c.id_commande,
            id_client=c.id_client,
            reference=c.reference,
            description=c.description,
            adresse_ramassage=c.adresse_ramassage,
            adresse_livraison=c.adresse_livraison,
            nom_destinataire=c.nom_destinataire,
            telephone_destinataire=c.telephone_destinataire,
            telephone_demandeur=c.telephone_demandeur,
            instructions=c.instructions,
            montant_a_percevoir=c.montant_a_percevoir,
            statut_commande=c.statut_commande
        )
        for c in commandes
    ]

async def mettre_a_jour_commande(db: AsyncSession, id_commande: str, data: CommandeUpdate) -> CommandeResponse | None:

    """Met à jour une commande existante"""
    resultat = await db.execute(
        select(Commande).where(Commande.id_commande == id_commande)
    )
    commande = resultat.scalar_one_or_none()

    if not commande:
        return None

    for key, value in data.dict(exclude_unset=True).items():
        setattr(commande, key, value)

    await db.commit()
    await db.refresh(commande)

    return CommandeResponse(
        id_commande=commande.id_commande,
        id_client=commande.id_client,
        reference=commande.reference,
        description=commande.description,
        adresse_ramassage=commande.adresse_ramassage,
        adresse_livraison=commande.adresse_livraison,
        nom_destinataire=commande.nom_destinataire,
        telephone_destinataire=commande.telephone_destinataire,
        telephone_demandeur=commande.telephone_demandeur,
        instructions=commande.instructions,
        montant_a_percevoir=commande.montant_a_percevoir,
        statut_commande=commande.statut_commande
    )

async def mettre_a_jour_statut_commande(db: AsyncSession, id_commande: str, nouveau_statut: StatutCommandeEnum) -> CommandeResponse | None:
    """Met à jour le statut d'une commande existante"""
    resultat = await db.execute(
        select(Commande).where(Commande.id_commande == id_commande)
    )
    commande = resultat.scalar_one_or_none()

    if not commande:
        return None

    commande.statut_commande = nouveau_statut
    await db.commit()
    await db.refresh(commande)

    return CommandeResponse(
        id_commande=commande.id_commande,
        id_client=commande.id_client,
        reference=commande.reference,
        description=commande.description,
        adresse_ramassage=commande.adresse_ramassage,
        adresse_livraison=commande.adresse_livraison,
        nom_destinataire=commande.nom_destinataire,
        telephone_destinataire=commande.telephone_destinataire,
        telephone_demandeur=commande.telephone_demandeur,
        instructions=commande.instructions,
        montant_a_percevoir=commande.montant_a_percevoir,
        statut_commande=commande.statut_commande
    )

async def supprimer_commande(db: AsyncSession, id_commande: str) -> bool:
    """Supprime une commande par son id"""
    resultat = await db.execute(
        select(Commande).where(Commande.id_commande == id_commande)
    )
    commande = resultat.scalar_one_or_none()

    if not commande:
        return False

    await db.delete(commande)
    await db.commit()
    return True


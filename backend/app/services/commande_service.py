from datetime import datetime
import uuid

from app.models.utilisateur import RoleEnum
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.commande import Commande, StatutCommandeEnum
from app.models.livreur import EtatActiviteEnum, Livreur
from app.schemas.client import ClientResponse
from app.schemas.commande import CommandeCreate, CommandeResponse, CommandeUpdate
from app.schemas.livreur import LivreurResponse as LivreurInfo
from app.services.notification_service import envoyer_sms_assignation

# Options d'Eager Loading réutilisables pour toutes les requêtes
LOAD_RELATIONS = [
    selectinload(Commande.client),
    selectinload(Commande.livreur).selectinload(Livreur.utilisateur),
]

# Transitions autorisées et irréversibles
TRANSITIONS_AUTORISEES = {
    StatutCommandeEnum.ASSIGNEE: StatutCommandeEnum.EN_COURS_DE_COLLECTE,
    StatutCommandeEnum.EN_COURS_DE_COLLECTE: StatutCommandeEnum.EN_COURS_DE_LIVRAISON,
    StatutCommandeEnum.EN_COURS_DE_LIVRAISON: StatutCommandeEnum.LIVREE,
}


def generate_reference() -> str:
    """Génère une référence unique pour une commande"""
    ref_prefix = "CMD"
    timestamp = datetime.now().strftime("%Y%m%d")
    random_suffix = uuid.uuid4().hex[:6].upper()
    return f"{ref_prefix}-{timestamp}-{random_suffix}"


async def creer_commande(
    db: AsyncSession, data: CommandeCreate, id_client: str
) -> CommandeResponse:
    """Crée une nouvelle commande — statut initial EN_ATTENTE"""

    if (
        data.adresse_ramassage.strip().lower()
        == data.adresse_livraison.strip().lower()
    ):
        raise ValueError(
            "Les adresses de départ et d'arrivée ne peuvent pas être identiques"
        )

    while True:
        nouvelle_commande = Commande(
            id_client=id_client,
            reference=generate_reference(),
            description=data.description,
            adresse_ramassage=data.adresse_ramassage,
            adresse_livraison=data.adresse_livraison,
            nom_destinataire=data.nom_destinataire,
            telephone_destinataire=data.telephone_destinataire,
            telephone_demandeur=data.telephone_demandeur,
            instructions=data.instructions,
            montant_a_percevoir=data.montant_a_percevoir,
            statut_commande=StatutCommandeEnum.EN_ATTENTE,
        )
        db.add(nouvelle_commande)
        try:
            await db.commit()
            break
        except IntegrityError:
            await db.rollback()
            continue

    # Récupérer la commande avec les relations préchargées
    return await trouver_commande(db, nouvelle_commande.id_commande)  # type: ignore


async def trouver_commande(
    db: AsyncSession, id_commande: str
) -> CommandeResponse | None:
    """Trouve une commande par son id"""
    resultat = await db.execute(
        select(Commande)
        .options(*LOAD_RELATIONS)
        .where(Commande.id_commande == id_commande)
    )
    commande = resultat.scalar_one_or_none()
    if not commande:
        return None
    return convertir_to_response(commande)


async def trouver_commande_par_reference(
    db: AsyncSession, reference: str
) -> CommandeResponse | None:
    """Trouve une commande par sa référence — utilisé pour le suivi client"""
    resultat = await db.execute(
        select(Commande)
        .options(*LOAD_RELATIONS)
        .where(Commande.reference == reference)
    )
    commande = resultat.scalar_one_or_none()
    if not commande:
        return None
    return convertir_to_response(commande)


async def lister_commandes(db: AsyncSession) -> list[CommandeResponse]:
    """Liste toutes les commandes"""
    resultat = await db.execute(select(Commande).options(*LOAD_RELATIONS))
    commandes = resultat.scalars().all()
    return [convertir_to_response(c) for c in commandes]


async def lister_commandes_par_statut(
    db: AsyncSession, statut: StatutCommandeEnum
) -> list[CommandeResponse]:
    """Liste les commandes par statut"""
    resultat = await db.execute(
        select(Commande)
        .options(*LOAD_RELATIONS)
        .where(Commande.statut_commande == statut)
    )
    commandes = resultat.scalars().all()
    return [convertir_to_response(c) for c in commandes]


async def lister_commandes_par_client(
    db: AsyncSession, id_client: str
) -> list[CommandeResponse]:
    """Liste les commandes d'un client"""
    resultat = await db.execute(
        select(Commande)
        .options(*LOAD_RELATIONS)
        .where(Commande.id_client == id_client)
    )
    commandes = resultat.scalars().all()
    return [convertir_to_response(c) for c in commandes]


async def mettre_a_jour_commande(
    db: AsyncSession, id_commande: str, data: CommandeUpdate
) -> CommandeResponse | None:
    """Modifie les informations d'une commande — champs limités"""
    resultat = await db.execute(
        select(Commande)
        .options(*LOAD_RELATIONS)
        .where(Commande.id_commande == id_commande)
    )
    commande = resultat.scalar_one_or_none()
    if not commande:
        return None

    champs_modifiables = [
        "description",
        "adresse_ramassage",
        "adresse_livraison",
        "nom_destinataire",
        "telephone_destinataire",
        "telephone_demandeur",
        "instructions",
        "montant_a_percevoir",
    ]

    for champ in champs_modifiables:
        valeur = getattr(data, champ, None)
        if valeur is not None:
            setattr(commande, champ, valeur)

    await db.commit()
    return await trouver_commande(db, id_commande)


async def mettre_a_jour_statut_commande(
    db: AsyncSession, id_commande: str, nouveau_statut: StatutCommandeEnum
) -> CommandeResponse | None:
    """Met à jour le statut selon la machine à états irréversible — RG-CMD-06"""
    resultat = await db.execute(
        select(Commande)
        .options(*LOAD_RELATIONS)
        .where(Commande.id_commande == id_commande)
    )
    commande = resultat.scalar_one_or_none()
    if not commande:
        return None

    transition_attendue = TRANSITIONS_AUTORISEES.get(commande.statut_commande)
    if nouveau_statut != transition_attendue:
        raise ValueError(
            f"Transition invalide : {commande.statut_commande} → {nouveau_statut}. "
            f"Transition attendue : {commande.statut_commande} → {transition_attendue}"
        )

    commande.statut_commande = nouveau_statut

    if nouveau_statut == StatutCommandeEnum.LIVREE and commande.id_livreur:
        livreur_res = await db.execute(
            select(Livreur).where(Livreur.id_livreur == commande.id_livreur)
        )
        livreur = livreur_res.scalar_one_or_none()
        if livreur:
            livreur.etat_activite = EtatActiviteEnum.DISPONIBLE

    await db.commit()
    return await trouver_commande(db, id_commande)


async def affecter_commande_a_livreur(
    db: AsyncSession, id_commande: str, id_livreur: str
) -> CommandeResponse | None:
    """Affecte une commande à un livreur — transaction atomique — RG-AFF-03"""

    commande_res = await db.execute(
        select(Commande)
        .options(*LOAD_RELATIONS)
        .where(Commande.id_commande == id_commande)
    )
    commande = commande_res.scalar_one_or_none()
    if not commande:
        return None
    if commande.statut_commande != StatutCommandeEnum.EN_ATTENTE:
        raise ValueError("La commande n'est pas en attente")

    livreur_res = await db.execute(
        select(Livreur)
        .where(Livreur.id_livreur == id_livreur)
        .options(selectinload(Livreur.utilisateur))
    )
    livreur = livreur_res.scalar_one_or_none()
    if not livreur:
        raise ValueError("Livreur non trouvé")
    if livreur.etat_activite != EtatActiviteEnum.DISPONIBLE:
        raise ValueError(
            "Ce livreur n'est plus disponible. Veuillez en sélectionner un autre."
        )

    nom_livreur = (
        f"{livreur.utilisateur.prenom} {livreur.utilisateur.nom}".strip()
    )
    telephone_livreur = livreur.utilisateur.telephone

    commande.id_livreur = id_livreur
    commande.statut_commande = StatutCommandeEnum.ASSIGNEE
    livreur.etat_activite = EtatActiviteEnum.EN_COURSE

    await db.commit()

    await envoyer_sms_assignation(
        db,
        id_commande=commande.id_commande,
        telephone_client=commande.telephone_demandeur,
        nom_livreur=nom_livreur,
        telephone_livreur=telephone_livreur,
    )

    return await trouver_commande(db, id_commande)


def convertir_to_response(commande: Commande) -> CommandeResponse:
    client_obj = None
    
    if commande.client:
        client_user = commande.client

        client_obj = ClientResponse(
            id_utilisateur=str(
                getattr(
                    client_user, "id", getattr(client_user, "id_utilisateur", "")
                )
            ),  # <-- 'id_utilisateur' ici
            nom=getattr(client_user, "nom", ""),
            prenom=getattr(client_user, "prenom", ""),
            telephone=getattr(client_user, "telephone", None),
            email=getattr(client_user, "email", None),
            role=getattr(client_user, "role", RoleEnum.CLIENT),
        )

    livreur_obj = None
    if commande.livreur:
        # On récupère la relation utilisateur du livreur
        user = getattr(commande.livreur, "utilisateur", None)
        
        livreur_obj = LivreurInfo(
            id=str(commande.livreur.id_livreur),  
            nom=user.nom if user else "",
            prenom=user.prenom if user else "",
            telephone=user.telephone if user else "",
            email=user.email if user else None,
            role=user.role if user else None,
            type_vehicule=commande.livreur.type_vehicule,
            immatriculation=commande.livreur.immatriculation,
            etat_activite=commande.livreur.etat_activite,
            est_actif=getattr(commande.livreur, "est_actif", True),
        )

    return CommandeResponse(
        id_commande=commande.id_commande,
        id_client=commande.id_client,
        client=client_obj,
        id_livreur=commande.id_livreur,
        livreur=livreur_obj,
        reference=commande.reference,
        description=commande.description,
        adresse_ramassage=commande.adresse_ramassage,
        adresse_livraison=commande.adresse_livraison,
        nom_destinataire=commande.nom_destinataire,
        telephone_destinataire=commande.telephone_destinataire,
        telephone_demandeur=commande.telephone_demandeur,
        instructions=commande.instructions,
        montant_a_percevoir=commande.montant_a_percevoir,
        statut_commande=commande.statut_commande,
        createdAt=commande.createdAt,
        updatedAt=commande.updatedAt,
    )
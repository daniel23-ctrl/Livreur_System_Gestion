from fastapi import APIRouter, Depends, HTTPException, Body, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.livreur import Livreur

from app.schemas.commande import (
    CommandeCreate,
    CommandeResponse,
    CommandeUpdate,
    StatutCommandeEnum, 
    AssignerLivreurSchema,
    StatutUpdatePayload
)
from app.services.commande_service import (
    creer_commande,
    trouver_commande,
    trouver_commande_par_reference,
    lister_commandes,
    affecter_commande_a_livreur,
    lister_commandes_par_statut,
    lister_commandes_par_client,
    mettre_a_jour_commande,
    mettre_a_jour_statut_commande,
    lister_commandes_par_livreur_connecte
)

from app.dependencies import require_admin, require_livreur, require_client, require_client_ou_admin, require_livreur_ou_admin
from app.models.utilisateur import Utilisateur

router = APIRouter(prefix="/api/commandes", tags=["Commandes"])


@router.post("/", response_model=CommandeResponse)
async def nouvelle_commande(
    request: Request,
    data: CommandeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Utilisateur = Depends(require_client_ou_admin)
):
    """Crée une nouvelle commande"""
    try:
        commande = await creer_commande(db, data, current_user.id)
        
        # Récupérer le nom du client (soit via current_user, soit via la relation commande.client)
        nom_client_str = f"{current_user.prenom} {current_user.nom}" if hasattr(current_user, "prenom") else "Client"
        
        # Diffusion WebSocket : Nouvelle commande créée avec le nom du client
        ws_manager = request.app.state.ws_manager
        await ws_manager.broadcast("commandeCreated", {
            "id": commande.id_commande,
            "reference": commande.reference,
            "nom_client": nom_client_str
        })
        
        return commande
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=list[CommandeResponse])
async def liste_commandes_par_client(db: AsyncSession = Depends(get_db), current_user: Utilisateur = Depends(require_client_ou_admin)):
    """Liste toutes les commandes d'un client — Client et administrateur uniquement"""
    return await lister_commandes_par_client(db, current_user.id)


@router.get("/all", response_model=list[CommandeResponse])
async def liste_commandes(db: AsyncSession = Depends(get_db), current_user: Utilisateur = Depends(require_admin)):
    """Liste toutes les commandes — Admin uniquement"""
    return await lister_commandes(db)
    

@router.get("/livreur", response_model=list[CommandeResponse])
async def mes_commandes_livreur(
    db: AsyncSession = Depends(get_db), 
    current_user: Utilisateur = Depends(require_livreur)
):
    """Liste les commandes assignées au livreur connecté"""
    return await lister_commandes_par_livreur_connecte(db, current_user.id)


@router.get("/{id_commande}", response_model=CommandeResponse)
async def detail_commande(id_commande: str, db: AsyncSession = Depends(get_db), current_user: Utilisateur = Depends(require_client)):
    """Détail d'une commande — Client uniquement"""
    commande = await trouver_commande(db, id_commande)
    if not commande:
        raise HTTPException(status_code=404, detail="Commande non trouvée")
    if commande.id_client != current_user.id:
        raise HTTPException(status_code=403, detail="Accès refusé à cette commande")
    return commande


@router.get("/reference/{reference}", response_model=CommandeResponse)
async def detail_commande_par_reference(reference: str, db: AsyncSession = Depends(get_db), current_user: Utilisateur = Depends(require_client)):
    """Détail d'une commande par sa référence — Client uniquement"""
    commande = await trouver_commande_par_reference(db, reference)
    if not commande:
        raise HTTPException(status_code=404, detail="Commande non trouvée")
    if commande.id_client != current_user.id:
        raise HTTPException(status_code=403, detail="Accès refusé à cette commande")
    return commande


@router.get("/statut/{statut}", response_model=list[CommandeResponse])
async def liste_commandes_par_statut(statut: StatutCommandeEnum, db: AsyncSession = Depends(get_db), current_user: Utilisateur = Depends(require_admin)):
    """Liste les commandes par statut — Admin uniquement"""
    return await lister_commandes_par_statut(db, statut)

@router.put("/{id_commande}", response_model=CommandeResponse)
async def update_commande(
    request: Request,
    id_commande: str, 
    data: CommandeUpdate, 
    db: AsyncSession = Depends(get_db), 
    current_user: Utilisateur = Depends(require_client)
):
    """Modifie les informations d'une commande — Client uniquement"""
    commande = await mettre_a_jour_commande(db, id_commande, data)
    if not commande:
        raise HTTPException(status_code=404, detail="Commande non trouvée")
    if commande.id_client != current_user.id:
        raise HTTPException(status_code=403, detail="Accès refusé à cette commande")
    
    # Récupérer uniquement les champs qui ont été modifiés (on exclut les valeurs None)
    # data.dict(exclude_unset=True) permet de n'avoir que les champs explicitement envoyés par le client
    changes = data.dict(exclude_unset=True)

    # Diffusion WebSocket : Commande modifiée avec les détails des changements
    ws_manager = request.app.state.ws_manager
    await ws_manager.broadcast("commandeUpdated", {
        "id": commande.id_commande,
        "reference": commande.reference,
        "changes": changes  
    })
    
    return commande


@router.patch("/{id_commande}/statut", response_model=CommandeResponse)
async def update_statut_commande(
    request: Request,
    id_commande: str, 
    payload: StatutUpdatePayload, # On récupère le statut via un body JSON propre
    db: AsyncSession = Depends(get_db), 
    current_user: Utilisateur = Depends(require_livreur_ou_admin)
):
    """Modifie le statut d'une commande — Admin et Livreur uniquement"""
    
    # On passe payload.nouveau_statut à votre fonction de service
    commande = await mettre_a_jour_statut_commande(db, id_commande, payload.nouveau_statut)
    if not commande:
        raise HTTPException(status_code=404, detail="Commande non trouvée")
    
    statuts_cibles = ["EN_COURS_DE_COLLECTE", "EN_COURS_DE_LIVRAISON", "LIVREE", "ANNULEE"]
    
    ws_data = {
        "id": commande.id_commande,
        "reference": commande.reference
    }
    
    if commande.statut_commande in statuts_cibles:
        ws_data["statut_nouveau"] = commande.statut_commande

    # Diffusion WebSocket : Statut changé
    ws_manager = request.app.state.ws_manager
    await ws_manager.broadcast("commandeEtatUpdated", ws_data)
    
    return commande

@router.patch("/{id_commande}/livreur", response_model=CommandeResponse | None)
async def assigner_livreur_commande(
    request: Request,
    id_commande: str,
    data: AssignerLivreurSchema = Body(...),  
    db: AsyncSession = Depends(get_db),
    current_user: Utilisateur = Depends(require_admin)
):
    try:
        commande = await affecter_commande_a_livreur(db, id_commande, data.id_livreur)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not commande:
        raise HTTPException(status_code=404, detail="Commande non trouvée")
    
    # Récupération sécurisée du nom du livreur si la relation est chargée
    nom_livreur_str = "un livreur"
    if hasattr(commande, "livreur") and commande.livreur:
        nom_livreur_str = f"{commande.livreur.prenom} {commande.livreur.nom}"

    # Diffusion WebSocket : Livreur assigné
    ws_manager = request.app.state.ws_manager
    await ws_manager.broadcast("commandeAssigned", {
        "id": commande.id_commande,
        "reference": commande.reference,
        "nom_livreur": nom_livreur_str
    })
    
    return commande


@router.get("/suivi/{reference}", response_model=CommandeResponse)
async def suivi_public(reference: str, db: AsyncSession = Depends(get_db)):
    """Suivi public sans authentification"""
    commande = await trouver_commande_par_reference(db, reference)
    if not commande:
        raise HTTPException(status_code=404, detail="Commande non trouvée")
    return commande
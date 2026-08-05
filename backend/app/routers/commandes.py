from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db

from app.schemas.commande import (
    CommandeCreate,
    CommandeResponse,
    CommandeUpdate,
    StatutCommandeEnum, 
    AssignerLivreurSchema
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
    mettre_a_jour_statut_commande
    
)

from app.dependencies import require_admin, require_livreur , require_client, get_current_user, require_client_ou_admin, require_livreur_ou_admin
from app.models.utilisateur import Utilisateur

router = APIRouter(prefix="/api/commandes", tags=["Commandes"])




@router.post("/", response_model=CommandeResponse)
async def nouvelle_commande(
    data: CommandeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Utilisateur = Depends(require_client_ou_admin)
):
    """Crée une nouvelle commande"""
    try:
        return await creer_commande(db, data, current_user.id) 
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
async def update_commande(id_commande: str, data: CommandeUpdate, db: AsyncSession = Depends(get_db), current_user: Utilisateur = Depends(require_client)):
    """Modifie les informations d'une commande — Client uniquement"""
    commande = await mettre_a_jour_commande(db, id_commande, data)
    if not commande:
        raise HTTPException(status_code=404, detail="Commande non trouvée")
    if commande.id_client != current_user.id:
        raise HTTPException(status_code=403, detail="Accès refusé à cette commande")
    return commande

@router.patch("/statut", response_model=CommandeResponse)
async def update_statut_commande(id_commande: str, statut: StatutCommandeEnum, db: AsyncSession = Depends(get_db), current_user: Utilisateur = Depends(require_livreur_ou_admin)):
    """Modifie le statut d'une commande — Admin et Livreur uniquement"""
    commande = await mettre_a_jour_statut_commande(db, id_commande, statut)
    if not commande:
        raise HTTPException(status_code=404, detail="Commande non trouvée")
    return commande

@router.patch("/{id_commande}/livreur", response_model=CommandeResponse | None)
async def assigner_livreur_commande(
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
    


@router.get("/suivi/{reference}", response_model=CommandeResponse)
async def suivi_public(reference: str, db: AsyncSession = Depends(get_db)):
    """Suivi public sans authentification"""
    commande = await trouver_commande_par_reference(db, reference)
    if not commande:
        raise HTTPException(status_code=404, detail="Commande non trouvée")
    return commande
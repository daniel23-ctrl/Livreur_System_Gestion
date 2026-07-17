

# Création de la connexion à la base de données
engine = create_async_engine(settings.DATABASE_URL, echo=True)

# Création de la session
AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Classe de base pour tous les modèles
class Base(DeclarativeBase):
    pass

# Fonction qui fournit une session à chaque requête
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

Ce que ça fait ligne par ligne
create_async_engine
C'est le moteur qui établit la connexion entre Python et PostgreSQL. On lui passe l'URL de la base depuis le .env. Le echo=True affiche dans le terminal toutes les requêtes SQL exécutées — utile pour déboguer.
AsyncSessionLocal
C'est une fabrique de sessions. Une session c'est comme une conversation temporaire avec la base de données — on ouvre, on fait des opérations, on ferme.
class Base
C'est la classe mère dont vont hériter tous nos modèles (tables). SQLAlchemy en a besoin pour savoir quelles tables gérer.
async def get_db()
C'est une fonction spéciale appelée une dépendance en FastAPI. À chaque requête HTTP, FastAPI l'appelle automatiquement pour ouvrir une session, faire le travail, puis la fermer proprement.
try / rollback / commit

Si tout se passe bien → commit (on sauvegarde les changements)
Si une erreur arrive → rollback (on annule tout pour garder la base cohérente)


Crée le fichier et dis-moi si une partie n'est pas claire.yield veur dire quoi ?Très bonne question !

yield en Python simple
Normalement une fonction avec return donne une valeur et s'arrête définitivement.
yield lui, donne une valeur mais met la fonction en pause — elle peut reprendre plus tard.

Analogie simple
Imagine un serveur au restaurant :
return → le serveur t'apporte le plat et repart en cuisine pour toujours
yield  → le serveur t'apporte le plat, RESTE près de ta table,
         et revient débarrasser quand tu as fini

Dans notre code concrètement
pythonasync def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session      # ← donne la session à la route FastAPI
                               #   et attend que la route finisse son travail
            await session.commit()   # ← reprend ici après la route
        except Exception:
            await session.rollback()
Ce qui se passe étape par étape :

FastAPI appelle get_db()
Une session est créée
yield session → la session est donnée à la route qui en a besoin
La route fait son travail (lire, écrire en base)
La fonction reprend après le yield
Si tout va bien → commit (sauvegarde)
Si erreur → rollback (annulation)
Session fermée


Sans yield ce serait impossible
Car on a besoin que la session reste ouverte pendant toute la durée de la requête, puis se ferme proprement après. return ne permettrait pas ça.
C'est clair pour toi ?fais une documentation de ce que on vient de faire puis je vais mettre dans un fichier ConnexionDB.mdVoici la documentation complète :

Connexion à la Base de Données — Documentation Technique
1. Vue d'ensemble
La connexion entre FastAPI et PostgreSQL repose sur deux fichiers distincts aux responsabilités séparées :
FichierRôleapp/core/config.pyLecture et centralisation des variables d'environnementapp/core/database.pyCréation du moteur de connexion et gestion des sessions

2. Variables d'environnement (.env)
envDATABASE_URL="postgresql+asyncpg://postgres:danny@2026_PostGreSQL@localhost:5432/Gestion_Livreur"
SECRET_KEY="bf3097b4dceaed6c30ae9727c9e6bf968ef6a4af2f55f9a98fa61c4818e74607"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=480
Explication de la DATABASE_URL
postgresql+asyncpg :// postgres : motdepasse @ localhost : 5432 / Gestion_Livreur
│              │        │           │              │          │     │
│              │        │           │              │          │     └─ Nom de la base
│              │        │           │              │          └─ Port PostgreSQL
│              │        │           │              └─ Adresse du serveur
│              │        │           └─ Mot de passe
│              │        └─ Nom d'utilisateur PostgreSQL
│              └─ Driver asynchrone utilisé par SQLAlchemy
└─ Type de base de données

3. Fichier app/core/config.py
pythonfrom pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    class Config:
        env_file = ".env"

settings = Settings()
Rôle de chaque élément
ÉlémentRôleBaseSettingsClasse Pydantic qui lit automatiquement le fichier .envDATABASE_URL: strURL de connexion à PostgreSQL — obligatoireSECRET_KEY: strClé de signature des tokens JWT — obligatoireALGORITHM: strAlgorithme de chiffrement JWT — valeur par défaut HS256ACCESS_TOKEN_EXPIRE_MINUTES: intDurée de vie du token JWT en minutes — 480 = 8 heuresclass ConfigIndique à Pydantic où se trouve le fichier .envsettings = Settings()Instance unique importable partout dans le projet

4. Fichier app/core/database.py
pythonfrom sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from app.core.config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=True)

AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
Rôle de chaque élément
ÉlémentRôlecreate_async_engineCrée le moteur de connexion asynchrone à PostgreSQLecho=TrueAffiche toutes les requêtes SQL dans le terminal (utile en développement)AsyncSessionLocalFabrique de sessions — crée une nouvelle session à chaque appelexpire_on_commit=FalseLes objets restent accessibles après un commit sans recharger la baseclass BaseClasse mère dont héritent tous les modèles SQLAlchemy (tables)get_db()Dépendance FastAPI — ouvre une session, la fournit à la route, puis la ferme
Cycle de vie d'une session
Requête HTTP arrive
        │
        ▼
get_db() appelé automatiquement par FastAPI
        │
        ▼
Session ouverte ──────────────────────────────┐
        │                                      │
        ▼                                      │
yield session → donnée à la route             │
        │                                      │
        ▼                                      │
Route fait son travail (lecture/écriture)     │
        │                                      │
        ▼                                      │
Succès ? ──── OUI ──► commit (sauvegarde)     │
        │                                      │
        └──── NON ──► rollback (annulation)    │
                              │                │
                              ▼                │
                    Session fermée ────────────┘

5. Concepts clés à retenir
Asynchrone (async/await)
FastAPI est un framework asynchrone. Cela signifie qu'il peut traiter plusieurs requêtes en même temps sans bloquer. C'est pourquoi on utilise AsyncSession et create_async_engine plutôt que leurs équivalents synchrones.
yield vs return
yield met la fonction en pause après avoir fourni la session à la route. La fonction reprend après que la route a terminé son travail pour effectuer le commit ou le rollback. return aurait fermé la session immédiatement, avant que la route puisse l'utiliser.
Injection de dépendances
get_db() est une dépendance FastAPI. Au lieu d'ouvrir manuellement une session dans chaque route, FastAPI l'injecte automatiquement grâce au mot-clé Depends que l'on utilisera plus tard.

6. Utilisation dans une route FastAPI
Voici comment cette configuration sera utilisée dans les routes :
pythonfrom fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db

router = APIRouter()

@router.get("/exemple")
async def exemple(db: AsyncSession = Depends(get_db)):
    # db est la session fournie automatiquement par get_db()
    # on peut maintenant faire des requêtes à la base
    pass

Copie tout ça dans ton fichier ConnexionDB.md. On passe aux modèles SQLAlchemy ?non pas un truc long comme ça juste l'explicationConnexion à la Base de Données
Fichiers créés

app/core/config.py — lit le fichier .env et rend les variables accessibles partout dans le projet via settings.
app/core/database.py — crée la connexion à PostgreSQL et fournit une session à chaque requête via la fonction get_db().

Concepts clés
engine — le moteur qui établit la connexion entre Python et PostgreSQL.
session — une conversation temporaire avec la base de données. On ouvre, on travaille, on ferme.
yield — met la fonction en pause après avoir fourni la session à la route. Elle reprend après pour faire le commit ou le rollback.
commit — sauvegarde les changements en base si tout s'est bien passé.
rollback — annule tout si une erreur survient pour garder la base cohérente.
Depends(get_db) — mot clé FastAPI qui injecte automatiquement la session dans chaque route sans l'ouvrir manuellement.
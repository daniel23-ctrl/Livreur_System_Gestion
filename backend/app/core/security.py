from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

# Outil de hachage des mots de passe
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hacher_mot_de_passe(mot_de_passe: str) -> str:
    """Transforme un mot de passe en clair en mot de passe haché"""
    return pwd_context.hash(mot_de_passe)

def verifier_mot_de_passe(mot_de_passe_clair: str, mot_de_passe_hache: str) -> bool:
    """Compare un mot de passe en clair avec le haché stocké en base"""
    return pwd_context.verify(mot_de_passe_clair, mot_de_passe_hache)

def creer_token(data: dict) -> str:
    """Génère un token JWT avec une durée de vie de 8 heures"""
    donnees = data.copy()
    expiration = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    donnees.update({"exp": expiration})
    return jwt.encode(donnees, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decoder_token(token: str) -> dict:
    """Décode et vérifie un token JWT"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None
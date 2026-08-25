from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.codes_otp import CodeOTP, CanalOTP, ObjectifOTP
from app.models.utilisateur import Utilisateur
from app.core.security import generer_code_otp, hacher_otp, verifier_otp_hash
from app.services.sms_service import envoyer_sms

DUREE_EXPIRATION_MINUTES = 10
MAX_TENTATIVES = 5


async def generer_et_envoyer_otp(db: AsyncSession, utilisateur: Utilisateur) -> None:
    """Génère un code OTP, l'enregistre en base (haché) et l'envoie par SMS."""
    code_clair = generer_code_otp()

    nouveau_otp = CodeOTP(
        utilisateur_id=utilisateur.id,
        code=hacher_otp(code_clair),
        canal=CanalOTP.SMS,
        objectif=ObjectifOTP.VERIFICATION_INSCRIPTION,
        expire_le=datetime.utcnow() + timedelta(minutes=DUREE_EXPIRATION_MINUTES),
    )
    db.add(nouveau_otp)
    await db.commit()

    envoyer_sms(
        utilisateur.telephone,
        f"Votre code de vérification KUSI est : {code_clair}. Il expire dans {DUREE_EXPIRATION_MINUTES} minutes."
    )


async def verifier_code_otp(db: AsyncSession, utilisateur_id: str, code_saisi: str) -> bool:
    """Vérifie le code OTP le plus récent non utilisé pour cet utilisateur."""
    resultat = await db.execute(
        select(CodeOTP)
        .where(
            CodeOTP.utilisateur_id == utilisateur_id,
            CodeOTP.utilise == False,
            CodeOTP.objectif == ObjectifOTP.VERIFICATION_INSCRIPTION,
        )
        .order_by(CodeOTP.cree_le.desc())
    )
    otp = resultat.scalars().first()

    if otp is None:
        raise ValueError("Aucun code OTP en attente pour cet utilisateur.")

    if otp.tentatives >= MAX_TENTATIVES:
        raise ValueError("Nombre maximal de tentatives atteint. Demandez un nouveau code.")

    if otp.expire_le < datetime.utcnow():
        raise ValueError("Le code a expiré. Demandez un nouveau code.")

    if not verifier_otp_hash(code_saisi, otp.code):
        otp.tentatives += 1
        await db.commit()
        raise ValueError("Code incorrect.")

    otp.utilise = True
    await db.execute(
        select(Utilisateur).where(Utilisateur.id == utilisateur_id)
    )
    utilisateur = await db.get(Utilisateur, utilisateur_id)
    utilisateur.telephone_verifie = True

    await db.commit()
    return True
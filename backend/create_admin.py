import asyncio
from app.core.database import AsyncSessionLocal
from app.services.admin_service import creer_admin
from app.schemas.admin import AdminCreate

async def main():
    async with AsyncSessionLocal() as db:
        admin = await creer_admin(db, AdminCreate(
            nom="Agbegbo",
            prenom="Jacques",
            email="admin@kauza.com",
            mot_de_passe="Admin@2026"
        ))
        print(f"Admin créé : {admin.nom} {admin.prenom} — {admin.email}")

asyncio.run(main())
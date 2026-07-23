from fastapi import FastAPI
from app.routers import auth, livreurs

app = FastAPI(
    title="Système de Gestion de Livreurs",
    description="API REST pour la gestion et supervision de livreurs",
    version="1.0.0"
)

app.include_router(auth.router)
app.include_router(livreurs.router)

@app.get("/")
async def root():
    return {"message": "API opérationnelle", "status": "ok"}
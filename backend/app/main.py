from fastapi import FastAPI
from app.routers import auth, livreurs, commandes, notifications
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI(
    title="Système de Gestion de Livreurs",
    description="API REST pour la gestion et supervision de livreurs",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(livreurs.router)
app.include_router(commandes.router)
app.include_router(notifications.router)

@app.get("/")
async def root():
    return {"message": "API opérationnelle", "status": "ok"}
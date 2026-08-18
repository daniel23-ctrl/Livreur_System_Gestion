from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from app.routers import auth, livreurs, commandes, notifications, admins, clients

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

# GESTIONNAIRE DE WEBSOCKETS

# GESTIONNAIRE DE WEBSOCKETS

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, event_name: str, data: dict = None):
        message = {"event": event_name, "data": data or {}}
        
        # Copier la liste des connexions pour éviter de modifier la liste 
        # pendant qu'on l'itère en cas de suppression
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"Erreur d'envoi WebSocket, suppression de la connexion : {e}")
                if connection in self.active_connections:
                    self.active_connections.remove(connection)
                    
                    

manager = ConnectionManager()

# Point de terminaison WebSocket global

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Garde la connexion ouverte en attendant les messages du client
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Rendre le manager accessible globalement 
app.state.ws_manager = manager

# ROUTERS EXISTANTS

app.include_router(auth.router)
app.include_router(admins.router)
app.include_router(livreurs.router)
app.include_router(commandes.router)
app.include_router(notifications.router)
app.include_router(clients.router)

@app.get("/")
async def root():
    return {"message": "API opérationnelle", "status": "ok"}
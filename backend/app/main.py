from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
from sqlalchemy import select
from app.routers import auth, livreurs, commandes, notifications, admins, clients
import asyncio
from app.models.livreur import EtatActiviteEnum, Livreur
from app.core.database import AsyncSessionLocal
from app.core.security import decoder_token


app = FastAPI(
    title="Système de Gestion de Livreurs",
    description="API REST pour la gestion et supervision de livreurs",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GESTIONNAIRE DE WEBSOCKETS


DELAI_GRACE_SECONDES = 3       # absorbe juste un F5, pas plus
INTERVALLE_PING_SECONDES = 10  # fréquence du heartbeat
TIMEOUT_PONG_SECONDES = 5      # si pas de réponse dans ce délai après un ping -> mort


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.user_connections: Dict[str, List[WebSocket]] = {}
        self.pending_disconnect_tasks: Dict[str, asyncio.Task] = {}

    async def connect(self, websocket: WebSocket, user_id: str | None = None, role: str | None = None):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"✅ CONNEXION — user_id={user_id}, role={role}")

        if user_id:
            self.user_connections.setdefault(user_id, []).append(websocket)
            print(f"   Connexions actives pour {user_id}: {len(self.user_connections[user_id])}")

            task = self.pending_disconnect_tasks.pop(user_id, None)
            if task and not task.done():
                task.cancel()
                print(f"   ⏹️ Tâche de déconnexion annulée pour {user_id}")

        if role == "LIVREUR":
            await self._mettre_a_jour_etat_livreur(user_id, EtatActiviteEnum.DISPONIBLE)

    def disconnect(self, websocket: WebSocket, user_id: str | None = None, role: str | None = None):
        print(f"❌ DÉCONNEXION appelée — user_id={user_id}, role={role}")
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

        if user_id and user_id in self.user_connections:
            if websocket in self.user_connections[user_id]:
                self.user_connections[user_id].remove(websocket)

            print(f"   Connexions restantes pour {user_id}: {len(self.user_connections.get(user_id, []))}")

            if not self.user_connections[user_id]:
                del self.user_connections[user_id]
                if role == "LIVREUR":
                    print(f"   ⏳ Programmation HORS_LIGNE dans {DELAI_GRACE_SECONDES}s pour {user_id}")
                    task = asyncio.create_task(self._programmer_hors_ligne(user_id))
                    self.pending_disconnect_tasks[user_id] = task

    async def _programmer_hors_ligne(self, user_id: str):
        try:
            await asyncio.sleep(DELAI_GRACE_SECONDES)
            print(f"⏰ Délai de grâce écoulé pour {user_id} — reconnecté ? {user_id in self.user_connections}")
            if user_id not in self.user_connections:
                print(f"🔴 Passage HORS_LIGNE pour {user_id}")
                await self._mettre_a_jour_etat_livreur(user_id, EtatActiviteEnum.HORS_LIGNE)
        except asyncio.CancelledError:
            print(f"↩️ Tâche annulée pour {user_id} (reconnexion détectée)")
        finally:
            self.pending_disconnect_tasks.pop(user_id, None)

    async def _mettre_a_jour_etat_livreur(self, id_livreur: str, nouvel_etat: EtatActiviteEnum):
        async with AsyncSessionLocal() as db:
            resultat = await db.execute(select(Livreur).where(Livreur.id_livreur == id_livreur))
            livreur = resultat.scalar_one_or_none()
            if not livreur or livreur.etat_activite == nouvel_etat:
                return
            livreur.etat_activite = nouvel_etat
            await db.commit()

        await self.broadcast("livreurEtatUpdated", {"id_livreur": id_livreur, "etat_activite": nouvel_etat.value})

    async def broadcast(self, event_name: str, data: dict = None):
        message = {"event": event_name, "data": data or {}}
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                if connection in self.active_connections:
                    self.active_connections.remove(connection)


manager = ConnectionManager()


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str | None = Query(default=None)):
    user_id = None
    role = None

    if token:
        payload = decoder_token(token)
        if payload:
            user_id = payload.get("sub")
            role = payload.get("role")

    await manager.connect(websocket, user_id=user_id, role=role)

    async def envoyer_pings():
        """Envoie un ping régulier ; si le client ne répond pas assez vite, on ferme nous-même la connexion"""
        try:
            while True:
                await asyncio.sleep(INTERVALLE_PING_SECONDES)
                try:
                    await asyncio.wait_for(
                        websocket.send_json({"event": "ping", "data": {}}),
                        timeout=TIMEOUT_PONG_SECONDES,
                    )
                except (asyncio.TimeoutError, Exception):
                    await websocket.close()
                    break
        except asyncio.CancelledError:
            pass

    ping_task = asyncio.create_task(envoyer_pings())

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        ping_task.cancel()
        manager.disconnect(websocket, user_id=user_id, role=role)

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
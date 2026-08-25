from fastapi import WebSocket, WebSocketDisconnect
import asyncio
from typing import Dict, List

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.livreur import EtatActiviteEnum, Livreur

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

        if user_id:
            self.user_connections.setdefault(user_id, []).append(websocket)

            task = self.pending_disconnect_tasks.pop(user_id, None)
            if task and not task.done():
                task.cancel()

            if role == "LIVREUR":
                await self._mettre_a_jour_etat_livreur(user_id, EtatActiviteEnum.DISPONIBLE)

    def disconnect(self, websocket: WebSocket, user_id: str | None = None, role: str | None = None):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

        if user_id and user_id in self.user_connections:
            if websocket in self.user_connections[user_id]:
                self.user_connections[user_id].remove(websocket)

            if not self.user_connections[user_id]:
                del self.user_connections[user_id]
                if role == "LIVREUR":
                    task = asyncio.create_task(self._programmer_hors_ligne(user_id))
                    self.pending_disconnect_tasks[user_id] = task

    async def _programmer_hors_ligne(self, user_id: str):
        try:
            await asyncio.sleep(DELAI_GRACE_SECONDES)
            if user_id not in self.user_connections:
                await self._mettre_a_jour_etat_livreur(user_id, EtatActiviteEnum.HORS_LIGNE)
        except asyncio.CancelledError:
            pass
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



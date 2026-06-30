from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Dict, Set
from app.auth.jwt import decode_access_token
import json
import asyncio

router = APIRouter()


class ConnectionManager:
    """Manages WebSocket connections per project."""

    def __init__(self):
        # project_id -> set of WebSocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, project_id: str):
        await websocket.accept()
        if project_id not in self.active_connections:
            self.active_connections[project_id] = set()
        self.active_connections[project_id].add(websocket)

    def disconnect(self, websocket: WebSocket, project_id: str):
        if project_id in self.active_connections:
            self.active_connections[project_id].discard(websocket)
            if not self.active_connections[project_id]:
                del self.active_connections[project_id]

    async def send_progress(self, project_id: str, message: dict):
        """Send a progress update to all connections for a project."""
        if project_id not in self.active_connections:
            return
        dead_connections = set()
        for ws in self.active_connections[project_id]:
            try:
                await ws.send_json(message)
            except Exception:
                dead_connections.add(ws)

        # Clean up dead connections
        for ws in dead_connections:
            self.active_connections[project_id].discard(ws)
        if project_id in self.active_connections and not self.active_connections[project_id]:
            del self.active_connections[project_id]


manager = ConnectionManager()


@router.websocket("/{project_id}/ws")
async def project_websocket(websocket: WebSocket, project_id: str):
    """WebSocket endpoint for real-time generation progress."""
    # Verify token via query param
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4001)
        return

    payload = decode_access_token(token)
    if not payload:
        await websocket.close(code=4001)
        return

    await manager.connect(websocket, project_id)
    try:
        # Keep connection alive
        while True:
            data = await websocket.receive_text()
            # Client can send ping to keep alive
            if data == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        manager.disconnect(websocket, project_id)
    except Exception:
        manager.disconnect(websocket, project_id)


async def broadcast_progress(project_id: str, step: str, status: str, **kwargs):
    """Utility to broadcast generation progress."""
    message = {
        "step": step,
        "status": status,
        **kwargs,
    }
    await manager.send_progress(project_id, message)

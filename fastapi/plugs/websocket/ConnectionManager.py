from business.services.loggerInteface import ILogger
from fastapi import WebSocket
import json

class ConnectionModel:
    board_id: str
    socket: WebSocket
    def __init__(self, board_id: str, socket: WebSocket):
        self.board_id = board_id
        self.socket = socket

class ConnectionManager:
    logger: ILogger
    def __init__(self, logger: ILogger):
        self.active_connections: list[ConnectionModel] = []
        self.logger = logger

    async def connect(self, board_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(ConnectionModel(board_id, websocket))
        self._connection_count()
        await self.update_participations_count(board_id)

    async def update_participations_count(self, board_id: str):
        all_connections_same_board = list(filter(lambda x: x.board_id == board_id, self.active_connections))
        message_object = {
            "type": "PARTICIPANTS_COUNT_UPDATE",
            "data": len(all_connections_same_board)
        }
        json_string = json.dumps(message_object)
        for connection in all_connections_same_board:
            await connection.socket.send_text(json_string)

    def disconnect(self, websocket: WebSocket):
        self.active_connections = list(filter(lambda x: x.socket != websocket, self.active_connections))
        self._connection_count()

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.socket.send_text(message)

    async def to_board_users(self, board_id: str, message: str, currentUser: WebSocket):
        for connection in filter(lambda x: x.board_id == board_id and x.socket != currentUser, self.active_connections):
            await connection.socket.send_text(message)
    def _connection_count(self):
        self.logger.log(f"{len(self.active_connections)} connections left!")
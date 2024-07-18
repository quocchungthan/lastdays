
from functools import lru_cache
from business.services.readDrawingServiceInterface import IReadDrawingService
from fastapi import Depends
from business.services.loggerInteface import ILogger
from configurations.env import Env
from plugs.consoleloggers.consolestream import ConsoleLogger
from plugs.implementations.readDrawingService import ReadDrawingService
from plugs.notion.queryOnTableService import QueryOnTableService
from plugs.openai.chatCompeleteService import ChatCompeleteService
from plugs.websocket.ConnectionManager import ConnectionManager

@lru_cache
def get_settings():
    return Env()

@lru_cache
def get_logger() -> ILogger:
    return ConsoleLogger()

@lru_cache
def get_chat_complete(settings: Env = Depends(get_settings), logger: ILogger = Depends(get_logger)) -> ChatCompeleteService:
    return ChatCompeleteService(logger, settings.OPENAI_API_KEY)

@lru_cache
def get_notion_client(settings: Env = Depends(get_settings), logger: ILogger = Depends(get_logger)) -> QueryOnTableService:
    return QueryOnTableService(logger, settings.NOTION_TOKEN_V2, settings.NOTION_WORKSPACE_ID, settings.NOTION_TABLE_ID)

@lru_cache
def get_read_drawing_service(chatCompelete: ChatCompeleteService = Depends(get_chat_complete)) -> IReadDrawingService:
    return ReadDrawingService(chatCompelete)

# Singleton
manager: ConnectionManager = None

@lru_cache
def get_connection_manager(logger: ILogger = Depends(get_logger)) -> ConnectionManager:
    global manager
    if (manager is None):
        manager = ConnectionManager(logger)
    return manager
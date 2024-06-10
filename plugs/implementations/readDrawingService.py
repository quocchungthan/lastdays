from typing import Any
from business.services.readDrawingServiceInterface import IReadDrawingService
from plugs.openai.chatCompeleteService import ChatCompeleteService

class ReadDrawingService(IReadDrawingService):
    def __init__(self, chatCompleteService: ChatCompeleteService) -> None:
        self._chatCompleteService = chatCompleteService

    def describeWhatUserDrawn(self, drawingJson: str, contextJson: str = None):
        return ""
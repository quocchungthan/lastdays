import logging
from typing import Any
from business.services.loggerInteface import ILogger

class ConsoleLogger(ILogger):
    def __init__(self) -> None:
        logging.basicConfig(
            format="%(asctime)s | %(name)s %(levelname)s: %(message)s", level=logging.INFO
        )
        self._logger = logging.getLogger(__name__)

    def log(self, content: Any):
        self._logger.info(content)
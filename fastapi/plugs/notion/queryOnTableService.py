from business.services.loggerInteface import ILogger

class QueryOnTableService:
    def __init__(self, logger: ILogger, notionTokenV2: str, notionWorkspaceId: str, notionTableId: str):
        self._logger = logger
        self._notionTokenV2 = notionTokenV2
        self._notionWorkspaceId = notionWorkspaceId
        self._notionTableId = notionTableId

    def configCheck(self):
        self._logger.log('Service initiated with configuration:')
        self._logger.log(f' - Notion token: {self._notionTokenV2}')
        self._logger.log(f' - Notion workspace: {self._notionWorkspaceId}')
        self._logger.log(f' - Notion table: {self._notionTableId}')
        self._logger.log('-------------------------------------')
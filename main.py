from contextlib import asynccontextmanager
from fastapi import FastAPI

from business.services.loggerInteface import ILogger
from configurations.env import Env
from plugs.consoleloggers.consolestream import ConsoleLogger
from plugs.notion.queryOnTableService import QueryOnTableService
from plugs.openai.chatCompeleteService import ChatCompeleteService

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger = ConsoleLogger()
    envVars = Env()
    queryOnTableService = QueryOnTableService(logger, envVars.NOTION_TOKEN_V2, envVars.NOTION_WORKSPACE_ID, envVars.NOTION_TABLE_ID)
    queryOnTableService.configCheck()
    
    yield

app = FastAPI(lifespan=lifespan)

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/hello-ai")
async def rootAI():
    logger = ConsoleLogger()
    envVars = Env()
    client = ChatCompeleteService(logger, envVars.OPENAI_API_KEY)
    client.helloWord()
    return {"message": "AI said Hello World"}

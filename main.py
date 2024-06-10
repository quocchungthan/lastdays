from contextlib import asynccontextmanager
from business.services.readDrawingServiceInterface import IReadDrawingService
from dependencies_map import get_chat_complete, get_notion_client, get_read_drawing_service
from fastapi import FastAPI, Depends

from plugs.notion.queryOnTableService import QueryOnTableService
from plugs.openai.chatCompeleteService import ChatCompeleteService


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(lifespan=lifespan)

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/hello-ai")
async def rootAI(chatCompleteClient: ChatCompeleteService = Depends(get_chat_complete)):
    chatCompleteClient.helloWord()
    return {"message": "AI said Hello World"}

@app.get("/hello-notion")
async def rootAI(queryOnTableService: QueryOnTableService = Depends(get_notion_client)):
    queryOnTableService.configCheck()
    return {"message": "Database said hello world!"}

@app.post("/ask/for-description")
async def generateDescription(readDrawingService: IReadDrawingService = Depends(get_read_drawing_service)):
    return {"message": readDrawingService.describeWhatUserDrawn("", "") }

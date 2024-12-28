from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models import User, Group, Project, UserToken, UserOTP  # Import models
from app.config import settings

async def init_db():
    client = AsyncIOMotorClient(settings.MONGO_URI)
    await init_beanie(database=client[settings.MONGO_DB_NAME], document_models=[User, Group, Project, UserToken, UserOTP])

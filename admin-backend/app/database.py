from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models import User, Group, Project, UserToken, UserOTP, Devices, Host, Notification  # Import models
from app.config import settings

# Initialize a global Motor Client instance
motor_client = AsyncIOMotorClient(settings.MONGO_URI)

async def init_db():
    """
    Initialize Beanie with the Motor Client and database models.
    """
    await init_beanie(
        database=motor_client[settings.MONGO_DB_NAME],
        document_models=[User, Group, Project, UserToken, UserOTP, Devices, Host, Notification]
    )

def get_motor_client():
    """
    Provide the Motor Client for dependency injection.
    """
    return motor_client

from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

async def get_database():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    return client[settings.DATABASE_NAME]

async def get_collection(collection_name: str):
    db = await get_database()
    return db[collection_name]
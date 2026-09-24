import os
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "nirmaan_db")

client_kwargs = {}
if "tls=true" in MONGO_URI.lower() or "ssl=true" in MONGO_URI.lower() or MONGO_URI.startswith("mongodb+srv://") or os.getenv("MONGO_TLS", "").lower() == "true":
    client_kwargs["tlsCAFile"] = certifi.where()

client = AsyncIOMotorClient(
    MONGO_URI,
    **client_kwargs
)
db = client[DB_NAME]


def get_database():
    return db


async def init_db_indexes():
    """Create essential MongoDB indexes on startup."""
    try:
        # Create unique index on users email
        await db.users.create_index("email", unique=True)
        # Create index on projects owner_id
        await db.projects.create_index("owner_id")
    except Exception as e:
        print(f"Warning: Failed to create database indexes: {e}")


def close_database_connection():
    """Close MongoDB connection on application shutdown."""
    client.close()

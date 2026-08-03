import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "nirmaan_db")

# tlsAllowInvalidCertificates SSL TLS issue ko fix karta hai
client = AsyncIOMotorClient(MONGO_URI, tlsAllowInvalidCertificates=True)
db = client[DB_NAME]

def get_database():
    return db

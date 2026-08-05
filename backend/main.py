import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db_indexes, close_database_connection
from auth.routes import router as auth_router
from projects.routes import router as projects_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB indexes
    await init_db_indexes()
    yield
    # Shutdown: Close database client connection
    close_database_connection()


app = FastAPI(
    title="NIRMAAN API",
    description="Backend API for NIRMAAN - Blueprint to 2D/3D Home Design Editor",
    version="1.0.0",
    lifespan=lifespan,
)

cors_origins = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "*").split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(projects_router, prefix="/api/projects", tags=["Projects"])


@app.get("/health")
async def health():
    return {"status": "ok"}

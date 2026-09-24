import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db_indexes, close_database_connection
from auth.routes import router as auth_router
from projects.routes import router as projects_router
from audit.routes import router as audit_router


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

env_origins = os.getenv("CORS_ORIGINS", "*").split(",")
cors_origins = [o.strip() for o in env_origins if o.strip()]
if "*" in cors_origins:
    cors_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(projects_router, prefix="/api/projects", tags=["Projects"])
app.include_router(audit_router, prefix="/api/audit", tags=["Audit"])


@app.get("/health")
async def health():
    return {"status": "ok"}

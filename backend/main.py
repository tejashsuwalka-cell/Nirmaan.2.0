from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth.routes import router as auth_router

app = FastAPI(
    title="NIRMAAN API",
    description="Backend API for NIRMAAN - Blueprint to 2D/3D Home Design Editor",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])


@app.get("/health")
async def health():
    return {"status": "ok"}

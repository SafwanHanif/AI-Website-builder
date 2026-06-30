from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.config import settings
from app.database.connection import engine, Base, SessionLocal
# Import models so they register with SQLAlchemy metadata
from app.models import User, Project, WebsitePlan, DesignToken, Component, Version, ChatHistory  # noqa: F401
from app.api.auth import router as auth_router
from app.api.projects import router as projects_router
from app.api.versions import router as versions_router
from app.api.exports import router as exports_router
from app.websocket.manager import router as ws_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: attempt DB connection, create tables if possible
    import asyncio as _asyncio
    try:
        def _init_db():
            Base.metadata.create_all(bind=engine)
            db = SessionLocal()
            db.execute(text("SELECT 1"))
            db.close()
        await _asyncio.to_thread(_init_db)
        print("[OK] Database connected and tables ready")
    except Exception as e:
        print(f"[WARN] Database not available: {e}")
        print("  The app will start but DB-dependent features won't work.")
        print("  Make sure PostgreSQL is running and configured in backend/.env")
    yield


app = FastAPI(
    title="AI Website Builder API",
    description="Generate complete websites from natural language descriptions",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(projects_router, prefix="/api/projects", tags=["Projects"])
app.include_router(versions_router, prefix="/api/projects", tags=["Versions"])
app.include_router(exports_router, prefix="/api/projects", tags=["Exports"])
app.include_router(ws_router, prefix="/api/projects", tags=["WebSocket"])


@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "version": "1.0.0",
    }

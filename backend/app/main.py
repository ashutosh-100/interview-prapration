import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.db.session import engine, Base
from app.api.api import api_router

# -------------------------
# INIT APP (ONLY ONCE)
# -------------------------
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs"
)

# -------------------------
# CORS
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://interview-prapration-1qbb.vercel.app",
        "https://interview-prapration-nine.vercel.app",
        "https://interview-prapration-klbn.vercel.app",
        "https://interview-prapration.vercel.app",
    ],
    allow_origin_regex=r"https://interview-prapration.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# DB INIT
# -------------------------
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"DB warning: {e}")

# -------------------------
# ROUTES
# -------------------------
app.include_router(api_router, prefix=settings.API_V1_STR)

# -------------------------
# STATIC FILES
# -------------------------
uploads_absolute_path = os.path.abspath(settings.UPLOAD_DIR)
try:
    os.makedirs(uploads_absolute_path, exist_ok=True)
except OSError:
    uploads_absolute_path = "/tmp/uploads"
    os.makedirs(uploads_absolute_path, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_absolute_path), name="uploads")

# -------------------------
# ROOT
# -------------------------
@app.get("/")
def root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "docs": "/docs",
        "version": "1.0.0"
    }
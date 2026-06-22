from fastapi import APIRouter
from app.api.endpoints import auth, resumes, interviews, recordings, admin

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(resumes.router, prefix="/resumes", tags=["resumes"])
api_router.include_router(interviews.router, prefix="/interviews", tags=["interviews"])
api_router.include_router(recordings.router, prefix="/recordings", tags=["recordings"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])

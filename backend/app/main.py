# from fastapi import FastAPI

# app = FastAPI()

# @app.get("/")
# def root():
#     return {"status": "ok"}
# app = FastAPI(
#     docs_url="/docs",
#     openapi_url="/openapi.json"
# )
# import os
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.staticfiles import StaticFiles
# from app.core.config import settings
# from app.db.session import engine, Base
# from app.api.api import api_router
# from fastapi.middleware.cors import CORSMiddleware


# from fastapi.middleware.cors import CORSMiddleware



# # Initialize Database tables
# try:
#     Base.metadata.create_all(bind=engine)
    
#     # Seed the admin user if not exists
#     from app.db.session import SessionLocal
#     from app.models.models import User, UserProfile
#     from app.core.security import get_password_hash
    
#     db = SessionLocal()
#     admin_email = "at9854787@gmail.com"
#     existing_admin = db.query(User).filter(User.email == admin_email).first()
#     if not existing_admin:
#         admin_user = User(
#             email=admin_email,
#             hashed_password=get_password_hash("as@%Fhu*1"),
#             role="admin"
#         )
#         db.add(admin_user)
#         db.commit()
#         db.refresh(admin_user)
        
#         admin_profile = UserProfile(
#             user_id=admin_user.id,
#             full_name="System Admin",
#             preferred_language="en",
#             theme="system"
#         )
#         db.add(admin_profile)
#         db.commit()
#     db.close()
    
# except Exception as e:
#     print(f"Database creation warning (might already exist/be locked): {e}")

# app = FastAPI(
#     title=settings.PROJECT_NAME,
#     openapi_url=f"{settings.API_V1_STR}/openapi.json"
# )
# app = FastAPI(
#     title=settings.PROJECT_NAME,
#     openapi_url=f"{settings.API_V1_STR}/openapi.json"
# )

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "http://localhost:3000",
#         "http://127.0.0.1:3000",
#         "https://interview-prapration.vercel.app"
#     ],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )



# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "http://localhost:3000",
#         "http://127.0.0.1:3000",
#         "https://interview-prapration.vercel.app"
#     ],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
# # Mount upload directory to serve static file uploads (resumes & recordings)
# uploads_absolute_path = os.path.abspath(settings.UPLOAD_DIR)
# os.makedirs(uploads_absolute_path, exist_ok=True)
# app.mount("/uploads", StaticFiles(directory=uploads_absolute_path), name="uploads")

# # Include aggregate api routes
# app.include_router(api_router, prefix=settings.API_V1_STR)

# @app.get("/")
# def read_root():
#     return {
#         "status": "online",
#         "app": settings.PROJECT_NAME,
#         "docs_url": "/docs",
#         "version": "1.0.0"
#     }
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
    ],
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
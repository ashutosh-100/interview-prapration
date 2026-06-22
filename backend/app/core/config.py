import os
from dotenv import load_dotenv

# Load env variables from .env if it exists
load_dotenv()

class Settings:
    PROJECT_NAME: str = "AI Interview Mentor Pro"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super_secret_key_123_change_me_in_production")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database URL: SQLite fallback if DATABASE_URL not provided
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./interview_mentor.db")
    
    # Gemini API Key
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # OpenAI API Key
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # Storage Directory for Uploads (Resumes/Recordings)
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")

settings = Settings()

settings = Settings()

# Create upload folders only when possible
try:
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "resumes"), exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "recordings"), exist_ok=True)
except Exception:
    pass
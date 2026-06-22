import datetime
import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from app.db.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="user")  # "admin" or "user"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    interviews = relationship("Interview", back_populates="user", cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")


class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    full_name = Column(String(255), nullable=False)
    phone_number = Column(String(50), nullable=True)
    college = Column(String(255), nullable=True)
    experience_level = Column(String(50), default="beginner")  # "beginner", "intermediate", "advanced"
    current_role = Column(String(255), nullable=True)
    target_role = Column(String(255), nullable=True)
    selected_domains = Column(String(500), default="")  # comma-separated domains (max 3)
    preferred_language = Column(String(10), default="en")  # "en" or "hi"
    theme = Column(String(20), default="system")  # "light", "dark", "system"
    
    user = relationship("User", back_populates="profile")


class Resume(Base):
    __tablename__ = "resumes"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    file_path = Column(String(500), nullable=False)
    skills = Column(Text, nullable=True)        # JSON string
    experience = Column(Text, nullable=True)    # JSON string
    projects = Column(Text, nullable=True)      # JSON string
    education = Column(Text, nullable=True)     # JSON string
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="resumes")


class Interview(Base):
    __tablename__ = "interviews"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(50), nullable=False)  # "technical", "coding", "hr", "behavioral"
    difficulty = Column(String(50), default="intermediate")  # "beginner", "intermediate", "advanced"
    status = Column(String(50), default="scheduled")  # "scheduled", "in_progress", "completed", "failed"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    user = relationship("User", back_populates="interviews")
    responses = relationship("QuestionResponse", back_populates="interview", cascade="all, delete-orphan")
    report = relationship("PerformanceReport", back_populates="interview", uselist=False, cascade="all, delete-orphan")
    recordings = relationship("Recording", back_populates="interview", cascade="all, delete-orphan")


class QuestionResponse(Base):
    __tablename__ = "question_responses"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    interview_id = Column(String(36), ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False)
    question_text = Column(Text, nullable=False)
    user_answer_text = Column(Text, nullable=True)
    code_submitted = Column(Text, nullable=True)
    execution_time = Column(Float, nullable=True)
    complexity_feedback = Column(Text, nullable=True)  # JSON string
    communication_score = Column(Float, default=0.0)
    confidence_score = Column(Float, default=0.0)
    follow_up_questions = Column(Text, nullable=True)  # JSON list string
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    interview = relationship("Interview", back_populates="responses")


class PerformanceReport(Base):
    __tablename__ = "performance_reports"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    interview_id = Column(String(36), ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False, unique=True)
    overall_score = Column(Float, default=0.0)
    category_scores = Column(Text, nullable=True)        # JSON string (technical, coding, hr, communication, etc.)
    strengths = Column(Text, nullable=True)              # JSON string list
    weaknesses = Column(Text, nullable=True)             # JSON string list
    improvement_areas = Column(Text, nullable=True)      # JSON string list
    hiring_probability = Column(String(50), default="low") # "high", "medium", "low"
    resource_suggestions = Column(Text, nullable=True)   # JSON string list
    detailed_ai_feedback = Column(Text, nullable=True)
    generated_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    interview = relationship("Interview", back_populates="report")


class Recording(Base):
    __tablename__ = "recordings"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    interview_id = Column(String(36), ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False)
    video_url = Column(String(500), nullable=True)
    audio_url = Column(String(500), nullable=True)
    screen_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    interview = relationship("Interview", back_populates="recordings")

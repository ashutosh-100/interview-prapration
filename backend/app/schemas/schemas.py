from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None


# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- Profile Schemas ---
class ProfileBase(BaseModel):
    full_name: str
    phone_number: Optional[str] = None
    college: Optional[str] = None
    experience_level: str = "beginner"  # "beginner", "intermediate", "advanced"
    current_role: Optional[str] = None
    target_role: Optional[str] = None
    selected_domains: str = ""          # comma separated list of up to 3 domains
    preferred_language: str = "en"      # "en" or "hi"
    theme: str = "system"               # "light", "dark", "system"

class ProfileUpdate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    id: str
    user_id: str

    class Config:
        from_attributes = True


# --- Resume Schemas ---
class ResumeResponse(BaseModel):
    id: str
    user_id: str
    file_path: str
    skills: Optional[str] = None
    experience: Optional[str] = None
    projects: Optional[str] = None
    education: Optional[str] = None
    uploaded_at: datetime

    class Config:
        from_attributes = True


# --- Interview Schemas ---
class InterviewCreate(BaseModel):
    type: str  # "technical", "coding", "hr", "behavioral"
    difficulty: str = "intermediate"  # "beginner", "intermediate", "advanced"

class InterviewResponse(BaseModel):
    id: str
    user_id: str
    type: str
    difficulty: str
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- Question & Response Schemas ---
class QuestionResponseBase(BaseModel):
    question_text: str
    user_answer_text: Optional[str] = None
    code_submitted: Optional[str] = None
    execution_time: Optional[float] = None
    communication_score: float = 0.0
    confidence_score: float = 0.0

class QuestionResponseCreate(BaseModel):
    question_text: str
    user_answer_text: Optional[str] = None
    code_submitted: Optional[str] = None
    # Raw analytics data captured from camera/voice
    eye_contact_ratio: Optional[float] = None
    attention_level: Optional[float] = None
    fillers_count: Optional[int] = None
    speaking_speed_wpm: Optional[float] = None

class QuestionResponseResponse(QuestionResponseBase):
    id: str
    interview_id: str
    complexity_feedback: Optional[str] = None
    follow_up_questions: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# --- Performance Report Schemas ---
class PerformanceReportResponse(BaseModel):
    id: str
    interview_id: str
    overall_score: float
    category_scores: Optional[str] = None
    strengths: Optional[str] = None
    weaknesses: Optional[str] = None
    improvement_areas: Optional[str] = None
    hiring_probability: str
    resource_suggestions: Optional[str] = None
    detailed_ai_feedback: Optional[str] = None
    generated_at: datetime

    class Config:
        from_attributes = True


# --- Recording Schemas ---
class RecordingCreate(BaseModel):
    video_url: Optional[str] = None
    audio_url: Optional[str] = None
    screen_url: Optional[str] = None

class RecordingResponse(RecordingCreate):
    id: str
    interview_id: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- Complete Details / Analytics Schemas ---
class InterviewDetailsResponse(BaseModel):
    interview: InterviewResponse
    responses: List[QuestionResponseResponse]
    report: Optional[PerformanceReportResponse] = None
    recordings: List[RecordingResponse] = []

    class Config:
        from_attributes = True

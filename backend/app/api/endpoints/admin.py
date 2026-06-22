from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import User, UserProfile, Interview, PerformanceReport, Recording
from app.schemas.schemas import UserResponse, ProfileResponse, InterviewResponse, PerformanceReportResponse
from app.api.deps import get_current_active_admin

router = APIRouter()

@router.get("/metrics")
def get_admin_metrics(
    current_admin: User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    
    # Active users: users who conducted at least 1 interview
    active_users = db.query(Interview.user_id).distinct().count()
    
    interviews_conducted = db.query(Interview).count()
    
    # Calculate average score from performance reports
    avg_score_row = db.query(PerformanceReport.overall_score).all()
    avg_score = 0.0
    if avg_score_row:
        avg_score = sum([r[0] for r in avg_score_row]) / len(avg_score_row)
        
    # Interview type breakdown
    tech_count = db.query(Interview).filter(Interview.type == "technical").count()
    coding_count = db.query(Interview).filter(Interview.type == "coding").count()
    hr_count = db.query(Interview).filter(Interview.type == "hr").count()
    behavioral_count = db.query(Interview).filter(Interview.type == "behavioral").count()
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "interviews_conducted": interviews_conducted,
        "average_score": round(avg_score, 1),
        "type_distribution": {
            "technical": tech_count,
            "coding": coding_count,
            "hr": hr_count,
            "behavioral": behavioral_count
        }
    }

@router.get("/users")
def get_all_users_details(
    current_admin: User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    users = db.query(User).all()
    results = []
    for u in users:
        profile = db.query(UserProfile).filter(UserProfile.user_id == u.id).first()
        results.append({
            "id": u.id,
            "email": u.email,
            "role": u.role,
            "created_at": u.created_at,
            "full_name": profile.full_name if profile else "N/A",
            "college": profile.college if profile else None,
            "experience_level": profile.experience_level if profile else None,
            "target_role": profile.target_role if profile else None
        })
    return results

@router.get("/interviews")
def get_all_interviews(
    current_admin: User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    interviews = db.query(Interview).all()
    results = []
    for iv in interviews:
        profile = db.query(UserProfile).filter(UserProfile.user_id == iv.user_id).first()
        report = db.query(PerformanceReport).filter(PerformanceReport.interview_id == iv.id).first()
        
        results.append({
            "id": iv.id,
            "user_email": iv.user.email if iv.user else "N/A",
            "user_name": profile.full_name if profile else "N/A",
            "type": iv.type,
            "difficulty": iv.difficulty,
            "status": iv.status,
            "created_at": iv.created_at,
            "completed_at": iv.completed_at,
            "score": report.overall_score if report else None,
            "hiring_probability": report.hiring_probability if report else None
        })
    return results

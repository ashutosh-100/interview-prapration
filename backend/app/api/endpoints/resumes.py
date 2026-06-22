import os
import uuid
import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import User, Resume
from app.schemas.schemas import ResumeResponse
from app.api.deps import get_current_user
from app.core.config import settings
from app.services.resume_parser import ResumeParser

router = APIRouter()

@router.post("/upload", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in [".pdf", ".docx"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file extension. Only .pdf and .docx are supported."
        )

    # Save file
    file_uuid = str(uuid.uuid4())
    save_filename = f"{file_uuid}{file_ext}"
    save_path = os.path.join(settings.UPLOAD_DIR, "resumes", save_filename)
    
    try:
        content = await file.read()
        with open(save_path, "wb") as f:
            f.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )

    # Parse file contents using ResumeParser
    try:
        parsed_data = ResumeParser.parse_resume_file(save_path)
    except Exception as e:
        # Cleanup file on failure
        if os.path.exists(save_path):
            os.remove(save_path)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to parse resume: {str(e)}"
        )

    # Save in DB
    db_resume = Resume(
        user_id=current_user.id,
        file_path=save_path,
        skills=json.dumps(parsed_data.get("skills", [])),
        experience=json.dumps(parsed_data.get("experience", [])),
        projects=json.dumps(parsed_data.get("projects", [])),
        education=json.dumps(parsed_data.get("education", [])),
    )
    
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)
    
    return db_resume

@router.get("/latest", response_model=ResumeResponse)
def get_latest_resume(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.uploaded_at.desc()).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No resume uploaded yet"
        )
    return resume

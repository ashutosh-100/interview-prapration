import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import User, Interview, Recording
from app.schemas.schemas import RecordingResponse
from app.api.deps import get_current_user
from app.core.config import settings

router = APIRouter()

@router.post("/{interview_id}/upload", response_model=RecordingResponse, status_code=status.HTTP_201_CREATED)
async def upload_recording(
    interview_id: str,
    video_file: UploadFile = File(None),
    audio_file: UploadFile = File(None),
    screen_file: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview or interview.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found"
        )
        
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "recordings"), exist_ok=True)
    
    video_url = None
    audio_url = None
    screen_url = None
    
    # helper to save file
    async def save_uploaded_file(uploaded_file: UploadFile, type_str: str) -> str:
        file_uuid = str(uuid.uuid4())
        ext = os.path.splitext(uploaded_file.filename)[1] or ".webm"
        filename = f"{type_str}_{file_uuid}{ext}"
        filepath = os.path.join(settings.UPLOAD_DIR, "recordings", filename)
        
        content = await uploaded_file.read()
        with open(filepath, "wb") as f:
            f.write(content)
            
        # Return local path identifier (accessible via /uploads static endpoint)
        return f"/uploads/recordings/{filename}"

    if video_file:
        video_url = await save_uploaded_file(video_file, "video")
    if audio_file:
        audio_url = await save_uploaded_file(audio_file, "audio")
    if screen_file:
        screen_url = await save_uploaded_file(screen_file, "screen")

    db_recording = Recording(
        interview_id=interview.id,
        video_url=video_url,
        audio_url=audio_url,
        screen_url=screen_url
    )
    
    db.add(db_recording)
    db.commit()
    db.refresh(db_recording)
    
    return db_recording

@router.get("/{interview_id}", response_model=list[RecordingResponse])
def get_interview_recordings(
    interview_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview or (interview.user_id != current_user.id and current_user.role != "admin"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found or access denied"
        )
        
    return interview.recordings

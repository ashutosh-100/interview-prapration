from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import text
import traceback
import os
from app.db.session import get_db, engine
from app.models.models import User, UserProfile
from app.schemas.schemas import UserCreate, UserResponse, Token, ProfileResponse, ProfileUpdate
from app.core.security import get_password_hash, verify_password, create_access_token
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/health")
def health_check():
    """Check DB connectivity and environment"""
    db_url = os.getenv("DATABASE_URL", "NOT SET")
    # Mask password for safety
    if "@" in db_url:
        prefix = db_url.split("://")[0]
        host_part = db_url.split("@")[1]
        db_url_safe = f"{prefix}://***@{host_part}"
    else:
        db_url_safe = db_url[:30] + "..."
    
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"FAILED: {repr(e)}"
    
    return {"db_url": db_url_safe, "db_status": db_status}

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    try:
        print("STEP 1: Checking existing user")

        existing_user = db.query(User).filter(User.email == user_in.email).first()
        print("STEP 2: Existing user check complete")

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="The user with this email already exists in the system."
            )

        print("STEP 3: Creating new user")

        # All regular signups get the 'user' role. Admin is seeded explicitly.
        role = "user"
        if user_in.email == "at9854787@gmail.com":
            role = "admin"

        new_user = User(
            email=user_in.email,
            hashed_password=get_password_hash(user_in.password),
            role=role
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        print("STEP 4: Creating user profile")

        # Create Profile
        default_name = user_in.email.split("@")[0].capitalize()
        new_profile = UserProfile(
            user_id=new_user.id,
            full_name=default_name,
            preferred_language="en",
            theme="system"
        )
        db.add(new_profile)
        db.commit()

        print("STEP 5: Signup complete")

        return new_user

    except HTTPException:
        raise
    except Exception as e:
        print("SIGNUP ERROR:", repr(e))
        print("SIGNUP TRACEBACK:", traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Signup error: {repr(e)[:200]}"
        )

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(subject=user.email, role=user.role)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role
    }

@router.get("/profile", response_model=ProfileResponse)
def read_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    return profile

@router.put("/profile", response_model=ProfileResponse)
def update_profile(
    profile_in: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Update profile fields
    for field, value in profile_in.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
        
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile

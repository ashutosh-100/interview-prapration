from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import User, UserProfile
from app.schemas.schemas import UserCreate, UserResponse, Token, ProfileResponse, ProfileUpdate
from app.core.security import get_password_hash, verify_password, create_access_token
from app.api.deps import get_current_user

router = APIRouter()

# @router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
# def signup(user_in: UserCreate, db: Session = Depends(get_db)):
#     # Check if user already exists
#     existing_user = db.query(User).filter(User.email == user_in.email).first()
@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    try:
        print("STEP 1")

        existing_user = db.query(User).filter(User.email == user_in.email).first()
        print("STEP 2")

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="The user with this email already exists in the system."
            )

        new_user = User(
            email=user_in.email,
            hashed_password=get_password_hash(user_in.password),
            role="user"
        )

        print("STEP 3")

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        print("STEP 4")

        new_profile = UserProfile(
            user_id=new_user.id,
            full_name="Test",
            preferred_language="en",
            theme="system"
        )

        db.add(new_profile)
        db.commit()

        print("STEP 5")

        return new_user

    except Exception as e:
        print("SIGNUP ERROR:", repr(e))
        raise HTTPException(
            status_code=500,
            detail="An error occurred during signup. Please try again later."
        )
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email already exists in the system."
        )
    
    # All regular signups get the 'user' role. Admin is seeded explicitly.
    role = "user"
    if user_in.email == "at9854787@gmail.com":
        role = "admin"

    # Create User
    new_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        role=role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
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
    
    return new_user

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

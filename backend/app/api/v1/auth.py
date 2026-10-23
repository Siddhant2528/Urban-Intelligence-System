from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.exceptions import UnauthorizedException, UISBaseException
from app.models.user import User
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    """Register a citizen account. Government accounts are provisioned separately."""
    if user_in.role == "government":
        raise UISBaseException(
            message="Government accounts must be provisioned by an administrator.",
            status_code=status.HTTP_403_FORBIDDEN,
            error_code="GOVERNMENT_ACCOUNT_REQUIRES_ADMIN",
        )

    existing_user = db.query(User).filter(
        (User.username == user_in.username) | (User.email == user_in.email)
    ).first()
    if existing_user:
        raise UISBaseException(
            message="Username or email already registered.",
            status_code=status.HTTP_409_CONFLICT,
            error_code="USER_ALREADY_EXISTS"
        )
    
    new_user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        role="citizen",
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Authenticate credentials and generate JWT access token."""
    user = db.query(User).filter(
        (User.username == credentials.username)
        | (User.email == credentials.username)
    ).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise UnauthorizedException("Incorrect username or password.")
    
    if not user.is_active:
        raise UnauthorizedException("Account is currently deactivated.")
    
    token = create_access_token(subject=user.username, role=user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "username": user.username,
    }


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Retrieve profile and role information of currently authenticated user."""
    return current_user

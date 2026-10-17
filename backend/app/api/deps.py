from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import Optional

from app.db.session import SessionLocal
from app.core.security import decode_access_token, UserRole
from app.core.exceptions import UnauthorizedException, ForbiddenException
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Validate JWT token and return authenticated User record."""
    if not token:
        raise UnauthorizedException("Authentication credentials were not provided.")
    
    payload = decode_access_token(token)
    username = payload.get("sub")
    if not username:
        raise UnauthorizedException("Token payload missing subject identifier.")
    
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise UnauthorizedException("User associated with this token does not exist.")
    if not user.is_active:
        raise ForbiddenException("User account is inactive.")
    
    return user


def require_role(required_role: UserRole):
    """Factory dependency to enforce role-based access control."""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role != required_role.value and current_user.role != UserRole.ADMIN.value:
            raise ForbiddenException(f"Operation requires '{required_role.value}' role privileges.")
        return current_user
    return role_checker


# Convenient specific dependencies
get_current_government_user = require_role(UserRole.GOVERNMENT)
get_current_citizen_user = get_current_user
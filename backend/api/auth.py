from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.api.services.auth_service import authenticate_user, register_user
from backend.auth_utils import create_access_token
from backend.db import models
from backend.db.base import get_db
from backend.dependencies import get_current_user
from backend.schemas.auth import LoginRequest
from backend.schemas.user import UserCreate, UserOut

router = APIRouter()


@router.post("/register", response_model=UserOut)
def register(user_data: UserCreate, db: Session = Depends(get_db)) -> UserOut:
    """Register a new user account."""
    return register_user(db, user_data)


@router.post("/login")
def login(user_data: LoginRequest, db: Session = Depends(get_db)) -> dict[str, Any]:
    """Authenticate a user and return a JWT access token."""
    user = authenticate_user(db, user_data.email, user_data.password)
    token = create_access_token({"user_id": user.id, "email": user.email, "role": user.role})
    return {"access_token": token, "user": {"id": user.id, "email": user.email, "role": user.role}}


@router.get("/me", response_model=UserOut)
def get_me(current_user: models.User = Depends(get_current_user)) -> UserOut:
    """Return the authenticated current user."""
    return current_user
from fastapi import HTTPException
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from backend.db import models
from backend.schemas.user import UserCreate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def register_user(db: Session, user: UserCreate) -> models.User:
    """Register a new user and hash the provided password."""
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    try:
        db_user = models.User(
            email=user.email,
            hashed_password=pwd_context.hash(user.password),
            role="user",
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except HTTPException:
        raise
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to register user")


def authenticate_user(db: Session, email: str, password: str) -> models.User:
    """Authenticate a user by email and password."""
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user or not pwd_context.verify(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return user


def get_user_by_email(db: Session, email: str) -> models.User | None:
    """Return a user by email if present."""
    return db.query(models.User).filter(models.User.email == email).first()

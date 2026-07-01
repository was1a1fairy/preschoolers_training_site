import os
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

from jose import JWTError, jwt

from backend.config import settings

SECRET_KEY = os.getenv("SECRET_KEY", settings.secret_key_jwt)
ALGORITHM = "HS256"


def create_access_token(data: Dict[str, Any]) -> str:
    """Create a signed JWT access token for the authenticated user."""
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(days=7)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and validate a JWT access token."""
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None

from pydantic import BaseModel, EmailStr, ConfigDict

from typing import Literal

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    role: Literal["admin", "user"]
    model_config = ConfigDict(
        from_attributes=True
    )
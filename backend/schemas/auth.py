from pydantic import BaseModel

# Модель данных для входа в систему
class LoginRequest(BaseModel):
    email: str  # электронная почта
    password: str  # пароль
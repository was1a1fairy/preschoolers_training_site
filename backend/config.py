from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables or a local .env file."""

    sql_url: str = "sqlite:///./repo.db"
    secret_key_jwt: str = "VIBIRASHKA_CHANGE_ME"
    default_admin_email: str = "admin@vibirashka.ru"
    default_admin_password: str = "Admin12345"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=False)


settings = Settings()

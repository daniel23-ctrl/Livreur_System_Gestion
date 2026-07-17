from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    AFRICAS_TALKING_API_KEY: str = ""
    AFRICAS_TALKING_USERNAME: str = "sandbox"

    class Config:
        env_file = ".env"

settings = Settings()
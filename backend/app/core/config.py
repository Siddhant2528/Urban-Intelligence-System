from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    GEMINI_API_KEY: str
    OVERPASS_API_URL: str = "https://overpass-api.de/api/interpreter"
    NOMINATIM_BASE_URL: str = "https://nominatim.openstreetmap.org"
    ENVIRONMENT: str = "development"
    
    # JWT Auth
    SECRET_KEY: str = "uis-secret-key-2024-urban-intelligence-system-jwt"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    class Config:
        env_file = ".env"

settings = Settings()
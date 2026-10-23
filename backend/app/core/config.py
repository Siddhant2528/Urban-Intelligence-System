from pydantic import model_validator
from pydantic_settings import BaseSettings

_DEVELOPMENT_SECRET_KEY = "uis-secret-key-2024-urban-intelligence-system-jwt"


class Settings(BaseSettings):
    DATABASE_URL: str
    GEMINI_API_KEY: str = ""
    OVERPASS_API_URL: str = "https://overpass-api.de/api/interpreter"
    NOMINATIM_BASE_URL: str = "https://nominatim.openstreetmap.org"
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: str = "*"
    
    # JWT Auth
    SECRET_KEY: str = _DEVELOPMENT_SECRET_KEY
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    INITIAL_GOVERNMENT_USERNAME: str = ""
    INITIAL_GOVERNMENT_EMAIL: str = ""
    INITIAL_GOVERNMENT_PASSWORD: str = ""

    @model_validator(mode="after")
    def validate_production_secrets(self):
        if self.ENVIRONMENT.lower() == "production":
            if self.SECRET_KEY == _DEVELOPMENT_SECRET_KEY or len(self.SECRET_KEY) < 32:
                raise ValueError("Production requires a unique SECRET_KEY of at least 32 characters.")

            allowed_origins = [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
            if not allowed_origins or "*" in allowed_origins:
                raise ValueError("Production requires explicit frontend origins in CORS_ORIGINS.")

            if not all((
                self.INITIAL_GOVERNMENT_USERNAME.strip(),
                self.INITIAL_GOVERNMENT_EMAIL.strip(),
                self.INITIAL_GOVERNMENT_PASSWORD,
            )):
                raise ValueError(
                    "Production requires INITIAL_GOVERNMENT_USERNAME, "
                    "INITIAL_GOVERNMENT_EMAIL, and INITIAL_GOVERNMENT_PASSWORD."
                )
            if len(self.INITIAL_GOVERNMENT_PASSWORD) < 12:
                raise ValueError("INITIAL_GOVERNMENT_PASSWORD must be at least 12 characters.")

        return self
    
    class Config:
        env_file = ".env"

settings = Settings()

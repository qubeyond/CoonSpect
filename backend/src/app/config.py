from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        extra="ignore",
        case_sensitive=False
    )

    # Postgres

    POSTGRES_USER: str = Field(...)
    POSTGRES_PASSWORD: str = Field(...)
    POSTGRES_DB: str = Field(...)
    POSTGRES_HOST: str = Field(...)
    POSTGRES_PORT: int = Field(...)

    POSTGRES_POOL_SIZE: int = Field(5)
    POSTGRES_MAX_OVERFLOW: int = Field(10)

    POSTGRES_URL: str = Field(default="", validate_default=False)
    POSTGRES_SYNC_URL: str = Field(default="", validate_default=False)

    @model_validator(mode="after")
    def postgres_url(self) -> "Settings":
        base = (
            f"{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@"
            f"{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )
        self.POSTGRES_URL = f"postgresql+asyncpg://{base}"
        self.POSTGRES_SYNC_URL = f"postgresql+psycopg://{base}"
        return self

    # Redis

    REDIS_HOST: str = Field(...)
    REDIS_PORT: int = Field(6379)

    REDIS_URL: str = Field(default="", validate_default=False)

    @model_validator(mode="after")
    def redis_url(self) -> "Settings":
        self.REDIS_URL = f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/0"
        return self

    # Services

    STT_SERVICE_URL: str = Field(...)
    LLM_SERVICE_URL: str = Field(...)

    # Security

    SECRET_KEY: str = Field("dev_secret", description="Key for JWT signing")
    ALGORITHM: str = Field("HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(30)
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(7)

settings = Settings()

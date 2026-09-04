from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Vaanam API"
    DATABASE_URL: str = "postgresql+asyncpg://vaanam_user:vaanam_password@localhost:5432/vaanam_db"
    
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_SECURE: bool = False
    
    SECRET_KEY: str = "YOUR_SUPER_SECRET_KEY_HERE"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Sentinel-2 / Copernicus Data Space
    SENTINEL_CLIENT_ID: str = ""
    SENTINEL_CLIENT_SECRET: str = ""
    SENTINEL_TOKEN_URL: str = "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token"
    SENTINEL_BASE_URL: str = "https://sh.dataspace.copernicus.eu"
    SENTINEL_EVALSCRIPT_URL: str = "https://services.sentinel-hub.com/ogc/wms/bd86bcc0-f318-402b-a145-015f85b9427e"

    # Satellite NDVI thresholds
    NDVI_VEGETATION_LOSS_THRESHOLD: float = -0.15
    NDVI_VEGETATION_GAIN_THRESHOLD: float = 0.15
    NDVI_DEFAULT_MAX_CLOUD_COVER: float = 20.0

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
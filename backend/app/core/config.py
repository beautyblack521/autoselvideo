from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "AutoVideo API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # MongoDB settings
    MONGODB_URL: str = "mongodb://root:kl4p4rfh@autovideo-db-mongodb.ns-tevyggd8.svc:27017"
    MONGODB_DB_NAME: str = "autovideo"
    
    # JWT settings
    SECRET_KEY: str = "your-secret-key-here"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # CORS settings
    BACKEND_CORS_ORIGINS: list = [
        "http://localhost:3000",
        "https://axfqazrhrwnt.sealoshzh.site"
    ]
    
    # 更新内网地址
    INTERNAL_API_URL: str = "http://autoselvbak.ns-tevyggd8.svc.cluster.local:3000"

    class Config:
        case_sensitive = True

settings = Settings() 
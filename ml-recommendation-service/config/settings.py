"""
Konfigurasi Settings untuk ML Recommendation Service
Menggunakan Pydantic Settings untuk load dari environment variables
"""
from pydantic_settings import BaseSettings
from typing import Literal
from pathlib import Path


class Settings(BaseSettings):
    """
    Kelas settings untuk manage semua konfigurasi aplikasi
    Otomatis load dari .env file
    """
    
    # === APPLICATION SETTINGS ===
    app_name: str = "BaleTani ML Recommendation Service"
    app_version: str = "1.0.0"
    environment: Literal["development", "production"] = "development"
    debug: bool = True
    log_level: str = "INFO"
    
    # === API SETTINGS ===
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_prefix: str = "/v1"
    api_key: str = "baletani-ml-secret-key"
    
    # === DATA SOURCE ===
    data_source: Literal["csv", "mysql"] = "csv"
    csv_data_path: str = "./data/raw"
    
    # === MYSQL DATABASE ===
    mysql_host: str = "localhost"
    mysql_port: int = 3306
    mysql_user: str = "root"
    mysql_password: str = ""
    mysql_database: str = "baletani_db"
    mysql_charset: str = "utf8mb4"
    mysql_pool_size: int = 10
    mysql_max_overflow: int = 20
    
    # === REDIS CACHE ===
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_db: int = 0
    redis_password: str = ""
    cache_ttl_recommendations: int = 3600  # 1 jam
    cache_ttl_embeddings: int = 86400  # 24 jam
    
    # === MODEL SETTINGS ===
    model_path: str = "./models_artifacts"
    model_version: str = "ncb_v1.0"
    embedding_dim: int = 32
    batch_size: int = 32
    top_k_recommendations: int = 10
    
    # === TRAINING SETTINGS ===
    train_test_split: float = 0.7  # 70% training
    validation_split: float = 0.15  # 15% validation
    epochs: int = 50
    learning_rate: float = 0.001
    early_stopping_patience: int = 10
    
    # === CORS SETTINGS ===
    cors_origins: str = "http://localhost:3000,http://localhost:5173"
    cors_allow_credentials: bool = True
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
    
    @property
    def cors_origins_list(self) -> list[str]:
        """Convert string CORS origins ke list"""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    @property
    def mysql_url(self) -> str:
        """Generate MySQL connection URL untuk SQLAlchemy"""
        return f"mysql+pymysql://{self.mysql_user}:{self.mysql_password}@{self.mysql_host}:{self.mysql_port}/{self.mysql_database}?charset={self.mysql_charset}"
    
    @property
    def redis_url(self) -> str:
        """Generate Redis connection URL"""
        if self.redis_password:
            return f"redis://:{self.redis_password}@{self.redis_host}:{self.redis_port}/{self.redis_db}"
        return f"redis://{self.redis_host}:{self.redis_port}/{self.redis_db}"
    
    @property
    def model_artifact_path(self) -> Path:
        """Path ke folder model artifacts"""
        return Path(self.model_path)
    
    @property
    def csv_products_path(self) -> Path:
        """Path ke products.csv"""
        return Path(self.csv_data_path) / "products.csv"
    
    @property
    def csv_orders_path(self) -> Path:
        """Path ke orders.csv"""
        return Path(self.csv_data_path) / "orders.csv"
    
    @property
    def csv_customers_path(self) -> Path:
        """Path ke customers.csv"""
        return Path(self.csv_data_path) / "customers.csv"


# Instance global settings
settings = Settings()

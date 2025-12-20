"""
Logging configuration untuk ML Recommendation Service
Menggunakan loguru untuk logging yang lebih modern
"""
import sys
from loguru import logger
from pathlib import Path
from config.settings import settings

def setup_logging():
    """
    Setup konfigurasi logging dengan loguru
    - Console logging dengan warna
    - File logging dengan rotation
    """
    
    # Remove default handler
    logger.remove()
    
    # Console handler dengan format colorful
    logger.add(
        sys.stdout,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan> - <level>{message}</level>",
        level=settings.log_level,
        colorize=True
    )
    
    # File handler dengan rotation (max 10 MB per file, keep 5 files)
    log_path = Path("logs")
    log_path.mkdir(exist_ok=True)
    
    logger.add(
        log_path / "app.log",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
        level=settings.log_level,
        rotation="10 MB",  # Rotate setelah 10 MB
        retention="7 days",  # Keep logs for 7 days
        compression="zip",  # Compress rotated files
        encoding="utf-8"
    )
    
    # File khusus untuk errors
    logger.add(
        log_path / "error.log",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
        level="ERROR",
        rotation="5 MB",
        retention="14 days",
        compression="zip",
        encoding="utf-8"
    )
    
    logger.info(f"🚀 Logging initialized - Level: {settings.log_level}")
    return logger

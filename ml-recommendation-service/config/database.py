"""
Database configuration untuk MySQL connection (future use)
Saat ini menggunakan CSV, tapi siap untuk migrasi ke MySQL
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config.settings import settings

# SQLAlchemy Base untuk ORM models
Base = declarative_base()

# Database engine (untuk production dengan MySQL)
engine = None
SessionLocal = None

def init_database():
    """
    Inisialisasi koneksi database MySQL
    Dipanggil saat startup jika data_source = 'mysql'
    """
    global engine, SessionLocal
    
    if settings.data_source == "mysql":
        # Create engine dengan connection pooling
        engine = create_engine(
            settings.mysql_url,
            pool_pre_ping=True,  # Check connection health
            pool_size=10,  # Max 10 connections
            max_overflow=20,  # Max 30 total connections
            echo=settings.debug  # Log SQL queries jika debug=True
        )
        
        # Create session factory
        SessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=engine
        )
        
        print(f"✅ Database connected: {settings.mysql_host}")
    else:
        print("ℹ️  Using CSV data source, database not initialized")

def get_db():
    """
    Dependency untuk mendapatkan database session
    Digunakan di FastAPI endpoints
    
    Usage:
        @app.get("/products")
        def get_products(db: Session = Depends(get_db)):
            return db.query(Product).all()
    """
    if SessionLocal is None:
        raise RuntimeError("Database not initialized. Set DATA_SOURCE=mysql")
    
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def close_database():
    """
    Tutup koneksi database
    Dipanggil saat shutdown aplikasi
    """
    global engine
    if engine:
        engine.dispose()
        print("✅ Database connection closed")

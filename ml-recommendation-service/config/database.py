"""
Database configuration untuk MySQL connection
Support untuk real-time data loading dari production database
"""
from sqlalchemy import create_engine, text
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
        try:
            print(f"🔄 Connecting to MySQL database: {settings.mysql_host}:{settings.mysql_port}/{settings.mysql_database}")
            
            # Create engine dengan connection pooling
            engine = create_engine(
                settings.mysql_url,
                pool_pre_ping=True,  # Check connection health
                pool_size=settings.mysql_pool_size,
                max_overflow=settings.mysql_max_overflow,
                pool_recycle=3600,  # Recycle connections after 1 hour
                echo=False  # Disable SQL query logging
            )
            
            # Test connection dengan SQLAlchemy 2.0 syntax
            with engine.connect() as conn:
                result = conn.execute(text("SELECT 1 as test"))
                test_value = result.scalar()
                if test_value != 1:
                    raise Exception("Database test query failed")
            
            # Create session factory
            SessionLocal = sessionmaker(
                autocommit=False,
                autoflush=False,
                bind=engine
            )
            
            print(f"✅ Database connected successfully: {settings.mysql_host}")
            print(f"📊 Pool size: {settings.mysql_pool_size}, Max overflow: {settings.mysql_max_overflow}")
            
        except Exception as e:
            print(f"❌ Failed to connect to database: {e}")
            print(f"⚠️  Falling back to CSV mode")
            settings.data_source = "csv"
            engine = None
            SessionLocal = None
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

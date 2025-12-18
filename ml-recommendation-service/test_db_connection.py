"""
Test Script untuk verify MySQL database connection dan data loading
Run: python test_db_connection.py
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from loguru import logger
from config.database import init_database, engine
from config.settings import Settings
from data.data_loader import DataLoader
import pandas as pd

def test_settings():
    """Test 1: Verify settings loaded correctly"""
    logger.info("="*60)
    logger.info("TEST 1: Settings Configuration")
    logger.info("="*60)
    
    settings = Settings()
    
    logger.info(f"Data Source: {settings.data_source}")
    logger.info(f"MySQL Host: {settings.mysql_host}:{settings.mysql_port}")
    logger.info(f"MySQL Database: {settings.mysql_database}")
    logger.info(f"MySQL User: {settings.mysql_user}")
    logger.info(f"MySQL URL: {settings.mysql_url}")
    logger.info(f"Model Version: {settings.model_version}")
    
    if settings.data_source != 'mysql':
        logger.warning(f"⚠️  DATA_SOURCE is '{settings.data_source}', should be 'mysql'")
        logger.warning("   Update .env file: DATA_SOURCE=mysql")
    else:
        logger.success("✅ Data source is configured to use MySQL")
    
    return settings

def test_database_connection():
    """Test 2: Test raw database connection"""
    logger.info("\n" + "="*60)
    logger.info("TEST 2: Database Connection")
    logger.info("="*60)
    
    try:
        # Initialize database
        init_database()
        
        # Re-import engine after init
        from config.database import engine as db_engine
        
        if db_engine is None:
            logger.error("❌ Engine is None - database not initialized")
            return False
        
        logger.info("Testing connection...")
        
        # Import text for SQLAlchemy 2.0
        from sqlalchemy import text
        
        # Test simple query
        with db_engine.connect() as conn:
            result = conn.execute(text("SELECT 1 as test"))
            test_value = result.scalar()
            
            if test_value == 1:
                logger.success("✅ Database connection successful!")
            else:
                logger.error("❌ Unexpected result from test query")
                return False
        
        # Test products table
        with db_engine.connect() as conn:
            result = conn.execute(text("""
                SELECT COUNT(*) as total 
                FROM products 
                WHERE is_active = 1
            """))
            product_count = result.scalar()
            logger.info(f"📦 Total active products in database: {product_count}")
        
        # Test orders table
        with db_engine.connect() as conn:
            result = conn.execute(text("""
                SELECT COUNT(*) as total 
                FROM orders 
                WHERE order_status = 'completed'
                AND created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
            """))
            order_count = result.scalar()
            logger.info(f"📋 Completed orders (last 90 days): {order_count}")
        
        # Test customers table
        with db_engine.connect() as conn:
            result = conn.execute(text("""
                SELECT COUNT(*) as total 
                FROM customers 
                WHERE is_active = 1
            """))
            customer_count = result.scalar()
            logger.info(f"👥 Total active customers: {customer_count}")
        
        logger.success("✅ All table queries successful!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        logger.error("   Check your MySQL credentials in .env file")
        return False

def test_dataloader():
    """Test 3: Test DataLoader class"""
    logger.info("\n" + "="*60)
    logger.info("TEST 3: DataLoader with MySQL")
    logger.info("="*60)
    
    try:
        # Create DataLoader with mysql source
        loader = DataLoader(data_source='mysql')
        
        # Test load products
        logger.info("Loading products from MySQL...")
        products = loader.load_products()
        
        logger.info(f"✅ Loaded {len(products)} products")
        logger.info(f"   Columns: {list(products.columns)}")
        logger.info(f"   Sample product IDs: {products['id'].head(3).tolist()}")
        
        # Show sample product
        if len(products) > 0:
            sample = products.iloc[0]
            logger.info(f"\n📦 Sample Product:")
            logger.info(f"   ID: {sample['id']}")
            logger.info(f"   Name: {sample['product_name']}")
            logger.info(f"   Category: {sample['category_name']}")
            logger.info(f"   Price: Rp {sample['selling_price']:,.0f}")
            logger.info(f"   Stock: {sample['total_stock']}")
        
        # Test load orders
        logger.info("\nLoading orders from MySQL...")
        orders = loader.load_orders()
        
        logger.info(f"✅ Loaded {len(orders)} order items")
        if len(orders) > 0:
            logger.info(f"   Date range: {orders['order_date'].min()} to {orders['order_date'].max()}")
            logger.info(f"   Total products sold: {orders['quantity'].sum()}")
        
        # Test load customers
        logger.info("\nLoading customers from MySQL...")
        customers = loader.load_customers()
        
        logger.info(f"✅ Loaded {len(customers)} customers")
        
        logger.success("\n✅ DataLoader test successful!")
        return True
        
    except Exception as e:
        logger.error(f"❌ DataLoader test failed: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return False

def test_product_features():
    """Test 4: Test product feature extraction"""
    logger.info("\n" + "="*60)
    logger.info("TEST 4: Product Feature Extraction")
    logger.info("="*60)
    
    try:
        loader = DataLoader(data_source='mysql')
        products = loader.load_products()
        
        if len(products) == 0:
            logger.warning("⚠️  No products found in database")
            return False
        
        # Check required columns for ML model
        required_cols = ['id', 'product_name', 'category_name', 'selling_price', 
                        'shelf_life_days', 'total_stock']
        
        missing_cols = [col for col in required_cols if col not in products.columns]
        
        if missing_cols:
            logger.error(f"❌ Missing columns: {missing_cols}")
            return False
        
        logger.info("✅ All required columns present")
        
        # Check data types
        logger.info(f"\nData types:")
        for col in required_cols:
            logger.info(f"   {col}: {products[col].dtype}")
        
        # Check for nulls
        null_counts = products[required_cols].isnull().sum()
        if null_counts.sum() > 0:
            logger.warning(f"\n⚠️  Null values found:")
            for col, count in null_counts.items():
                if count > 0:
                    logger.warning(f"   {col}: {count} nulls")
        else:
            logger.success("✅ No null values in required columns")
        
        # Statistics
        logger.info(f"\n📊 Product Statistics:")
        logger.info(f"   Price range: Rp {products['selling_price'].min():,.0f} - Rp {products['selling_price'].max():,.0f}")
        logger.info(f"   Shelf life range: {products['shelf_life_days'].min()} - {products['shelf_life_days'].max()} days")
        logger.info(f"   Categories: {products['category_name'].nunique()} unique")
        logger.info(f"   Category distribution:")
        
        for cat, count in products['category_name'].value_counts().head(5).items():
            logger.info(f"      - {cat}: {count} products")
        
        logger.success("\n✅ Product features ready for ML model!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Feature extraction test failed: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return False

def main():
    """Run all tests"""
    logger.info("🚀 Starting ML Service Database Integration Tests")
    logger.info("="*60)
    
    results = {
        'settings': False,
        'connection': False,
        'dataloader': False,
        'features': False
    }
    
    # Run tests
    results['settings'] = test_settings()
    
    if results['settings']:
        results['connection'] = test_database_connection()
        
        if results['connection']:
            results['dataloader'] = test_dataloader()
            results['features'] = test_product_features()
    
    # Summary
    logger.info("\n" + "="*60)
    logger.info("TEST SUMMARY")
    logger.info("="*60)
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        logger.info(f"{test_name.upper()}: {status}")
    
    all_passed = all(results.values())
    
    if all_passed:
        logger.success("\n🎉 ALL TESTS PASSED!")
        logger.success("✅ ML Service is ready to use MySQL database")
        logger.success("✅ You can now start the ML service with: python start_server.py")
    else:
        logger.error("\n❌ SOME TESTS FAILED")
        logger.error("Please fix the issues above before starting the ML service")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

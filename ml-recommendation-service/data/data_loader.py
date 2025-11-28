"""
Data Loader untuk load dataset dari CSV atau MySQL
Mendukung kedua source dengan interface yang sama
"""
import pandas as pd
from pathlib import Path
from typing import Optional, Tuple
from loguru import logger

from config.settings import settings


class DataLoader:
    """
    Class untuk load data dari CSV atau MySQL database
    Menyediakan interface yang konsisten untuk kedua source
    """
    
    def __init__(self, data_source: Optional[str] = None):
        """
        Inisialisasi DataLoader
        
        Args:
            data_source: 'csv' atau 'mysql'. Default dari settings
        """
        self.data_source = data_source or settings.data_source
        logger.info(f"DataLoader initialized with source: {self.data_source}")
    
    def load_products(self) -> pd.DataFrame:
        """
        Load data produk
        
        Returns:
            DataFrame dengan kolom: product_id, name, category, product_type,
            selling_price, quantity_info, shelf_life_days, total_stock, 
            description, is_active, created_at
        """
        if self.data_source == "csv":
            return self._load_products_from_csv()
        elif self.data_source == "mysql":
            return self._load_products_from_mysql()
        else:
            raise ValueError(f"Unknown data source: {self.data_source}")
    
    def load_orders(self) -> pd.DataFrame:
        """
        Load data orders/transaksi
        
        Returns:
            DataFrame dengan kolom: order_id, customer_id, product_id,
            quantity, total_price, order_date, order_status
        """
        if self.data_source == "csv":
            return self._load_orders_from_csv()
        elif self.data_source == "mysql":
            return self._load_orders_from_mysql()
        else:
            raise ValueError(f"Unknown data source: {self.data_source}")
    
    def load_customers(self) -> pd.DataFrame:
        """
        Load data customers
        
        Returns:
            DataFrame dengan kolom: customer_id, phone_number, full_name,
            address, created_at
        """
        if self.data_source == "csv":
            return self._load_customers_from_csv()
        elif self.data_source == "mysql":
            return self._load_customers_from_mysql()
        else:
            raise ValueError(f"Unknown data source: {self.data_source}")
    
    def load_all_data(self) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """
        Load semua data sekaligus
        
        Returns:
            Tuple of (products_df, orders_df, customers_df)
        """
        logger.info("Loading all datasets...")
        products = self.load_products()
        orders = self.load_orders()
        customers = self.load_customers()
        
        logger.info(f"✅ Loaded: {len(products)} products, {len(orders)} orders, {len(customers)} customers")
        return products, orders, customers
    
    # === CSV LOADING METHODS ===
    
    def _load_products_from_csv(self) -> pd.DataFrame:
        """Load products dari CSV file"""
        csv_path = settings.csv_products_path
        
        if not csv_path.exists():
            raise FileNotFoundError(f"Products CSV not found: {csv_path}")
        
        df = pd.read_csv(csv_path)
        
        # Rename columns to match expected schema
        df = df.rename(columns={
            'product_id': 'id',
            'name': 'product_name',
            'category': 'category_name'
        })
        
        # Convert types sesuai schema database
        # UUID stays as string - no conversion needed
        df['id'] = df['id'].astype(str)
        df['category_id'] = df['category_id'].astype(str)
        df['selling_price'] = df['selling_price'].astype(float)
        df['shelf_life_days'] = df['shelf_life_days'].astype(int)
        df['total_stock'] = df['total_stock'].astype(int)
        df['is_active'] = df['is_active'].astype(bool)
        df['created_at'] = pd.to_datetime(df['created_at'])
        
        logger.debug(f"Loaded {len(df)} products from CSV")
        return df
    
    def _load_orders_from_csv(self) -> pd.DataFrame:
        """Load orders dari CSV file"""
        csv_path = settings.csv_orders_path
        
        if not csv_path.exists():
            raise FileNotFoundError(f"Orders CSV not found: {csv_path}")
        
        df = pd.read_csv(csv_path)
        
        # Convert types - UUID stays as string
        df['id'] = df['id'].astype(str)
        df['order_number'] = df['order_number'].astype(str)
        df['customer_id'] = df['customer_id'].astype(str)
        df['product_id'] = df['product_id'].astype(str)
        df['quantity'] = df['quantity'].astype(int)
        df['total_price'] = df['total_price'].astype(float)
        df['order_date'] = pd.to_datetime(df['order_date'])
        
        logger.debug(f"Loaded {len(df)} order items from CSV")
        return df
    
    def _load_customers_from_csv(self) -> pd.DataFrame:
        """Load customers dari CSV file"""
        csv_path = settings.csv_customers_path
        
        if not csv_path.exists():
            raise FileNotFoundError(f"Customers CSV not found: {csv_path}")
        
        df = pd.read_csv(csv_path)
        
        # Convert types - UUID stays as string
        df['id'] = df['id'].astype(str)
        df['phone_number'] = df['phone_number'].astype(str)
        df['created_at'] = pd.to_datetime(df['created_at'])
        
        logger.debug(f"Loaded {len(df)} customers from CSV")
        return df
    
    # === MYSQL LOADING METHODS (untuk future implementation) ===
    
    def _load_products_from_mysql(self) -> pd.DataFrame:
        """
        Load products dari MySQL database
        
        Query dari tabel: products + categories + product_discounts (optional)
        """
        from config.database import get_db
        from sqlalchemy import text
        
        query = """
        SELECT 
            p.id as product_id,
            p.name,
            c.name as category,
            p.selling_price as price,
            p.quantity_info as unit,
            p.current_stock as stock,
            p.description,
            p.is_active,
            p.created_at
        FROM products p
        LEFT JOIN product_categories c ON p.category_id = c.id
        WHERE p.is_active = 1
        """
        
        db = next(get_db())
        df = pd.read_sql(query, db.bind)
        db.close()
        
        logger.debug(f"Loaded {len(df)} products from MySQL")
        return df
    
    def _load_orders_from_mysql(self) -> pd.DataFrame:
        """
        Load orders dari MySQL database
        
        Query dari tabel: orders + order_items
        """
        from config.database import get_db
        from sqlalchemy import text
        
        query = """
        SELECT 
            o.id as order_id,
            o.customer_id,
            oi.product_id,
            oi.quantity,
            oi.subtotal as total_price,
            o.created_at as order_date,
            o.order_status
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        WHERE o.order_status IN ('completed', 'paid')
        AND o.deleted_at IS NULL
        """
        
        db = next(get_db())
        df = pd.read_sql(query, db.bind)
        db.close()
        
        logger.debug(f"Loaded {len(df)} order items from MySQL")
        return df
    
    def _load_customers_from_mysql(self) -> pd.DataFrame:
        """
        Load customers dari MySQL database
        
        Query dari tabel: customers
        """
        from config.database import get_db
        
        query = """
        SELECT 
            id as customer_id,
            phone_number,
            full_name,
            address,
            created_at
        FROM customers
        WHERE is_active = 1
        """
        
        db = next(get_db())
        df = pd.read_sql(query, db.bind)
        db.close()
        
        logger.debug(f"Loaded {len(df)} customers from MySQL")
        return df
    
    # === HELPER METHODS ===
    
    def get_product_by_id(self, product_id: str) -> dict:
        """
        Get product information by UUID
        
        Args:
            product_id: UUID string of the product
            
        Returns:
            dict: Product info atau None jika tidak ditemukan
        """
        products_df, _, _ = self.load_all_data()
        product = products_df[products_df['id'] == product_id]
        
        if len(product) == 0:
            return None
        
        # Convert to dict
        return product.iloc[0].to_dict()


# Singleton instance
data_loader = DataLoader()

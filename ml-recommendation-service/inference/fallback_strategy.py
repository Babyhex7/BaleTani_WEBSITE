"""
Fallback Strategy - Backup recommendations when model fails
Provide reliable recommendations even when AI model error atau cold start
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import pandas as pd
from typing import List, Dict, Optional
from loguru import logger
import random


class FallbackStrategy:
    """
    Fallback Strategy untuk handle edge cases:
    1. Model error/unavailable
    2. Cold start (produk baru tanpa history)
    3. No similar products found
    4. User baru tanpa behavior history
    
    Strategy:
    - Same category products (paling relevan)
    - Popular products (based on order frequency)
    - Random products dari kategori populer
    """
    
    def __init__(self, products_df: pd.DataFrame, orders_df: Optional[pd.DataFrame] = None):
        """
        Initialize Fallback Strategy
        
        Args:
            products_df: DataFrame produk
            orders_df: DataFrame orders (optional, untuk calculate popularity)
        """
        self.products_df = products_df
        self.orders_df = orders_df
        
        # Pre-calculate popular products jika ada order data
        self.popular_products = None
        if orders_df is not None:
            self._calculate_popular_products()
        
        logger.info(f"✅ FallbackStrategy initialized with {len(products_df)} products")
    
    def _calculate_popular_products(self):
        """
        Calculate popular products based on order frequency
        Internal method, dipanggil saat initialization
        """
        if self.orders_df is None or len(self.orders_df) == 0:
            logger.warning("⚠️ No orders data, skipping popularity calculation")
            return
        
        # Count order frequency per product
        product_counts = self.orders_df['product_id'].value_counts().reset_index()
        product_counts.columns = ['product_id', 'order_count']
        
        # Merge dengan products untuk get product details
        self.popular_products = product_counts.merge(
            self.products_df,
            left_on='product_id',
            right_on='id',
            how='inner'
        )
        
        # Sort by order count descending
        self.popular_products = self.popular_products.sort_values('order_count', ascending=False)
        
        logger.info(f"✅ Calculated popularity for {len(self.popular_products)} products")
    
    def get_same_category_products(
        self,
        product_id: str,
        top_k: int = 10,
        exclude_self: bool = True
    ) -> List[Dict]:
        """
        Get products from same category
        Strategy paling relevan untuk fallback
        
        Args:
            product_id: UUID produk referensi
            top_k: Jumlah rekomendasi
            exclude_self: Exclude produk itu sendiri
            
        Returns:
            List of recommended products
        """
        # Find product
        product = self.products_df[self.products_df['id'] == product_id]
        
        if len(product) == 0:
            logger.warning(f"⚠️ Product {product_id} not found, returning popular products")
            return self.get_popular_products(top_k=top_k)
        
        # Get category
        category = product.iloc[0]['category_name']
        
        # Find products in same category
        same_category = self.products_df[
            (self.products_df['category_name'] == category) &
            (self.products_df['is_active'] == True)
        ]
        
        # Exclude self if requested
        if exclude_self:
            same_category = same_category[same_category['id'] != product_id]
        
        # Convert to recommendations format
        recommendations = []
        for _, row in same_category.head(top_k).iterrows():
            recommendations.append({
                'product_id': row['id'],
                'product_name': row['name'],
                'category_name': row['category_name'],
                'similarity_score': 0.7,  # Fallback score
                'percentage': '70.00%',
                'reason': f'Produk sejenis dalam kategori {category} (fallback)'
            })
        
        logger.info(f"✅ Fallback: Found {len(recommendations)} products in category {category}")
        return recommendations
    
    def get_popular_products(
        self,
        top_k: int = 10,
        category_filter: Optional[str] = None
    ) -> List[Dict]:
        """
        Get popular products based on order frequency
        Fallback ketika tidak ada data referensi sama sekali
        
        Args:
            top_k: Jumlah produk
            category_filter: Filter by kategori (optional)
            
        Returns:
            List of popular products
        """
        # Jika ada popular_products (calculated dari orders)
        if self.popular_products is not None:
            df = self.popular_products
            
            # Apply category filter if requested
            if category_filter:
                df = df[df['category_name'] == category_filter]
            
            # Take top-K
            top_products = df.head(top_k)
            
        else:
            # Jika tidak ada order data, ambil random products
            logger.warning("⚠️ No popularity data, using random products")
            df = self.products_df[self.products_df['is_active'] == True]
            
            # Apply category filter
            if category_filter:
                df = df[df['category_name'] == category_filter]
            
            # Random sample
            top_products = df.sample(n=min(top_k, len(df)))
        
        # Convert to recommendations format
        recommendations = []
        for _, row in top_products.iterrows():
            recommendations.append({
                'product_id': row['id'],
                'product_name': row['name'],
                'category_name': row['category_name'],
                'similarity_score': 0.5,  # Fallback score
                'percentage': '50.00%',
                'reason': 'Produk populer (fallback recommendation)'
            })
        
        logger.info(f"✅ Fallback: Returned {len(recommendations)} popular products")
        return recommendations
    
    def get_random_products(
        self,
        top_k: int = 10,
        category_filter: Optional[str] = None
    ) -> List[Dict]:
        """
        Get random products (last resort fallback)
        Ketika semua strategy lain gagal
        
        Args:
            top_k: Jumlah produk
            category_filter: Filter by kategori (optional)
            
        Returns:
            List of random products
        """
        df = self.products_df[self.products_df['is_active'] == True]
        
        # Apply category filter
        if category_filter:
            df = df[df['category_name'] == category_filter]
        
        # Random sample
        random_products = df.sample(n=min(top_k, len(df)))
        
        # Convert to recommendations format
        recommendations = []
        for _, row in random_products.iterrows():
            recommendations.append({
                'product_id': row['id'],
                'product_name': row['name'],
                'category_name': row['category_name'],
                'similarity_score': 0.3,  # Low score untuk random
                'percentage': '30.00%',
                'reason': 'Rekomendasi acak (emergency fallback)'
            })
        
        logger.warning(f"⚠️ Emergency fallback: Returned {len(recommendations)} random products")
        return recommendations
    
    def get_cross_sell_products(
        self,
        product_id: str,
        top_k: int = 10
    ) -> List[Dict]:
        """
        Get cross-sell products (produk dari kategori berbeda yang sering dibeli bersamaan)
        Advanced fallback strategy
        
        Args:
            product_id: UUID produk referensi
            top_k: Jumlah rekomendasi
            
        Returns:
            List of cross-sell products
        """
        if self.orders_df is None:
            logger.warning("⚠️ No orders data for cross-sell, using same category instead")
            return self.get_same_category_products(product_id, top_k)
        
        # Find product category
        product = self.products_df[self.products_df['id'] == product_id]
        if len(product) == 0:
            return self.get_popular_products(top_k)
        
        product_category = product.iloc[0]['category_name']
        
        # Strategy: Ambil produk dari kategori BERBEDA
        # yang paling populer (complement products)
        other_categories = self.products_df[
            (self.products_df['category_name'] != product_category) &
            (self.products_df['is_active'] == True)
        ]
        
        # Random sample dari kategori lain
        cross_sell = other_categories.sample(n=min(top_k, len(other_categories)))
        
        # Convert to recommendations format
        recommendations = []
        for _, row in cross_sell.iterrows():
            recommendations.append({
                'product_id': row['id'],
                'product_name': row['name'],
                'category_name': row['category_name'],
                'similarity_score': 0.6,
                'percentage': '60.00%',
                'reason': f'Cross-sell: Cocok dipadukan dengan {product_category}'
            })
        
        logger.info(f"✅ Cross-sell: Found {len(recommendations)} complementary products")
        return recommendations
    
    def get_new_arrivals(
        self,
        top_k: int = 10,
        days: int = 30
    ) -> List[Dict]:
        """
        Get new arrival products (produk yang baru ditambahkan)
        Good for cold start products
        
        Args:
            top_k: Jumlah produk
            days: Produk yang ditambahkan dalam X hari terakhir
            
        Returns:
            List of new products
        """
        # Check jika ada created_at column
        if 'created_at' in self.products_df.columns:
            from datetime import datetime, timedelta
            cutoff_date = datetime.now() - timedelta(days=days)
            
            new_products = self.products_df[
                (pd.to_datetime(self.products_df['created_at']) >= cutoff_date) &
                (self.products_df['is_active'] == True)
            ]
            
            if len(new_products) == 0:
                logger.warning(f"⚠️ No new products in last {days} days")
                return self.get_popular_products(top_k)
        else:
            # Jika tidak ada created_at, ambil produk terakhir by ID
            new_products = self.products_df[self.products_df['is_active'] == True].tail(top_k * 2)
        
        # Take top-K
        new_products = new_products.head(top_k)
        
        # Convert to recommendations format
        recommendations = []
        for _, row in new_products.iterrows():
            recommendations.append({
                'product_id': row['id'],
                'product_name': row['name'],
                'category_name': row['category_name'],
                'similarity_score': 0.8,
                'percentage': '80.00%',
                'reason': 'Produk baru (new arrival)'
            })
        
        logger.info(f"✅ New arrivals: Found {len(recommendations)} new products")
        return recommendations


if __name__ == "__main__":
    # Test fallback strategy
    from data.data_loader import DataLoader
    
    logger.info("=" * 60)
    logger.info("Testing Fallback Strategy")
    logger.info("=" * 60)
    
    # Load data
    data_loader = DataLoader()
    products_df = data_loader.load_products()
    orders_df = data_loader.load_orders()
    
    # Initialize
    fallback = FallbackStrategy(products_df, orders_df)
    
    # Test 1: Same category products
    logger.info("\n[TEST 1] Same Category Products")
    test_product_id = products_df.iloc[0]['id']
    recs = fallback.get_same_category_products(test_product_id, top_k=5)
    logger.info(f"✅ Got {len(recs)} same-category recommendations")
    for i, rec in enumerate(recs, 1):
        logger.info(f"  {i}. {rec['product_name']} - {rec['reason']}")
    
    # Test 2: Popular products
    logger.info("\n[TEST 2] Popular Products")
    popular = fallback.get_popular_products(top_k=5)
    logger.info(f"✅ Got {len(popular)} popular products")
    for i, rec in enumerate(popular, 1):
        logger.info(f"  {i}. {rec['product_name']}")
    
    # Test 3: Cross-sell
    logger.info("\n[TEST 3] Cross-Sell Products")
    cross_sell = fallback.get_cross_sell_products(test_product_id, top_k=5)
    logger.info(f"✅ Got {len(cross_sell)} cross-sell recommendations")
    for i, rec in enumerate(cross_sell, 1):
        logger.info(f"  {i}. {rec['product_name']} - {rec['reason']}")

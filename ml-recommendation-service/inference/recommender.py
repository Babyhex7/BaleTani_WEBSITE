"""
Inference Engine - Main Recommender System
Orchestrator utama untuk generate recommendations dengan caching dan fallback strategy
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import numpy as np
import pandas as pd
from typing import List, Dict, Optional, Tuple
from loguru import logger
import time

from models.content_based.ncb_model import NCBModel
from data.data_loader import DataLoader
from inference.cache_manager import CacheManager
from inference.fallback_strategy import FallbackStrategy


class Recommender:
    """
    Main Recommender Class - Orchestrator untuk semua rekomendasi
    
    Features:
    - Load trained model
    - Generate recommendations dengan caching
    - Fallback strategy jika model error
    - Cold start handling untuk produk baru
    - Business rules filtering
    """
    
    def __init__(
        self, 
        model_path: str = "models/saved_models/ncb_v2",
        use_cache: bool = True,
        cache_ttl: int = 3600  # 1 jam
    ):
        """
        Initialize Recommender
        
        Args:
            model_path: Path ke saved model
            use_cache: Aktifkan caching atau tidak
            cache_ttl: Time-to-live cache dalam detik (default: 1 jam)
        """
        logger.info("🔄 Initializing Recommender...")
        
        # Load model
        self.model = self._load_model(model_path)
        
        # Load data
        self.data_loader = DataLoader()
        self.products_df = self.data_loader.load_products()
        
        # Initialize cache manager
        self.use_cache = use_cache
        if use_cache:
            self.cache_manager = CacheManager(ttl=cache_ttl)
            logger.info(f"✅ Cache enabled (TTL: {cache_ttl}s)")
        else:
            self.cache_manager = None
            logger.info("⚠️ Cache disabled")
        
        # Initialize fallback strategy
        self.fallback = FallbackStrategy(self.products_df)
        
        logger.info(f"✅ Recommender initialized - {len(self.products_df)} products loaded")
    
    def _load_model(self, model_path: str) -> NCBModel:
        """
        Load trained NCB model
        
        Args:
            model_path: Path ke saved model
            
        Returns:
            Loaded NCBModel instance
        """
        try:
            logger.info(f"📦 Loading model from {model_path}...")
            model = NCBModel.load(model_path)
            logger.info("✅ Model loaded successfully")
            return model
        except Exception as e:
            logger.error(f"❌ Failed to load model: {e}")
            raise
    
    def get_similar_products(
        self,
        product_id: str,
        top_k: int = 10,
        filter_category: Optional[str] = None,
        min_stock: int = 0,
        exclude_inactive: bool = True
    ) -> Tuple[List[Dict], float]:
        """
        Get similar products based on product ID
        
        Args:
            product_id: UUID produk yang dijadikan referensi
            top_k: Jumlah rekomendasi yang diinginkan
            filter_category: Filter by kategori tertentu (optional)
            min_stock: Minimum stock yang harus tersedia
            exclude_inactive: Exclude produk tidak aktif
            
        Returns:
            Tuple[List[Dict], float]: (list of recommendations, computation_time_ms)
        """
        start_time = time.time()
        
        # Check cache terlebih dahulu
        if self.use_cache:
            cache_key = f"similar_{product_id}_{top_k}_{filter_category}_{min_stock}_{exclude_inactive}"
            cached_result = self.cache_manager.get(cache_key)
            if cached_result is not None:
                computation_time = (time.time() - start_time) * 1000
                logger.info(f"💾 Cache HIT for product {product_id} ({computation_time:.2f}ms)")
                return cached_result, computation_time
        
        try:
            # Generate recommendations dari model
            recommendations = self.model.recommend(
                product_id=product_id,
                top_k=top_k * 2  # Ambil lebih banyak untuk filtering
            )
            
            # Apply business rules filtering
            filtered_recs = self._apply_business_rules(
                recommendations,
                filter_category=filter_category,
                min_stock=min_stock,
                exclude_inactive=exclude_inactive
            )
            
            # Ambil top-K setelah filtering
            final_recs = filtered_recs[:top_k]
            
            # Format response
            result = self._format_recommendations(final_recs, product_id)
            
            # Save to cache
            if self.use_cache:
                self.cache_manager.set(cache_key, result)
            
            computation_time = (time.time() - start_time) * 1000
            logger.info(f"✅ Generated {len(result)} recommendations for {product_id} ({computation_time:.2f}ms)")
            
            return result, computation_time
            
        except Exception as e:
            logger.error(f"❌ Error generating recommendations: {e}")
            
            # Fallback strategy
            logger.info("🔄 Using fallback strategy...")
            fallback_recs = self.fallback.get_same_category_products(
                product_id=product_id,
                top_k=top_k
            )
            
            computation_time = (time.time() - start_time) * 1000
            return fallback_recs, computation_time
    
    def get_bundle_recommendations(
        self,
        product_ids: List[str],
        top_k: int = 10
    ) -> Tuple[List[Dict], float]:
        """
        Get bundle recommendations based on multiple products
        
        Strategy: Aggregate embeddings dari semua produk, lalu cari yang similar
        
        Args:
            product_ids: List UUID produk
            top_k: Jumlah rekomendasi
            
        Returns:
            Tuple[List[Dict], float]: (recommendations, computation_time_ms)
        """
        start_time = time.time()
        
        # Check cache
        if self.use_cache:
            cache_key = f"bundle_{'_'.join(sorted(product_ids))}_{top_k}"
            cached_result = self.cache_manager.get(cache_key)
            if cached_result is not None:
                computation_time = (time.time() - start_time) * 1000
                logger.info(f"💾 Cache HIT for bundle ({computation_time:.2f}ms)")
                return cached_result, computation_time
        
        try:
            # Get recommendations untuk setiap produk
            all_recommendations = []
            for pid in product_ids:
                recs = self.model.recommend(product_id=pid, top_k=top_k * 2)
                all_recommendations.extend(recs)
            
            # Aggregate scores (average) dan remove duplicates
            aggregated = self._aggregate_recommendations(all_recommendations, exclude_ids=product_ids)
            
            # Ambil top-K
            final_recs = aggregated[:top_k]
            
            # Format response
            result = self._format_recommendations(final_recs, reference_id=None)
            
            # Save to cache
            if self.use_cache:
                self.cache_manager.set(cache_key, result)
            
            computation_time = (time.time() - start_time) * 1000
            logger.info(f"✅ Generated {len(result)} bundle recommendations ({computation_time:.2f}ms)")
            
            return result, computation_time
            
        except Exception as e:
            logger.error(f"❌ Error generating bundle recommendations: {e}")
            
            # Fallback: return popular products
            fallback_recs = self.fallback.get_popular_products(top_k=top_k)
            computation_time = (time.time() - start_time) * 1000
            return fallback_recs, computation_time
    
    def get_trending_products(
        self,
        top_k: int = 10,
        category_filter: Optional[str] = None
    ) -> Tuple[List[Dict], float]:
        """
        Get trending products (most popular based on order frequency)
        
        Args:
            top_k: Jumlah produk trending
            category_filter: Filter by kategori (optional)
            
        Returns:
            Tuple[List[Dict], float]: (trending_products, computation_time_ms)
        """
        start_time = time.time()
        
        # Check cache
        if self.use_cache:
            cache_key = f"trending_{top_k}_{category_filter}"
            cached_result = self.cache_manager.get(cache_key)
            if cached_result is not None:
                computation_time = (time.time() - start_time) * 1000
                logger.info(f"💾 Cache HIT for trending ({computation_time:.2f}ms)")
                return cached_result, computation_time
        
        try:
            # Get trending dari fallback strategy (based on orders)
            trending = self.fallback.get_popular_products(
                top_k=top_k,
                category_filter=category_filter
            )
            
            # Save to cache
            if self.use_cache:
                self.cache_manager.set(cache_key, trending)
            
            computation_time = (time.time() - start_time) * 1000
            logger.info(f"✅ Retrieved {len(trending)} trending products ({computation_time:.2f}ms)")
            
            return trending, computation_time
            
        except Exception as e:
            logger.error(f"❌ Error getting trending products: {e}")
            computation_time = (time.time() - start_time) * 1000
            return [], computation_time
    
    def _apply_business_rules(
        self,
        recommendations: List[Dict],
        filter_category: Optional[str] = None,
        min_stock: int = 0,
        exclude_inactive: bool = True
    ) -> List[Dict]:
        """
        Apply business rules filtering
        
        Args:
            recommendations: List recommendations dari model
            filter_category: Filter by kategori
            min_stock: Minimum stock
            exclude_inactive: Exclude inactive products
            
        Returns:
            Filtered recommendations
        """
        filtered = recommendations.copy()
        
        # Filter by category
        if filter_category:
            filtered = [r for r in filtered if r.get('category_name') == filter_category]
        
        # Filter by stock
        if min_stock > 0:
            filtered = [r for r in filtered if r.get('total_stock', 0) >= min_stock]
        
        # Filter inactive products
        if exclude_inactive:
            filtered = [r for r in filtered if r.get('is_active', True)]
        
        return filtered
    
    def _aggregate_recommendations(
        self,
        recommendations: List[Dict],
        exclude_ids: List[str]
    ) -> List[Dict]:
        """
        Aggregate recommendations dari multiple sources
        Average similarity scores untuk produk yang sama
        
        Args:
            recommendations: List semua recommendations
            exclude_ids: Product IDs yang harus di-exclude
            
        Returns:
            Aggregated and sorted recommendations
        """
        # Group by product_id dan hitung average score
        aggregated = {}
        for rec in recommendations:
            pid = rec['product_id']
            
            # Skip jika ada di exclude_ids
            if pid in exclude_ids:
                continue
            
            if pid not in aggregated:
                aggregated[pid] = {
                    'product_id': pid,
                    'product_name': rec['product_name'],
                    'category_name': rec['category_name'],
                    'similarity_scores': []
                }
            
            aggregated[pid]['similarity_scores'].append(rec['similarity_score'])
        
        # Calculate average score
        result = []
        for pid, data in aggregated.items():
            avg_score = np.mean(data['similarity_scores'])
            result.append({
                'product_id': pid,
                'product_name': data['product_name'],
                'category_name': data['category_name'],
                'similarity_score': avg_score
            })
        
        # Sort by score descending
        result.sort(key=lambda x: x['similarity_score'], reverse=True)
        
        return result
    
    def _format_recommendations(
        self,
        recommendations: List[Dict],
        reference_id: Optional[str] = None
    ) -> List[Dict]:
        """
        Format recommendations untuk API response
        
        Args:
            recommendations: Raw recommendations dari model
            reference_id: Product ID referensi (untuk similar products)
            
        Returns:
            Formatted recommendations
        """
        formatted = []
        for rec in recommendations:
            formatted.append({
                'product_id': rec['product_id'],
                'product_name': rec['product_name'],
                'category_name': rec['category_name'],
                'similarity_score': float(rec['similarity_score']),
                'percentage': f"{rec['similarity_score'] * 100:.2f}%",
                'reason': self._generate_reason(rec, reference_id)
            })
        
        return formatted
    
    def _generate_reason(self, recommendation: Dict, reference_id: Optional[str]) -> str:
        """
        Generate reason string untuk recommendation
        
        Args:
            recommendation: Recommendation dict
            reference_id: Product ID referensi
            
        Returns:
            Reason string
        """
        score = recommendation['similarity_score']
        category = recommendation['category_name']
        
        if score > 0.9:
            return f"Produk sangat mirip dalam kategori {category}"
        elif score > 0.7:
            return f"Produk sejenis dengan karakteristik serupa dalam {category}"
        elif score > 0.5:
            return f"Produk terkait dalam kategori {category}"
        else:
            return f"Rekomendasi berdasarkan kategori {category}"
    
    def get_cache_stats(self) -> Dict:
        """
        Get cache statistics
        
        Returns:
            Cache stats dict
        """
        if self.use_cache:
            return self.cache_manager.get_stats()
        else:
            return {'cache_enabled': False}
    
    def clear_cache(self):
        """Clear all cache"""
        if self.use_cache:
            self.cache_manager.clear()
            logger.info("🗑️ Cache cleared")


if __name__ == "__main__":
    # Test recommender
    logger.info("=" * 60)
    logger.info("Testing Recommender Engine")
    logger.info("=" * 60)
    
    # Initialize
    recommender = Recommender(use_cache=True)
    
    # Test 1: Similar products
    logger.info("\n[TEST 1] Similar Products")
    products_df = recommender.products_df
    test_product_id = products_df.iloc[0]['id']
    
    recs, time_ms = recommender.get_similar_products(test_product_id, top_k=5)
    logger.info(f"✅ Got {len(recs)} recommendations in {time_ms:.2f}ms")
    for i, rec in enumerate(recs, 1):
        logger.info(f"  {i}. {rec['product_name']} - {rec['percentage']}")
    
    # Test 2: Bundle recommendations
    logger.info("\n[TEST 2] Bundle Recommendations")
    test_bundle = [products_df.iloc[0]['id'], products_df.iloc[1]['id']]
    bundle_recs, time_ms = recommender.get_bundle_recommendations(test_bundle, top_k=5)
    logger.info(f"✅ Got {len(bundle_recs)} bundle recommendations in {time_ms:.2f}ms")
    
    # Test 3: Cache hit
    logger.info("\n[TEST 3] Cache Hit Test")
    recs2, time_ms2 = recommender.get_similar_products(test_product_id, top_k=5)
    logger.info(f"✅ Second call took {time_ms2:.2f}ms (should be faster!)")
    
    # Cache stats
    logger.info("\n[CACHE STATS]")
    stats = recommender.get_cache_stats()
    logger.info(f"Stats: {stats}")

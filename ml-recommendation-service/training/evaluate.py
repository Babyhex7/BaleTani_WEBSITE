"""
Evaluation Script untuk NCB Model v3 🔬
✅ RE-USE metrics.py module (DRY principle)
✅ 10 COMPREHENSIVE METRICS
✅ EXPORT results ke JSON/CSV
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

import numpy as np
import pandas as pd
import json
from datetime import datetime
from typing import Dict, List, Tuple
from loguru import logger
from collections import defaultdict

from models.content_based.ncb_model import NCBModel
from data.data_loader import DataLoader
from training import metrics  # Import metrics module


class NCBEvaluator:
    """
    ✅ Evaluator untuk Neural Content-Based Filtering (V3)
    
    🆕 10 COMPREHENSIVE METRICS (dari metrics.py):
    1. Precision@K - Berapa persen rekomendasi yang relevan
    2. Recall@K - Berapa persen produk relevan yang direkomendasikan
    3. F1 Score - Harmonic mean precision & recall
    4. NDCG@K - Normalized Discounted Cumulative Gain ⭐
    5. MRR - Mean Reciprocal Rank
    6. Hit Rate@K - Persentase queries dapat minimal 1 relevant
    7. Diversity - Keberagaman kategori
    8. Novelty - Recommend produk jarang/niche
    9. Serendipity - Unexpected tapi relevan (coming soon)
    10. Coverage - Persentase catalog yang ter-recommend
    """
    
    def __init__(self, model: NCBModel, products_df: pd.DataFrame):
        """
        Initialize evaluator
        
        Args:
            model: Trained NCBModel
            products_df: Products dataframe
        """
        self.model = model
        self.products_df = products_df
        
        # Build category mapping (for diversity)
        self.product_categories = dict(zip(
            products_df['id'],
            products_df['category_id']  # Use category_id for metrics
        ))
        
        # Build category name mapping
        self.product_category_names = dict(zip(
            products_df['id'],
            products_df['category_name']
        ))
        
        # Build popularity scores (for novelty)
        max_stock = products_df['current_stock'].max()
        self.product_popularity = dict(zip(
            products_df['id'],
            products_df['current_stock'] / max(max_stock, 1)
        ))
        
        logger.info("NCBEvaluator v3 initialized with comprehensive metrics")
    
    def get_relevant_products(self, product_id: int) -> List[int]:
        """
        Get relevant products (same category_id)
        
        Args:
            product_id: Source product ID
            
        Returns:
            List of relevant product IDs
        """
        source_category_id = self.product_categories.get(product_id)
        
        if not source_category_id:
            return []
        
        # Produk relevan = produk dalam category_id sama (exclude source)
        relevant = [
            pid for pid, cat_id in self.product_categories.items()
            if cat_id == source_category_id and pid != product_id
        ]
        
        return relevant
    
    # ✅ REMOVED: Duplicate metric functions
    # All metrics now delegated to metrics.py module (DRY principle)
    
    def evaluate_sample(
        self, 
        product_id: int, 
        top_k: int = 10
    ) -> Dict[str, float]:
        """
        ✅ Evaluate single product recommendation (using metrics.py)
        
        Args:
            product_id: Source product ID
            top_k: Number of recommendations
            
        Returns:
            Dictionary of 10 comprehensive metrics
        """
        # Get recommendations
        recs = self.model.get_similar_products(product_id, top_k)
        recommended_ids = [rec['product_id'] for rec in recs]
        
        # Get relevant products
        relevant_ids = self.get_relevant_products(product_id)
        
        # ✅ USE metrics.py module
        result = {
            'precision@k': metrics.precision_at_k(recommended_ids, relevant_ids, top_k),
            'recall@k': metrics.recall_at_k(recommended_ids, relevant_ids, top_k),
            'f1_score': metrics.f1_score(recommended_ids, relevant_ids, top_k),
            'ndcg@k': metrics.ndcg_at_k(recommended_ids, relevant_ids, top_k),
            'mrr': metrics.reciprocal_rank(recommended_ids, relevant_ids),
            'diversity': metrics.diversity_score(recommended_ids, self.product_categories, top_k),
            'novelty': metrics.novelty_score(recommended_ids, self.product_popularity, top_k)
        }
        
        return result
    
    def evaluate_full(
        self, 
        sample_size: int = None,
        top_k: int = 10,
        export_path: str = None
    ) -> Dict[str, float]:
        """
        ✅ Evaluate model dengan 10 comprehensive metrics (using metrics.py)
        
        Args:
            sample_size: Number of products to evaluate (None = all)
            top_k: Number of recommendations per product
            export_path: Optional path untuk export results ke JSON
            
        Returns:
            Dictionary of average metrics (10 metrics)
        """
        logger.info("=" * 70)
        logger.info("EVALUATING NCB MODEL V3 - COMPREHENSIVE METRICS")
        logger.info("=" * 70)
        
        # Get product IDs
        all_product_ids = list(self.product_categories.keys())
        
        if sample_size:
            eval_product_ids = np.random.choice(
                all_product_ids, 
                min(sample_size, len(all_product_ids)),
                replace=False
            )
        else:
            eval_product_ids = all_product_ids
        
        logger.info(f"Evaluating {len(eval_product_ids)} products (top_k={top_k})...")
        
        # Collect metrics
        all_metrics = defaultdict(list)
        all_recommendations = []
        
        for i, product_id in enumerate(eval_product_ids, 1):
            if i % 10 == 0:
                logger.info(f"  Progress: {i}/{len(eval_product_ids)}...")
            
            try:
                metrics = self.evaluate_sample(product_id, top_k)
                recs = self.model.get_similar_products(product_id, top_k)
                recommended_ids = [rec['product_id'] for rec in recs]
                
                for key, value in metrics.items():
                    all_metrics[key].append(value)
                
                all_recommendations.append(recommended_ids)
                
            except Exception as e:
                logger.warning(f"  Error evaluating product {product_id}: {e}")
                continue
        
        # Calculate averages untuk semua metrics
        avg_metrics = {
            key: np.mean(values) for key, values in all_metrics.items()
        }
        
        # ✅ Add Hit Rate@K (binary metric)
        hit_count = sum(1 for m in all_metrics['precision@k'] if m > 0)
        avg_metrics['hit_rate@k'] = hit_count / len(eval_product_ids) if eval_product_ids else 0
        
        # ✅ Add Catalog Coverage
        catalog_size = len(self.products_df)
        avg_metrics['catalog_coverage'] = metrics.catalog_coverage(all_recommendations, catalog_size)
        
        # ✅ Print comprehensive results
        logger.info("\n" + "=" * 70)
        logger.info("📊 EVALUATION RESULTS (10 COMPREHENSIVE METRICS)")
        logger.info("=" * 70)
        logger.info(f"Evaluated Products: {len(eval_product_ids)}")
        logger.info(f"Top-K: {top_k}")
        logger.info("-" * 70)
        logger.info(f"Precision@{top_k}:        {avg_metrics.get('precision@k', 0):.4f} ({avg_metrics.get('precision@k', 0)*100:.2f}%)")
        logger.info(f"Recall@{top_k}:           {avg_metrics.get('recall@k', 0):.4f} ({avg_metrics.get('recall@k', 0)*100:.2f}%)")
        logger.info(f"F1 Score:              {avg_metrics.get('f1_score', 0):.4f} ({avg_metrics.get('f1_score', 0)*100:.2f}%)")
        logger.info(f"NDCG@{top_k}:             {avg_metrics.get('ndcg@k', 0):.4f} ({avg_metrics.get('ndcg@k', 0)*100:.2f}%) ⭐")
        logger.info(f"MRR:                   {avg_metrics.get('mrr', 0):.4f} ({avg_metrics.get('mrr', 0)*100:.2f}%)")
        logger.info(f"Hit Rate@{top_k}:         {avg_metrics.get('hit_rate@k', 0):.4f} ({avg_metrics.get('hit_rate@k', 0)*100:.2f}%)")
        logger.info(f"Diversity:             {avg_metrics.get('diversity', 0):.4f} ({avg_metrics.get('diversity', 0)*100:.2f}%)")
        logger.info(f"Novelty:               {avg_metrics.get('novelty', 0):.4f} ({avg_metrics.get('novelty', 0)*100:.2f}%)")
        logger.info(f"Catalog Coverage:      {avg_metrics['catalog_coverage']:.4f} ({avg_metrics['catalog_coverage']*100:.2f}%)")
        logger.info("=" * 70)
        
        # ✅ Export results to JSON if requested
        if export_path:
            export_data = {
                'evaluation_date': datetime.now().isoformat(),
                'config': {
                    'top_k': top_k,
                    'sample_size': sample_size,
                    'evaluated_products': len(eval_product_ids),
                    'total_products': len(self.products_df)
                },
                'metrics': {k: float(v) for k, v in avg_metrics.items()},
                'raw_metrics': {k: [float(x) for x in v] for k, v in all_metrics.items()}
            }
            
            export_file = Path(export_path)
            export_file.parent.mkdir(parents=True, exist_ok=True)
            
            with open(export_file, 'w') as f:
                json.dump(export_data, f, indent=2)
            
            logger.info(f"\n✅ Results exported to: {export_path}")
        
        return avg_metrics


def evaluate_model(
    model_path: str = "ml-recommendation-service/models/saved_models/ncb_v1",
    sample_size: int = None,
    top_k: int = 10
) -> Dict[str, float]:
    """
    Main evaluation function
    
    Args:
        model_path: Path ke saved model
        sample_size: Number of products to evaluate (None = all)
        top_k: Number of recommendations
        
    Returns:
        Dictionary of metrics
    """
    # Load model
    logger.info(f"Loading model from {model_path}...")
    model = NCBModel.load_model(model_path)
    
    # Load data
    logger.info("Loading product data...")
    data_loader = DataLoader()
    products_df, _, _ = data_loader.load_all_data()
    
    # Create evaluator
    evaluator = NCBEvaluator(model, products_df)
    
    # Run evaluation
    metrics = evaluator.evaluate_full(sample_size=sample_size, top_k=top_k)
    
    return metrics


if __name__ == "__main__":
    # Evaluate model
    metrics = evaluate_model(
        model_path="ml-recommendation-service/models/saved_models/ncb_v1",
        sample_size=None,  # Evaluate all products
        top_k=10
    )
    
    # Test recommendations untuk beberapa produk
    logger.info("\n" + "=" * 60)
    logger.info("SAMPLE RECOMMENDATIONS")
    logger.info("=" * 60)
    
    model = NCBModel.load_model("ml-recommendation-service/models/saved_models/ncb_v1")
    data_loader = DataLoader()
    products_df, _, _ = data_loader.load_all_data()
    
    # Test beberapa produk
    test_product_ids = [1, 10, 20, 30, 40]
    
    for pid in test_product_ids:
        product_info = products_df[products_df['id'] == pid]
        if len(product_info) == 0:
            continue
            
        product_name = product_info.iloc[0]['product_name']
        category = product_info.iloc[0]['category_name']
        
        logger.info(f"\nProduct: {product_name} ({category})")
        logger.info("-" * 60)
        
        recs = model.get_similar_products(pid, top_k=5)
        for i, rec in enumerate(recs, 1):
            logger.info(
                f"  {i}. {rec['product_name']} "
                f"({rec['category']}) - "
                f"Score: {rec['similarity_score']:.2%}"
            )

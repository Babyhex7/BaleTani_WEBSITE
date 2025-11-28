"""
Evaluation Script untuk NCB Model
Mengukur performa recommendation dengan berbagai metrics
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple
from loguru import logger
from collections import defaultdict

from models.content_based.ncb_model import NCBModel
from data.data_loader import DataLoader


class NCBEvaluator:
    """
    Evaluator untuk Neural Content-Based Filtering
    
    Metrics:
    1. Precision@K - Berapa persen rekomendasi yang relevan
    2. Recall@K - Berapa persen produk relevan yang direkomendasikan
    3. NDCG@K - Normalized Discounted Cumulative Gain
    4. Category Coverage - Berapa persen kategori yang tercakup
    5. Diversity Score - Seberapa diverse rekomendasi
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
        
        # Build category mapping
        self.product_categories = dict(zip(
            products_df['id'],
            products_df['category_name']
        ))
        
        logger.info("NCBEvaluator initialized")
    
    def get_relevant_products(self, product_id: int) -> List[int]:
        """
        Get relevant products (same category)
        
        Args:
            product_id: Source product ID
            
        Returns:
            List of relevant product IDs
        """
        source_category = self.product_categories.get(product_id)
        
        if not source_category:
            return []
        
        # Produk relevan = produk dalam kategori sama (exclude source)
        relevant = [
            pid for pid, cat in self.product_categories.items()
            if cat == source_category and pid != product_id
        ]
        
        return relevant
    
    def precision_at_k(self, recommended: List[int], relevant: List[int]) -> float:
        """
        Precision@K = (relevant items in recommendations) / K
        
        Args:
            recommended: List of recommended product IDs
            relevant: List of relevant product IDs
            
        Returns:
            Precision score [0, 1]
        """
        if len(recommended) == 0:
            return 0.0
        
        relevant_set = set(relevant)
        recommended_relevant = [pid for pid in recommended if pid in relevant_set]
        
        return len(recommended_relevant) / len(recommended)
    
    def recall_at_k(self, recommended: List[int], relevant: List[int]) -> float:
        """
        Recall@K = (relevant items in recommendations) / (total relevant items)
        
        Args:
            recommended: List of recommended product IDs
            relevant: List of relevant product IDs
            
        Returns:
            Recall score [0, 1]
        """
        if len(relevant) == 0:
            return 0.0
        
        relevant_set = set(relevant)
        recommended_relevant = [pid for pid in recommended if pid in relevant_set]
        
        return len(recommended_relevant) / len(relevant)
    
    def dcg_at_k(self, recommended: List[int], relevant: List[int]) -> float:
        """
        Discounted Cumulative Gain
        DCG = sum(relevance[i] / log2(i + 2)) for i in range(k)
        
        Args:
            recommended: List of recommended product IDs
            relevant: List of relevant product IDs
            
        Returns:
            DCG score
        """
        relevant_set = set(relevant)
        
        dcg = 0.0
        for i, pid in enumerate(recommended):
            if pid in relevant_set:
                # Relevance = 1 jika relevant, 0 jika tidak
                dcg += 1.0 / np.log2(i + 2)
        
        return dcg
    
    def ndcg_at_k(self, recommended: List[int], relevant: List[int]) -> float:
        """
        Normalized DCG
        NDCG = DCG / IDCG (ideal DCG)
        
        Args:
            recommended: List of recommended product IDs
            relevant: List of relevant product IDs
            
        Returns:
            NDCG score [0, 1]
        """
        dcg = self.dcg_at_k(recommended, relevant)
        
        # Ideal DCG: semua relevant items di posisi teratas
        k = len(recommended)
        ideal_relevant = min(k, len(relevant))
        idcg = sum(1.0 / np.log2(i + 2) for i in range(ideal_relevant))
        
        if idcg == 0:
            return 0.0
        
        return dcg / idcg
    
    def category_coverage(self, all_recommendations: List[List[int]]) -> float:
        """
        Berapa persen kategori yang muncul dalam rekomendasi
        
        Args:
            all_recommendations: List of recommendation lists
            
        Returns:
            Coverage percentage [0, 1]
        """
        # Get all categories
        all_categories = set(self.product_categories.values())
        
        # Get categories dalam recommendations
        recommended_categories = set()
        for recs in all_recommendations:
            for pid in recs:
                if pid in self.product_categories:
                    recommended_categories.add(self.product_categories[pid])
        
        return len(recommended_categories) / len(all_categories)
    
    def diversity_score(self, recommended: List[int]) -> float:
        """
        Diversity score = jumlah kategori unik / total recommendations
        
        Args:
            recommended: List of recommended product IDs
            
        Returns:
            Diversity score [0, 1]
        """
        if len(recommended) == 0:
            return 0.0
        
        categories = [
            self.product_categories.get(pid) 
            for pid in recommended 
            if pid in self.product_categories
        ]
        
        unique_categories = len(set(categories))
        return unique_categories / len(categories)
    
    def evaluate_sample(
        self, 
        product_id: int, 
        top_k: int = 10
    ) -> Dict[str, float]:
        """
        Evaluate single product recommendation
        
        Args:
            product_id: Source product ID
            top_k: Number of recommendations
            
        Returns:
            Dictionary of metrics
        """
        # Get recommendations
        recs = self.model.get_similar_products(product_id, top_k)
        recommended_ids = [rec['product_id'] for rec in recs]
        
        # Get relevant products
        relevant_ids = self.get_relevant_products(product_id)
        
        # Calculate metrics
        metrics = {
            'precision': self.precision_at_k(recommended_ids, relevant_ids),
            'recall': self.recall_at_k(recommended_ids, relevant_ids),
            'ndcg': self.ndcg_at_k(recommended_ids, relevant_ids),
            'diversity': self.diversity_score(recommended_ids)
        }
        
        return metrics
    
    def evaluate_full(
        self, 
        sample_size: int = None,
        top_k: int = 10
    ) -> Dict[str, float]:
        """
        Evaluate model pada semua/sample products
        
        Args:
            sample_size: Number of products to evaluate (None = all)
            top_k: Number of recommendations per product
            
        Returns:
            Dictionary of average metrics
        """
        logger.info("=" * 60)
        logger.info("EVALUATING NCB MODEL")
        logger.info("=" * 60)
        
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
        
        # Calculate averages
        avg_metrics = {
            key: np.mean(values) for key, values in all_metrics.items()
        }
        
        # Add category coverage
        avg_metrics['category_coverage'] = self.category_coverage(all_recommendations)
        
        # Print results
        logger.info("\n" + "=" * 60)
        logger.info("EVALUATION RESULTS")
        logger.info("=" * 60)
        logger.info(f"Evaluated Products: {len(eval_product_ids)}")
        logger.info(f"Top-K: {top_k}")
        logger.info("-" * 60)
        logger.info(f"Precision@{top_k}:        {avg_metrics['precision']:.4f} ({avg_metrics['precision']*100:.2f}%)")
        logger.info(f"Recall@{top_k}:           {avg_metrics['recall']:.4f} ({avg_metrics['recall']*100:.2f}%)")
        logger.info(f"NDCG@{top_k}:             {avg_metrics['ndcg']:.4f} ({avg_metrics['ndcg']*100:.2f}%)")
        logger.info(f"Diversity Score:       {avg_metrics['diversity']:.4f} ({avg_metrics['diversity']*100:.2f}%)")
        logger.info(f"Category Coverage:     {avg_metrics['category_coverage']:.4f} ({avg_metrics['category_coverage']*100:.2f}%)")
        logger.info("=" * 60)
        
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

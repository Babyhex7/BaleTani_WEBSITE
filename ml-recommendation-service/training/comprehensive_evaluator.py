"""
Comprehensive Evaluator - Evaluasi lengkap model NCB dengan 5 metrics penting
Evaluasi di semua data splits: train, validation, test, real_57
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple
from loguru import logger
import json
from datetime import datetime

from models.content_based.ncb_model import NCBModel
from data.data_loader import DataLoader
from training.metrics import (
    precision_at_k,
    recall_at_k,
    f1_score,
    ndcg_at_k,
    diversity_score
)


class ComprehensiveEvaluator:
    """
    Comprehensive Evaluator untuk NCB Model
    
    Evaluasi 5 metrics penting:
    1. NDCG@10 - Ranking quality (MOST IMPORTANT)
    2. Precision@10 - Akurasi recommendations
    3. Recall@10 - Coverage relevant items
    4. F1 Score - Balance precision & recall
    5. Diversity Score - Variety kategori
    
    Evaluasi di 4 data splits:
    - Train (700 produk)
    - Validation (150 produk)
    - Test (150 produk)
    - Real_57 (57 produk asli dari database)
    """
    
    def __init__(self, model_version: str = "ncb_v2", k: int = 10):
        """
        Initialize Evaluator
        
        Args:
            model_version: Versi model yang mau dievaluasi (v1, v2, v3)
            k: Top-K untuk evaluation (default: 10)
        """
        self.model_version = model_version
        self.k = k
        
        # Load data
        self.data_loader = DataLoader()
        
        # Results storage
        self.results = {}
        
        logger.info(f"✅ ComprehensiveEvaluator initialized for {model_version}")
    
    def load_model(self, model_path: str = None) -> NCBModel:
        """
        Load trained model
        
        Args:
            model_path: Path ke model (optional, default: models/saved_models/{model_version})
            
        Returns:
            Loaded NCBModel
        """
        if model_path is None:
            model_path = f"models/saved_models/{self.model_version}"
        
        logger.info(f"📦 Loading model from {model_path}...")
        model = NCBModel.load(model_path)
        logger.info("✅ Model loaded successfully")
        
        return model
    
    def evaluate_split(
        self,
        model: NCBModel,
        products_df: pd.DataFrame,
        split_name: str
    ) -> Dict:
        """
        Evaluate model pada satu data split
        
        Args:
            model: NCBModel instance
            products_df: DataFrame produk untuk split ini
            split_name: Nama split (train/val/test/real_57)
            
        Returns:
            Dict berisi metrics results
        """
        logger.info(f"\n{'='*60}")
        logger.info(f"Evaluating {split_name.upper()} split ({len(products_df)} products)")
        logger.info(f"{'='*60}")
        
        # Storage untuk metrics per query
        all_precision = []
        all_recall = []
        all_f1 = []
        all_ndcg = []
        all_diversity = []
        
        # Mapping category untuk diversity calculation
        product_to_category = dict(zip(products_df['id'], products_df['category_name']))
        
        # Test setiap produk sebagai query
        num_queries = min(50, len(products_df))  # Max 50 queries untuk speed
        test_products = products_df.sample(n=num_queries, random_state=42)
        
        for idx, (_, product) in enumerate(test_products.iterrows(), 1):
            query_id = product['id']
            query_category = product['category_name']
            
            try:
                # Get recommendations
                recommendations = model.recommend(product_id=query_id, top_k=self.k)
                
                if len(recommendations) == 0:
                    logger.warning(f"⚠️ No recommendations for {query_id}")
                    continue
                
                # Extract recommended IDs
                recommended_ids = [rec['product_id'] for rec in recommendations]
                
                # Ground truth: Produk dari kategori yang SAMA
                # (asumsi: produk sejenis adalah relevant)
                relevant_ids = products_df[
                    (products_df['category_name'] == query_category) &
                    (products_df['id'] != query_id)  # Exclude query itself
                ]['id'].tolist()
                
                if len(relevant_ids) == 0:
                    continue  # Skip jika tidak ada relevant items
                
                # Calculate metrics
                prec = precision_at_k(recommended_ids, relevant_ids, k=self.k)
                rec = recall_at_k(recommended_ids, relevant_ids, k=self.k)
                f1 = f1_score(recommended_ids, relevant_ids, k=self.k)
                ndcg = ndcg_at_k(recommended_ids, relevant_ids, k=self.k)
                
                # Diversity: Berapa banyak kategori unik di recommendations
                recommended_categories = [product_to_category.get(rid) for rid in recommended_ids if rid in product_to_category]
                diversity = diversity_score(recommended_ids, product_to_category)
                
                # Store metrics
                all_precision.append(prec)
                all_recall.append(rec)
                all_f1.append(f1)
                all_ndcg.append(ndcg)
                all_diversity.append(diversity)
                
                # Log setiap 10 queries
                if idx % 10 == 0:
                    logger.info(f"  Processed {idx}/{num_queries} queries...")
                
            except Exception as e:
                logger.error(f"❌ Error processing {query_id}: {e}")
                continue
        
        # Aggregate results
        results = {
            'split_name': split_name,
            'total_products': len(products_df),
            'num_queries': len(all_precision),
            'k': self.k,
            'metrics': {
                'precision@k': {
                    'mean': float(np.mean(all_precision)),
                    'std': float(np.std(all_precision)),
                    'min': float(np.min(all_precision)),
                    'max': float(np.max(all_precision))
                },
                'recall@k': {
                    'mean': float(np.mean(all_recall)),
                    'std': float(np.std(all_recall)),
                    'min': float(np.min(all_recall)),
                    'max': float(np.max(all_recall))
                },
                'f1_score': {
                    'mean': float(np.mean(all_f1)),
                    'std': float(np.std(all_f1)),
                    'min': float(np.min(all_f1)),
                    'max': float(np.max(all_f1))
                },
                'ndcg@k': {
                    'mean': float(np.mean(all_ndcg)),
                    'std': float(np.std(all_ndcg)),
                    'min': float(np.min(all_ndcg)),
                    'max': float(np.max(all_ndcg))
                },
                'diversity': {
                    'mean': float(np.mean(all_diversity)),
                    'std': float(np.std(all_diversity)),
                    'min': float(np.min(all_diversity)),
                    'max': float(np.max(all_diversity))
                }
            }
        }
        
        # Print results
        self._print_results(results)
        
        return results
    
    def evaluate_all_splits(self, model: NCBModel) -> Dict:
        """
        Evaluate model di semua data splits
        
        Args:
            model: NCBModel instance
            
        Returns:
            Dict berisi results untuk semua splits
        """
        logger.info("\n" + "="*80)
        logger.info("COMPREHENSIVE EVALUATION - ALL SPLITS")
        logger.info("="*80)
        
        all_results = {}
        
        # 1. Train split
        try:
            logger.info("\n[1/4] Loading TRAIN split...")
            train_df = pd.read_csv('data/splits/train/products_train.csv')
            all_results['train'] = self.evaluate_split(model, train_df, 'train')
        except Exception as e:
            logger.error(f"❌ Failed to evaluate train split: {e}")
        
        # 2. Validation split
        try:
            logger.info("\n[2/4] Loading VALIDATION split...")
            val_df = pd.read_csv('data/splits/validation/products_val.csv')
            all_results['validation'] = self.evaluate_split(model, val_df, 'validation')
        except Exception as e:
            logger.error(f"❌ Failed to evaluate validation split: {e}")
        
        # 3. Test split
        try:
            logger.info("\n[3/4] Loading TEST split...")
            test_df = pd.read_csv('data/splits/test/products_test.csv')
            all_results['test'] = self.evaluate_split(model, test_df, 'test')
        except Exception as e:
            logger.error(f"❌ Failed to evaluate test split: {e}")
        
        # 4. Real 57 products
        try:
            logger.info("\n[4/4] Loading REAL_57 split...")
            real_df = pd.read_csv('data/raw/products_57_real_test.csv')
            all_results['real_57'] = self.evaluate_split(model, real_df, 'real_57')
        except Exception as e:
            logger.error(f"❌ Failed to evaluate real_57 split: {e}")
        
        # Save results
        self.results = all_results
        
        return all_results
    
    def _print_results(self, results: Dict):
        """
        Print evaluation results dengan format yang rapi
        
        Args:
            results: Results dict dari evaluate_split
        """
        logger.info(f"\n📊 RESULTS for {results['split_name'].upper()}")
        logger.info(f"Total Products: {results['total_products']}")
        logger.info(f"Queries Evaluated: {results['num_queries']}")
        logger.info(f"Top-K: {results['k']}")
        logger.info("-" * 60)
        
        metrics = results['metrics']
        
        # Format table
        logger.info(f"{'Metric':<20} {'Mean':<10} {'Std':<10} {'Min':<10} {'Max':<10}")
        logger.info("-" * 60)
        
        for metric_name, values in metrics.items():
            mean = values['mean']
            std = values['std']
            min_val = values['min']
            max_val = values['max']
            
            logger.info(f"{metric_name:<20} {mean:<10.4f} {std:<10.4f} {min_val:<10.4f} {max_val:<10.4f}")
        
        logger.info("-" * 60)
        
        # Status indicators
        ndcg_mean = metrics['ndcg@k']['mean']
        prec_mean = metrics['precision@k']['mean']
        div_mean = metrics['diversity']['mean']
        
        logger.info("\n🎯 TARGET ACHIEVEMENT:")
        logger.info(f"  NDCG@{self.k}:    {ndcg_mean:.4f} {'✅ EXCELLENT' if ndcg_mean > 0.7 else '⚠️ GOOD' if ndcg_mean > 0.5 else '❌ POOR'} (target: >0.7)")
        logger.info(f"  Precision@{self.k}: {prec_mean:.4f} {'✅ EXCELLENT' if prec_mean > 0.5 else '⚠️ GOOD' if prec_mean > 0.3 else '❌ POOR'} (target: >0.5)")
        logger.info(f"  Diversity:  {div_mean:.4f} {'✅ EXCELLENT' if div_mean > 0.7 else '⚠️ GOOD' if div_mean > 0.5 else '❌ POOR'} (target: >0.7)")
    
    def generate_comparison_table(self) -> pd.DataFrame:
        """
        Generate comparison table untuk semua splits
        
        Returns:
            DataFrame dengan comparison metrics
        """
        if not self.results:
            logger.warning("⚠️ No results to compare. Run evaluate_all_splits() first.")
            return None
        
        # Build comparison data
        comparison_data = []
        
        for split_name, result in self.results.items():
            metrics = result['metrics']
            
            row = {
                'Split': split_name,
                'Products': result['total_products'],
                'Queries': result['num_queries'],
                'NDCG@10': metrics['ndcg@k']['mean'],
                'Precision@10': metrics['precision@k']['mean'],
                'Recall@10': metrics['recall@k']['mean'],
                'F1 Score': metrics['f1_score']['mean'],
                'Diversity': metrics['diversity']['mean']
            }
            
            comparison_data.append(row)
        
        # Create DataFrame
        df = pd.DataFrame(comparison_data)
        
        # Print table
        logger.info("\n" + "="*100)
        logger.info("📊 COMPARISON TABLE - ALL SPLITS")
        logger.info("="*100)
        logger.info(df.to_string(index=False))
        logger.info("="*100)
        
        return df
    
    def save_results(self, output_dir: str = "training/evaluation_results"):
        """
        Save evaluation results ke JSON dan CSV
        
        Args:
            output_dir: Directory untuk save results
        """
        import os
        os.makedirs(output_dir, exist_ok=True)
        
        # Generate timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Save full results as JSON
        json_path = f"{output_dir}/{self.model_version}_results_{timestamp}.json"
        with open(json_path, 'w') as f:
            json.dump(self.results, f, indent=2)
        logger.info(f"✅ Full results saved to {json_path}")
        
        # Save comparison table as CSV
        comparison_df = self.generate_comparison_table()
        if comparison_df is not None:
            csv_path = f"{output_dir}/{self.model_version}_comparison_{timestamp}.csv"
            comparison_df.to_csv(csv_path, index=False)
            logger.info(f"✅ Comparison table saved to {csv_path}")
        
        # Save summary report
        self._generate_summary_report(output_dir, timestamp)
    
    def _generate_summary_report(self, output_dir: str, timestamp: str):
        """
        Generate summary report dalam format markdown
        
        Args:
            output_dir: Directory untuk save report
            timestamp: Timestamp string
        """
        report_path = f"{output_dir}/{self.model_version}_report_{timestamp}.md"
        
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(f"# 📊 Evaluation Report - {self.model_version.upper()}\n\n")
            f.write(f"**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"**Model Version:** {self.model_version}\n")
            f.write(f"**Top-K:** {self.k}\n\n")
            
            f.write("---\n\n")
            f.write("## 📋 Summary\n\n")
            
            # Comparison table
            comparison_df = self.generate_comparison_table()
            if comparison_df is not None:
                f.write("### Comparison Across Splits\n\n")
                f.write(comparison_df.to_markdown(index=False))
                f.write("\n\n")
            
            f.write("---\n\n")
            f.write("## 🎯 Target Achievement\n\n")
            
            # Check targets untuk setiap split
            for split_name, result in self.results.items():
                metrics = result['metrics']
                ndcg = metrics['ndcg@k']['mean']
                prec = metrics['precision@k']['mean']
                div = metrics['diversity']['mean']
                
                f.write(f"### {split_name.upper()}\n\n")
                f.write(f"- **NDCG@{self.k}:** {ndcg:.4f} ")
                f.write(f"{'✅ EXCELLENT' if ndcg > 0.7 else '⚠️ GOOD' if ndcg > 0.5 else '❌ POOR'}\n")
                f.write(f"- **Precision@{self.k}:** {prec:.4f} ")
                f.write(f"{'✅ EXCELLENT' if prec > 0.5 else '⚠️ GOOD' if prec > 0.3 else '❌ POOR'}\n")
                f.write(f"- **Diversity:** {div:.4f} ")
                f.write(f"{'✅ EXCELLENT' if div > 0.7 else '⚠️ GOOD' if div > 0.5 else '❌ POOR'}\n\n")
            
            f.write("---\n\n")
            f.write("## 💡 Recommendations\n\n")
            
            # Best split
            best_split = max(self.results.items(), key=lambda x: x[1]['metrics']['ndcg@k']['mean'])
            f.write(f"**Best Performing Split:** {best_split[0].upper()}\n")
            f.write(f"**NDCG@{self.k}:** {best_split[1]['metrics']['ndcg@k']['mean']:.4f}\n\n")
            
            f.write("---\n\n")
            f.write("Generated by ComprehensiveEvaluator\n")
        
        logger.info(f"✅ Summary report saved to {report_path}")


def main():
    """Main function untuk run comprehensive evaluation"""
    logger.info("=" * 80)
    logger.info("COMPREHENSIVE MODEL EVALUATION")
    logger.info("=" * 80)
    
    # Initialize evaluator
    evaluator = ComprehensiveEvaluator(model_version="ncb_v2", k=10)
    
    # Load model
    model = evaluator.load_model()
    
    # Evaluate all splits
    results = evaluator.evaluate_all_splits(model)
    
    # Generate comparison table
    evaluator.generate_comparison_table()
    
    # Save results
    evaluator.save_results()
    
    logger.info("\n✅ Evaluation completed!")
    logger.info("Check training/evaluation_results/ for detailed reports")


if __name__ == "__main__":
    main()

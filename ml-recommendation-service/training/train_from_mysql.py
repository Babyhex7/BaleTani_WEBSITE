"""
Training NCB Model dari MySQL Database
Train model dengan produk yang ada di database real-time
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import numpy as np
import pandas as pd
import tensorflow as tf
import json
from datetime import datetime
from loguru import logger
from typing import Dict, Tuple, List

from models.content_based.ncb_model import NCBModel
from models.content_based.product_encoder import contrastive_loss
from data.data_loader import DataLoader
from training.metrics import (
    precision_at_k,
    recall_at_k,
    f1_score,
    ndcg_at_k,
    diversity_score
)


# ===== CONFIGURATION =====
CONFIG = {
    'model_version': 'ncb_mysql_v1',
    'embedding_dim': 32,
    'batch_size': 16,  # Smaller batch karena data lebih sedikit
    'epochs': 50,
    'learning_rate': 0.001,
    'early_stopping_patience': 10,
    'validation_split': 0.15,  # 15% untuk validation
    'k': 5  # Top-K untuk evaluation
}


def load_data_from_mysql() -> pd.DataFrame:
    """
    Load products dari MySQL database
    
    Returns:
        DataFrame dengan semua products
    """
    logger.info("📂 Loading products from MySQL database...")
    
    data_loader = DataLoader()  # Will use mysql from .env
    products_df = data_loader.load_products()
    
    logger.info(f"✅ Loaded {len(products_df)} products from database")
    
    # Category distribution
    logger.info("\n📊 Category Distribution:")
    category_counts = products_df['category_name'].value_counts()
    for cat, count in category_counts.items():
        logger.info(f"  - {cat}: {count} products")
    
    return products_df


def split_data(products_df: pd.DataFrame, val_ratio: float = 0.15) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Split data into train and validation
    
    Args:
        products_df: All products
        val_ratio: Validation split ratio
        
    Returns:
        Tuple[train_df, val_df]
    """
    logger.info(f"\n🔀 Splitting data (validation: {val_ratio*100:.0f}%)...")
    
    # Stratified split by category
    train_dfs = []
    val_dfs = []
    
    for category in products_df['category_name'].unique():
        cat_df = products_df[products_df['category_name'] == category]
        
        # Calculate split point
        n_val = max(1, int(len(cat_df) * val_ratio))  # At least 1 for validation
        n_train = len(cat_df) - n_val
        
        # Shuffle and split
        cat_df_shuffled = cat_df.sample(frac=1.0, random_state=42).reset_index(drop=True)
        train_dfs.append(cat_df_shuffled.iloc[:n_train])
        val_dfs.append(cat_df_shuffled.iloc[n_train:])
    
    train_df = pd.concat(train_dfs, ignore_index=True).sample(frac=1.0, random_state=42)
    val_df = pd.concat(val_dfs, ignore_index=True).sample(frac=1.0, random_state=42)
    
    logger.info(f"✅ Training:   {len(train_df)} products")
    logger.info(f"✅ Validation: {len(val_df)} products")
    
    return train_df, val_df


def create_training_pairs(products_df: pd.DataFrame, pairs_per_product: int = 5) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Create positive & negative pairs untuk contrastive learning
    
    Args:
        products_df: DataFrame produk
        pairs_per_product: Jumlah pairs per product
        
    Returns:
        Tuple[indices_1, indices_2, labels]
    """
    logger.info(f"🔄 Creating training pairs ({pairs_per_product} pairs/product)...")
    
    pairs_1 = []
    pairs_2 = []
    labels = []
    
    # Group by category
    categories = products_df['category_name'].unique()
    category_groups = {cat: products_df[products_df['category_name'] == cat].index.tolist() 
                      for cat in categories}
    
    # Create pairs for each product
    for idx in range(len(products_df)):
        category = products_df.iloc[idx]['category_name']
        same_category_indices = [i for i in category_groups[category] if i != idx]
        
        # Skip if no other products in same category
        if len(same_category_indices) == 0:
            continue
        
        # Positive pairs (same category)
        n_positive = min(pairs_per_product // 2, len(same_category_indices))
        for _ in range(n_positive):
            positive_idx = np.random.choice(same_category_indices)
            pairs_1.append(idx)
            pairs_2.append(positive_idx)
            labels.append(1)  # Similar
        
        # Negative pairs (different category)
        other_categories = [cat for cat in categories if cat != category]
        n_negative = pairs_per_product - n_positive
        for _ in range(n_negative):
            negative_cat = np.random.choice(other_categories)
            negative_idx = np.random.choice(category_groups[negative_cat])
            pairs_1.append(idx)
            pairs_2.append(negative_idx)
            labels.append(0)  # Not similar
    
    indices_1 = np.array(pairs_1)
    indices_2 = np.array(pairs_2)
    labels_array = np.array(labels)
    
    logger.info(f"✅ Created {len(indices_1)} training pairs")
    logger.info(f"  - Positive pairs (same category): {(labels_array == 1).sum()}")
    logger.info(f"  - Negative pairs (different category): {(labels_array == 0).sum()}")
    
    return indices_1, indices_2, labels_array


def train_model():
    """Main training function"""
    logger.info("=" * 80)
    logger.info("🚀 TRAINING NCB MODEL FROM MYSQL DATABASE")
    logger.info("=" * 80)
    logger.info(f"\n📋 Configuration:")
    for key, value in CONFIG.items():
        logger.info(f"  - {key}: {value}")
    
    # Initialize database connection
    from config.database import init_database
    logger.info("\n🔄 Initializing MySQL database connection...")
    init_database()
    logger.info("✅ Database connection initialized")
    
    # 1. Load data
    products_df = load_data_from_mysql()
    
    # 2. Split data
    train_df, val_df = split_data(products_df, val_ratio=CONFIG['validation_split'])
    
    # 3. Create training pairs
    train_indices_1, train_indices_2, train_labels = create_training_pairs(train_df)
    
    # 4. Initialize model
    logger.info("\n🔧 Initializing NCB Model...")
    model = NCBModel(embedding_dim=CONFIG['embedding_dim'])
    
    # 5. Train model
    logger.info("\n🎯 Starting training...")
    logger.info(f"  - Training samples: {len(train_indices_1)}")
    logger.info(f"  - Validation products: {len(val_df)}")
    
    try:
        history = model.train(
            products_df=train_df,
            indices_1=train_indices_1,
            indices_2=train_indices_2,
            labels=train_labels,
            embedding_dim=CONFIG['embedding_dim'],
            batch_size=CONFIG['batch_size'],
            epochs=CONFIG['epochs'],
            learning_rate=CONFIG['learning_rate']
        )
        
        logger.info("\n✅ Training completed successfully!")
        
        # 6. Save model
        save_dir = Path(__file__).parent.parent / "models" / "saved_models" / CONFIG['model_version']
        save_dir.mkdir(parents=True, exist_ok=True)
        
        logger.info(f"\n💾 Saving model to {save_dir}...")
        model.save_model(str(save_dir))
        
        # Save config
        config_path = save_dir / "model_config.json"
        with open(config_path, 'w') as f:
            json.dump(CONFIG, f, indent=2)
        logger.info(f"✅ Config saved to {config_path}")
        
        # Save training info
        training_info = {
            'trained_at': datetime.now().isoformat(),
            'total_products': len(products_df),
            'train_products': len(train_df),
            'val_products': len(val_df),
            'training_pairs': len(train_indices_1),
            'categories': products_df['category_name'].value_counts().to_dict(),
            'config': CONFIG
        }
        
        info_path = save_dir / "training_info.json"
        with open(info_path, 'w') as f:
            json.dump(training_info, f, indent=2)
        logger.info(f"✅ Training info saved to {info_path}")
        
        logger.info("\n" + "=" * 80)
        logger.info("🎉 TRAINING COMPLETE!")
        logger.info("=" * 80)
        logger.info(f"\n✅ Model saved at: {save_dir}")
        logger.info(f"✅ Total indexed products: {len(products_df)}")
        logger.info(f"✅ Ready for inference!")
        
    except Exception as e:
        logger.error(f"\n❌ Training failed: {e}")
        raise


if __name__ == "__main__":
    train_model()

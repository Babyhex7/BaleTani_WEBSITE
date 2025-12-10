"""
Training Script untuk NCB Model v4 🚀
✅ Gunakan dataset 1000 produk balanced (70/15/15 split)
✅ 5 METRICS PENTING: NDCG@10, Precision@10, Recall@10, F1, Diversity
✅ Early stopping based on NDCG@10
✅ Validation metrics setiap epoch
✅ Best model auto-save
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
from training.metrics import (
    precision_at_k,
    recall_at_k,
    f1_score,
    ndcg_at_k,
    diversity_score
)


# ===== CONFIGURATION =====
CONFIG = {
    'model_version': 'ncb_v4',
    'embedding_dim': 32,
    'batch_size': 32,
    'epochs': 100,
    'learning_rate': 0.001,
    'early_stopping_patience': 15,
    'validation_sample_size': 30,  # Sample queries untuk validation (speed up)
    'k': 10  # Top-K untuk evaluation
}


def load_split_data() -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Load data dari splits folder (train/val/test)
    
    Returns:
        Tuple[train_df, val_df, test_df]
    """
    logger.info("📂 Loading split datasets from data/splits/...")
    
    base_path = Path(__file__).parent.parent / 'data' / 'splits'
    
    # Load all splits
    train_df = pd.read_csv(base_path / 'train' / 'products_train.csv')
    val_df = pd.read_csv(base_path / 'validation' / 'products_val.csv')
    test_df = pd.read_csv(base_path / 'test' / 'products_test.csv')
    
    logger.info(f"✅ Training:   {len(train_df)} products")
    logger.info(f"✅ Validation: {len(val_df)} products")
    logger.info(f"✅ Test:       {len(test_df)} products")
    logger.info(f"✅ Total:      {len(train_df) + len(val_df) + len(test_df)} products")
    
    # Category distribution
    logger.info("\n📊 Category Distribution:")
    logger.info(f"{'Category':<20} {'Train':<8} {'Val':<8} {'Test':<8} {'Total':<8}")
    logger.info("-" * 60)
    
    for cat in sorted(train_df['category_name'].unique()):
        train_cnt = (train_df['category_name'] == cat).sum()
        val_cnt = (val_df['category_name'] == cat).sum()
        test_cnt = (test_df['category_name'] == cat).sum()
        total_cnt = train_cnt + val_cnt + test_cnt
        logger.info(f"{cat:<20} {train_cnt:<8} {val_cnt:<8} {test_cnt:<8} {total_cnt:<8}")
    
    return train_df, val_df, test_df


def create_training_pairs(products_df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Create positive & negative pairs untuk contrastive learning
    
    Strategy:
    - Positive pairs: Same category products (label = 1)
    - Negative pairs: Different category products (label = 0)
    
    Args:
        products_df: DataFrame produk
        
    Returns:
        Tuple[indices_1, indices_2, labels]
    """
    logger.info("🔄 Creating training pairs...")
    
    pairs_1 = []
    pairs_2 = []
    labels = []
    
    product_ids = products_df['id'].tolist()
    categories = products_df['category_name'].tolist()
    
    # Group products by category
    category_groups = {}
    for idx, (pid, cat) in enumerate(zip(product_ids, categories)):
        if cat not in category_groups:
            category_groups[cat] = []
        category_groups[cat].append(idx)
    
    # Create positive pairs (same category)
    for cat, indices in category_groups.items():
        if len(indices) < 2:
            continue
        
        # Ambil semua kombinasi pairs dalam kategori yang sama
        for i in range(len(indices)):
            for j in range(i + 1, min(i + 5, len(indices))):  # Max 5 pairs per product
                pairs_1.append(indices[i])
                pairs_2.append(indices[j])
                labels.append(1.0)  # Positive pair
    
    # Create negative pairs (different category)
    num_positive = len(labels)
    categories_list = list(category_groups.keys())
    
    for _ in range(num_positive):
        # Random select 2 different categories
        cat1, cat2 = np.random.choice(categories_list, size=2, replace=False)
        
        # Random select 1 product from each category
        idx1 = np.random.choice(category_groups[cat1])
        idx2 = np.random.choice(category_groups[cat2])
        
        pairs_1.append(idx1)
        pairs_2.append(idx2)
        labels.append(0.0)  # Negative pair
    
    pairs_1 = np.array(pairs_1)
    pairs_2 = np.array(pairs_2)
    labels = np.array(labels)
    
    num_positive = (labels == 1).sum()
    num_negative = (labels == 0).sum()
    
    logger.info(f"✅ Created {len(labels)} pairs:")
    logger.info(f"   - Positive pairs (same category): {num_positive}")
    logger.info(f"   - Negative pairs (diff category): {num_negative}")
    
    return pairs_1, pairs_2, labels


def calculate_validation_metrics(
    model: NCBModel,
    train_df: pd.DataFrame,
    val_df: pd.DataFrame,
    k: int = 10,
    sample_size: int = 30
) -> Dict[str, float]:
    """
    Calculate 5 metrics penting pada validation set
    
    IMPORTANT: Metrics dihitung pada TRAIN products (yang sudah di-index)
    
    Args:
        model: NCBModel instance (must be indexed with train_df)
        train_df: DataFrame training products (yang di-index)
        val_df: DataFrame validation products (untuk reference)
        k: Top-K untuk evaluation
        sample_size: Berapa query yang mau dievaluasi
        
    Returns:
        Dict berisi 5 metrics
    """
    # Sample products dari TRAIN set (yang sudah di-index)
    sample_products = train_df.sample(n=min(sample_size, len(train_df)), random_state=42)
    
    # Storage untuk metrics
    all_precision = []
    all_recall = []
    all_f1 = []
    all_ndcg = []
    all_diversity = []
    
    # Category mapping untuk diversity (gabungan train + val)
    all_products_df = pd.concat([train_df, val_df], ignore_index=True) if len(val_df) > 0 else train_df
    product_to_category = dict(zip(all_products_df['id'], all_products_df['category_name']))
    
    # Evaluate setiap query
    for _, query_product in sample_products.iterrows():
        query_id = query_product['id']
        query_category = query_product['category_name']
        
        try:
            # Get recommendations using get_similar_products
            recommendations = model.get_similar_products(product_id=query_id, top_k=k)
            
            if len(recommendations) == 0:
                continue
            
            # Extract recommended IDs
            recommended_ids = [rec['product_id'] for rec in recommendations]
            
            # Ground truth: Produk dari kategori yang SAMA (dari train set)
            relevant_ids = train_df[
                (train_df['category_name'] == query_category) &
                (train_df['id'] != query_id)
            ]['id'].tolist()
            
            if len(relevant_ids) == 0:
                continue
            
            # Calculate metrics
            prec = precision_at_k(recommended_ids, relevant_ids, k=k)
            rec = recall_at_k(recommended_ids, relevant_ids, k=k)
            f1 = f1_score(recommended_ids, relevant_ids, k=k)
            ndcg = ndcg_at_k(recommended_ids, relevant_ids, k=k)
            diversity = diversity_score(recommended_ids, product_to_category)
            
            # Store
            all_precision.append(prec)
            all_recall.append(rec)
            all_f1.append(f1)
            all_ndcg.append(ndcg)
            all_diversity.append(diversity)
            
        except Exception as e:
            logger.debug(f"Error in validation metrics for {query_id}: {e}")
            continue
    
    # Aggregate
    if len(all_precision) == 0:
        logger.warning("⚠️ No successful validation queries!")
        return {
            'precision@k': 0.0,
            'recall@k': 0.0,
            'f1_score': 0.0,
            'ndcg@k': 0.0,
            'diversity': 0.0
        }
    
    return {
        'precision@k': float(np.mean(all_precision)),
        'recall@k': float(np.mean(all_recall)),
        'f1_score': float(np.mean(all_f1)),
        'ndcg@k': float(np.mean(all_ndcg)),
        'diversity': float(np.mean(all_diversity))
    }


def train_model():
    """Main training function"""
    logger.info("=" * 80)
    logger.info(f"TRAINING NCB MODEL {CONFIG['model_version'].upper()}")
    logger.info("=" * 80)
    logger.info(f"Configuration: {json.dumps(CONFIG, indent=2)}")
    
    # ===== STEP 1: Load Data =====
    logger.info("\n[STEP 1/7] Loading data...")
    train_df, val_df, test_df = load_split_data()
    
    # Untuk training, gunakan train_df
    # Untuk validation metrics, gunakan val_df
    
    # ===== STEP 2: Create NCB Model =====
    logger.info("\n[STEP 2/7] Creating NCB Model...")
    model = NCBModel(embedding_dim=CONFIG['embedding_dim'])
    
    # ===== STEP 3: Prepare Features =====
    logger.info("\n[STEP 3/7] Preparing features...")
    
    # Fit preprocessor pada TRAIN data
    train_features = model.prepare_data(train_df)
    logger.info("✅ Preprocessor fitted on training data")
    
    # Transform validation data menggunakan fitted preprocessor
    val_features = model.preprocessor.transform_products(val_df)
    # Add TF-IDF features
    val_features['tfidf_features'] = model.text_extractor.transform(val_features['product_names'])
    logger.info("✅ Validation features transformed")
    
    # ===== STEP 4: Build Neural Network =====
    logger.info("\n[STEP 4/7] Building neural network...")
    model.build_model(train_features)
    logger.info(f"✅ Model architecture built")
    model.encoder.summary(print_fn=logger.info)
    
    # ===== STEP 5: Create Training Pairs =====
    logger.info("\n[STEP 5/7] Creating training pairs...")
    training_data, pair_labels = model.create_training_pairs(train_features, n_pairs_per_product=5)
    pair_labels = np.array(pair_labels)
    
    # ===== STEP 6: Training Loop =====
    logger.info("\n[STEP 6/7] Training model...")
    logger.info(f"Epochs: {CONFIG['epochs']}, Batch Size: {CONFIG['batch_size']}")
    logger.info(f"Early Stopping: Patience={CONFIG['early_stopping_patience']} (based on NDCG@{CONFIG['k']})")
    
    # Compile contrastive train step
    optimizer = tf.keras.optimizers.Adam(learning_rate=CONFIG['learning_rate'])
    
    @tf.function
    def train_step(inputs_1, inputs_2, labels_batch):
        with tf.GradientTape() as tape:
            # Map keys dari plural ke singular
            mapped_inputs_1 = model._map_features_to_encoder_inputs(inputs_1)
            mapped_inputs_2 = model._map_features_to_encoder_inputs(inputs_2)
            
            embeddings_1 = model.encoder(mapped_inputs_1, training=True)
            embeddings_2 = model.encoder(mapped_inputs_2, training=True)
            loss = contrastive_loss(embeddings_1, embeddings_2, labels_batch, margin=1.0)
        
        gradients = tape.gradient(loss, model.encoder.trainable_variables)
        optimizer.apply_gradients(zip(gradients, model.encoder.trainable_variables))
        
        return loss
    
    # Training history
    history = {
        'train_loss': [],
        'val_metrics': []
    }
    
    # Early stopping variables
    best_ndcg = 0.0
    patience_counter = 0
    best_epoch = 0
    
    # Training loop
    # training_data adalah tuple: (inputs_1_dict, inputs_2_dict)
    inputs_1_dict, inputs_2_dict = training_data
    n_pairs = len(pair_labels)
    num_batches = n_pairs // CONFIG['batch_size']
    
    for epoch in range(CONFIG['epochs']):
        logger.info(f"\n{'='*60}")
        logger.info(f"Epoch {epoch+1}/{CONFIG['epochs']}")
        logger.info(f"{'='*60}")
        
        # Shuffle pairs
        shuffle_idx = np.random.permutation(n_pairs)
        labels_shuffled = pair_labels[shuffle_idx]
        
        # Training
        epoch_losses = []
        
        for batch_idx in range(num_batches):
            start_idx = batch_idx * CONFIG['batch_size']
            end_idx = start_idx + CONFIG['batch_size']
            
            # Get batch indices
            batch_indices = shuffle_idx[start_idx:end_idx]
            batch_labels = labels_shuffled[start_idx:end_idx]
            
            # Extract features untuk batch
            batch_features_1 = {key: np.array([value[i] for i in batch_indices]) for key, value in inputs_1_dict.items()}
            batch_features_2 = {key: np.array([value[i] for i in batch_indices]) for key, value in inputs_2_dict.items()}
            
            # Train step
            loss = train_step(batch_features_1, batch_features_2, batch_labels)
            epoch_losses.append(float(loss))
        
        # Calculate average loss
        avg_loss = np.mean(epoch_losses)
        history['train_loss'].append(avg_loss)
        
        logger.info(f"Train Loss: {avg_loss:.4f}")
        
        # ===== VALIDATION METRICS =====
        logger.info("\n📊 Calculating validation metrics...")
        
        # Generate embeddings untuk validation (needed for recommend function)
        embeddings = model.generate_embeddings(train_features)
        model.similarity_engine.index_products(embeddings, train_df['id'].values)
        model.products_df = train_df
        model.is_trained = True
        
        # Calculate metrics (use train products yang sudah di-index)
        val_metrics = calculate_validation_metrics(
            model=model,
            train_df=train_df,
            val_df=val_df,
            k=CONFIG['k'],
            sample_size=CONFIG['validation_sample_size']
        )
        
        history['val_metrics'].append(val_metrics)
        
        # Log metrics
        logger.info(f"  NDCG@{CONFIG['k']}:      {val_metrics['ndcg@k']:.4f} {'✅' if val_metrics['ndcg@k'] > 0.7 else '⚠️'}")
        logger.info(f"  Precision@{CONFIG['k']}: {val_metrics['precision@k']:.4f} {'✅' if val_metrics['precision@k'] > 0.5 else '⚠️'}")
        logger.info(f"  Recall@{CONFIG['k']}:    {val_metrics['recall@k']:.4f}")
        logger.info(f"  F1 Score:     {val_metrics['f1_score']:.4f}")
        logger.info(f"  Diversity:    {val_metrics['diversity']:.4f} {'✅' if val_metrics['diversity'] > 0.7 else '⚠️'}")
        
        # ===== EARLY STOPPING CHECK =====
        current_ndcg = val_metrics['ndcg@k']
        
        if current_ndcg > best_ndcg:
            best_ndcg = current_ndcg
            best_epoch = epoch + 1
            patience_counter = 0
            
            # Save best model
            model_save_path = f"models/saved_models/{CONFIG['model_version']}"
            model.save_model(model_save_path)
            logger.info(f"✅ New best model saved! NDCG@{CONFIG['k']}: {best_ndcg:.4f}")
            
        else:
            patience_counter += 1
            logger.info(f"⚠️ No improvement. Patience: {patience_counter}/{CONFIG['early_stopping_patience']}")
            
            if patience_counter >= CONFIG['early_stopping_patience']:
                logger.info(f"\n🛑 Early stopping triggered at epoch {epoch+1}")
                logger.info(f"Best NDCG@{CONFIG['k']}: {best_ndcg:.4f} (Epoch {best_epoch})")
                break
    
    # ===== STEP 7: Final Evaluation & Save =====
    logger.info("\n[STEP 7/7] Final evaluation & saving...")
    
    # Load best model
    best_model_path = f"models/saved_models/{CONFIG['model_version']}"
    logger.info(f"Loading best model from {best_model_path}...")
    best_model = NCBModel.load_model(best_model_path, embedding_dim=CONFIG['embedding_dim'])
    
    # Final evaluation on test set
    logger.info("\n📊 Final Evaluation on TEST set...")
    
    # Re-index dengan TRAIN data (model should be indexed with train products)
    train_features = best_model.prepare_data(train_df)
    train_embeddings = best_model.generate_embeddings(train_features)
    best_model.similarity_engine.index_products(train_embeddings, train_df['id'].values)
    best_model.products_df = train_df
    
    # Now evaluate using test queries
    test_metrics = calculate_validation_metrics(
        model=best_model,
        train_df=train_df,  # Model indexed with train
        val_df=test_df,  # Query from test
        k=CONFIG['k'],
        sample_size=50  # More queries untuk final test
    )
    
    logger.info(f"\n{'='*60}")
    logger.info("FINAL TEST METRICS")
    logger.info(f"{'='*60}")
    logger.info(f"NDCG@{CONFIG['k']}:      {test_metrics['ndcg@k']:.4f} {'✅' if test_metrics['ndcg@k'] > 0.7 else '⚠️'}")
    logger.info(f"Precision@{CONFIG['k']}: {test_metrics['precision@k']:.4f} {'✅' if test_metrics['precision@k'] > 0.5 else '⚠️'}")
    logger.info(f"Recall@{CONFIG['k']}:    {test_metrics['recall@k']:.4f}")
    logger.info(f"F1 Score:     {test_metrics['f1_score']:.4f}")
    logger.info(f"Diversity:    {test_metrics['diversity']:.4f} {'✅' if test_metrics['diversity'] > 0.7 else '⚠️'}")
    logger.info(f"{'='*60}")
    
    # Save training history
    history_path = f"{best_model_path}/training_history_v4.json"
    with open(history_path, 'w') as f:
        json.dump({
            'config': CONFIG,
            'best_epoch': best_epoch,
            'best_ndcg': best_ndcg,
            'train_loss': history['train_loss'],
            'val_metrics': history['val_metrics'],
            'final_test_metrics': test_metrics,
            'timestamp': datetime.now().isoformat()
        }, f, indent=2)
    
    logger.info(f"\n✅ Training history saved to {history_path}")
    
    # Success message
    logger.info("\n" + "="*80)
    logger.info("🎉 TRAINING COMPLETED SUCCESSFULLY!")
    logger.info("="*80)
    logger.info(f"Model Version: {CONFIG['model_version']}")
    logger.info(f"Best Epoch: {best_epoch}/{CONFIG['epochs']}")
    logger.info(f"Best NDCG@{CONFIG['k']}: {best_ndcg:.4f}")
    logger.info(f"Final Test NDCG@{CONFIG['k']}: {test_metrics['ndcg@k']:.4f}")
    logger.info(f"Model saved at: {best_model_path}")
    logger.info("="*80)


if __name__ == "__main__":
    train_model()

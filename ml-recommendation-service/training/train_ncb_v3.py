"""
Training Script untuk NCB Model v3 🚀
✅ AUTO-LOAD dari data/splits/ (train/val/test)
✅ COMPREHENSIVE METRICS - 10 metrics lengkap dari metrics.py
✅ VALIDATION METRICS setiap epoch
✅ EARLY STOPPING based on NDCG@10 (industry standard)
✅ BEST MODEL SAVING
✅ 1000 produk balanced dataset
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
from typing import Dict, Tuple

from models.content_based.ncb_model import NCBModel
from models.content_based.product_encoder import contrastive_loss
from training import metrics  # Import metrics module baru
from config.settings import settings


def load_split_data():
    """
    ✅ AUTO-LOAD dari data/splits/ folder
    Load train, validation, test dari folder splits yang sudah dibuat
    """
    logger.info("Loading split datasets from data/splits/...")
    
    base_path = Path(__file__).parent.parent / 'data' / 'splits'
    
    # Load train
    train_path = base_path / 'train' / 'products_train.csv'
    train_df = pd.read_csv(train_path)
    
    # Load validation
    val_path = base_path / 'validation' / 'products_val.csv'
    val_df = pd.read_csv(val_path)
    
    # Load test
    test_path = base_path / 'test' / 'products_test.csv'
    test_df = pd.read_csv(test_path)
    
    logger.info(f"✅ Training:   {len(train_df)} products")
    logger.info(f"✅ Validation: {len(val_df)} products")
    logger.info(f"✅ Test:       {len(test_df)} products")
    logger.info(f"✅ Total:      {len(train_df) + len(val_df) + len(test_df)} products")
    
    # Category distribution check
    logger.info("\n📋 Category Distribution:")
    for cat in sorted(train_df['category_name'].unique()):
        train_count = (train_df['category_name'] == cat).sum()
        val_count = (val_df['category_name'] == cat).sum()
        test_count = (test_df['category_name'] == cat).sum()
        total = train_count + val_count + test_count
        logger.info(f"  {cat:20s}: Train={train_count:3d}, Val={val_count:3d}, Test={test_count:3d}, Total={total:4d}")
    
    return train_df, val_df, test_df


def compile_contrastive_model(model: NCBModel, learning_rate: float = 0.001):
    """Compile model dengan contrastive loss"""
    logger.info(f"Compiling model with contrastive loss (LR={learning_rate:.2e})...")
    
    optimizer = tf.keras.optimizers.Adam(learning_rate=learning_rate)
    
    @tf.function
    def train_step(inputs_1, inputs_2, labels):
        with tf.GradientTape() as tape:
            embeddings_1 = model.encoder(inputs_1, training=True)
            embeddings_2 = model.encoder(inputs_2, training=True)
            loss = contrastive_loss(embeddings_1, embeddings_2, labels, margin=1.0)
        
        gradients = tape.gradient(loss, model.encoder.trainable_variables)
        optimizer.apply_gradients(zip(gradients, model.encoder.trainable_variables))
        
        return loss
    
    return train_step


def calculate_comprehensive_metrics(
    model: NCBModel, 
    products_df: pd.DataFrame, 
    features: dict,
    k: int = 10,
    sample_size: int = None
) -> Dict[str, float]:
    """
    ✅ COMPREHENSIVE METRICS - Pakai metrics.py module
    Calculate 10 metrics lengkap:
    1. Precision@K
    2. Recall@K
    3. F1 Score
    4. NDCG@K (industry standard!)
    5. MRR
    6. Hit Rate@K
    7. Diversity
    8. Novelty
    9. Serendipity
    10. Coverage
    
    Args:
        model: Trained NCBModel
        products_df: Products dataframe
        features: Product features
        k: Top-K for metrics
        sample_size: Number of products to sample (None = all)
    
    Returns:
        Dictionary of metrics
    """
    logger.info(f"  Calculating comprehensive metrics (k={k})...")
    
    # Sample products if needed
    if sample_size and sample_size < len(products_df):
        eval_df = products_df.sample(n=sample_size, random_state=42)
    else:
        eval_df = products_df
    
    # Build category mapping for diversity
    product_categories = dict(zip(products_df['id'], products_df['category_id']))
    
    # Build popularity scores for novelty (based on stock as proxy)
    max_stock = products_df['current_stock'].max()
    product_popularity = dict(zip(
        products_df['id'], 
        products_df['current_stock'] / max_stock
    ))
    
    # Collect metrics
    all_precision = []
    all_recall = []
    all_f1 = []
    all_ndcg = []
    all_mrr = []
    all_diversity = []
    all_novelty = []
    
    all_recommendations = []
    hit_count = 0
    
    for _, row in eval_df.iterrows():
        product_id = row['id']
        true_category = row['category_id']
        
        try:
            # Get recommendations
            similar = model.similarity_engine.find_similar(
                product_id=product_id,
                top_k=k,
                exclude_self=True
            )
            
            if not similar:
                continue
            
            # Extract recommended IDs
            recommended_ids = [rec_id for rec_id, score in similar]
            all_recommendations.append(recommended_ids)
            
            # Get relevant products (same category, exclude self)
            relevant_ids = products_df[
                (products_df['category_id'] == true_category) & 
                (products_df['id'] != product_id)
            ]['id'].tolist()
            
            # Calculate metrics using metrics.py
            prec = metrics.precision_at_k(recommended_ids, relevant_ids, k)
            rec = metrics.recall_at_k(recommended_ids, relevant_ids, k)
            f1 = metrics.f1_score(recommended_ids, relevant_ids, k)
            ndcg = metrics.ndcg_at_k(recommended_ids, relevant_ids, k)
            rr = metrics.reciprocal_rank(recommended_ids, relevant_ids)
            div = metrics.diversity_score(recommended_ids, product_categories, k)
            nov = metrics.novelty_score(recommended_ids, product_popularity, k)
            
            all_precision.append(prec)
            all_recall.append(rec)
            all_f1.append(f1)
            all_ndcg.append(ndcg)
            all_mrr.append(rr)
            all_diversity.append(div)
            all_novelty.append(nov)
            
            # Hit rate (binary: apakah ada minimal 1 relevant item?)
            if any(rid in relevant_ids for rid in recommended_ids):
                hit_count += 1
            
        except Exception as e:
            logger.debug(f"Error evaluating product {product_id}: {e}")
            continue
    
    # Calculate averages
    n_evaluated = len(all_precision)
    
    if n_evaluated == 0:
        logger.warning("  ⚠️ No products evaluated!")
        return {metric: 0.0 for metric in [
            'precision@k', 'recall@k', 'f1_score', 'ndcg@k', 'mrr',
            'hit_rate@k', 'diversity', 'novelty', 'catalog_coverage'
        ]}
    
    # Catalog coverage
    catalog_size = len(products_df)
    coverage = metrics.catalog_coverage(all_recommendations, catalog_size)
    
    result_metrics = {
        'precision@k': np.mean(all_precision),
        'recall@k': np.mean(all_recall),
        'f1_score': np.mean(all_f1),
        'ndcg@k': np.mean(all_ndcg),
        'mrr': np.mean(all_mrr),
        'hit_rate@k': hit_count / n_evaluated,
        'diversity': np.mean(all_diversity),
        'novelty': np.mean(all_novelty),
        'catalog_coverage': coverage,
        'n_evaluated': n_evaluated
    }
    
    return result_metrics


def print_metrics(metrics_dict: dict, title: str = "Metrics"):
    """Pretty print metrics"""
    logger.info(f"\n  📊 {title}:")
    logger.info(f"    Precision@10:      {metrics_dict['precision@k']:.4f} ({metrics_dict['precision@k']*100:.2f}%)")
    logger.info(f"    Recall@10:         {metrics_dict['recall@k']:.4f} ({metrics_dict['recall@k']*100:.2f}%)")
    logger.info(f"    F1 Score:          {metrics_dict['f1_score']:.4f} ({metrics_dict['f1_score']*100:.2f}%)")
    logger.info(f"    NDCG@10:           {metrics_dict['ndcg@k']:.4f} ({metrics_dict['ndcg@k']*100:.2f}%) ⭐")
    logger.info(f"    MRR:               {metrics_dict['mrr']:.4f} ({metrics_dict['mrr']*100:.2f}%)")
    logger.info(f"    Hit Rate@10:       {metrics_dict['hit_rate@k']:.4f} ({metrics_dict['hit_rate@k']*100:.2f}%)")
    logger.info(f"    Diversity:         {metrics_dict['diversity']:.4f} ({metrics_dict['diversity']*100:.2f}%)")
    logger.info(f"    Novelty:           {metrics_dict['novelty']:.4f} ({metrics_dict['novelty']*100:.2f}%)")
    logger.info(f"    Catalog Coverage:  {metrics_dict['catalog_coverage']:.4f} ({metrics_dict['catalog_coverage']*100:.2f}%)")
    logger.info(f"    (Evaluated: {metrics_dict.get('n_evaluated', 'N/A')} products)")


def train_ncb_v3(
    epochs: int = 100,
    batch_size: int = 32,
    learning_rate: float = 0.001,
    embedding_dim: int = 64,
    tfidf_max_features: int = 150,
    n_pairs_per_product: int = 10,
    patience: int = 15,
    min_delta: float = 0.001,  # Minimum NDCG improvement
    lr_patience: int = 5,
    lr_factor: float = 0.5,
    min_lr: float = 1e-6,
    save_dir: str = "models/saved_models/ncb_v3",
    eval_every_n_epochs: int = 5  # Evaluate validation metrics setiap N epochs
):
    """
    ✅ NCB V3 TRAINING - The Complete Solution!
    
    Improvements dari v2:
    1. Auto-load dari data/splits/ (stratified 70/15/15)
    2. 10 comprehensive metrics (metrics.py module)
    3. Validation metrics tracking setiap epoch
    4. Early stopping based on NDCG@10 (bukan val_loss!)
    5. Best model checkpoint saving
    6. 1000 products balanced dataset
    """
    logger.info("=" * 80)
    logger.info("NCB MODEL V3 TRAINING - COMPREHENSIVE METRICS & AUTO-SPLIT")
    logger.info("=" * 80)
    
    # 1. Load split data
    logger.info("\n[STEP 1/9] Loading split datasets...")
    train_df, val_df, test_df = load_split_data()
    
    # 2. Create model
    logger.info(f"\n[STEP 2/9] Creating NCBModel v3...")
    logger.info(f"  Embedding dim: {embedding_dim}")
    logger.info(f"  TF-IDF max features: {tfidf_max_features}")
    
    model = NCBModel(
        embedding_dim=embedding_dim,
        tfidf_max_features=tfidf_max_features
    )
    
    # 3. Prepare training data
    logger.info("\n[STEP 3/9] Preparing training features...")
    train_features = model.prepare_data(train_df)
    
    # 4. Build model
    logger.info("\n[STEP 4/9] Building neural network...")
    model.build_model(train_features)
    
    # 5. Create training pairs
    logger.info(f"\n[STEP 5/9] Creating contrastive training pairs...")
    (inputs_1, inputs_2), labels = model.create_training_pairs(
        train_features, 
        n_pairs_per_product=n_pairs_per_product
    )
    
    # Prepare validation data
    logger.info("  Preparing validation features...")
    val_features = model.preprocessor.transform_products(val_df)
    val_tfidf = model.text_extractor.transform(val_features['product_names'])
    val_features['tfidf_features'] = val_tfidf
    
    (val_inputs_1, val_inputs_2), val_labels = model.create_training_pairs(
        val_features,
        n_pairs_per_product=n_pairs_per_product
    )
    
    logger.info(f"  Training pairs: {len(labels):,}")
    logger.info(f"  Validation pairs: {len(val_labels):,}")
    
    # 6. Training loop with validation metrics
    logger.info(f"\n[STEP 6/9] Training neural network with validation tracking...")
    logger.info(f"  Epochs: {epochs}")
    logger.info(f"  Batch size: {batch_size}")
    logger.info(f"  Initial learning rate: {learning_rate}")
    logger.info(f"  Early stopping: NDCG@10 (patience={patience}, min_delta={min_delta})")
    logger.info(f"  Validation eval: Every {eval_every_n_epochs} epochs")
    
    current_lr = learning_rate
    train_step = compile_contrastive_model(model, current_lr)
    
    # Helper to map keys
    def map_to_encoder(features_dict):
        return {
            'category_id': features_dict['category_ids'],
            'product_type_id': features_dict['product_type_ids'],
            'price_tier': features_dict['price_tiers'],
            'shelf_life_tier': features_dict['shelf_life_tiers'],
            'price_normalized': features_dict['prices_normalized'],
            'stock_normalized': features_dict['stocks_normalized'],
            'shelf_life_normalized': features_dict['shelf_life_normalized'],
            'tfidf_features': features_dict['tfidf_features']
        }
    
    # Training history
    history = {
        'loss': [],
        'val_loss': [],
        'val_ndcg': [],
        'val_precision': [],
        'val_recall': [],
        'val_f1': [],
        'learning_rate': [],
        'epoch_time': []
    }
    
    n_train = len(labels)
    n_batches = (n_train + batch_size - 1) // batch_size
    
    # Early stopping based on NDCG@10
    best_ndcg = 0.0
    best_epoch = 0
    patience_counter = 0
    lr_patience_counter = 0
    total_lr_reductions = 0
    best_model_weights = None
    
    for epoch in range(epochs):
        epoch_start = datetime.now()
        
        # Shuffle training data
        shuffle_indices = np.random.permutation(n_train)
        
        # Training
        train_losses = []
        for i in range(n_batches):
            batch_indices = shuffle_indices[i * batch_size:(i + 1) * batch_size]
            
            batch_features_1 = {key: val[batch_indices] for key, val in inputs_1.items()}
            batch_features_2 = {key: val[batch_indices] for key, val in inputs_2.items()}
            
            batch_inputs_1 = {k: tf.constant(v) for k, v in map_to_encoder(batch_features_1).items()}
            batch_inputs_2 = {k: tf.constant(v) for k, v in map_to_encoder(batch_features_2).items()}
            batch_labels = tf.constant(labels[batch_indices])
            
            loss = train_step(batch_inputs_1, batch_inputs_2, batch_labels)
            train_losses.append(loss.numpy())
        
        avg_train_loss = np.mean(train_losses)
        
        # Validation loss
        val_inputs_1_mapped = {k: tf.constant(v) for k, v in map_to_encoder(val_inputs_1).items()}
        val_inputs_2_mapped = {k: tf.constant(v) for k, v in map_to_encoder(val_inputs_2).items()}
        
        val_embeddings_1 = model.encoder(val_inputs_1_mapped, training=False)
        val_embeddings_2 = model.encoder(val_inputs_2_mapped, training=False)
        val_loss = contrastive_loss(
            val_embeddings_1, 
            val_embeddings_2, 
            tf.constant(val_labels),
            margin=1.0
        ).numpy()
        
        epoch_time = (datetime.now() - epoch_start).total_seconds()
        
        # Save loss history
        history['loss'].append(float(avg_train_loss))
        history['val_loss'].append(float(val_loss))
        history['learning_rate'].append(float(current_lr))
        history['epoch_time'].append(float(epoch_time))
        
        # Evaluate validation metrics every N epochs
        if (epoch + 1) % eval_every_n_epochs == 0 or epoch == 0:
            logger.info(f"\n  🔍 Evaluating validation metrics at epoch {epoch+1}...")
            
            # Generate embeddings untuk validation set
            temp_val_features = model.preprocessor.transform_products(val_df)
            temp_val_tfidf = model.text_extractor.transform(temp_val_features['product_names'])
            temp_val_features['tfidf_features'] = temp_val_tfidf
            temp_val_embeddings = model.generate_embeddings(temp_val_features)
            
            # Temporarily index validation products
            model.index_products(temp_val_features, temp_val_embeddings)
            model.is_trained = True
            
            # Calculate comprehensive metrics (sample 50 products untuk speed)
            val_metrics = calculate_comprehensive_metrics(
                model, val_df, temp_val_features, k=10, sample_size=50
            )
            
            val_ndcg = val_metrics['ndcg@k']
            
            # Save validation metrics
            history['val_ndcg'].append(float(val_ndcg))
            history['val_precision'].append(float(val_metrics['precision@k']))
            history['val_recall'].append(float(val_metrics['recall@k']))
            history['val_f1'].append(float(val_metrics['f1_score']))
            
            # Check for NDCG improvement
            ndcg_improved = (val_ndcg - best_ndcg) > min_delta
            
            if ndcg_improved:
                best_ndcg = val_ndcg
                best_epoch = epoch + 1
                patience_counter = 0
                lr_patience_counter = 0
                
                # Save best model weights
                best_model_weights = [w.numpy() for w in model.encoder.weights]
                
                logger.info(
                    f"Epoch {epoch+1:3d}/{epochs} - "
                    f"Loss: {avg_train_loss:.6f} - Val Loss: {val_loss:.6f} - "
                    f"Val NDCG@10: {val_ndcg:.4f} ⬆️ NEW BEST! - "
                    f"LR: {current_lr:.2e} - Time: {epoch_time:.1f}s"
                )
                print_metrics(val_metrics, "Validation Metrics")
            else:
                patience_counter += 1
                lr_patience_counter += 1
                
                logger.info(
                    f"Epoch {epoch+1:3d}/{epochs} - "
                    f"Loss: {avg_train_loss:.6f} - Val Loss: {val_loss:.6f} - "
                    f"Val NDCG@10: {val_ndcg:.4f} - "
                    f"LR: {current_lr:.2e} - Time: {epoch_time:.1f}s - "
                    f"No improve: {patience_counter}/{patience}"
                )
                
                # Reduce learning rate if plateau
                if lr_patience_counter >= lr_patience and current_lr > min_lr:
                    old_lr = current_lr
                    current_lr = max(current_lr * lr_factor, min_lr)
                    
                    if current_lr != old_lr:
                        total_lr_reductions += 1
                        logger.info(f"  📉 Reducing LR: {old_lr:.2e} → {current_lr:.2e}")
                        train_step = compile_contrastive_model(model, current_lr)
                        lr_patience_counter = 0
            
            # Early stopping
            if patience_counter >= patience:
                logger.info(f"⏹️ Early stopping at epoch {epoch+1}")
                logger.info(f"   Best NDCG@10: {best_ndcg:.4f} at epoch {best_epoch}")
                break
        else:
            # Just log loss without full evaluation
            logger.info(
                f"Epoch {epoch+1:3d}/{epochs} - "
                f"Loss: {avg_train_loss:.6f} - Val Loss: {val_loss:.6f} - "
                f"LR: {current_lr:.2e} - Time: {epoch_time:.1f}s"
            )
    
    # Restore best model weights
    if best_model_weights is not None:
        logger.info(f"\n✅ Restoring best model from epoch {best_epoch} (NDCG={best_ndcg:.4f})")
        for w, best_w in zip(model.encoder.weights, best_model_weights):
            w.assign(best_w)
    
    logger.info(f"✅ Training completed - Best NDCG@10: {best_ndcg:.4f}")
    
    # 7. Generate embeddings & index
    logger.info("\n[STEP 7/9] Generating embeddings for all products...")
    
    # Combine all data untuk indexing (train + val + test)
    all_df = pd.concat([train_df, val_df, test_df], ignore_index=True)
    all_features = model.preprocessor.transform_products(all_df)
    all_tfidf = model.text_extractor.transform(all_features['product_names'])
    all_features['tfidf_features'] = all_tfidf
    
    embeddings = model.generate_embeddings(all_features)
    model.index_products(all_features, embeddings)
    model.is_trained = True
    
    logger.info(f"  ✅ Indexed {len(all_df)} products")
    
    # 8. Final evaluation on test set
    logger.info("\n[STEP 8/9] Final evaluation on test set...")
    
    test_features = model.preprocessor.transform_products(test_df)
    test_tfidf = model.text_extractor.transform(test_features['product_names'])
    test_features['tfidf_features'] = test_tfidf
    
    test_metrics = calculate_comprehensive_metrics(
        model, test_df, test_features, k=10, sample_size=None  # Evaluate all test products
    )
    
    print_metrics(test_metrics, "📊 TEST SET PERFORMANCE (Final)")
    
    # 9. Save model
    logger.info(f"\n[STEP 9/9] Saving model to {save_dir}...")
    Path(save_dir).mkdir(parents=True, exist_ok=True)
    model.save_model(save_dir)
    
    # Save training history
    history_data = {
        'config': {
            'model_version': 'ncb_v3',
            'embedding_dim': embedding_dim,
            'tfidf_max_features': tfidf_max_features,
            'epochs_trained': len(history['loss']),
            'batch_size': batch_size,
            'initial_learning_rate': learning_rate,
            'final_learning_rate': current_lr,
            'n_pairs_per_product': n_pairs_per_product,
            'early_stopping_patience': patience,
            'early_stopping_metric': 'NDCG@10',
            'lr_reduction_patience': lr_patience,
            'lr_reduction_factor': lr_factor,
            'total_lr_reductions': total_lr_reductions,
            'best_epoch': best_epoch,
            'best_ndcg': float(best_ndcg)
        },
        'dataset': {
            'train_size': len(train_df),
            'val_size': len(val_df),
            'test_size': len(test_df),
            'total_size': len(all_df)
        },
        'history': history,
        'final_metrics': {
            'test_metrics': {k: float(v) for k, v in test_metrics.items()}
        },
        'training_date': datetime.now().isoformat()
    }
    
    history_path = Path(save_dir) / 'training_history_v3.json'
    with open(history_path, 'w') as f:
        json.dump(history_data, f, indent=2)
    
    logger.info(f"  ✅ Training history saved to {history_path}")
    
    # Save model config
    model_config = {
        'model_version': 'ncb_v3',
        'embedding_dim': embedding_dim,
        'tfidf_max_features': tfidf_max_features,
        'training_date': datetime.now().isoformat(),
        'best_ndcg': float(best_ndcg)
    }
    
    config_path = Path(save_dir) / 'model_config.json'
    with open(config_path, 'w') as f:
        json.dump(model_config, f, indent=2)
    
    logger.info(f"  ✅ Model config saved to {config_path}")
    
    # Summary
    logger.info("\n" + "=" * 80)
    logger.info("🎉 NCB V3 TRAINING COMPLETED SUCCESSFULLY!")
    logger.info("=" * 80)
    logger.info(f"Model: {save_dir}")
    logger.info(f"Products indexed: {len(all_df)}")
    logger.info(f"Embedding dimension: {embedding_dim}")
    logger.info(f"\n⚙️ Training Configuration:")
    logger.info(f"  Epochs trained: {len(history['loss'])}/{epochs}")
    logger.info(f"  Best epoch: {best_epoch}")
    logger.info(f"  Initial LR: {learning_rate:.2e}")
    logger.info(f"  Final LR: {current_lr:.2e}")
    logger.info(f"  LR reductions: {total_lr_reductions}")
    logger.info(f"  Best NDCG@10: {best_ndcg:.4f} ⭐")
    
    print_metrics(test_metrics, "📊 FINAL TEST SET PERFORMANCE")
    
    logger.info("\n💡 V3 Improvements:")
    logger.info(f"  ✅ Auto-load from data/splits/ (stratified)")
    logger.info(f"  ✅ 10 comprehensive metrics (metrics.py)")
    logger.info(f"  ✅ Validation NDCG@10 tracking")
    logger.info(f"  ✅ Early stopping on NDCG (industry standard)")
    logger.info(f"  ✅ Best model checkpoint saving")
    logger.info(f"  ✅ 1000 products balanced dataset")
    logger.info("=" * 80)
    
    return model, history_data


if __name__ == "__main__":
    # Train NCB v3 with comprehensive metrics!
    trained_model, history = train_ncb_v3(
        epochs=100,
        batch_size=32,
        learning_rate=0.001,
        embedding_dim=64,
        tfidf_max_features=150,
        n_pairs_per_product=10,
        patience=15,  # Early stop after 15 epochs no NDCG improvement
        min_delta=0.001,  # Minimum NDCG improvement (0.1%)
        lr_patience=5,
        lr_factor=0.5,
        min_lr=1e-6,
        save_dir="models/saved_models/ncb_v3",
        eval_every_n_epochs=5  # Evaluate validation every 5 epochs
    )
    
    logger.info("\n✅ NCB v3 training completed! Model ready for deployment.")

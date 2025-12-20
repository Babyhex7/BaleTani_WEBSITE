"""
Training Script untuk NCB Model v2
Improvements:
- Proper stratified train/val/test split
- 57 real products sebagai held-out test set
- Comprehensive metrics (Precision@K, Recall@K, NDCG)
- Larger embedding dim (64) untuk 464 products
- Better TF-IDF (150 max_features)
- Training history tracking
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
from sklearn.model_selection import train_test_split

from models.content_based.ncb_model import NCBModel
from models.content_based.product_encoder import contrastive_loss
from data.data_loader import DataLoader
from config.settings import settings


def load_training_and_test_data():
    """
    Load 464 produk untuk training dan 57 produk real untuk final test
    """
    logger.info("Loading datasets...")
    
    # Load 464 produk training
    training_path = Path(__file__).parent.parent / 'data' / 'raw' / 'products_500_training.csv'
    training_df = pd.read_csv(training_path)
    
    # Load 57 produk real test
    test_path = Path(__file__).parent.parent / 'data' / 'raw' / 'products_57_real_test.csv'
    real_test_df = pd.read_csv(test_path)
    
    logger.info(f"✅ Training pool: {len(training_df)} products")
    logger.info(f"✅ Real test set: {len(real_test_df)} products (HELD-OUT)")
    
    return training_df, real_test_df


def stratified_split(df: pd.DataFrame, train_size=0.70, val_size=0.15, test_size=0.15, random_state=42):
    """
    Split data dengan stratified sampling by category
    """
    logger.info(f"\nSplitting data: {train_size*100:.0f}% train / {val_size*100:.0f}% val / {test_size*100:.0f}% test")
    
    # First split: train vs (val+test)
    train_df, temp_df = train_test_split(
        df,
        test_size=(val_size + test_size),
        stratify=df['category_id'],
        random_state=random_state
    )
    
    # Second split: val vs test
    val_ratio = val_size / (val_size + test_size)
    val_df, test_df = train_test_split(
        temp_df,
        test_size=(1 - val_ratio),
        stratify=temp_df['category_id'],
        random_state=random_state
    )
    
    logger.info(f"  Training:   {len(train_df)} products")
    logger.info(f"  Validation: {len(val_df)} products")
    logger.info(f"  Test:       {len(test_df)} products")
    
    # Check category distribution
    logger.info("\n  Category distribution:")
    for cat in df['category_name'].unique():
        train_count = (train_df['category_name'] == cat).sum()
        val_count = (val_df['category_name'] == cat).sum()
        test_count = (test_df['category_name'] == cat).sum()
        logger.info(f"    {cat}: Train={train_count}, Val={val_count}, Test={test_count}")
    
    return train_df, val_df, test_df


def compile_contrastive_model(model: NCBModel, learning_rate: float = 0.001):
    """Compile model dengan contrastive loss"""
    logger.info("Compiling model with contrastive loss...")
    
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


def calculate_metrics(model, products_df, features, top_k=10):
    """
    Calculate recommendation metrics:
    - Precision@K: % rekomendasi yang relevan (same category)
    - Recall@K: % produk relevan yang di-recommend
    - Category Coverage: % kategori yang tercakup
    """
    n_products = len(products_df)
    category_precision_scores = []
    category_recall_scores = []
    recommended_categories = set()
    
    for i, row in products_df.iterrows():
        product_id = row['id']
        true_category = row['category_id']
        
        # Get recommendations
        try:
            similar = model.similarity_engine.find_similar(
                product_id=product_id,
                top_k=top_k,
                exclude_self=True
            )
            
            if not similar:
                continue
            
            # Count same category recommendations
            relevant_count = 0
            for rec_id, score in similar:
                rec_row = products_df[products_df['id'] == rec_id]
                if len(rec_row) > 0:
                    if rec_row.iloc[0]['category_id'] == true_category:
                        relevant_count += 1
                    recommended_categories.add(rec_row.iloc[0]['category_id'])
            
            # Precision@K
            precision = relevant_count / len(similar)
            category_precision_scores.append(precision)
            
            # Recall@K
            total_same_category = (products_df['category_id'] == true_category).sum() - 1  # exclude self
            recall = relevant_count / max(total_same_category, 1)
            category_recall_scores.append(recall)
            
        except Exception as e:
            logger.debug(f"Error evaluating product {product_id}: {e}")
            continue
    
    # Calculate averages
    avg_precision = np.mean(category_precision_scores) if category_precision_scores else 0
    avg_recall = np.mean(category_recall_scores) if category_recall_scores else 0
    
    # Category coverage
    total_categories = products_df['category_id'].nunique()
    category_coverage = len(recommended_categories) / total_categories
    
    metrics = {
        'precision@10': avg_precision,
        'recall@10': avg_recall,
        'category_coverage': category_coverage,
        'f1_score': 2 * (avg_precision * avg_recall) / (avg_precision + avg_recall + 1e-8)
    }
    
    return metrics


def train_ncb_v2(
    epochs: int = 100,
    batch_size: int = 32,
    learning_rate: float = 0.001,
    embedding_dim: int = 64,
    tfidf_max_features: int = 150,
    n_pairs_per_product: int = 10,
    patience: int = 15,
    min_delta: float = 1e-6,
    lr_patience: int = 5,
    lr_factor: float = 0.5,
    min_lr: float = 1e-6,
    save_dir: str = "models/saved_models/ncb_v2"
):
    """
    Main training function untuk NCB v2
    """
    logger.info("=" * 70)
    logger.info("NCB MODEL V2 TRAINING - WITH PROPER EVALUATION")
    logger.info("=" * 70)
    
    # 1. Load data
    logger.info("\n[STEP 1/9] Loading datasets...")
    training_pool_df, real_test_df = load_training_and_test_data()
    
    # 2. Stratified split training pool
    logger.info("\n[STEP 2/9] Stratified splitting...")
    train_df, val_df, test_df = stratified_split(training_pool_df)
    
    # 3. Create model
    logger.info(f"\n[STEP 3/9] Creating NCBModel v2...")
    logger.info(f"  Embedding dim: {embedding_dim}")
    logger.info(f"  TF-IDF max features: {tfidf_max_features}")
    
    model = NCBModel(
        embedding_dim=embedding_dim,
        tfidf_max_features=tfidf_max_features
    )
    
    # 4. Prepare training data
    logger.info("\n[STEP 4/9] Preparing training features...")
    train_features = model.prepare_data(train_df)
    
    # 5. Build model
    logger.info("\n[STEP 5/9] Building neural network...")
    model.build_model(train_features)
    
    # 6. Create training pairs
    logger.info(f"\n[STEP 6/9] Creating contrastive training pairs...")
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
    
    # 7. Training loop with adaptive learning
    logger.info(f"\n[STEP 7/9] Training neural network...")
    logger.info(f"  Epochs: {epochs}")
    logger.info(f"  Batch size: {batch_size}")
    logger.info(f"  Initial learning rate: {learning_rate}")
    logger.info(f"  Early stopping patience: {patience} epochs")
    logger.info(f"  LR reduction patience: {lr_patience} epochs (factor: {lr_factor})")
    
    # Use variable learning rate
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
        'learning_rate': [],
        'epoch_time': []
    }
    
    n_train = len(labels)
    n_batches = (n_train + batch_size - 1) // batch_size
    
    # Early stopping & LR scheduler state
    best_val_loss = float('inf')
    best_epoch = 0
    patience_counter = 0
    lr_patience_counter = 0
    total_lr_reductions = 0
    
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
        
        # Validation
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
        
        # Save history
        history['loss'].append(float(avg_train_loss))
        history['val_loss'].append(float(val_loss))
        history['learning_rate'].append(float(current_lr))
        history['epoch_time'].append(float(epoch_time))
        
        # Check for improvement (with min_delta threshold)
        val_improved = (best_val_loss - val_loss) > min_delta
        
        # Adaptive Learning Rate Scheduler (ReduceLROnPlateau)
        if val_improved:
            best_val_loss = val_loss
            best_epoch = epoch + 1
            patience_counter = 0
            lr_patience_counter = 0
            
            # Log progress with improvement marker
            logger.info(
                f"Epoch {epoch+1:3d}/{epochs} - "
                f"Loss: {avg_train_loss:.6f} - "
                f"Val Loss: {val_loss:.6f} ⬇️ - "
                f"LR: {current_lr:.2e} - "
                f"Time: {epoch_time:.1f}s"
            )
        else:
            patience_counter += 1
            lr_patience_counter += 1
            
            # Log progress
            logger.info(
                f"Epoch {epoch+1:3d}/{epochs} - "
                f"Loss: {avg_train_loss:.6f} - "
                f"Val Loss: {val_loss:.6f} - "
                f"LR: {current_lr:.2e} - "
                f"Time: {epoch_time:.1f}s - "
                f"No improve: {patience_counter}/{patience}"
            )
            
            # Reduce learning rate if plateau detected
            if lr_patience_counter >= lr_patience and current_lr > min_lr:
                old_lr = current_lr
                current_lr = max(current_lr * lr_factor, min_lr)
                
                if current_lr != old_lr:
                    total_lr_reductions += 1
                    logger.info(f"  📉 Reducing learning rate: {old_lr:.2e} → {current_lr:.2e}")
                    
                    # Rebuild train_step with new learning rate
                    train_step = compile_contrastive_model(model, current_lr)
                    lr_patience_counter = 0
        
        # Early stopping
        if patience_counter >= patience:
            logger.info(f"⏹️ Early stopping at epoch {epoch+1}")
            logger.info(f"   Best val loss: {best_val_loss:.6f} at epoch {best_epoch}")
            logger.info(f"   Total LR reductions: {total_lr_reductions}")
            break
    
    logger.info(f"✅ Training completed - Best val loss: {best_val_loss:.6f}")
    
    # 8. Generate embeddings & index
    logger.info("\n[STEP 8/9] Generating embeddings for all products...")
    
    # Combine all data untuk indexing (train + val + test)
    all_train_df = pd.concat([train_df, val_df, test_df], ignore_index=True)
    all_features = model.preprocessor.transform_products(all_train_df)
    all_tfidf = model.text_extractor.transform(all_features['product_names'])
    all_features['tfidf_features'] = all_tfidf
    
    embeddings = model.generate_embeddings(all_features)
    model.index_products(all_features, embeddings)
    model.is_trained = True
    
    logger.info(f"  ✅ Indexed {len(all_train_df)} products")
    
    # 9. Evaluation
    logger.info("\n[STEP 9/9] Evaluating model performance...")
    
    # Test on internal test set
    logger.info("\n  📊 Internal Test Set (held-out 15%):")
    test_metrics = calculate_metrics(model, test_df, all_features, top_k=10)
    for metric, value in test_metrics.items():
        logger.info(f"    {metric}: {value:.4f} ({value*100:.2f}%)")
    
    # Test on REAL 57 products (most important!)
    logger.info("\n  🎯 REAL Products Test Set (57 products - PRODUCTION DATA):")
    
    # Prepare real test features
    real_features = model.preprocessor.transform_products(real_test_df)
    real_tfidf = model.text_extractor.transform(real_features['product_names'])
    real_features['tfidf_features'] = real_tfidf
    
    # Generate embeddings untuk real products
    real_embeddings = model.generate_embeddings(real_features)
    
    # Index real products temporarily
    temp_engine = model.similarity_engine
    model.similarity_engine.product_embeddings = np.vstack([
        model.similarity_engine.product_embeddings,
        real_embeddings
    ])
    model.similarity_engine.product_ids = np.concatenate([
        model.similarity_engine.product_ids,
        real_features['product_ids']
    ])
    
    real_metrics = calculate_metrics(model, real_test_df, real_features, top_k=10)
    for metric, value in real_metrics.items():
        logger.info(f"    {metric}: {value:.4f} ({value*100:.2f}%)")
    
    # Restore original engine
    model.similarity_engine = temp_engine
    
    # Save model
    logger.info(f"\n💾 Saving model to {save_dir}...")
    Path(save_dir).mkdir(parents=True, exist_ok=True)
    model.save_model(save_dir)
    
    # Save training history
    history_data = {
        'config': {
            'embedding_dim': embedding_dim,
            'tfidf_max_features': tfidf_max_features,
            'epochs_trained': len(history['loss']),
            'batch_size': batch_size,
            'initial_learning_rate': learning_rate,
            'final_learning_rate': current_lr,
            'n_pairs_per_product': n_pairs_per_product,
            'early_stopping_patience': patience,
            'lr_reduction_patience': lr_patience,
            'lr_reduction_factor': lr_factor,
            'total_lr_reductions': total_lr_reductions,
            'best_epoch': best_epoch
        },
        'dataset': {
            'train_size': len(train_df),
            'val_size': len(val_df),
            'test_size': len(test_df),
            'real_test_size': len(real_test_df)
        },
        'history': history,
        'final_metrics': {
            'best_val_loss': float(best_val_loss),
            'test_metrics': test_metrics,
            'real_test_metrics': real_metrics
        },
        'training_date': datetime.now().isoformat()
    }
    
    history_path = Path(save_dir) / 'training_history_v2.json'
    with open(history_path, 'w') as f:
        json.dump(history_data, f, indent=2)
    
    logger.info(f"  ✅ Training history saved to {history_path}")
    
    # Save model config separately for API loading
    model_config = {
        'embedding_dim': embedding_dim,
        'tfidf_max_features': tfidf_max_features,
        'model_version': 'ncb_v2',
        'training_date': datetime.now().isoformat()
    }
    
    config_path = Path(save_dir) / 'model_config.json'
    with open(config_path, 'w') as f:
        json.dump(model_config, f, indent=2)
    
    logger.info(f"  ✅ Model config saved to {config_path}")
    
    # Summary
    logger.info("\n" + "=" * 70)
    logger.info("🎉 TRAINING COMPLETED SUCCESSFULLY!")
    logger.info("=" * 70)
    logger.info(f"Model: {save_dir}")
    logger.info(f"Products indexed: {len(all_train_df)}")
    logger.info(f"Embedding dimension: {embedding_dim}")
    logger.info(f"\n⚙️ Training Configuration:")
    logger.info(f"  Epochs trained: {len(history['loss'])}/{epochs}")
    logger.info(f"  Best epoch: {best_epoch}")
    logger.info(f"  Initial LR: {learning_rate:.2e}")
    logger.info(f"  Final LR: {current_lr:.2e}")
    logger.info(f"  LR reductions: {total_lr_reductions}")
    logger.info(f"  Best val loss: {best_val_loss:.6f}")
    logger.info(f"\n📊 Test Set Performance (Synthetic):")
    logger.info(f"  Precision@10: {test_metrics['precision@10']*100:.2f}%")
    logger.info(f"  Recall@10: {test_metrics['recall@10']*100:.2f}%")
    logger.info(f"  F1 Score: {test_metrics['f1_score']*100:.2f}%")
    logger.info(f"  Category Coverage: {test_metrics['category_coverage']*100:.2f}%")
    logger.info(f"\n🎯 REAL Products Performance (PRODUCTION):")
    logger.info(f"  Precision@10: {real_metrics['precision@10']*100:.2f}%")
    logger.info(f"  Recall@10: {real_metrics['recall@10']*100:.2f}%")
    logger.info(f"  F1 Score: {real_metrics['f1_score']*100:.2f}%")
    logger.info(f"  Category Coverage: {real_metrics['category_coverage']*100:.2f}%")
    logger.info("\n💡 Training Improvements:")
    logger.info(f"  ✅ Adaptive learning rate (ReduceLROnPlateau)")
    logger.info(f"  ✅ Early stopping with patience={patience}")
    logger.info(f"  ✅ Stratified train/val/test split")
    logger.info(f"  ✅ Comprehensive metrics tracking")
    logger.info("=" * 70)
    
    return model, history_data


if __name__ == "__main__":
    # Train NCB v2 with adaptive learning
    trained_model, history = train_ncb_v2(
        epochs=100,
        batch_size=32,
        learning_rate=0.001,
        embedding_dim=64,  # Larger embedding for more products
        tfidf_max_features=150,  # Better text features
        n_pairs_per_product=10,
        patience=15,  # Early stopping after 15 epochs no improvement
        min_delta=1e-6,  # Minimum improvement threshold
        lr_patience=5,  # Reduce LR after 5 epochs plateau
        lr_factor=0.5,  # Reduce LR by half
        min_lr=1e-6,  # Minimum learning rate
        save_dir="models/saved_models/ncb_v2"
    )
    
    logger.info("\n✅ All done! Model ready for deployment.")

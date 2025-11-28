"""
Training Script untuk Neural Content-Based Model
Train model menggunakan contrastive learning
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

import numpy as np
import tensorflow as tf
from loguru import logger
from typing import Dict, Tuple

from models.content_based.ncb_model import NCBModel
from models.content_based.product_encoder import contrastive_loss
from data.data_loader import DataLoader
from config.settings import settings


def compile_contrastive_model(
    model: NCBModel,
    learning_rate: float = 0.001
):
    """
    Compile model untuk contrastive learning
    
    Args:
        model: NCBModel instance
        learning_rate: Learning rate untuk optimizer
    """
    logger.info("Compiling model with contrastive loss...")
    
    # Custom training step untuk contrastive pairs
    optimizer = tf.keras.optimizers.Adam(learning_rate=learning_rate)
    
    @tf.function
    def train_step(inputs_1, inputs_2, labels):
        """
        Training step untuk contrastive pairs
        
        Args:
            inputs_1: Features product pertama
            inputs_2: Features product kedua
            labels: 1 = similar, 0 = dissimilar
        """
        with tf.GradientTape() as tape:
            # Forward pass
            embeddings_1 = model.encoder(inputs_1, training=True)
            embeddings_2 = model.encoder(inputs_2, training=True)
            
            # Compute contrastive loss
            loss = contrastive_loss(embeddings_1, embeddings_2, labels, margin=1.0)
        
        # Backward pass
        gradients = tape.gradient(loss, model.encoder.trainable_variables)
        optimizer.apply_gradients(zip(gradients, model.encoder.trainable_variables))
        
        return loss
    
    return train_step


def train_ncb_model(
    epochs: int = 50,
    batch_size: int = 32,
    learning_rate: float = 0.001,
    n_pairs_per_product: int = 10,
    validation_split: float = 0.15,
    save_dir: str = "models/saved_models/ncb_v1"
):
    """
    Main training function
    
    Args:
        epochs: Number of training epochs
        batch_size: Batch size
        learning_rate: Learning rate
        n_pairs_per_product: Pairs per product untuk contrastive learning
        validation_split: Validation data split
        save_dir: Directory untuk save model
    """
    logger.info("=" * 60)
    logger.info("STARTING NCB MODEL TRAINING")
    logger.info("=" * 60)
    
    # 1. Load data
    logger.info("\n[STEP 1/7] Loading data...")
    data_loader = DataLoader()
    products_df, _, _ = data_loader.load_all_data()
    
    logger.info(f"  Loaded {len(products_df)} products")
    logger.info(f"  Categories: {products_df['category_name'].nunique()}")
    
    # 2. Create model instance
    logger.info("\n[STEP 2/7] Creating NCBModel...")
    model = NCBModel(
        embedding_dim=settings.embedding_dim,
        tfidf_max_features=50
    )
    
    # 3. Prepare data
    logger.info("\n[STEP 3/7] Preparing features...")
    features = model.prepare_data(products_df)
    
    # 4. Build model
    logger.info("\n[STEP 4/7] Building neural network...")
    model.build_model(features)
    
    # 5. Create training pairs
    logger.info("\n[STEP 5/7] Creating training pairs...")
    (inputs_1, inputs_2), labels = model.create_training_pairs(
        features, 
        n_pairs_per_product=n_pairs_per_product
    )
    
    # Split train/validation
    n_samples = len(labels)
    n_val = int(n_samples * validation_split)
    indices = np.random.permutation(n_samples)
    
    train_indices = indices[n_val:]
    val_indices = indices[:n_val]
    
    # Prepare training data
    train_inputs_1 = {key: val[train_indices] for key, val in inputs_1.items()}
    train_inputs_2 = {key: val[train_indices] for key, val in inputs_2.items()}
    train_labels = labels[train_indices]
    
    val_inputs_1 = {key: val[val_indices] for key, val in inputs_1.items()}
    val_inputs_2 = {key: val[val_indices] for key, val in inputs_2.items()}
    val_labels = labels[val_indices]
    
    logger.info(f"  Training samples: {len(train_labels)}")
    logger.info(f"  Validation samples: {len(val_labels)}")
    
    # 6. Train model
    logger.info("\n[STEP 6/7] Training model...")
    logger.info(f"  Epochs: {epochs}")
    logger.info(f"  Batch size: {batch_size}")
    logger.info(f"  Learning rate: {learning_rate}")
    
    train_step = compile_contrastive_model(model, learning_rate)
    
    # Helper function untuk map keys
    def map_to_encoder_inputs(features_dict):
        """Map features keys untuk encoder"""
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
    
    # Training loop
    n_train = len(train_labels)
    n_batches = (n_train + batch_size - 1) // batch_size
    
    best_val_loss = float('inf')
    patience = 10
    patience_counter = 0
    
    for epoch in range(epochs):
        # Shuffle training data
        shuffle_indices = np.random.permutation(n_train)
        
        # Training
        train_losses = []
        for i in range(n_batches):
            batch_indices = shuffle_indices[i * batch_size:(i + 1) * batch_size]
            
            # Map keys untuk encoder
            batch_features_1 = {key: val[batch_indices] for key, val in train_inputs_1.items()}
            batch_features_2 = {key: val[batch_indices] for key, val in train_inputs_2.items()}
            
            batch_inputs_1 = {k: tf.constant(v) for k, v in map_to_encoder_inputs(batch_features_1).items()}
            batch_inputs_2 = {k: tf.constant(v) for k, v in map_to_encoder_inputs(batch_features_2).items()}
            batch_labels = tf.constant(train_labels[batch_indices])
            
            loss = train_step(batch_inputs_1, batch_inputs_2, batch_labels)
            train_losses.append(loss.numpy())
        
        avg_train_loss = np.mean(train_losses)
        
        # Validation - map keys untuk encoder
        val_inputs_1_mapped = {k: tf.constant(v) for k, v in map_to_encoder_inputs(val_inputs_1).items()}
        val_inputs_2_mapped = {k: tf.constant(v) for k, v in map_to_encoder_inputs(val_inputs_2).items()}
        
        val_embeddings_1 = model.encoder(val_inputs_1_mapped, training=False)
        val_embeddings_2 = model.encoder(val_inputs_2_mapped, training=False)
        val_loss = contrastive_loss(
            val_embeddings_1, 
            val_embeddings_2, 
            tf.constant(val_labels),
            margin=1.0
        ).numpy()
        
        # Log progress
        logger.info(
            f"Epoch {epoch+1}/{epochs} - "
            f"Train Loss: {avg_train_loss:.4f} - "
            f"Val Loss: {val_loss:.4f}"
        )
        
        # Early stopping
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            patience_counter = 0
        else:
            patience_counter += 1
            
        if patience_counter >= patience:
            logger.info(f"Early stopping at epoch {epoch+1}")
            break
    
    logger.info(f"✅ Training completed - Best val loss: {best_val_loss:.4f}")
    
    # 7. Generate final embeddings & index products
    logger.info("\n[STEP 7/7] Generating embeddings & indexing products...")
    
    embeddings = model.generate_embeddings(features)
    model.index_products(features, embeddings)
    
    # Mark as trained
    model.is_trained = True
    
    # Save model
    logger.info(f"\nSaving model to {save_dir}...")
    model.save_model(save_dir)
    
    logger.info("\n" + "=" * 60)
    logger.info("TRAINING COMPLETED SUCCESSFULLY! 🎉")
    logger.info("=" * 60)
    logger.info(f"Model saved to: {save_dir}")
    logger.info(f"Total products indexed: {len(features['product_ids'])}")
    logger.info(f"Embedding dimension: {embeddings.shape[1]}")
    
    return model


if __name__ == "__main__":
    # Train dengan hyperparameters
    trained_model = train_ncb_model(
        epochs=100,
        batch_size=32,
        learning_rate=0.001,
        n_pairs_per_product=10,
        validation_split=0.15
    )
    
    # Test recommendations
    logger.info("\n" + "=" * 60)
    logger.info("TESTING RECOMMENDATIONS")
    logger.info("=" * 60)
    
    # Get random product
    test_product_id = 1
    recommendations = trained_model.get_similar_products(
        product_id=test_product_id,
        top_k=5
    )
    
    logger.info(f"\nRecommendations for Product ID {test_product_id}:")
    for i, rec in enumerate(recommendations, 1):
        logger.info(
            f"  {i}. {rec['product_name']} "
            f"({rec['category']}) - "
            f"Score: {rec['similarity_score']:.2%}"
        )

"""
Simple training script - no validation, just train and save
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import numpy as np
import pandas as pd
from loguru import logger
from models.content_based.ncb_model import NCBModel

# Config
CONFIG = {
    'model_version': 'ncb_v4_test',
    'embedding_dim': 32,
    'batch_size': 32,
    'epochs': 20,
    'learning_rate': 0.001
}

def main():
    logger.info("🚀 Simple Training - NCB Model v4")
    
    # Load data
    logger.info("Loading train data...")
    train_df = pd.read_csv('data/splits/train/products_train.csv')
    logger.info(f"Loaded {len(train_df)} training products")
    
    # Initialize model
    logger.info("Initializing model...")
    model = NCBModel(embedding_dim=CONFIG['embedding_dim'])
    
    # Prepare data
    logger.info("Preparing features...")
    features = model.prepare_data(train_df)
    
    # Build model
    logger.info("Building TensorFlow model...")
    model.build_model(features)
    logger.info(f"Model built successfully")
    
    # Create optimizer
    import tensorflow as tf
    from models.content_based.product_encoder import contrastive_loss
    
    optimizer = tf.keras.optimizers.Adam(learning_rate=CONFIG['learning_rate'])
    logger.info("Optimizer created")
    
    # Create training pairs
    logger.info("Creating training pairs...")
    (pairs_1, pairs_2), labels = model.create_training_pairs(features, n_pairs_per_product=2)
    logger.info(f"Created {len(labels)} training pairs")
    
    # Training function
    @tf.function
    def train_step(inputs_1, inputs_2, labels_batch):
        with tf.GradientTape() as tape:
            # Map keys
            mapped_1 = model._map_features_to_encoder_inputs(inputs_1)
            mapped_2 = model._map_features_to_encoder_inputs(inputs_2)
            
            embeddings_1 = model.encoder(mapped_1, training=True)
            embeddings_2 = model.encoder(mapped_2, training=True)
            loss = contrastive_loss(embeddings_1, embeddings_2, labels_batch, margin=1.0)
        
        gradients = tape.gradient(loss, model.encoder.trainable_variables)
        optimizer.apply_gradients(zip(gradients, model.encoder.trainable_variables))
        return loss
    
    # Train
    logger.info(f"\nTraining for {CONFIG['epochs']} epochs...")
    n_pairs = len(labels)
    num_batches = n_pairs // CONFIG['batch_size']
    
    for epoch in range(CONFIG['epochs']):
        # Shuffle
        indices = np.random.permutation(n_pairs)
        pairs_1_shuffled = {k: v[indices] for k, v in pairs_1.items()}
        pairs_2_shuffled = {k: v[indices] for k, v in pairs_2.items()}
        labels_shuffled = labels[indices]
        
        # Train batches
        epoch_losses = []
        for batch_idx in range(num_batches):
            start = batch_idx * CONFIG['batch_size']
            end = start + CONFIG['batch_size']
            
            batch_1 = {k: v[start:end] for k, v in pairs_1_shuffled.items()}
            batch_2 = {k: v[start:end] for k, v in pairs_2_shuffled.items()}
            batch_labels = labels_shuffled[start:end]
            
            loss = train_step(batch_1, batch_2, batch_labels)
            epoch_losses.append(float(loss))
        
        avg_loss = np.mean(epoch_losses)
        logger.info(f"Epoch {epoch+1}/{CONFIG['epochs']} - Loss: {avg_loss:.4f}")
        
        # Save every 5 epochs
        if (epoch + 1) % 5 == 0:
            save_path = f"models/saved_models/{CONFIG['model_version']}"
            model.save_model(save_path)
            logger.info(f"✅ Model saved to {save_path}")
    
    # Generate embeddings and index products
    logger.info("\n📊 Generating product embeddings...")
    embeddings = model.generate_embeddings(features)
    logger.info(f"Generated {embeddings.shape[0]} embeddings with dim={embeddings.shape[1]}")
    
    # Index products with metadata
    logger.info("Indexing products...")
    product_ids = train_df['id'].values
    
    metadata = {
        'names': train_df['name'].values,
        'categories': train_df['category_name'].values,
        'prices': train_df['selling_price'].values
    }
    model.similarity_engine.index_products(embeddings, product_ids, metadata)
    model.similarity_engine.product_metadata = metadata
    logger.info("✅ Products indexed")
    
    # Final save
    logger.info("\n✅ Training complete!")
    save_path = f"models/saved_models/{CONFIG['model_version']}"
    model.save_model(save_path)
    logger.info(f"✅ Final model saved to {save_path}")
    
    # Test loading
    logger.info("\n🧪 Testing model loading...")
    loaded_model = NCBModel.load_model(save_path, embedding_dim=CONFIG['embedding_dim'])
    logger.info("✅ Model loaded successfully!")
    
    # Test recommendations
    logger.info("\n🧪 Testing recommendations...")
    test_product_id = train_df.iloc[0]['id']
    logger.info(f"Query product: {test_product_id}")
    
    # Generate embeddings and index
    embeddings = loaded_model.generate_embeddings(features)
    loaded_model.similarity_engine.index_products(embeddings, train_df['id'].values)
    loaded_model.products_df = train_df
    
    # CRITICAL: Populate metadata for get_similar_products
    loaded_model.similarity_engine.product_metadata = {
        'names': dict(zip(train_df['id'].values, train_df['name'].values)),
        'categories': dict(zip(train_df['id'].values, train_df['category_name'].values))
    }
    
    # Get recommendations
    recs = loaded_model.get_similar_products(product_id=test_product_id, top_k=5)
    logger.info(f"✅ Got {len(recs)} recommendations!")
    for i, rec in enumerate(recs, 1):
        logger.info(f"  {i}. {rec['product_id']} - Score: {rec['similarity_score']:.3f}")
    
    logger.info("\n✅ All tests passed!")

if __name__ == '__main__':
    main()

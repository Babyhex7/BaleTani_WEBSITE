"""
Product Encoder - Neural Network untuk encode product features menjadi embeddings
Ini adalah core dari Neural Content-Based Filtering

Arsitektur:
- Embedding layers untuk categorical features (category, product_type, price_tier, shelf_life_tier)
- Concatenation dengan numerical features (price, stock, shelf_life, TF-IDF)
- Multi-Layer Perceptron (MLP) untuk learn non-linear relationships
- Output: Dense embedding vector (32-dim) untuk setiap produk
"""
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, Model
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
import numpy as np
from typing import Dict, Tuple, List
from loguru import logger

from config.settings import settings


class ProductEncoder(Model):
    """
    Neural Network untuk encode product features menjadi dense embeddings
    
    Input Features:
    - category_id (categorical) → Embedding
    - product_type_id (categorical) → Embedding  
    - price_tier (categorical) → Embedding
    - shelf_life_tier (categorical) → Embedding
    - price_normalized (numerical)
    - stock_normalized (numerical)
    - shelf_life_normalized (numerical)
    - tfidf_features (numerical, dari product name)
    
    Output:
    - Dense embedding vector (embedding_dim dimensions)
    """
    
    def __init__(
        self,
        n_categories: int,
        n_product_types: int,
        n_price_tiers: int,
        n_shelf_life_tiers: int,
        tfidf_dim: int,
        embedding_dim: int = 32,
        name: str = "product_encoder"
    ):
        """
        Inisialisasi Product Encoder Network
        
        Args:
            n_categories: Jumlah unique categories
            n_product_types: Jumlah unique product types
            n_price_tiers: Jumlah price tiers (biasanya 3)
            n_shelf_life_tiers: Jumlah shelf life tiers (biasanya 3)
            tfidf_dim: Dimensi TF-IDF features
            embedding_dim: Output embedding dimension (default 32)
            name: Model name
        """
        super(ProductEncoder, self).__init__(name=name)
        
        self.embedding_dim = embedding_dim
        
        # === EMBEDDING LAYERS untuk Categorical Features ===
        # Category embedding (paling penting)
        self.category_embedding = layers.Embedding(
            input_dim=n_categories,
            output_dim=16,  # 16-dim embedding untuk category
            embeddings_initializer='glorot_uniform',
            name='category_embedding'
        )
        
        # Product type embedding
        self.product_type_embedding = layers.Embedding(
            input_dim=n_product_types,
            output_dim=4,  # 4-dim embedding untuk product type
            embeddings_initializer='glorot_uniform',
            name='product_type_embedding'
        )
        
        # Price tier embedding
        self.price_tier_embedding = layers.Embedding(
            input_dim=n_price_tiers,
            output_dim=4,  # 4-dim embedding untuk price tier
            embeddings_initializer='glorot_uniform',
            name='price_tier_embedding'
        )
        
        # Shelf life tier embedding
        self.shelf_life_tier_embedding = layers.Embedding(
            input_dim=n_shelf_life_tiers,
            output_dim=4,  # 4-dim embedding untuk shelf life tier
            embeddings_initializer='glorot_uniform',
            name='shelf_life_tier_embedding'
        )
        
        # === CONCATENATION LAYER ===
        self.concat_layer = layers.Concatenate(name='concat_features')
        
        # === MULTI-LAYER PERCEPTRON (MLP) ===
        # Dense layer 1: 128 units
        self.dense1 = layers.Dense(
            128,
            activation='relu',
            kernel_initializer='he_normal',
            name='dense1'
        )
        self.dropout1 = layers.Dropout(0.3, name='dropout1')
        self.batch_norm1 = layers.BatchNormalization(name='batch_norm1')
        
        # Dense layer 2: 64 units
        self.dense2 = layers.Dense(
            64,
            activation='relu',
            kernel_initializer='he_normal',
            name='dense2'
        )
        self.dropout2 = layers.Dropout(0.3, name='dropout2')
        self.batch_norm2 = layers.BatchNormalization(name='batch_norm2')
        
        # Output layer: embedding_dim units (no activation = linear)
        self.output_layer = layers.Dense(
            embedding_dim,
            activation=None,  # Linear activation
            kernel_initializer='glorot_uniform',
            name='product_embedding'
        )
        
        # L2 Normalization untuk cosine similarity
        self.l2_norm = layers.Lambda(
            lambda x: tf.nn.l2_normalize(x, axis=1),
            name='l2_normalize'
        )
        
        logger.info(f"ProductEncoder initialized - embedding_dim={embedding_dim}")
    
    def call(self, inputs: Dict[str, tf.Tensor], training: bool = False) -> tf.Tensor:
        """
        Forward pass melalui network
        
        Args:
            inputs: Dictionary berisi:
                - category_id: (batch_size,)
                - product_type_id: (batch_size,)
                - price_tier: (batch_size,)
                - shelf_life_tier: (batch_size,)
                - price_normalized: (batch_size,)
                - stock_normalized: (batch_size,)
                - shelf_life_normalized: (batch_size,)
                - tfidf_features: (batch_size, tfidf_dim)
            training: Training mode flag
            
        Returns:
            Product embeddings: (batch_size, embedding_dim)
        """
        # === EMBED CATEGORICAL FEATURES ===
        category_emb = self.category_embedding(inputs['category_id'])
        product_type_emb = self.product_type_embedding(inputs['product_type_id'])
        price_tier_emb = self.price_tier_embedding(inputs['price_tier'])
        shelf_life_tier_emb = self.shelf_life_tier_embedding(inputs['shelf_life_tier'])
        
        # Flatten embeddings
        category_emb = layers.Flatten()(category_emb)
        product_type_emb = layers.Flatten()(product_type_emb)
        price_tier_emb = layers.Flatten()(price_tier_emb)
        shelf_life_tier_emb = layers.Flatten()(shelf_life_tier_emb)
        
        # === EXPAND NUMERICAL FEATURES ===
        # Expand dims untuk concat: (batch_size,) → (batch_size, 1)
        price_norm = tf.expand_dims(inputs['price_normalized'], axis=1)
        stock_norm = tf.expand_dims(inputs['stock_normalized'], axis=1)
        shelf_life_norm = tf.expand_dims(inputs['shelf_life_normalized'], axis=1)
        
        # === CONCATENATE SEMUA FEATURES ===
        # Shape: (batch_size, 16 + 4 + 4 + 4 + 1 + 1 + 1 + tfidf_dim)
        all_features = self.concat_layer([
            category_emb,
            product_type_emb,
            price_tier_emb,
            shelf_life_tier_emb,
            price_norm,
            stock_norm,
            shelf_life_norm,
            inputs['tfidf_features']
        ])
        
        # === FEEDFORWARD NEURAL NETWORK (MLP) ===
        # Layer 1
        x = self.dense1(all_features)
        x = self.batch_norm1(x, training=training)
        x = self.dropout1(x, training=training)
        
        # Layer 2
        x = self.dense2(x)
        x = self.batch_norm2(x, training=training)
        x = self.dropout2(x, training=training)
        
        # Output layer (embeddings)
        embeddings = self.output_layer(x)
        
        # L2 Normalize untuk cosine similarity
        embeddings = self.l2_norm(embeddings)
        
        return embeddings
    
    def get_config(self):
        """Config untuk model serialization"""
        return {
            'embedding_dim': self.embedding_dim,
            'name': self.name
        }


def build_product_encoder(
    vocab_sizes: Dict[str, int],
    tfidf_dim: int,
    embedding_dim: int = 32
) -> ProductEncoder:
    """
    Builder function untuk create ProductEncoder
    
    Args:
        vocab_sizes: Dictionary dengan n_categories, n_product_types, etc.
        tfidf_dim: Dimensi TF-IDF features
        embedding_dim: Output embedding dimension
        
    Returns:
        ProductEncoder model
    """
    model = ProductEncoder(
        n_categories=vocab_sizes['n_categories'],
        n_product_types=vocab_sizes['n_product_types'],
        n_price_tiers=vocab_sizes['n_price_tiers'],
        n_shelf_life_tiers=vocab_sizes['n_shelf_life_tiers'],
        tfidf_dim=tfidf_dim,
        embedding_dim=embedding_dim
    )
    
    logger.info(f"✅ ProductEncoder built - vocab_sizes={vocab_sizes}, tfidf_dim={tfidf_dim}")
    return model


def create_triplet_loss(margin: float = 0.2):
    """
    Triplet Loss untuk training
    Loss = max(0, margin + d(anchor, negative) - d(anchor, positive))
    
    Args:
        margin: Margin untuk triplet loss
        
    Returns:
        Triplet loss function
    """
    def triplet_loss(y_true, y_pred):
        """
        Compute triplet loss
        
        Args:
            y_true: Not used (placeholder)
            y_pred: Concatenated [anchor, positive, negative] embeddings
                    Shape: (batch_size, 3 * embedding_dim)
        """
        # Split embeddings
        embedding_dim = tf.shape(y_pred)[1] // 3
        anchor = y_pred[:, :embedding_dim]
        positive = y_pred[:, embedding_dim:2*embedding_dim]
        negative = y_pred[:, 2*embedding_dim:]
        
        # Compute distances (1 - cosine similarity karena sudah L2 normalized)
        pos_dist = 1.0 - tf.reduce_sum(anchor * positive, axis=1)
        neg_dist = 1.0 - tf.reduce_sum(anchor * negative, axis=1)
        
        # Triplet loss
        loss = tf.maximum(0.0, margin + pos_dist - neg_dist)
        
        return tf.reduce_mean(loss)
    
    return triplet_loss


def create_contrastive_loss(margin: float = 1.0):
    """
    Contrastive Loss (alternatif untuk triplet loss)
    
    Args:
        margin: Margin untuk contrastive loss
        
    Returns:
        Contrastive loss function
    """
    def contrastive_loss(y_true, y_pred):
        """
        y_true: 1 jika similar (same category), 0 jika dissimilar
        y_pred: Concatenated [embedding1, embedding2]
        """
        embedding_dim = tf.shape(y_pred)[1] // 2
        emb1 = y_pred[:, :embedding_dim]
        emb2 = y_pred[:, embedding_dim:]
        
        # Cosine distance
        distance = 1.0 - tf.reduce_sum(emb1 * emb2, axis=1)
        
        # Contrastive loss
        similar_loss = y_true * tf.square(distance)
        dissimilar_loss = (1 - y_true) * tf.square(tf.maximum(0.0, margin - distance))
        
        loss = 0.5 * (similar_loss + dissimilar_loss)
        
        return tf.reduce_mean(loss)
    
    return contrastive_loss


def contrastive_loss(embeddings_1, embeddings_2, labels, margin=1.0):
    """
    Standalone contrastive loss function untuk training
    
    Args:
        embeddings_1: First embeddings (batch_size, embedding_dim)
        embeddings_2: Second embeddings (batch_size, embedding_dim)
        labels: 1 jika similar, 0 jika dissimilar
        margin: Margin untuk dissimilar pairs
        
    Returns:
        Contrastive loss scalar
    """
    # Cosine distance (1 - cosine similarity)
    distance = 1.0 - tf.reduce_sum(embeddings_1 * embeddings_2, axis=1)
    
    # Contrastive loss
    labels = tf.cast(labels, tf.float32)
    similar_loss = labels * tf.square(distance)
    dissimilar_loss = (1 - labels) * tf.square(tf.maximum(0.0, margin - distance))
    
    loss = 0.5 * (similar_loss + dissimilar_loss)
    
    return tf.reduce_mean(loss)

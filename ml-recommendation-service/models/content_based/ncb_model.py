"""
Neural Content-Based (NCB) Model
Main model class yang menggabungkan semua komponen:
- ProductEncoder (neural network)
- TextFeatureExtractor (TF-IDF)
- DataPreprocessor (feature engineering)
- SimilarityEngine (similarity search)
"""
import numpy as np
import tensorflow as tf
from typing import Dict, List, Tuple, Optional
from pathlib import Path
from loguru import logger

from .product_encoder import ProductEncoder, build_product_encoder
from .similarity_engine import SimilarityEngine
from data.data_preprocessor import DataPreprocessor
from data.feature_extractor import TextFeatureExtractor
from config.settings import settings


class NCBModel:
    """
    Neural Content-Based Filtering Model
    
    Complete recommendation model yang combine:
    1. Data preprocessing
    2. Text feature extraction (TF-IDF)
    3. Neural network encoding
    4. Similarity search
    """
    
    @staticmethod
    def _map_features_to_encoder_inputs(features_dict):
        """
        Map features dictionary keys untuk encoder input
        Mengubah plural keys (category_ids) menjadi singular (category_id)
        """
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
    
    def __init__(
        self,
        embedding_dim: int = 32,
        tfidf_max_features: int = 50
    ):
        """
        Inisialisasi NCB Model
        
        Args:
            embedding_dim: Dimensi output embeddings
            tfidf_max_features: Max features untuk TF-IDF
        """
        self.embedding_dim = embedding_dim
        self.tfidf_max_features = tfidf_max_features
        
        # Components
        self.preprocessor = DataPreprocessor()
        self.text_extractor = TextFeatureExtractor(max_features=tfidf_max_features)
        self.encoder = None  # Will be built after preprocessing
        self.similarity_engine = SimilarityEngine()
        
        # Training history
        self.training_history = None
        
        # Status flags
        self.is_trained = False
        
        logger.info(f"NCBModel initialized - embedding_dim={embedding_dim}")
    
    def prepare_data(self, products_df):
        """
        Prepare data untuk training
        
        Args:
            products_df: DataFrame produk dari data loader
            
        Returns:
            Prepared features dictionary
        """
        logger.info("Preparing data for training...")
        
        # 1. Fit preprocessor
        self.preprocessor.fit(products_df)
        
        # 2. Transform products
        features = self.preprocessor.transform_products(products_df)
        
        # 3. Extract text features
        tfidf_features = self.text_extractor.fit_transform(features['product_names'])
        features['tfidf_features'] = tfidf_features
        
        logger.info(f"✅ Data prepared - {len(features['product_ids'])} products")
        return features
    
    def build_model(self, features: Dict[str, np.ndarray]):
        """
        Build neural network model
        
        Args:
            features: Features dictionary dari prepare_data()
        """
        logger.info("Building ProductEncoder model...")
        
        # Get vocab sizes
        vocab_sizes = self.preprocessor.get_vocab_sizes()
        tfidf_dim = features['tfidf_features'].shape[1]
        
        # Build encoder
        self.encoder = build_product_encoder(
            vocab_sizes=vocab_sizes,
            tfidf_dim=tfidf_dim,
            embedding_dim=self.embedding_dim
        )
        
        # Build model dengan dummy input untuk initialize weights
        dummy_batch_size = 2
        dummy_features = {
            'category_ids': features['category_ids'][:dummy_batch_size],
            'product_type_ids': features['product_type_ids'][:dummy_batch_size],
            'price_tiers': features['price_tiers'][:dummy_batch_size],
            'shelf_life_tiers': features['shelf_life_tiers'][:dummy_batch_size],
            'prices_normalized': features['prices_normalized'][:dummy_batch_size],
            'stocks_normalized': features['stocks_normalized'][:dummy_batch_size],
            'shelf_life_normalized': features['shelf_life_normalized'][:dummy_batch_size],
            'tfidf_features': features['tfidf_features'][:dummy_batch_size]
        }
        dummy_inputs = {k: tf.constant(v) for k, v in self._map_features_to_encoder_inputs(dummy_features).items()}
        
        _ = self.encoder(dummy_inputs, training=False)
        
        logger.info(f"✅ Model built - Total parameters: {self.encoder.count_params():,}")
    
    def create_training_pairs(
        self,
        features: Dict[str, np.ndarray],
        n_pairs_per_product: int = 5
    ) -> Tuple[Dict, np.ndarray]:
        """
        Create training pairs untuk contrastive learning
        
        Strategi:
        - Positive pairs: Produk dalam kategori sama
        - Negative pairs: Produk dari kategori berbeda
        
        Args:
            features: Features dictionary
            n_pairs_per_product: Jumlah pairs per product
            
        Returns:
            Tuple of (training_inputs, labels)
            labels: 1 = similar (same category), 0 = dissimilar
        """
        logger.info("Creating training pairs...")
        
        n_products = len(features['product_ids'])
        category_ids = features['category_ids']
        
        # Storage untuk pairs
        pair_inputs_1 = {key: [] for key in features.keys() if key != 'product_ids' and key != 'product_names'}
        pair_inputs_2 = {key: [] for key in features.keys() if key != 'product_ids' and key != 'product_names'}
        labels = []
        
        # Create pairs
        for i in range(n_products):
            # Positive pairs (same category)
            same_category_indices = np.where(category_ids == category_ids[i])[0]
            same_category_indices = same_category_indices[same_category_indices != i]
            
            if len(same_category_indices) > 0:
                # Sample positive pairs
                n_positive = min(n_pairs_per_product // 2, len(same_category_indices))
                positive_indices = np.random.choice(same_category_indices, n_positive, replace=False)
                
                for j in positive_indices:
                    # Add pair (i, j) dengan label=1
                    for key in pair_inputs_1.keys():
                        pair_inputs_1[key].append(features[key][i])
                        pair_inputs_2[key].append(features[key][j])
                    labels.append(1)
            
            # Negative pairs (different category)
            diff_category_indices = np.where(category_ids != category_ids[i])[0]
            
            if len(diff_category_indices) > 0:
                # Sample negative pairs
                n_negative = min(n_pairs_per_product // 2, len(diff_category_indices))
                negative_indices = np.random.choice(diff_category_indices, n_negative, replace=False)
                
                for j in negative_indices:
                    # Add pair (i, j) dengan label=0
                    for key in pair_inputs_1.keys():
                        pair_inputs_1[key].append(features[key][i])
                        pair_inputs_2[key].append(features[key][j])
                    labels.append(0)
        
        # Convert to numpy arrays
        for key in pair_inputs_1.keys():
            pair_inputs_1[key] = np.array(pair_inputs_1[key])
            pair_inputs_2[key] = np.array(pair_inputs_2[key])
        
        labels = np.array(labels, dtype=np.float32)
        
        # Combine pairs untuk contrastive loss
        # Format: [emb1, emb2] concatenated
        training_inputs = pair_inputs_1
        training_inputs_2 = pair_inputs_2
        
        logger.info(f"✅ Created {len(labels)} training pairs ({labels.sum():.0f} positive, {(~labels.astype(bool)).sum()} negative)")
        
        return (training_inputs, training_inputs_2), labels
    
    def generate_embeddings(self, features: Dict[str, np.ndarray]) -> np.ndarray:
        """
        Generate embeddings untuk all products
        
        Args:
            features: Features dictionary
            
        Returns:
            Product embeddings (n_products, embedding_dim)
        """
        if self.encoder is None:
            raise RuntimeError("Model belum di-build. Panggil build_model() terlebih dahulu")
        
        logger.info(f"Generating embeddings for {len(features['product_ids'])} products...")
        
        # Prepare inputs dengan key mapping
        inputs = {k: tf.constant(v) for k, v in self._map_features_to_encoder_inputs(features).items()}
        
        # Generate embeddings (batch processing untuk memory efficiency)
        batch_size = 64
        n_samples = len(features['product_ids'])
        all_embeddings = []
        
        for i in range(0, n_samples, batch_size):
            batch_inputs = {
                key: val[i:i+batch_size] for key, val in inputs.items()
            }
            batch_embeddings = self.encoder(batch_inputs, training=False)
            all_embeddings.append(batch_embeddings.numpy())
        
        embeddings = np.vstack(all_embeddings)
        
        logger.info(f"✅ Generated embeddings shape: {embeddings.shape}")
        return embeddings
    
    def index_products(self, features: Dict[str, np.ndarray], embeddings: np.ndarray):
        """
        Index products untuk similarity search
        
        Args:
            features: Features dictionary
            embeddings: Product embeddings
        """
        logger.info("Indexing products for similarity search...")
        
        # Prepare metadata
        metadata = {
            'categories': {
                pid: self.preprocessor.idx_to_category[cat_idx]
                for pid, cat_idx in zip(features['product_ids'], features['category_ids'])
            },
            'names': {
                pid: name
                for pid, name in zip(features['product_ids'], features['product_names'])
            }
        }
        
        # Index in similarity engine
        self.similarity_engine.index_products(
            embeddings=embeddings,
            product_ids=features['product_ids'],
            metadata=metadata
        )
        
        logger.info("✅ Products indexed in SimilarityEngine")
    
    def get_similar_products(
        self,
        product_id: int,
        top_k: int = 10,
        category_filter: Optional[str] = None
    ) -> List[Dict]:
        """
        Get similar products untuk given product
        
        Args:
            product_id: Source product ID
            top_k: Number of recommendations
            category_filter: Optional category filter
            
        Returns:
            List of recommendation dictionaries
        """
        if category_filter:
            similar = self.similarity_engine.find_similar_in_category(
                product_id, category_filter, top_k
            )
        else:
            similar = self.similarity_engine.find_similar(product_id, top_k)
        
        # Format results
        recommendations = []
        metadata = self.similarity_engine.product_metadata
        names_data = metadata.get('names', {})
        categories_data = metadata.get('categories', {})
        
        # Handle both dict and array format for metadata (backward compatibility)
        def get_value(data, product_id, default='Unknown'):
            if isinstance(data, dict):
                return data.get(product_id, default)
            elif isinstance(data, (list, np.ndarray)):
                # If it's array/list, find index by product_id
                try:
                    idx = list(self.similarity_engine.product_ids).index(product_id)
                    return data[idx]
                except (ValueError, IndexError):
                    return default
            return default
        
        for sim_id, score in similar:
            recommendations.append({
                'product_id': sim_id,  # Keep as string (UUID)
                'product_name': get_value(names_data, sim_id, 'Unknown'),
                'category': get_value(categories_data, sim_id, 'Unknown'),
                'similarity_score': float(score),
                'reason': f"Similarity: {score:.2%}"
            })
        
        return recommendations
    
    def save_model(self, save_dir: str):
        """
        Save complete model ke disk
        
        Args:
            save_dir: Directory untuk save model artifacts
        """
        save_path = Path(save_dir)
        save_path.mkdir(parents=True, exist_ok=True)
        
        logger.info(f"Saving model to {save_path}...")
        
        # Save encoder weights
        if self.encoder:
            encoder_path = save_path / "encoder.weights.h5"
            self.encoder.save_weights(str(encoder_path))
            logger.info(f"  ✅ Encoder saved: {encoder_path}")
        
        # Save preprocessor
        preprocessor_path = save_path / "preprocessor.pkl"
        self.preprocessor.save(str(preprocessor_path))
        logger.info(f"  ✅ Preprocessor saved: {preprocessor_path}")
        
        # Save text extractor
        text_extractor_path = save_path / "text_extractor.pkl"
        self.text_extractor.save(str(text_extractor_path))
        logger.info(f"  ✅ Text extractor saved: {text_extractor_path}")
        
        # Save similarity engine
        similarity_path = save_path / "similarity_engine.pkl"
        self.similarity_engine.save(str(similarity_path))
        logger.info(f"  ✅ Similarity engine saved: {similarity_path}")
        
        logger.info(f"✅ Complete model saved to {save_path}")
    
    @staticmethod
    def load_model(load_dir: str, embedding_dim: int = 32) -> 'NCBModel':
        """
        Load model dari disk
        
        Args:
            load_dir: Directory model artifacts
            embedding_dim: Embedding dimension
            
        Returns:
            NCBModel instance
        """
        load_path = Path(load_dir)
        
        logger.info(f"Loading model from {load_path}...")
        
        # Create model instance
        model = NCBModel(embedding_dim=embedding_dim)
        
        # Load preprocessor
        preprocessor_path = load_path / "preprocessor.pkl"
        model.preprocessor = DataPreprocessor.load(str(preprocessor_path))
        
        # Load text extractor
        text_extractor_path = load_path / "text_extractor.pkl"
        model.text_extractor = TextFeatureExtractor.load(str(text_extractor_path))
        
        # Rebuild encoder (need vocab sizes)
        vocab_sizes = model.preprocessor.get_vocab_sizes()
        tfidf_dim = model.text_extractor.max_features
        
        model.encoder = build_product_encoder(
            vocab_sizes=vocab_sizes,
            tfidf_dim=tfidf_dim,
            embedding_dim=embedding_dim
        )
        
        # Build encoder with dummy data before loading weights
        import numpy as np
        dummy_inputs = {
            'category_id': np.zeros((1,), dtype=np.int32),
            'product_type_id': np.zeros((1,), dtype=np.int32),
            'price_tier': np.zeros((1,), dtype=np.int32),
            'shelf_life_tier': np.zeros((1,), dtype=np.int32),
            'price_normalized': np.zeros((1,), dtype=np.float32),
            'stock_normalized': np.zeros((1,), dtype=np.float32),
            'shelf_life_normalized': np.zeros((1,), dtype=np.float32),
            'tfidf_features': np.zeros((1, tfidf_dim), dtype=np.float32)
        }
        
        _ = model.encoder(dummy_inputs, training=False)
        logger.info("  ✅ Encoder built with dummy data")
        
        # Load encoder weights
        encoder_path = load_path / "encoder.weights.h5"
        if encoder_path.exists():
            model.encoder.load_weights(str(encoder_path))
            logger.info(f"  ✅ Encoder weights loaded")
        
        # Load similarity engine
        similarity_path = load_path / "similarity_engine.pkl"
        model.similarity_engine = SimilarityEngine.load(str(similarity_path))
        
        # CRITICAL FIX: Load products_df untuk product lookup
        logger.info("Loading products data for similarity engine...")
        from data.data_loader import DataLoader
        data_loader = DataLoader()
        products_df = data_loader.load_products()
        
        # Set products_df in similarity engine
        model.similarity_engine.products_df = products_df
        logger.info(f"  ✅ Loaded {len(products_df)} products for lookup")
        
        model.is_trained = True
        
        logger.info(f"✅ Complete model loaded from {load_path}")
        return model

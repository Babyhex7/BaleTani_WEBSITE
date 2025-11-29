"""
Similarity Engine untuk mencari produk yang mirip
Menggunakan cosine similarity dan ANN (Approximate Nearest Neighbors) untuk retrieval cepat
"""
import numpy as np
from typing import List, Tuple, Dict, Optional
from sklearn.metrics.pairwise import cosine_similarity
from loguru import logger
import pickle


class SimilarityEngine:
    """
    Engine untuk compute similarity dan retrieve similar products
    Menggunakan cosine similarity karena embeddings sudah L2-normalized
    """
    
    def __init__(self):
        """Inisialisasi Similarity Engine"""
        self.product_embeddings = None  # (n_products, embedding_dim)
        self.product_ids = None  # (n_products,)
        self.product_metadata = None  # Dictionary metadata
        
        # Index untuk fast retrieval (akan digunakan untuk ANN nanti)
        self.is_indexed = False
        
        logger.info("SimilarityEngine initialized")
    
    def index_products(
        self,
        embeddings: np.ndarray,
        product_ids: np.ndarray,
        metadata: Optional[Dict] = None
    ):
        """
        Index product embeddings untuk similarity search
        
        Args:
            embeddings: Product embeddings (n_products, embedding_dim)
            product_ids: Product IDs (n_products,)
            metadata: Optional metadata dictionary (product names, categories, etc.)
        """
        logger.info(f"Indexing {len(embeddings)} product embeddings")
        
        self.product_embeddings = embeddings
        self.product_ids = product_ids
        self.product_metadata = metadata or {}
        
        # Normalize embeddings (seharusnya sudah normalized dari model)
        norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
        self.product_embeddings = embeddings / (norms + 1e-8)
        
        self.is_indexed = True
        
        logger.info(f"Indexed {len(embeddings)} products - embedding_dim={embeddings.shape[1]}")
    
    def find_similar(
        self,
        product_id: int,
        top_k: int = 10,
        exclude_self: bool = True
    ) -> List[Tuple[int, float]]:
        """
        Find top-K similar products untuk given product
        
        Args:
            product_id: Product ID untuk find similar items
            top_k: Number of similar items to return
            exclude_self: Exclude product itu sendiri dari results
            
        Returns:
            List of (product_id, similarity_score) tuples, sorted by score descending
        """
        if not self.is_indexed:
            raise RuntimeError("SimilarityEngine belum di-index. Panggil index_products() terlebih dahulu")
        
        # Find index of product
        try:
            product_idx = np.where(self.product_ids == product_id)[0][0]
        except IndexError:
            logger.warning(f"Product ID {product_id} not found in index")
            return []
        
        # Get embedding untuk product ini
        query_embedding = self.product_embeddings[product_idx:product_idx+1]
        
        # Compute cosine similarity dengan semua products
        # Karena sudah L2-normalized, cosine sim = dot product
        similarities = np.dot(self.product_embeddings, query_embedding.T).flatten()
        
        # Sort by similarity (descending)
        sorted_indices = np.argsort(similarities)[::-1]
        
        # Get top-K
        results = []
        for idx in sorted_indices:
            if exclude_self and idx == product_idx:
                continue
            
            similar_product_id = self.product_ids[idx]
            similarity_score = float(similarities[idx])
            
            results.append((similar_product_id, similarity_score))
            
            if len(results) >= top_k:
                break
        
        logger.debug(f"Found {len(results)} similar products for product_id={product_id}")
        return results
    
    def find_similar_by_embedding(
        self,
        query_embedding: np.ndarray,
        top_k: int = 10
    ) -> List[Tuple[int, float]]:
        """
        Find similar products berdasarkan custom embedding vector
        Useful untuk query-based recommendations
        
        Args:
            query_embedding: Embedding vector (1, embedding_dim) atau (embedding_dim,)
            top_k: Number of results
            
        Returns:
            List of (product_id, similarity_score)
        """
        if not self.is_indexed:
            raise RuntimeError("SimilarityEngine belum di-index")
        
        # Reshape jika perlu
        if query_embedding.ndim == 1:
            query_embedding = query_embedding.reshape(1, -1)
        
        # Normalize query embedding
        query_norm = query_embedding / (np.linalg.norm(query_embedding) + 1e-8)
        
        # Compute similarities
        similarities = np.dot(self.product_embeddings, query_norm.T).flatten()
        
        # Sort and get top-K
        sorted_indices = np.argsort(similarities)[::-1][:top_k]
        
        results = [
            (self.product_ids[idx], float(similarities[idx]))
            for idx in sorted_indices
        ]
        
        return results
    
    def find_similar_in_category(
        self,
        product_id: int,
        category: str,
        top_k: int = 10
    ) -> List[Tuple[int, float]]:
        """
        Find similar products dalam kategori yang sama
        
        Args:
            product_id: Source product ID
            category: Category untuk filter
            top_k: Number of results
            
        Returns:
            List of (product_id, similarity_score)
        """
        if 'categories' not in self.product_metadata:
            logger.warning("Category metadata not available, returning all similar products")
            return self.find_similar(product_id, top_k)
        
        # Get all similar products
        all_similar = self.find_similar(product_id, top_k=100, exclude_self=True)
        
        # Filter by category
        category_filtered = [
            (pid, score) for pid, score in all_similar
            if self.product_metadata['categories'].get(pid) == category
        ]
        
        return category_filtered[:top_k]
    
    def batch_find_similar(
        self,
        product_ids: List[int],
        top_k: int = 10
    ) -> Dict[int, List[Tuple[int, float]]]:
        """
        Batch processing untuk multiple products
        
        Args:
            product_ids: List of product IDs
            top_k: Number of similar items per product
            
        Returns:
            Dictionary {product_id: [(similar_id, score), ...]}
        """
        results = {}
        
        for product_id in product_ids:
            results[product_id] = self.find_similar(product_id, top_k)
        
        logger.info(f"Batch processed {len(product_ids)} products")
        return results
    
    def get_diversity_score(
        self,
        product_ids: List[int]
    ) -> float:
        """
        Compute diversity score untuk list of products
        Higher score = more diverse recommendations
        
        Args:
            product_ids: List of product IDs
            
        Returns:
            Diversity score (0-1, higher = more diverse)
        """
        if len(product_ids) < 2:
            return 1.0
        
        # Get embeddings untuk products
        indices = [np.where(self.product_ids == pid)[0][0] for pid in product_ids]
        embeddings = self.product_embeddings[indices]
        
        # Compute pairwise similarities
        sim_matrix = cosine_similarity(embeddings)
        
        # Average similarity (exclude diagonal)
        mask = ~np.eye(len(embeddings), dtype=bool)
        avg_similarity = sim_matrix[mask].mean()
        
        # Diversity = 1 - avg_similarity
        diversity = 1.0 - avg_similarity
        
        return float(diversity)
    
    def save(self, filepath: str):
        """Save similarity engine ke disk"""
        from pathlib import Path
        save_path = Path(filepath)
        save_path.parent.mkdir(parents=True, exist_ok=True)
        
        save_dict = {
            'product_embeddings': self.product_embeddings,
            'product_ids': self.product_ids,
            'product_metadata': self.product_metadata
        }
        
        with open(save_path, 'wb') as f:
            pickle.dump(save_dict, f)
        
        logger.info(f"✅ SimilarityEngine saved to {save_path}")
    
    @staticmethod
    def load(filepath: str) -> 'SimilarityEngine':
        """Load similarity engine dari disk"""
        with open(filepath, 'rb') as f:
            save_dict = pickle.load(f)
        
        engine = SimilarityEngine()
        engine.index_products(
            embeddings=save_dict['product_embeddings'],
            product_ids=save_dict['product_ids'],
            metadata=save_dict['product_metadata']
        )
        
        logger.info(f"✅ SimilarityEngine loaded from {filepath}")
        return engine


class ANNSimilarityEngine(SimilarityEngine):
    """
    Approximate Nearest Neighbors (ANN) Similarity Engine
    Untuk production dengan dataset besar, menggunakan library seperti FAISS atau Annoy
    
    NOTE: Implementasi ini placeholder untuk future optimization
    Untuk 57 products, exact search sudah cukup cepat
    """
    
    def __init__(self, use_ann: bool = False):
        """
        Args:
            use_ann: Enable ANN indexing (requires faiss-cpu library)
        """
        super().__init__()
        self.use_ann = use_ann
        self.ann_index = None
        
        if use_ann:
            try:
                import faiss
                self.faiss = faiss
                logger.info("FAISS ANN enabled")
            except ImportError:
                logger.warning("FAISS not installed, falling back to exact search")
                self.use_ann = False
    
    def index_products(self, embeddings: np.ndarray, product_ids: np.ndarray, metadata=None):
        """Index dengan ANN jika enabled"""
        super().index_products(embeddings, product_ids, metadata)
        
        if self.use_ann and self.faiss:
            # Build FAISS index
            embedding_dim = embeddings.shape[1]
            self.ann_index = self.faiss.IndexFlatIP(embedding_dim)  # Inner Product (cosine sim)
            self.ann_index.add(embeddings.astype('float32'))
            
            logger.info("✅ FAISS ANN index built")
    
    def find_similar(self, product_id: int, top_k: int = 10, exclude_self: bool = True):
        """Override dengan ANN search jika enabled"""
        if self.use_ann and self.ann_index:
            # ANN search implementation
            # ... (future implementation)
            pass
        
        # Fallback ke exact search
        return super().find_similar(product_id, top_k, exclude_self)

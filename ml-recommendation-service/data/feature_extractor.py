"""
Feature Extractor untuk text features (product names, descriptions)
Menggunakan TF-IDF untuk text vectorization
"""
import numpy as np
from typing import List, Dict
from sklearn.feature_extraction.text import TfidfVectorizer
from loguru import logger
import pickle
import re


class TextFeatureExtractor:
    """
    Extract text features dari product names dan descriptions
    Menggunakan TF-IDF vectorization
    """
    
    def __init__(self, max_features: int = 50, ngram_range: tuple = (1, 2)):
        """
        Inisialisasi text feature extractor
        
        Args:
            max_features: Maximum number of features (vocabulary size)
            ngram_range: Ngram range untuk TF-IDF (1,2 = unigram + bigram)
        """
        self.max_features = max_features
        self.ngram_range = ngram_range
        
        # TF-IDF vectorizer untuk product names
        self.name_vectorizer = TfidfVectorizer(
            max_features=max_features,
            ngram_range=ngram_range,
            lowercase=True,
            strip_accents='unicode',
            analyzer='word',
            stop_words=self._get_indonesian_stopwords()
        )
        
        self.is_fitted = False
        logger.info(f"TextFeatureExtractor initialized (max_features={max_features})")
    
    def _get_indonesian_stopwords(self) -> List[str]:
        """
        Get common Indonesian stopwords untuk filtering
        
        Returns:
            List of stopwords
        """
        # Common Indonesian stopwords yang tidak informatif untuk produk
        stopwords = [
            'dan', 'atau', 'yang', 'untuk', 'dari', 'dengan', 'di', 'ke',
            'pada', 'dalam', 'adalah', 'ini', 'itu', 'tersebut', 'dapat',
            'akan', 'sudah', 'telah', 'oleh', 'karena', 'sehingga'
        ]
        return stopwords
    
    def _preprocess_text(self, text: str) -> str:
        """
        Preprocessing text sebelum vectorization
        
        Args:
            text: Raw text
            
        Returns:
            Cleaned text
        """
        if pd.isna(text) or text is None:
            return ""
        
        # Convert to lowercase
        text = str(text).lower()
        
        # Remove special characters tapi keep spaces
        text = re.sub(r'[^a-z0-9\s]', ' ', text)
        
        # Remove extra whitespaces
        text = ' '.join(text.split())
        
        return text
    
    def fit(self, product_names: List[str]) -> 'TextFeatureExtractor':
        """
        Fit TF-IDF vectorizer dengan product names
        
        Args:
            product_names: List of product names
            
        Returns:
            self untuk method chaining
        """
        logger.info(f"Fitting TextFeatureExtractor with {len(product_names)} products")
        
        # Preprocess all names
        cleaned_names = [self._preprocess_text(name) for name in product_names]
        
        # Fit vectorizer
        self.name_vectorizer.fit(cleaned_names)
        
        self.is_fitted = True
        vocab_size = len(self.name_vectorizer.vocabulary_)
        logger.info(f"✅ TF-IDF fitted - vocabulary size: {vocab_size}")
        
        # Log top features untuk debugging
        feature_names = self.name_vectorizer.get_feature_names_out()
        logger.debug(f"Sample features: {list(feature_names[:10])}")
        
        return self
    
    def transform(self, product_names: List[str]) -> np.ndarray:
        """
        Transform product names menjadi TF-IDF vectors
        
        Args:
            product_names: List of product names
            
        Returns:
            TF-IDF matrix (n_products, max_features)
        """
        if not self.is_fitted:
            raise RuntimeError("TextFeatureExtractor belum di-fit. Panggil fit() terlebih dahulu")
        
        # Preprocess
        cleaned_names = [self._preprocess_text(name) for name in product_names]
        
        # Transform ke TF-IDF
        tfidf_matrix = self.name_vectorizer.transform(cleaned_names).toarray()
        
        logger.debug(f"✅ Transformed {len(product_names)} names to TF-IDF shape: {tfidf_matrix.shape}")
        return tfidf_matrix
    
    def fit_transform(self, product_names: List[str]) -> np.ndarray:
        """
        Fit dan transform sekaligus
        
        Args:
            product_names: List of product names
            
        Returns:
            TF-IDF matrix
        """
        self.fit(product_names)
        return self.transform(product_names)
    
    def get_feature_names(self) -> List[str]:
        """
        Get list of feature names (vocabulary)
        
        Returns:
            List of feature names
        """
        if not self.is_fitted:
            return []
        return self.name_vectorizer.get_feature_names_out().tolist()
    
    def get_top_terms(self, tfidf_vector: np.ndarray, top_n: int = 5) -> List[tuple]:
        """
        Get top N terms dari TF-IDF vector
        
        Args:
            tfidf_vector: Single TF-IDF vector
            top_n: Number of top terms
            
        Returns:
            List of (term, score) tuples
        """
        if not self.is_fitted:
            return []
        
        feature_names = self.get_feature_names()
        top_indices = np.argsort(tfidf_vector)[-top_n:][::-1]
        
        top_terms = [
            (feature_names[idx], tfidf_vector[idx])
            for idx in top_indices
            if tfidf_vector[idx] > 0
        ]
        
        return top_terms
    
    def save(self, filepath: str):
        """Save extractor ke disk"""
        from pathlib import Path
        save_path = Path(filepath)
        save_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(save_path, 'wb') as f:
            pickle.dump(self, f)
        
        logger.info(f"✅ TextFeatureExtractor saved to {save_path}")
    
    @staticmethod
    def load(filepath: str) -> 'TextFeatureExtractor':
        """Load extractor dari disk"""
        with open(filepath, 'rb') as f:
            extractor = pickle.load(f)
        
        logger.info(f"✅ TextFeatureExtractor loaded from {filepath}")
        return extractor


# Import pandas untuk text preprocessing
import pandas as pd

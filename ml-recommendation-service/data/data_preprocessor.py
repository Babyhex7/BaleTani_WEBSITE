"""
Data Preprocessor untuk feature engineering dan data cleaning
Mengubah raw data menjadi features yang siap untuk training model
"""
import pandas as pd
import numpy as np
from typing import Dict, Tuple, List
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from loguru import logger
import pickle
from pathlib import Path

from config.settings import settings


class DataPreprocessor:
    """
    Preprocessor untuk transform data produk menjadi features untuk neural network
    """
    
    def __init__(self):
        """Inisialisasi preprocessor dengan encoders dan scalers"""
        self.category_encoder = LabelEncoder()
        self.product_type_encoder = LabelEncoder()
        self.price_scaler = StandardScaler()
        self.stock_scaler = StandardScaler()
        self.shelf_life_scaler = StandardScaler()
        
        # Storage untuk mapping
        self.category_to_idx = {}
        self.idx_to_category = {}
        self.product_type_to_idx = {}
        
        # Flag untuk menandakan preprocessor sudah di-fit
        self.is_fitted = False
        
        logger.info("DataPreprocessor initialized")
    
    def fit(self, products_df: pd.DataFrame) -> 'DataPreprocessor':
        """
        Fit preprocessor dengan training data
        
        Args:
            products_df: DataFrame produk untuk fit encoders/scalers
            
        Returns:
            self untuk method chaining
        """
        logger.info(f"Fitting preprocessor with {len(products_df)} products")
        
        # Fit category encoder
        self.category_encoder.fit(products_df['category_name'].fillna('Unknown'))
        self.category_to_idx = {
            cat: idx for idx, cat in enumerate(self.category_encoder.classes_)
        }
        self.idx_to_category = {
            idx: cat for cat, idx in self.category_to_idx.items()
        }
        
        # Fit product type encoder
        self.product_type_encoder.fit(products_df['product_type'].fillna('online'))
        self.product_type_to_idx = {
            ptype: idx for idx, ptype in enumerate(self.product_type_encoder.classes_)
        }
        
        # Fit scalers untuk numerical features
        self.price_scaler.fit(products_df[['selling_price']])
        self.stock_scaler.fit(products_df[['total_stock']])
        self.shelf_life_scaler.fit(products_df[['shelf_life_days']])
        
        self.is_fitted = True
        logger.info(f"✅ Preprocessor fitted - {len(self.category_to_idx)} categories, "
                   f"{len(self.product_type_to_idx)} product types")
        
        return self
    
    def transform_products(self, products_df: pd.DataFrame) -> Dict[str, np.ndarray]:
        """
        Transform DataFrame produk menjadi features untuk model
        
        Args:
            products_df: DataFrame produk
            
        Returns:
            Dictionary berisi berbagai feature arrays:
            - category_ids: encoded category
            - product_type_ids: encoded product type
            - prices_normalized: normalized prices
            - stocks_normalized: normalized stocks
            - shelf_life_normalized: normalized shelf life
            - price_tiers: categorical price tiers (low/mid/high)
            - shelf_life_tiers: categorical shelf life tiers
            - product_ids: original product IDs
        """
        if not self.is_fitted:
            raise RuntimeError("Preprocessor belum di-fit. Panggil fit() terlebih dahulu")
        
        logger.info(f"Transforming {len(products_df)} products")
        
        # Encode categorical features
        category_ids = self.category_encoder.transform(
            products_df['category_name'].fillna('Unknown')
        )
        
        product_type_ids = self.product_type_encoder.transform(
            products_df['product_type'].fillna('online')
        )
        
        # Normalize numerical features
        prices_normalized = self.price_scaler.transform(
            products_df[['selling_price']]
        ).flatten()
        
        stocks_normalized = self.stock_scaler.transform(
            products_df[['total_stock']]
        ).flatten()
        
        shelf_life_normalized = self.shelf_life_scaler.transform(
            products_df[['shelf_life_days']]
        ).flatten()
        
        # Create price tiers (low: <15k, mid: 15k-40k, high: >40k)
        price_tiers = pd.cut(
            products_df['selling_price'],
            bins=[0, 15000, 40000, float('inf')],
            labels=[0, 1, 2]  # 0=low, 1=mid, 2=high
        ).astype(int)
        
        # Create shelf life tiers (perishable: <7 days, medium: 7-30, long: >30)
        shelf_life_tiers = pd.cut(
            products_df['shelf_life_days'],
            bins=[0, 7, 30, float('inf')],
            labels=[0, 1, 2]  # 0=very_perishable, 1=perishable, 2=shelf_stable
        ).astype(int)
        
        features = {
            'category_ids': category_ids,
            'product_type_ids': product_type_ids,
            'prices_normalized': prices_normalized,
            'stocks_normalized': stocks_normalized,
            'shelf_life_normalized': shelf_life_normalized,
            'price_tiers': price_tiers.values,
            'shelf_life_tiers': shelf_life_tiers.values,
            'product_ids': products_df['id'].values,
            'product_names': products_df['product_name'].values.tolist()
        }
        
        logger.debug(f"✅ Transformed features shape: category_ids={len(category_ids)}")
        return features
    
    def create_price_tier(self, price: float) -> int:
        """
        Convert price ke tier category
        
        Args:
            price: Harga produk
            
        Returns:
            0 (low), 1 (mid), atau 2 (high)
        """
        if price < 15000:
            return 0  # low
        elif price < 40000:
            return 1  # mid
        else:
            return 2  # high
    
    def create_shelf_life_tier(self, days: int) -> int:
        """
        Convert shelf life days ke tier category
        
        Args:
            days: Shelf life dalam hari
            
        Returns:
            0 (very_perishable), 1 (perishable), 2 (shelf_stable)
        """
        if days < 7:
            return 0  # very perishable
        elif days < 30:
            return 1  # perishable
        else:
            return 2  # shelf stable
    
    def split_train_test(
        self,
        features: Dict[str, np.ndarray],
        test_size: float = 0.3,
        random_state: int = 42
    ) -> Tuple[Dict, Dict]:
        """
        Split features menjadi train dan test set
        
        Args:
            features: Dictionary features dari transform_products()
            test_size: Proporsi test set (default 0.3 = 30%)
            random_state: Random seed untuk reproducibility
            
        Returns:
            Tuple of (train_features, test_features)
        """
        n_samples = len(features['product_ids'])
        indices = np.arange(n_samples)
        
        train_idx, test_idx = train_test_split(
            indices,
            test_size=test_size,
            random_state=random_state,
            stratify=features['category_ids']  # Stratify by category
        )
        
        train_features = {
            key: val[train_idx] if isinstance(val, np.ndarray) else [val[i] for i in train_idx]
            for key, val in features.items()
        }
        
        test_features = {
            key: val[test_idx] if isinstance(val, np.ndarray) else [val[i] for i in test_idx]
            for key, val in features.items()
        }
        
        logger.info(f"✅ Split data: train={len(train_idx)}, test={len(test_idx)}")
        return train_features, test_features
    
    def save(self, filepath: str):
        """
        Save preprocessor ke disk
        
        Args:
            filepath: Path untuk save preprocessor (.pkl)
        """
        save_path = Path(filepath)
        save_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(save_path, 'wb') as f:
            pickle.dump(self, f)
        
        logger.info(f"✅ Preprocessor saved to {save_path}")
    
    @staticmethod
    def load(filepath: str) -> 'DataPreprocessor':
        """
        Load preprocessor dari disk
        
        Args:
            filepath: Path file preprocessor (.pkl)
            
        Returns:
            DataPreprocessor instance
        """
        with open(filepath, 'rb') as f:
            preprocessor = pickle.load(f)
        
        logger.info(f"✅ Preprocessor loaded from {filepath}")
        return preprocessor
    
    def get_vocab_sizes(self) -> Dict[str, int]:
        """
        Get vocabulary sizes untuk embedding layers
        
        Returns:
            Dictionary dengan vocab sizes untuk setiap categorical feature
        """
        return {
            'n_categories': len(self.category_to_idx),
            'n_product_types': len(self.product_type_to_idx),
            'n_price_tiers': 3,  # low, mid, high
            'n_shelf_life_tiers': 3  # very_perishable, perishable, shelf_stable
        }

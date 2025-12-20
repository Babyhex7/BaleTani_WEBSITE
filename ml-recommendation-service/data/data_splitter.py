"""
Data Splitter dengan Stratified Sampling
✅ OTOMATIS: Split data train/validation/test
✅ STRATIFIED: Setiap kategori proporsional
✅ REPRODUCIBLE: Random state untuk consistency
✅ MODULAR: Reusable untuk berbagai dataset
"""
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Tuple, Optional
from sklearn.model_selection import train_test_split
from loguru import logger


class DataSplitter:
    """
    Class untuk split dataset dengan stratified sampling
    
    Features:
    - Stratified by category (balanced distribution)
    - Configurable split ratios
    - Auto save to separate folders
    - Reproducible with random_state
    """
    
    def __init__(
        self,
        train_ratio: float = 0.70,
        val_ratio: float = 0.15,
        test_ratio: float = 0.15,
        random_state: int = 42
    ):
        """
        Initialize data splitter
        
        Args:
            train_ratio: Proporsi data training (default: 70%)
            val_ratio: Proporsi data validation (default: 15%)
            test_ratio: Proporsi data test (default: 15%)
            random_state: Seed untuk reproducibility
        """
        # Validasi ratios
        total_ratio = train_ratio + val_ratio + test_ratio
        if not np.isclose(total_ratio, 1.0):
            raise ValueError(f"Total ratios harus = 1.0, got {total_ratio}")
        
        self.train_ratio = train_ratio
        self.val_ratio = val_ratio
        self.test_ratio = test_ratio
        self.random_state = random_state
        
        logger.info(
            f"DataSplitter initialized - "
            f"Train: {train_ratio*100:.0f}% | "
            f"Val: {val_ratio*100:.0f}% | "
            f"Test: {test_ratio*100:.0f}%"
        )
    
    def split_dataframe(
        self,
        df: pd.DataFrame,
        stratify_column: str = 'category_id'
    ) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """
        ✅ SPLIT DataFrame dengan stratified sampling
        
        Args:
            df: DataFrame yang akan di-split
            stratify_column: Column untuk stratification (default: 'category_id')
        
        Returns:
            Tuple of (train_df, val_df, test_df)
        """
        logger.info(f"Splitting {len(df)} products with stratification by '{stratify_column}'...")
        
        # Validasi column exists
        if stratify_column not in df.columns:
            raise ValueError(f"Column '{stratify_column}' not found in DataFrame")
        
        # STEP 1: Split train vs (val + test)
        train_df, temp_df = train_test_split(
            df,
            test_size=(self.val_ratio + self.test_ratio),
            stratify=df[stratify_column],  # ✅ STRATIFIED!
            random_state=self.random_state
        )
        
        logger.info(f"  ✅ Train split: {len(train_df)} products")
        
        # STEP 2: Split (val + test) → val dan test
        # Hitung proporsi val dari temp
        val_ratio_from_temp = self.val_ratio / (self.val_ratio + self.test_ratio)
        
        val_df, test_df = train_test_split(
            temp_df,
            test_size=(1 - val_ratio_from_temp),
            stratify=temp_df[stratify_column],  # ✅ TETAP STRATIFIED!
            random_state=self.random_state
        )
        
        logger.info(f"  ✅ Validation split: {len(val_df)} products")
        logger.info(f"  ✅ Test split: {len(test_df)} products")
        
        # Verify total
        total_split = len(train_df) + len(val_df) + len(test_df)
        assert total_split == len(df), f"Split error: {total_split} != {len(df)}"
        
        return train_df, val_df, test_df
    
    def print_split_statistics(
        self,
        train_df: pd.DataFrame,
        val_df: pd.DataFrame,
        test_df: pd.DataFrame,
        category_column: str = 'category_name'
    ):
        """
        Print statistik distribusi split
        
        Args:
            train_df: Training DataFrame
            val_df: Validation DataFrame
            test_df: Test DataFrame
            category_column: Column nama kategori
        """
        print("\n" + "=" * 80)
        print("📊 SPLIT STATISTICS")
        print("=" * 80)
        
        # Overall distribution
        total = len(train_df) + len(val_df) + len(test_df)
        print(f"\n📦 Overall Distribution:")
        print(f"   • Total:      {total:5d} products (100.0%)")
        print(f"   • Training:   {len(train_df):5d} products ({len(train_df)/total*100:5.1f}%)")
        print(f"   • Validation: {len(val_df):5d} products ({len(val_df)/total*100:5.1f}%)")
        print(f"   • Test:       {len(test_df):5d} products ({len(test_df)/total*100:5.1f}%)")
        
        # Per-category distribution
        print(f"\n📋 Per-Category Distribution:")
        print(f"{'Category':<20} {'Train':>8} {'Val':>8} {'Test':>8} {'Total':>8}")
        print("-" * 80)
        
        categories = sorted(train_df[category_column].unique())
        
        for category in categories:
            train_count = (train_df[category_column] == category).sum()
            val_count = (val_df[category_column] == category).sum()
            test_count = (test_df[category_column] == category).sum()
            total_cat = train_count + val_count + test_count
            
            print(
                f"{category:<20} "
                f"{train_count:>8d} "
                f"{val_count:>8d} "
                f"{test_count:>8d} "
                f"{total_cat:>8d}"
            )
        
        # Check stratification quality
        print(f"\n⚖️  Stratification Quality Check:")
        train_dist = train_df[category_column].value_counts(normalize=True).sort_index()
        val_dist = val_df[category_column].value_counts(normalize=True).sort_index()
        test_dist = test_df[category_column].value_counts(normalize=True).sort_index()
        
        max_diff = 0
        for category in categories:
            train_pct = train_dist.get(category, 0) * 100
            val_pct = val_dist.get(category, 0) * 100
            test_pct = test_dist.get(category, 0) * 100
            
            diff = max(abs(train_pct - val_pct), abs(val_pct - test_pct), abs(train_pct - test_pct))
            max_diff = max(max_diff, diff)
        
        print(f"   • Max percentage difference: {max_diff:.2f}%")
        if max_diff < 2:
            print(f"   ✅ EXCELLENT stratification (diff < 2%)")
        elif max_diff < 5:
            print(f"   ✅ GOOD stratification (diff < 5%)")
        else:
            print(f"   ⚠️ Poor stratification (diff >= 5%)")
        
        print("=" * 80)
    
    def save_splits(
        self,
        train_df: pd.DataFrame,
        val_df: pd.DataFrame,
        test_df: pd.DataFrame,
        output_dir: str = "data/splits"
    ) -> dict:
        """
        ✅ SAVE split datasets ke folder terpisah
        
        Args:
            train_df: Training DataFrame
            val_df: Validation DataFrame
            test_df: Test DataFrame
            output_dir: Base directory untuk save (default: 'data/splits')
        
        Returns:
            Dict dengan path ke saved files
        """
        base_path = Path(output_dir)
        
        # Create directories
        train_dir = base_path / "train"
        val_dir = base_path / "validation"
        test_dir = base_path / "test"
        
        train_dir.mkdir(parents=True, exist_ok=True)
        val_dir.mkdir(parents=True, exist_ok=True)
        test_dir.mkdir(parents=True, exist_ok=True)
        
        # Save CSVs
        train_path = train_dir / "products_train.csv"
        val_path = val_dir / "products_val.csv"
        test_path = test_dir / "products_test.csv"
        
        logger.info(f"Saving split datasets to {base_path}...")
        
        train_df.to_csv(train_path, index=False)
        logger.info(f"  ✅ Train saved: {train_path} ({len(train_df)} products)")
        
        val_df.to_csv(val_path, index=False)
        logger.info(f"  ✅ Validation saved: {val_path} ({len(val_df)} products)")
        
        test_df.to_csv(test_path, index=False)
        logger.info(f"  ✅ Test saved: {test_path} ({len(test_df)} products)")
        
        return {
            'train': str(train_path),
            'validation': str(val_path),
            'test': str(test_path)
        }
    
    def split_and_save(
        self,
        df: pd.DataFrame,
        output_dir: str = "data/splits",
        stratify_column: str = 'category_id',
        category_column: str = 'category_name',
        print_stats: bool = True
    ) -> dict:
        """
        ✅ FUNGSI ALL-IN-ONE: Split dan save sekaligus
        
        Args:
            df: DataFrame yang akan di-split
            output_dir: Directory output
            stratify_column: Column untuk stratification
            category_column: Column nama kategori (untuk statistics)
            print_stats: Print statistics atau tidak
        
        Returns:
            Dict dengan path ke saved files
        """
        # Split
        train_df, val_df, test_df = self.split_dataframe(df, stratify_column)
        
        # Print statistics
        if print_stats:
            self.print_split_statistics(train_df, val_df, test_df, category_column)
        
        # Save
        paths = self.save_splits(train_df, val_df, test_df, output_dir)
        
        logger.info("✅ Split and save completed!")
        
        return paths


def split_products_dataset(
    input_csv: str,
    output_dir: str = "data/splits",
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15,
    random_state: int = 42
) -> dict:
    """
    ✅ CONVENIENCE FUNCTION: Split products CSV dengan satu command
    
    Args:
        input_csv: Path ke CSV file input
        output_dir: Directory output untuk splits
        train_ratio: Proporsi training (default: 70%)
        val_ratio: Proporsi validation (default: 15%)
        test_ratio: Proporsi test (default: 15%)
        random_state: Random seed
    
    Returns:
        Dict dengan path ke saved files
    
    Example:
        >>> paths = split_products_dataset(
        ...     input_csv="data/raw/products_1000_balanced.csv",
        ...     output_dir="data/splits"
        ... )
    """
    logger.info("=" * 80)
    logger.info("DATA SPLITTER - Stratified Train/Val/Test Split")
    logger.info("=" * 80)
    
    # Load CSV
    logger.info(f"Loading dataset from: {input_csv}")
    df = pd.read_csv(input_csv)
    logger.info(f"  ✅ Loaded {len(df)} products")
    
    # Create splitter
    splitter = DataSplitter(
        train_ratio=train_ratio,
        val_ratio=val_ratio,
        test_ratio=test_ratio,
        random_state=random_state
    )
    
    # Split and save
    paths = splitter.split_and_save(
        df=df,
        output_dir=output_dir,
        stratify_column='category_id',
        category_column='category_name',
        print_stats=True
    )
    
    logger.info("\n" + "=" * 80)
    logger.info("✅ DATA SPLITTING COMPLETED!")
    logger.info("=" * 80)
    logger.info("\nSaved files:")
    for split_name, path in paths.items():
        logger.info(f"  • {split_name:12s}: {path}")
    
    return paths


if __name__ == "__main__":
    """
    Main execution: Split products_1000_balanced.csv
    """
    import sys
    from pathlib import Path
    
    # Add parent directory to path
    sys.path.insert(0, str(Path(__file__).parent.parent))
    
    # Input file
    input_file = Path(__file__).parent.parent / "data" / "raw" / "products_1000_balanced.csv"
    
    if not input_file.exists():
        logger.error(f"Input file not found: {input_file}")
        logger.info("Please run generate_1000_products_balanced.py first!")
        sys.exit(1)
    
    # Split dataset
    paths = split_products_dataset(
        input_csv=str(input_file),
        output_dir=str(Path(__file__).parent.parent / "data" / "splits"),
        train_ratio=0.70,
        val_ratio=0.15,
        test_ratio=0.15,
        random_state=42
    )
    
    logger.info("\n🎉 Success! Ready for training.")

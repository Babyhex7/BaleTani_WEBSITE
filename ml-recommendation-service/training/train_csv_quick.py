"""
Training NCB Model dengan data CSV real (52 produk)
Quick training untuk demo dan testing
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import pandas as pd
from loguru import logger
from models.content_based.ncb_model import NCBModel
from data.data_loader import DataLoader

def train_with_csv_data():
    """Train model dengan data dari CSV"""
    
    print("\n" + "="*70)
    print("TRAINING NCB MODEL - Using CSV Data (52 Products)")
    print("="*70)
    
    # Load data dari CSV
    print("\n[1] Loading products from CSV...")
    loader = DataLoader()
    products_df = loader.load_products()
    print(f"✓ Loaded {len(products_df)} products")
    print(f"  Categories: {products_df['category_name'].nunique()}")
    print(f"  Products per category:")
    for cat, count in products_df['category_name'].value_counts().items():
        print(f"    - {cat}: {count}")
    
    # Initialize model
    print("\n[2] Initializing NCB Model...")
    model = NCBModel(embedding_dim=32, tfidf_max_features=50)
    print("✓ Model initialized")
    
    # Prepare data
    print("\n[3] Preparing data...")
    features = model.prepare_data(products_df)
    print(f"✓ Data prepared: {len(features['product_ids'])} products")
    
    # Build model
    print("\n[4] Building neural network...")
    model.build_model(features)
    print("✓ Model built")
    
    # Generate embeddings (tanpa training, hanya forward pass)
    print("\n[5] Generating product embeddings...")
    embeddings = model.generate_embeddings(features)
    print(f"✓ Embeddings generated: {embeddings.shape}")
    
    # Index products
    print("\n[6] Indexing products for similarity search...")
    model.index_products(features, embeddings)
    print("✓ Products indexed")
    
    # Set as trained
    model.is_trained = True
    
    # Save model
    save_path = "../models/saved_models/ncb_csv"
    print(f"\n[7] Saving model to {save_path}...")
    model.save_model(save_path)
    print("✓ Model saved")
    
    # Test recommendations
    print("\n[8] Testing recommendations...")
    print("="*70)
    
    # Test dengan 3 produk pertama
    for i in range(min(3, len(features['product_ids']))):
        prod_id = features['product_ids'][i]
        prod_name = features['product_names'][i]
        
        recs = model.get_similar_products(prod_id, top_k=5)
        
        print(f"\n🔍 Query: {prod_name}")
        print(f"   📦 Recommendations:")
        for j, rec in enumerate(recs, 1):
            print(f"   {j}. {rec['product_name'][:40]:<40} | {rec['category_name']:<15} | Sim: {rec['similarity_score']:.4f}")
    
    print("\n" + "="*70)
    print("✅ TRAINING COMPLETE!")
    print(f"   Model saved to: {save_path}")
    print("="*70)

if __name__ == "__main__":
    train_with_csv_data()

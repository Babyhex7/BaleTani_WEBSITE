"""
Test rekomendasi dengan produk-produk dari database
"""
import sys
sys.path.insert(0, '.')

from models.content_based.ncb_model import NCBModel
from data.data_loader import DataLoader
import numpy as np

def test_with_real_products():
    """Test dengan produk dari database"""
    
    print("\n" + "="*70)
    print("TESTING NCB MODEL - Real Product Recommendations")
    print("="*70)
    
    # Load model
    print("\n[1] Loading model...")
    model = NCBModel.load_model('../models/saved_models/ncb_v4')
    print(f"✓ Model loaded: {len(model.similarity_engine.product_ids)} products indexed")
    
    # Gunakan produk yang ada di index model
    print("\n[2] Using products from model index...")
    indexed_product_ids = model.similarity_engine.product_ids
    print(f"✓ Model has {len(indexed_product_ids)} indexed products")
    
    # Test dengan 10 produk random dari index
    print("\n[3] Testing recommendations for indexed products...")
    print("="*70)
    
    # Ambil 10 produk random dari index
    test_indices = np.random.choice(len(indexed_product_ids), size=10, replace=False)
    
    for idx in test_indices:
        prod_id = indexed_product_ids[idx]
        
        # Get product info dari metadata
        metadata = model.similarity_engine.product_metadata
        prod_name = metadata.get('product_names', {}).get(prod_id, 'Unknown')
        prod_category = metadata.get('categories', {}).get(prod_id, 'Unknown')
        
        print(f"\n🔍 Query Product:")
        print(f"   Name: {prod_name}")
        print(f"   Category: {prod_category}")
        print(f"   ID: {prod_id}")
        
        try:
            # Get recommendations
            recs = model.get_similar_products(prod_id, top_k=5)
            
            print(f"\n   📦 Top 5 Recommendations:")
            for i, rec in enumerate(recs, 1):
                sim = rec.get('similarity_score', 0)
                rec_name = rec.get('product_name', 'Unknown')
                rec_cat = rec.get('category_name', 'Unknown')
                
                print(f"   {i}. {rec_name[:50]:<50} | {rec_cat:<15} | Sim: {sim:.4f}")
                
        except Exception as e:
            print(f"   ✗ Error: {e}")
            import traceback
            traceback.print_exc()
        
        print("-" * 70)
    
    print("\n" + "="*70)
    print("✅ TESTING COMPLETE!")
    print("="*70)

if __name__ == "__main__":
    test_with_real_products()

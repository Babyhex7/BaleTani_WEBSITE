"""
Test script untuk mengecek rekomendasi produk
"""
import sys
sys.path.insert(0, '.')

from models.content_based.ncb_model import NCBModel
import numpy as np
from loguru import logger

def test_model():
    """Test model loading dan recommendations"""
    
    print("\n" + "="*60)
    print("TESTING NCB MODEL - Product Recommendations")
    print("="*60)
    
    # Load model
    print("\n[1] Loading model...")
    try:
        model = NCBModel.load_model('../models/saved_models/ncb_v4')
        print(f"✓ Model loaded successfully!")
        print(f"  - Trained: {model.is_trained}")
        print(f"  - Embeddings shape: {model.similarity_engine.product_embeddings.shape}")
        print(f"  - Total products: {len(model.similarity_engine.product_ids)}")
    except Exception as e:
        print(f"✗ Error loading model: {e}")
        import traceback
        traceback.print_exc()
        return
    
    # Test dengan berbagai produk
    print("\n[2] Testing recommendations for different products...")
    print("-" * 60)
    
    # Ambil 10 produk random untuk test
    test_indices = np.random.choice(len(model.similarity_engine.product_ids), 
                                   size=min(10, len(model.similarity_engine.product_ids)), 
                                   replace=False)
    
    success_count = 0
    total_count = 0
    
    for idx in test_indices:
        product_id = model.similarity_engine.product_ids[idx]
        total_count += 1
        
        try:
            recommendations = model.get_similar_products(product_id, top_k=5)
            success_count += 1
            
            print(f"\n✓ Product ID: {product_id}")
            print(f"  Recommendations: {len(recommendations)} items")
            
            # Show top 3
            for i, rec in enumerate(recommendations[:3], 1):
                sim_score = rec.get('similarity_score', 0)
                rec_id = rec.get('product_id', 'N/A')
                rec_name = rec.get('product_name', 'N/A')
                print(f"    {i}. {rec_name[:40]} (similarity: {sim_score:.4f})")
                
        except Exception as e:
            print(f"\n✗ Product ID: {product_id}")
            print(f"  Error: {e}")
    
    # Summary
    print("\n" + "="*60)
    print("TESTING SUMMARY")
    print("="*60)
    print(f"Total tests: {total_count}")
    print(f"Successful: {success_count}")
    print(f"Failed: {total_count - success_count}")
    print(f"Success rate: {(success_count/total_count)*100:.1f}%")
    
    if success_count == total_count:
        print("\n🎉 ALL TESTS PASSED!")
    else:
        print(f"\n⚠️  {total_count - success_count} tests failed")
    
    print("="*60)

if __name__ == "__main__":
    test_model()

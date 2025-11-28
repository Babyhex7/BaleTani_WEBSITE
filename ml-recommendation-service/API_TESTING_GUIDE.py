"""
API Testing Documentation untuk BaleTani AI Recommendation Service
Test manual dengan Postman, Thunder Client, atau curl
"""

# ===== BASE URL =====
BASE_URL = "http://localhost:8000"

# ===== SAMPLE UUID DATA =====
# Ambil dari ml-recommendation-service/data/raw/products.csv
# Gunakan UUID dari product ID yang sudah ada

# Contoh UUIDs (sesuaikan dengan CSV Anda):
SAMPLE_PRODUCT_UUID = "550e8400-e29b-41d4-a716-446655440001"  # Udang Sedang 1
SAMPLE_CATEGORY_UUID = "660e8400-e29b-41d4-a716-446655440001"  # Protein Laut

# ===== 1. HEALTH CHECK =====
# GET /health
"""
curl http://localhost:8000/health

Expected Response:
{
  "status": "healthy",
  "model_loaded": true,
  "total_indexed_products": 52,
  "model_version": "ncb_v1",
  "uptime_seconds": 45.23
}
"""

# ===== 2. SIMILAR PRODUCTS =====
# GET /v1/recommendations/similar/{product_id}?top_k=10
"""
curl "http://localhost:8000/v1/recommendations/similar/{PRODUCT_UUID}?top_k=10"

Example:
curl "http://localhost:8000/v1/recommendations/similar/550e8400-e29b-41d4-a716-446655440001?top_k=5"

Expected Response:
{
  "product_id": "550e8400-e29b-41d4-a716-446655440001",
  "product_name": "Udang sedang 1",
  "category_name": "Protein Laut",
  "recommendations": [
    {
      "product_id": "550e8400-e29b-41d4-a716-446655440002",
      "product_name": "Udang sedang 2",
      "category_name": "Protein Laut",
      "similarity_score": 0.9987,
      "percentage": "99.87%",
      "reason": "Produk sangat mirip dengan karakteristik hampir identik"
    },
    {
      "product_id": "550e8400-e29b-41d4-a716-446655440005",
      "product_name": "Cumi",
      "category_name": "Protein Laut",
      "similarity_score": 0.9654,
      "percentage": "96.54%",
      "reason": "Produk sejenis dari kategori yang sama"
    }
  ],
  "computation_time_ms": 12.45,
  "total_recommendations": 5,
  "timestamp": "2025-11-28T21:05:30.123456"
}
"""

# ===== 3. BUNDLE RECOMMENDATIONS =====
# POST /v1/recommendations/bundle
"""
curl -X POST http://localhost:8000/v1/recommendations/bundle \
  -H "Content-Type: application/json" \
  -d '{
    "product_ids": [
      "550e8400-e29b-41d4-a716-446655440001",
      "550e8400-e29b-41d4-a716-446655440002"
    ]
  }'

Query Parameter: ?top_k=8

Expected Response:
{
  "input_products": [
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440002"
  ],
  "bundle_recommendations": [
    {
      "product_id": "550e8400-e29b-41d4-a716-446655440005",
      "product_name": "Cumi",
      "category_name": "Protein Laut",
      "similarity_score": 0.9512,
      "percentage": "95.12%",
      "reason": "Produk sejenis dari kategori yang sama"
    }
  ],
  "computation_time_ms": 18.23,
  "total_recommendations": 8,
  "timestamp": "2025-11-28T21:06:15.234567"
}
"""

# ===== 4. TRENDING PRODUCTS =====
# GET /v1/recommendations/trending?category_id={UUID}&top_k=12
"""
# All categories
curl "http://localhost:8000/v1/recommendations/trending?top_k=12"

# Specific category
curl "http://localhost:8000/v1/recommendations/trending?category_id=660e8400-e29b-41d4-a716-446655440001&top_k=10"

Expected Response:
{
  "trending_products": [
    {
      "product_id": "550e8400-e29b-41d4-a716-446655440015",
      "product_name": "Telur ayam negeri",
      "category_name": "Protein Telur",
      "similarity_score": 1.0,
      "percentage": "100.00%",
      "reason": "Produk sangat mirip dengan karakteristik hampir identik"
    }
  ],
  "category_filter": "660e8400-e29b-41d4-a716-446655440001",
  "computation_time_ms": 8.12,
  "total_products": 10,
  "timestamp": "2025-11-28T21:07:20.345678"
}
"""

# ===== 5. CATEGORY TOP PRODUCTS =====
# GET /v1/recommendations/category/{category_id}?top_k=10
"""
curl "http://localhost:8000/v1/recommendations/category/660e8400-e29b-41d4-a716-446655440001?top_k=10"

Expected Response:
{
  "trending_products": [
    {
      "product_id": "550e8400-e29b-41d4-a716-446655440001",
      "product_name": "Udang sedang 1",
      "category_name": "Protein Laut",
      "similarity_score": 1.0,
      "percentage": "100.00%",
      "reason": "Produk sangat mirip dengan karakteristik hampir identik"
    }
  ],
  "category_filter": "660e8400-e29b-41d4-a716-446655440001",
  "computation_time_ms": 6.45,
  "total_products": 6,
  "timestamp": "2025-11-28T21:08:30.456789"
}
"""

# ===== POSTMAN COLLECTION =====
"""
Import JSON collection ke Postman:

{
  "info": {
    "name": "BaleTani AI Recommendation API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{BASE_URL}}/health",
          "host": ["{{BASE_URL}}"],
          "path": ["health"]
        }
      }
    },
    {
      "name": "Similar Products",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{BASE_URL}}/v1/recommendations/similar/{{PRODUCT_ID}}?top_k=10",
          "host": ["{{BASE_URL}}"],
          "path": ["v1", "recommendations", "similar", "{{PRODUCT_ID}}"],
          "query": [{"key": "top_k", "value": "10"}]
        }
      }
    },
    {
      "name": "Bundle Recommendations",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"product_ids\": [\n    \"{{PRODUCT_ID_1}}\",\n    \"{{PRODUCT_ID_2}}\"\n  ]\n}"
        },
        "url": {
          "raw": "{{BASE_URL}}/v1/recommendations/bundle?top_k=8",
          "host": ["{{BASE_URL}}"],
          "path": ["v1", "recommendations", "bundle"],
          "query": [{"key": "top_k", "value": "8"}]
        }
      }
    },
    {
      "name": "Trending Products",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{BASE_URL}}/v1/recommendations/trending?top_k=12",
          "host": ["{{BASE_URL}}"],
          "path": ["v1", "recommendations", "trending"],
          "query": [{"key": "top_k", "value": "12"}]
        }
      }
    },
    {
      "name": "Category Top Products",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{BASE_URL}}/v1/recommendations/category/{{CATEGORY_ID}}?top_k=10",
          "host": ["{{BASE_URL}}"],
          "path": ["v1", "recommendations", "category", "{{CATEGORY_ID}}"],
          "query": [{"key": "top_k", "value": "10"}]
        }
      }
    }
  ],
  "variable": [
    {"key": "BASE_URL", "value": "http://localhost:8000"},
    {"key": "PRODUCT_ID", "value": "550e8400-e29b-41d4-a716-446655440001"},
    {"key": "PRODUCT_ID_1", "value": "550e8400-e29b-41d4-a716-446655440001"},
    {"key": "PRODUCT_ID_2", "value": "550e8400-e29b-41d4-a716-446655440002"},
    {"key": "CATEGORY_ID", "value": "660e8400-e29b-41d4-a716-446655440001"}
  ]
}
"""

# ===== ERROR RESPONSES =====
"""
404 - Product Not Found:
{
  "detail": "Product {uuid} not found or no recommendations available"
}

500 - Internal Server Error:
{
  "detail": "Internal server error",
  "error": "Error message details"
}

503 - Service Unavailable:
{
  "detail": "Model not loaded"
}

422 - Validation Error:
{
  "detail": [
    {
      "loc": ["body", "product_ids", 0],
      "msg": "Invalid UUID format: abc123",
      "type": "value_error"
    }
  ]
}
"""

# ===== SWAGGER UI =====
"""
Access interactive API documentation:
http://localhost:8000/api/docs

Redoc documentation:
http://localhost:8000/api/redoc
"""

if __name__ == "__main__":
    print("📖 API Testing Guide untuk BaleTani AI Recommendation Service")
    print("\n🚀 Start server: python api/main.py")
    print("📚 Swagger Docs: http://localhost:8000/api/docs")
    print("\n✅ Use UUIDs from ml-recommendation-service/data/raw/products.csv")

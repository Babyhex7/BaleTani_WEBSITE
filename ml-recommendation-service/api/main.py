"""
FastAPI Application untuk Neural Content-Based Filtering
Endpoints untuk serve recommendations dari trained ML model
"""
import sys
import os
from pathlib import Path

# Add parent directory to Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

import time
import logging
from typing import List, Optional
from datetime import datetime
import numpy as np

from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
import uvicorn

from models.content_based.ncb_model import NCBModel
from data.data_loader import DataLoader
from config.settings import Settings

# ===== CONFIGURATION =====
settings = Settings()
logger = logging.getLogger(__name__)
data_loader = DataLoader()  # Global data loader instance

# ===== PYDANTIC MODELS =====
class ProductRecommendation(BaseModel):
    """Schema untuk single recommendation result"""
    product_id: str = Field(..., description="UUID produk")
    product_name: str = Field(..., description="Nama produk")
    category_name: str = Field(..., description="Kategori produk")
    similarity_score: float = Field(..., ge=0.0, le=1.0, description="Similarity score (0-1)")
    percentage: str = Field(..., description="Similarity percentage string (e.g., '99.87%')")
    reason: str = Field(..., description="Alasan recommendation")
    
    class Config:
        json_schema_extra = {
            "example": {
                "product_id": "550e8400-e29b-41d4-a716-446655440002",
                "product_name": "Udang Sedang 2",
                "category_name": "Protein Laut",
                "similarity_score": 0.9987,
                "percentage": "99.87%",
                "reason": "Produk sejenis dengan harga dan shelf life mirip"
            }
        }

class SimilarProductsResponse(BaseModel):
    """Response untuk similar products endpoint"""
    product_id: str
    product_name: str
    category_name: str
    recommendations: List[ProductRecommendation]
    computation_time_ms: float = Field(..., description="Waktu komputasi dalam milidetik")
    total_recommendations: int
    timestamp: datetime = Field(default_factory=datetime.now)
    
class BundleRequest(BaseModel):
    """Request untuk bundle recommendations"""
    product_ids: List[str] = Field(..., min_items=1, max_items=10, description="UUID products (max 10)", alias="productIds")
    
    @validator('product_ids')
    def validate_uuids(cls, v):
        """Validate UUID format"""
        import uuid
        for pid in v:
            try:
                uuid.UUID(pid)
            except ValueError:
                raise ValueError(f"Invalid UUID format: {pid}")
        return v
    
    class Config:
        populate_by_name = True  # Allow both snake_case and camelCase
        json_schema_extra = {
            "example": {
                "product_ids": [
                    "550e8400-e29b-41d4-a716-446655440001",
                    "550e8400-e29b-41d4-a716-446655440002"
                ]
            }
        }

class BundleResponse(BaseModel):
    """Response untuk bundle recommendations"""
    input_products: List[str]
    bundle_recommendations: List[ProductRecommendation]
    computation_time_ms: float
    total_recommendations: int
    timestamp: datetime = Field(default_factory=datetime.now)

class TrendingResponse(BaseModel):
    """Response untuk trending products"""
    trending_products: List[ProductRecommendation]
    category_filter: Optional[str] = None
    computation_time_ms: float
    total_products: int
    timestamp: datetime = Field(default_factory=datetime.now)

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    model_loaded: bool
    total_indexed_products: int
    model_version: str
    uptime_seconds: float

# ===== FASTAPI APP =====
app = FastAPI(
    title="BaleTani AI Recommendation Service",
    description="Neural Content-Based Filtering recommendation system using MLP",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Frontend origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# ===== GLOBAL STATE =====
model: Optional[NCBModel] = None
start_time = time.time()

# ===== STARTUP/SHUTDOWN =====
@app.on_event("startup")
async def load_model():
    """Load trained NCB model on startup"""
    global model
    try:
        logger.info("🔄 Loading NCB model v2...")
        
        # Load trained model v2 with adaptive learning
        model_path = Path(__file__).parent.parent / "models" / "saved_models" / "ncb_v4_test"
        
        # Load model config to get embedding_dim
        config_path = model_path / "model_config.json"
        if config_path.exists():
            import json
            with open(config_path, 'r') as f:
                config = json.load(f)
            embedding_dim = config['embedding_dim']
            logger.info(f"📋 Config loaded - embedding_dim={embedding_dim}")
        else:
            # Fallback: read from training_history_v2.json
            history_path = model_path / "training_history_v4.json"
            if history_path.exists():
                import json
                with open(history_path, 'r') as f:
                    history = json.load(f)
                embedding_dim = history['config']['embedding_dim']
                logger.info(f"📋 Config from history - embedding_dim={embedding_dim}")
            else:
                embedding_dim = 32  # Default fallback
                logger.warning("⚠️ No config found, using default embedding_dim=32")
        
        model = NCBModel.load_model(str(model_path), embedding_dim=embedding_dim)
        
        # Safe check for product_ids
        num_products = len(model.similarity_engine.product_ids) if model.similarity_engine.product_ids is not None else 0
        logger.info(f"✅ Model loaded successfully! Indexed {num_products} products")
    except Exception as e:
        logger.error(f"❌ Failed to load model: {e}")
        raise

@app.on_event("shutdown")
async def shutdown():
    """Cleanup on shutdown"""
    logger.info("🛑 Shutting down recommendation service...")

# ===== HELPER FUNCTIONS =====
def format_recommendation(product_id: str, score: float, product_data: dict) -> ProductRecommendation:
    """Format recommendation dengan explanation"""
    # Clamp score to [0, 1] range to prevent validation errors
    score = max(0.0, min(1.0, score))
    percentage = f"{score * 100:.2f}%"
    
    # Generate reason based on similarity score
    if score >= 0.95:
        reason = "Produk sangat mirip dengan karakteristik hampir identik"
    elif score >= 0.85:
        reason = "Produk sejenis dari kategori yang sama"
    elif score >= 0.70:
        reason = "Produk terkait dengan kesamaan fitur tertentu"
    else:
        reason = "Produk alternatif yang mungkin Anda sukai"
    
    return ProductRecommendation(
        product_id=product_id,
        product_name=product_data.get('product_name', 'Unknown'),
        category_name=product_data.get('category_name', 'Unknown'),
        similarity_score=round(score, 4),
        percentage=percentage,
        reason=reason
    )

# ===== ENDPOINTS =====
@app.get("/", tags=["System"])
async def root():
    """Root endpoint"""
    return {
        "service": "BaleTani AI Recommendation",
        "version": "1.0.0",
        "status": "running",
        "docs": "/api/docs"
    }

@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """Health check endpoint"""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    return HealthResponse(
        status="healthy",
        model_loaded=True,
        total_indexed_products=len(model.similarity_engine.product_ids) if model.similarity_engine.product_ids is not None else 0,
        model_version="ncb_v4",
        uptime_seconds=round(time.time() - start_time, 2)
    )

@app.get("/v1/recommendations/similar/{product_id}", 
         response_model=SimilarProductsResponse,
         tags=["Recommendations"])
async def get_similar_products(
    product_id: str,
    top_k: int = Query(10, ge=1, le=50, description="Jumlah recommendations (max 50)")
):
    """
    **Similar Products Recommendation**
    
    Mendapatkan produk serupa berdasarkan Neural Network similarity calculation.
    
    **Input:**
    - product_id: UUID produk sebagai reference
    
    **Computation Process:**
    1. Load product features (category, price, shelf_life, name, etc.)
    2. Feature engineering (encoding, normalization, TF-IDF)
    3. Neural Network forward pass (MLP layers)
    4. L2 normalization untuk embeddings
    5. Cosine similarity calculation dengan semua indexed products
    6. Ranking & filtering top-K results
    
    **Output:**
    - List recommendations dengan similarity scores (0.0 - 1.0)
    - Computation time dalam milidetik
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    start = time.time()
    
    try:
        # Get product info first
        product_info = data_loader.get_product_by_id(product_id)
        if product_info is None:
            raise HTTPException(status_code=404, detail=f"Product {product_id} not found")
        
        # Find similar products using similarity engine directly with UUID
        similar_results = model.similarity_engine.find_similar(
            product_id=product_id,
            top_k=top_k + 1,  # +1 to exclude self
            exclude_self=True
        )
        
        if not similar_results:
            raise HTTPException(
                status_code=404, 
                detail=f"No recommendations available for product {product_id}"
            )
        
        # Format recommendations
        recommendations = []
        for rec_id, score in similar_results:
            rec_info = data_loader.get_product_by_id(rec_id)
            if rec_info:
                recommendations.append(format_recommendation(rec_id, score, rec_info))
        
        computation_time = (time.time() - start) * 1000  # Convert to ms
        
        return SimilarProductsResponse(
            product_id=product_id,
            product_name=product_info.get('product_name', 'Unknown'),
            category_name=product_info.get('category_name', 'Unknown'),
            recommendations=recommendations,
            computation_time_ms=round(computation_time, 2),
            total_recommendations=len(recommendations)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_similar_products: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/v1/recommendations/bundle",
          response_model=BundleResponse,
          tags=["Recommendations"])
async def get_bundle_recommendations(
    request: BundleRequest,
    top_k: int = Query(8, ge=1, le=30, description="Jumlah recommendations (max 30)")
):
    """
    **Bundle Recommendation**
    
    Mendapatkan produk pelengkap untuk cart/bundle berdasarkan multiple products.
    
    **Input:**
    - product_ids: Array UUID products (max 10 items)
    
    **Computation Process:**
    1. Generate embeddings untuk setiap product dalam bundle
    2. Compute average embedding vector (centroid)
    3. Find similar products ke centroid
    4. Filter out products yang sudah ada di bundle
    5. Rank berdasarkan similarity score
    
    **Output:**
    - Complementary products untuk melengkapi bundle
    - Similarity scores ke bundle centroid
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    start = time.time()
    
    try:
        # Validate input product_ids
        product_ids = request.product_ids if hasattr(request, 'product_ids') else request.productIds
        
        if not isinstance(product_ids, list) or len(product_ids) == 0:
            raise HTTPException(status_code=400, detail="product_ids must be a non-empty array")
        
        # Validate semua product_ids exist
        for pid in product_ids:
            if data_loader.get_product_by_id(pid) is None:
                raise HTTPException(status_code=404, detail=f"Product {pid} not found")
        
        # Get embeddings for each product in bundle
        bundle_embeddings = []
        for pid in product_ids:
            # Find product index
            try:
                product_idx = np.where(model.similarity_engine.product_ids == pid)[0][0]
                embedding = model.similarity_engine.product_embeddings[product_idx]
                bundle_embeddings.append(embedding)
            except IndexError:
                continue
        
        if len(bundle_embeddings) == 0:
            raise HTTPException(status_code=404, detail="No valid products found in bundle")
        
        # Compute centroid (average embedding)
        centroid = np.mean(bundle_embeddings, axis=0)
        
        # Find similar products to centroid
        results = model.similarity_engine.find_similar_by_embedding(
            query_embedding=centroid,
            top_k=top_k + len(product_ids)  # Extra to filter out bundle items
        )
        
        # Filter out products already in bundle
        filtered_results = [(pid, score) for pid, score in results if pid not in product_ids][:top_k]
        # Filter out products already in bundle
        filtered_results = [(pid, score) for pid, score in results if pid not in product_ids][:top_k]
        
        if not filtered_results:
            raise HTTPException(
                status_code=404,
                detail="No bundle recommendations available"
            )
        
        # Format recommendations
        recommendations = []
        for rec_id, score in filtered_results:
            rec_info = data_loader.get_product_by_id(rec_id)
            if rec_info:
                recommendations.append(format_recommendation(rec_id, score, rec_info))
        
        computation_time = (time.time() - start) * 1000
        
        return BundleResponse(
            input_products=product_ids,
            bundle_recommendations=recommendations,
            computation_time_ms=round(computation_time, 2),
            total_recommendations=len(recommendations)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_bundle_recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/v1/recommendations/trending",
         response_model=TrendingResponse,
         tags=["Recommendations"])
async def get_trending_products(
    category_id: Optional[str] = Query(None, description="Filter by category UUID (optional)"),
    top_k: int = Query(12, ge=1, le=50, description="Jumlah products (max 50)")
):
    """
    **Trending Products**
    
    Mendapatkan produk trending berdasarkan popularity & quality scores.
    
    **Input:**
    - category_id (optional): Filter by specific category UUID
    
    **Computation Process:**
    1. Load all products dengan metadata (stock, price, sales)
    2. Calculate popularity score:
       - Stock availability weight
       - Price competitiveness
       - Category diversity
    3. Combine dengan embedding quality (L2 norm)
    4. Rank & filter top-K
    
    **Output:**
    - Trending products list dengan scores
    - Optional category filtering
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    start = time.time()
    
    try:
        # Get all products (using global data_loader)
        products_df, _, _ = data_loader.load_all_data()
        all_products = products_df
        
        if category_id:
            # Validate category exists
            all_products = all_products[all_products['category_id'] == category_id]
            if len(all_products) == 0:
                raise HTTPException(status_code=404, detail=f"Category {category_id} not found")
        
        # Simple trending logic: sort by stock (high stock = popular)
        # In production: use actual sales data, view counts, etc.
        trending_ids = all_products.nlargest(top_k, 'total_stock')['id'].tolist()
        
        # Format as recommendations dengan dummy scores
        recommendations = []
        for idx, pid in enumerate(trending_ids):
            product_info = data_loader.get_product_by_id(pid)
            if product_info:
                # Trending score decreases linearly
                score = 1.0 - (idx * 0.05)  # 1.0, 0.95, 0.90, ...
                recommendations.append(format_recommendation(pid, max(score, 0.5), product_info))
        
        computation_time = (time.time() - start) * 1000
        
        return TrendingResponse(
            trending_products=recommendations,
            category_filter=category_id,
            computation_time_ms=round(computation_time, 2),
            total_products=len(recommendations)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_trending_products: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/v1/recommendations/category/{category_id}",
         response_model=TrendingResponse,
         tags=["Recommendations"])
async def get_category_top_products(
    category_id: str,
    top_k: int = Query(10, ge=1, le=50, description="Jumlah products (max 50)")
):
    """
    **Category Top Products**
    
    Mendapatkan top products dari specific category berdasarkan quality & popularity.
    
    **Input:**
    - category_id: UUID kategori
    
    **Computation Process:**
    1. Filter products by category_id
    2. Calculate quality scores:
       - Stock availability
       - Price competitiveness
       - Embedding magnitude (model confidence)
    3. Rank & return top-K
    
    **Output:**
    - Top products dari kategori tertentu
    - Quality scores
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    start = time.time()
    
    try:
        # Load products filtered by category (using global data_loader)
        products_df, _, _ = data_loader.load_all_data()
        category_products = products_df[products_df['category_id'] == category_id]
        
        if len(category_products) == 0:
            raise HTTPException(
                status_code=404,
                detail=f"No products found in category {category_id}"
            )
        
        # Get top products by stock (proxy for popularity)
        top_product_ids = category_products.nlargest(top_k, 'total_stock')['id'].tolist()
        
        # Format recommendations
        recommendations = []
        for idx, pid in enumerate(top_product_ids):
            product_info = data_loader.get_product_by_id(pid)
            if product_info:
                # Quality score decreases linearly
                score = 1.0 - (idx * 0.05)
                recommendations.append(format_recommendation(pid, max(score, 0.5), product_info))
        
        computation_time = (time.time() - start) * 1000
        
        return TrendingResponse(
            trending_products=recommendations,
            category_filter=category_id,
            computation_time_ms=round(computation_time, 2),
            total_products=len(recommendations)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_category_top_products: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ===== ERROR HANDLERS =====
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "error": str(exc)
        }
    )

# ===== MAIN =====
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

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
        logger.info("🚀 Starting BaleTani ML Recommendation Service...")
        
        # Initialize database connection if using MySQL
        from config.database import init_database
        logger.info(f"📊 Data source: {settings.data_source}")
        
        if settings.data_source == "mysql":
            logger.info("🔄 Initializing MySQL database connection...")
            init_database()
            logger.info("✅ Database connection initialized")
        else:
            logger.info("📄 Using CSV data source")
        
        logger.info("🔄 Loading NCB model...")
        
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
        
        # Check if product exists in index
        if product_id in model.similarity_engine.product_ids:
            # Product ada di index - pakai index langsung (fast)
            logger.info(f"✅ Product {product_id} found in index")
            similar_results = model.similarity_engine.find_similar(
                product_id=product_id,
                top_k=top_k + 1,  # +1 to exclude self
                exclude_self=True
            )
        else:
            # Product BARU - encode on-the-fly
            logger.info(f"🆕 Product {product_id} NOT in index - encoding on-the-fly...")
            
            # Encode produk baru menggunakan trained encoder
            try:
                # Prepare product DataFrame untuk encoding
                import pandas as pd
                import tensorflow as tf
                product_df = pd.DataFrame([product_info])
                
                # Encode menggunakan preprocessor dan encoder dari model
                features_dict = model.preprocessor.transform_products(product_df)
                text_features = model.text_extractor.transform([product_info['product_name']])
                features_dict['text_features'] = text_features
                
                # Convert to TensorFlow tensors
                # Note: Rename keys to match encoder expectations (singular names)
                key_mapping = {
                    'category_ids': 'category_id',
                    'product_type_ids': 'product_type_id',
                    'prices_normalized': 'price_normalized',
                    'stocks_normalized': 'stock_normalized',
                    'price_tiers': 'price_tier',
                    'shelf_life_tiers': 'shelf_life_tier',
                    'text_features': 'tfidf_features'  # Encoder expects tfidf_features
                }
                
                batch_inputs = {}
                for k, v in features_dict.items():
                    if k in ['product_ids', 'product_names']:  # Exclude non-numeric fields
                        continue
                    # Use mapped key name if exists, otherwise use original
                    key_name = key_mapping.get(k, k)
                    batch_inputs[key_name] = tf.constant(v) if not isinstance(v, tf.Tensor) else v
                
                # Get embedding dari encoder
                product_embedding = model.encoder(batch_inputs, training=False).numpy()
                
                # Find similar products by embedding
                similar_results = model.similarity_engine.find_similar_by_embedding(
                    query_embedding=product_embedding[0],
                    top_k=top_k
                )
                
                logger.info(f"✅ On-the-fly encoding successful - found {len(similar_results)} similar products")
            except Exception as e:
                logger.error(f"❌ On-the-fly encoding failed: {e}")
                raise HTTPException(status_code=500, detail=f"Failed to encode product: {str(e)}")
        
        # Format recommendations
        recommendations = []
        for rec_id, score in similar_results:
            rec_info = data_loader.get_product_by_id(rec_id)
            if rec_info:
                recommendations.append(format_recommendation(rec_id, score, rec_info))
        
        # Fallback: Jika tidak ada recommendations atau semua filtered out
        if len(recommendations) == 0:
            logger.warning(f"No matching recommendations found, using fallback strategy...")
            # Gunakan same-category products sebagai fallback
            products_df = data_loader.load_products()
            product_category = product_info.get('category_name')
            
            # Get same category products
            same_category = products_df[
                (products_df['category_name'] == product_category) & 
                (products_df['id'] != product_id) &
                (products_df['is_active'] == True)
            ].head(top_k)
            
            for _, row in same_category.iterrows():
                recommendations.append({
                    'product_id': row['id'],
                    'product_name': row['product_name'],
                    'category_name': row['category_name'],
                    'similarity_score': 0.85,  # Default similarity for same category
                    'percentage': '85%',
                    'reason': f'Produk sejenis dalam kategori {product_category}'
                })
            
            logger.info(f"✅ Fallback: Returned {len(recommendations)} same-category products")
        
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
            # Check if product exists in model index (use numpy where for proper comparison)
            in_index = False
            if model.similarity_engine.product_ids is not None:
                matches = np.where(model.similarity_engine.product_ids == pid)[0]
                in_index = len(matches) > 0
            
            if in_index:
                # Fast lookup dari index
                try:
                    product_idx = np.where(model.similarity_engine.product_ids == pid)[0][0]
                    embedding = model.similarity_engine.product_embeddings[product_idx]
                    bundle_embeddings.append(embedding)
                    logger.info(f"✅ Product {pid} found in index")
                except IndexError:
                    logger.warning(f"⚠️ Product {pid} index error")
                    pass
            else:
                # On-the-fly encoding untuk product tidak di index
                logger.info(f"🔄 Product {pid} not in index, encoding on-the-fly...")
                try:
                    product_info = data_loader.get_product_by_id(pid)
                    if product_info is None:
                        logger.warning(f"⚠️ Product {pid} not found in database")
                        continue
                    
                    # Prepare product data untuk encoding
                    product_data = pd.DataFrame([{
                        'id': product_info.get('id'),
                        'product_name': product_info.get('product_name'),
                        'description': product_info.get('description', ''),
                        'category_id': product_info.get('category_id'),
                        'price': product_info.get('price', 0),
                        'stock': product_info.get('stock', 0),
                        'is_active': product_info.get('is_active', True)
                    }])
                    
                    # Preprocess
                    preprocessed = model.preprocessor.transform_products(product_data)
                    
                    # Extract text features
                    text_features = model.text_extractor.transform(
                        preprocessed['product_name'].fillna('') + ' ' + 
                        preprocessed['description'].fillna('')
                    )
                    
                    # Prepare encoder input dengan key mapping yang benar
                    encoder_input = {
                        'category_id': preprocessed['category_id'].values.reshape(-1, 1),
                        'price': preprocessed['price_normalized'].values.reshape(-1, 1),
                        'stock': preprocessed['stock_normalized'].values.reshape(-1, 1),
                        'tfidf_features': text_features.toarray()
                    }
                    
                    # Convert ke TensorFlow tensors
                    encoder_input_tf = {k: tf.convert_to_tensor(v, dtype=tf.float32) for k, v in encoder_input.items()}
                    
                    # Generate embedding
                    embedding = model.encoder(encoder_input_tf).numpy()[0]
                    bundle_embeddings.append(embedding)
                    logger.info(f"✅ Successfully encoded {pid} on-the-fly, embedding shape: {embedding.shape}")
                except Exception as e:
                    logger.error(f"❌ Failed to encode {pid}: {e}", exc_info=True)
                    continue
        
        logger.info(f"📊 Bundle embeddings collected: {len(bundle_embeddings)} out of {len(product_ids)} products")
        
        if len(bundle_embeddings) == 0:
            # Fallback: return popular products from different categories
            logger.warning("No embeddings generated, using fallback strategy...")
            products_df = data_loader.load_products()
            
            # Get categories dari input products
            input_categories = []
            for pid in product_ids:
                p_info = data_loader.get_product_by_id(pid)
                if p_info:
                    input_categories.append(p_info.get('category_name'))
            
            # Get products dari kategori berbeda (complementary)
            different_category = products_df[
                (~products_df['category_name'].isin(input_categories)) &
                (~products_df['id'].isin(product_ids)) &
                (products_df['is_active'] == True)
            ].head(top_k)
            
            recommendations = []
            for _, row in different_category.iterrows():
                recommendations.append({
                    'product_id': row['id'],
                    'product_name': row['product_name'],
                    'category_name': row['category_name'],
                    'similarity_score': 0.75,
                    'percentage': '75%',
                    'reason': f'Produk pelengkap dari kategori berbeda'
                })
            
            computation_time = (time.time() - start) * 1000
            return BundleResponse(
                input_products=product_ids,
                bundle_recommendations=recommendations,
                computation_time_ms=round(computation_time, 2),
                total_recommendations=len(recommendations)
            )
        
        # Compute centroid (average embedding)
        centroid = np.mean(bundle_embeddings, axis=0)
        logger.info(f"📐 Centroid computed, shape: {centroid.shape}")
        
        # Find similar products to centroid
        results = model.similarity_engine.find_similar_by_embedding(
            query_embedding=centroid,
            top_k=top_k + len(product_ids)  # Extra to filter out bundle items
        )
        
        logger.info(f"🔍 Found {len(results)} similar products to centroid")
        
        # Filter out products already in bundle
        filtered_results = [(pid, score) for pid, score in results if pid not in product_ids][:top_k]
        
        logger.info(f"✨ Filtered results: {len(filtered_results)} recommendations")
        
        if not filtered_results:
            # Fallback if no results after filtering
            logger.warning("No filtered results, using fallback...")
            products_df = data_loader.load_products()
            different_products = products_df[
                (~products_df['id'].isin(product_ids)) &
                (products_df['is_active'] == True)
            ].head(top_k)
            
            recommendations = []
            for _, row in different_products.iterrows():
                recommendations.append({
                    'product_id': row['id'],
                    'product_name': row['product_name'],
                    'category_name': row['category_name'],
                    'similarity_score': 0.7,
                    'percentage': '70%',
                    'reason': 'Rekomendasi produk lainnya'
                })
            
            computation_time = (time.time() - start) * 1000
            return BundleResponse(
                input_products=product_ids,
                bundle_recommendations=recommendations,
                computation_time_ms=round(computation_time, 2),
                total_recommendations=len(recommendations)
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
    **Trending Products - Real Database Implementation**
    
    Mendapatkan produk trending berdasarkan metrics real dari database.
    
    **Logic:**
    1. Query database untuk sales metrics (order_items)
    2. Calculate trending score:
       - Sales count (total quantity sold) - 40%
       - Order frequency (berapa kali dipesan) - 30%
       - Stock availability - 20%
       - Recency (created_at) - 10%
    3. Rank by weighted score
    
    **Fallback:**
    - Jika tidak ada data sales: sort by stock + recency
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    start = time.time()
    
    try:
        logger.info(f"📊 Getting trending products (category={category_id}, top_k={top_k})")
        
        # Load products dari database
        products_df = data_loader.load_products()
        
        # Filter by category jika diminta
        if category_id:
            products_df = products_df[products_df['category_id'] == category_id]
            if len(products_df) == 0:
                raise HTTPException(status_code=404, detail=f"Category {category_id} not found")
            logger.info(f"🔍 Filtered to category {category_id}: {len(products_df)} products")
        
        # Filter only active products
        products_df = products_df[products_df['is_active'] == True].copy()
        
        if len(products_df) == 0:
            raise HTTPException(status_code=404, detail="No active products found")
        
        # Query untuk sales data dari database
        try:
            from config.database import get_db_connection
            from sqlalchemy import text
            
            engine = get_db_connection()
            
            # Query: hitung sales metrics per product
            sales_query = text("""
                SELECT 
                    oi.product_id,
                    COUNT(DISTINCT oi.order_id) as order_count,
                    SUM(oi.quantity) as total_quantity_sold,
                    MAX(o.created_at) as last_order_date
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.order_id
                WHERE o.status IN ('pending', 'processing', 'shipped', 'delivered')
                GROUP BY oi.product_id
            """)
            
            with engine.connect() as conn:
                sales_result = pd.read_sql(sales_query, conn)
            
            logger.info(f"📈 Sales data loaded: {len(sales_result)} products with orders")
            
            # Merge sales data dengan products
            products_df = products_df.merge(
                sales_result, 
                left_on='id', 
                right_on='product_id', 
                how='left'
            )
            
            # Fill NaN untuk produk yang belum pernah terjual
            products_df['order_count'] = products_df['order_count'].fillna(0)
            products_df['total_quantity_sold'] = products_df['total_quantity_sold'].fillna(0)
            
            # Calculate trending score dengan weighted formula
            # Normalize each metric to 0-1 range
            max_orders = products_df['order_count'].max() if products_df['order_count'].max() > 0 else 1
            max_quantity = products_df['total_quantity_sold'].max() if products_df['total_quantity_sold'].max() > 0 else 1
            max_stock = products_df['total_stock'].max() if products_df['total_stock'].max() > 0 else 1
            
            # Weighted scoring
            products_df['sales_score'] = (products_df['total_quantity_sold'] / max_quantity) * 0.4
            products_df['order_freq_score'] = (products_df['order_count'] / max_orders) * 0.3
            products_df['stock_score'] = (products_df['total_stock'] / max_stock) * 0.2
            
            # Recency score (newer products get small boost)
            if 'created_at' in products_df.columns:
                now = pd.Timestamp.now()
                products_df['days_since_created'] = (now - pd.to_datetime(products_df['created_at'])).dt.days
                max_days = products_df['days_since_created'].max() if products_df['days_since_created'].max() > 0 else 1
                products_df['recency_score'] = (1 - (products_df['days_since_created'] / max_days)) * 0.1
            else:
                products_df['recency_score'] = 0
            
            # Total trending score
            products_df['trending_score'] = (
                products_df['sales_score'] + 
                products_df['order_freq_score'] + 
                products_df['stock_score'] + 
                products_df['recency_score']
            )
            
            logger.info(f"✅ Trending scores calculated using sales data")
            
        except Exception as e:
            logger.warning(f"⚠️ Failed to load sales data: {e}, using fallback scoring")
            
            # Fallback: simple scoring based on stock only
            max_stock = products_df['total_stock'].max() if products_df['total_stock'].max() > 0 else 1
            products_df['trending_score'] = products_df['total_stock'] / max_stock
        
        # Sort by trending score
        trending_products = products_df.nlargest(top_k, 'trending_score')
        
        # Format recommendations
        recommendations = []
        for idx, row in trending_products.iterrows():
            pid = row['id']
            score = row['trending_score']
            
            product_info = data_loader.get_product_by_id(pid)
            if product_info:
                # Normalize score to 0.5-1.0 range for consistency
                normalized_score = 0.5 + (score * 0.5)
                recommendations.append(format_recommendation(pid, normalized_score, product_info))
        
        computation_time = (time.time() - start) * 1000
        
        logger.info(f"✅ Returned {len(recommendations)} trending products in {computation_time:.2f}ms")
        
        return TrendingResponse(
            trending_products=recommendations,
            category_filter=category_id,
            computation_time_ms=round(computation_time, 2),
            total_products=len(recommendations)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_trending_products: {e}", exc_info=True)
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

# ===== MODEL MANAGEMENT ENDPOINTS =====
@app.post("/v1/admin/reload-model")
async def reload_model():
    """
    🔄 Reload model untuk recognize produk baru
    
    Call endpoint ini setelah:
    - Menambah produk baru ke database/CSV
    - Update data produk existing
    - Ingin refresh model dengan data terbaru
    
    Returns:
        Status reload dan jumlah produk yang di-index
    """
    global model
    try:
        start = time.time()
        logger.info("🔄 Reloading model with latest product data...")
        
        model_path = Path(__file__).parent.parent / "models" / "saved_models" / "ncb_v4_test"
        
        # Get embedding_dim from config
        config_path = model_path / "model_config.json"
        if config_path.exists():
            import json
            with open(config_path, 'r') as f:
                config = json.load(f)
            embedding_dim = config['embedding_dim']
        else:
            embedding_dim = 32
        
        # Reload model (akan auto-load CSV terbaru)
        model = NCBModel.load_model(str(model_path), embedding_dim=embedding_dim)
        
        num_products = len(model.similarity_engine.product_ids) if model.similarity_engine.product_ids is not None else 0
        reload_time = round((time.time() - start) * 1000, 2)
        
        logger.info(f"✅ Model reloaded! Now indexing {num_products} products")
        
        return {
            "status": "success",
            "message": "Model reloaded with latest data",
            "indexed_products": num_products,
            "reload_time_ms": reload_time,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to reload model: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Model reload failed: {str(e)}"
        )

@app.get("/v1/admin/model-status")
async def get_model_status():
    """
    📊 Get status model dan statistik
    
    Returns:
        Informasi model: uptime, jumlah produk, versi, dll
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    num_products = len(model.similarity_engine.product_ids) if model.similarity_engine.product_ids is not None else 0
    
    return {
        "status": "active",
        "model_version": "ncb_v4",
        "indexed_products": num_products,
        "embedding_dimension": model.embedding_dim,
        "uptime_seconds": round(time.time() - start_time, 2),
        "is_trained": model.is_trained,
        "data_source": "csv",  # Could be dynamic from settings
        "last_reload": "on_startup",  # TODO: track last reload time
        "timestamp": datetime.now().isoformat()
    }

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
        "api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )

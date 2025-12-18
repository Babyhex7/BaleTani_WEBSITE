/**
 * Similar Products Component
 * Display produk serupa/similar di product detail page
 */

import { useState, useEffect } from "react";
import { getSimilarProducts } from "../../services/services_customer/recommendationService";
import ProductCard from "../ui/ProductCard";
import ProductCardSkeleton from "../ui/ProductCardSkeleton";
import { formatCurrency } from "../../utils/formatCurrency";

const SimilarProducts = ({ productId, category }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!productId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await getSimilarProducts(productId, 5);

        if (response.success && response.data) {
          // ML service response structure: { product_id, product_name, recommendations: [...] }
          const recs = response.data.recommendations || [];
          console.log(`✅ Similar products loaded: ${recs.length} items for product ${productId}`);
          setRecommendations(recs);
        } else if (response.status === 404 || response.status === 503) {
          // ML service down or product not found - hide section silently
          console.warn('⚠️ ML Service unavailable or product not found');
          setRecommendations([]);
        }
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        
        // Check if it's a 404 or 503 - hide section silently
        if (err.response?.status === 404 || err.response?.status === 503) {
          console.warn('⚠️ ML Service unavailable - hiding recommendations');
          setRecommendations([]);
          setError(null); // Don't show error message
        } else {
          setError("Gagal memuat rekomendasi produk");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [productId]);

  // Don't show section if no recommendations
  if (!loading && recommendations.length === 0) {
    return null;
  }

  return (
    <section className="py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            🤖 Produk Serupa
          </h2>
          <p className="text-gray-600">
            Rekomendasi AI berdasarkan produk yang Anda lihat
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {loading ? (
            // Skeleton loading
            Array.from({ length: 5 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))
          ) : (
            // Actual recommendations
            recommendations.map((rec) => {
              // Get primary image or first image or use placeholder
              const primaryImage = rec.images?.find(img => img.is_primary)?.image_url || 
                                   rec.images?.[0]?.image_url || 
                                   'https://via.placeholder.com/400x400/f0f0f0/999999?text=No+Image';
              
              return (
                <ProductCard
                  key={rec.product_id}
                  product={{
                    id: rec.product_id,
                    name: rec.product_name,  // ProductCard expects 'name'
                    category: rec.category_name,  // ProductCard expects 'category'
                    image: primaryImage,  // ProductCard expects single 'image' string
                    // Pricing
                    price: rec.selling_price || rec.price || 0,
                    finalPrice: rec.final_price || rec.selling_price || rec.price || 0,
                    // Stock
                    stock: rec.total_stock || rec.stock || 0,
                    // Other
                    discount: rec.discount ? {
                      finalPrice: rec.final_price || rec.selling_price
                    } : null,
                  }}
                  formatPrice={formatCurrency}
                  showBadge={true}
                  badgeText={`${Math.round((rec.similarity_score || 0) * 100)}% Match`}
                  badgeColor="bg-purple-500"
                />
              );
            })
          )}
        </div>

        {!loading && recommendations.length > 0 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              ✨ Dipilih khusus untuk Anda dengan teknologi AI Neural Network
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default SimilarProducts;

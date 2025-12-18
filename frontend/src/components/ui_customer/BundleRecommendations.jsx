/**
 * Bundle Recommendations Component
 * Display rekomendasi produk untuk bundle/paket di cart page
 */

import { useState, useEffect } from "react";
import { getBundleRecommendations } from "../../services/services_customer/recommendationService";
import ProductCard from "../ui/ProductCard";
import ProductCardSkeleton from "../ui/ProductCardSkeleton";
import { formatCurrency } from "../../utils/formatCurrency";

const BundleRecommendations = ({ cartProducts }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!cartProducts || cartProducts.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Extract product IDs from cart
        const productIds = cartProducts.map((item) => item.id || item.product_id);

        const response = await getBundleRecommendations(productIds, 5);

        if (response.success && response.data) {
          // Backend might return either 'recommendations' or 'bundle_recommendations'
          const recs = response.data.recommendations || response.data.bundle_recommendations || [];
          console.log(`✅ Bundle recommendations loaded: ${recs.length} items for ${productIds.length} cart products`);
          setRecommendations(recs);
        } else if (response.status === 503) {
          // ML service down - hide section silently
          console.warn('⚠️ ML Service unavailable');
          setRecommendations([]);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching bundle recommendations:", err);
        
        // Check if it's 503 (ML service down) - hide silently
        if (err.response?.status === 503) {
          console.warn('⚠️ ML Service unavailable - hiding bundle recommendations');
          setRecommendations([]);
          setError(null); // Don't show error
        } else {
          setError("Gagal memuat rekomendasi bundling");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [cartProducts]);

  // Don't show section if no recommendations
  if (!loading && recommendations.length === 0) {
    return null;
  }

  return (
    <section className="py-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg mt-6">
      <div className="px-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            🎁 Lengkapi Belanjaan Anda
          </h3>
          <p className="text-gray-600">
            Produk yang cocok dibeli bersamaan dengan keranjang Anda
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
                  badgeText="Recommended"
                  badgeColor="bg-gradient-to-r from-green-500 to-blue-500"
                />
              );
            })
          )}
        </div>

        {!loading && recommendations.length > 0 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              🧠 Rekomendasi cerdas berdasarkan pola pembelian pelanggan lain
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default BundleRecommendations;

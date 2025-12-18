/**
 * Bundle Recommendations Component
 * Display rekomendasi produk untuk bundle/paket di cart page
 */

import { useState, useEffect } from "react";
import { getBundleRecommendations } from "../../services/services_customer/recommendationService";
import ProductCard from "../ui/ProductCard";
import ProductCardSkeleton from "../ui/ProductCardSkeleton";

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

        console.log('🛒 Cart items:', cartProducts);
        console.log('🛒 Fetching bundle recommendations for cart:', productIds);
        const response = await getBundleRecommendations(productIds, 5);

        console.log('📦 Bundle Response:', response);

        if (response.success && response.data) {
          setRecommendations(response.data.recommendations || []);
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
              console.log('🎁 Bundle recommendation item:', rec);
              return (
                <ProductCard
                  key={rec.product_id}
                  product={{
                    id: rec.product_id,
                    product_name: rec.product_name,
                    category_name: rec.category_name,
                    // Map sesuai response dari ML service yang di-enrich backend
                    price: rec.price || rec.selling_price || 0,
                    selling_price: rec.price || rec.selling_price || 0,
                    finalPrice: rec.final_price || rec.price || rec.selling_price || 0,
                    quantity_info: rec.quantity_info || "1 unit",
                    stock: rec.stock || rec.total_stock || 0,
                    total_stock: rec.stock || rec.total_stock || 0,
                    // Images handling
                    images: rec.images || (rec.ProductImages ? rec.ProductImages.map((img) => ({
                      image_url: img.image_url,
                      is_primary: img.is_primary,
                    })) : []),
                    // Pass through other fields
                    discount: rec.discount,
                    is_active: rec.is_active !== false,
                  }}
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

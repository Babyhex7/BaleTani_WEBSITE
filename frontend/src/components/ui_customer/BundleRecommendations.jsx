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
        const productIds = cartProducts.map((item) => item.product_id || item.id);

        const response = await getBundleRecommendations(productIds, 5);

        if (response.success && response.data) {
          setRecommendations(response.data.recommendations || []);
        }
      } catch (err) {
        console.error("Error fetching bundle recommendations:", err);
        setError("Gagal memuat rekomendasi bundling");
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
            recommendations.map((product) => (
              <ProductCard
                key={product.product_id}
                product={{
                  id: product.product_id,
                  product_name: product.product_name,
                  category_name: product.category_name,
                  selling_price: product.selling_price || 0,
                  quantity_info: product.quantity_info || "1 unit",
                  total_stock: product.total_stock || 0,
                  images:
                    product.images ||
                    (product.ProductImages &&
                      product.ProductImages.map((img) => ({
                        image_url: img.image_url,
                        is_primary: img.is_primary,
                      }))),
                }}
                showBadge={true}
                badgeText="Recommended"
                badgeColor="bg-gradient-to-r from-green-500 to-blue-500"
              />
            ))
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

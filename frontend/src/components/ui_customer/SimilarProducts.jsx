/**
 * Similar Products Component
 * Display produk serupa/similar di product detail page
 */

import { useState, useEffect } from "react";
import { getSimilarProducts } from "../../services/services_customer/recommendationService";
import ProductCard from "../ui/ProductCard";
import ProductCardSkeleton from "../ui/ProductCardSkeleton";

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
          setRecommendations(response.data.recommendations || []);
        }
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setError("Gagal memuat rekomendasi produk");
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
                badgeText={`${Math.round(product.similarity_score * 100)}% Match`}
                badgeColor="bg-purple-500"
              />
            ))
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

/**
 * Trending Products Component
 * Display produk trending/populer di homepage
 */

import { useState, useEffect } from "react";
import { getTrendingProducts } from "../../services/services_customer/recommendationService";
import ProductCard from "../ui/ProductCard";
import ProductCardSkeleton from "../ui/ProductCardSkeleton";

const TrendingProducts = ({ limit = 10 }) => {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getTrendingProducts(limit);

        if (response.success && response.data) {
          setTrendingProducts(response.data.trending_products || []);
        }
      } catch (err) {
        console.error("Error fetching trending products:", err);
        setError("Gagal memuat produk trending");
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, [limit]);

  // Don't show section if error or no products
  if (error || (!loading && trendingProducts.length === 0)) {
    return null;
  }

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            <span>🔥</span>
            <span>Produk Trending</span>
          </h2>
          <p className="text-gray-600">
            Produk paling banyak dibeli dan disukai pelanggan kami
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {loading ? (
            // Skeleton loading
            Array.from({ length: limit }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))
          ) : (
            // Actual trending products
            trendingProducts.map((product, index) => (
              <div key={product.product_id} className="relative">
                {/* Ranking badge */}
                {index < 3 && (
                  <div className="absolute -top-2 -left-2 z-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-lg">
                    {index + 1}
                  </div>
                )}

                <ProductCard
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
                  badgeText={`${product.order_count || 0} terjual`}
                  badgeColor="bg-red-500"
                />
              </div>
            ))
          )}
        </div>

        {!loading && trendingProducts.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              📊 Data real-time dari sistem kami • Diperbarui setiap jam
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default TrendingProducts;

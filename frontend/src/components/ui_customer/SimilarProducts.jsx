/**
 * Similar Products Component
 * Display produk serupa/similar di product detail page
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSimilarProducts } from "../../services/services_customer/recommendationService";
import ProductImage from "../ui/ProductImage";
import ProductPrice from "../ui/ProductPrice";
import AddToCartButton from "../ui/AddToCartButton";
import ProductCardSkeleton from "../ui/ProductCardSkeleton";
import useAddToCart from "../../hooks/hook_customer/useAddToCart";
import { formatCurrency } from "../../utils/formatCurrency";
import { getImageUrl } from "../../utils/imageUtils";
import { calculateDiscount, getCategoryName } from "../../utils/productUtils";
import LoginModal from "../ui/LoginModal";

const SimilarProducts = ({ productId, category }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { handleAddToCart, showLoginModal, setShowLoginModal, isProcessing } = useAddToCart();

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
          <h2 className="text-2xl font-bold text-gray-800">
            Produk Serupa
          </h2>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading ? (
            // Skeleton loading
            Array.from({ length: 5 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))
          ) : (
            // Actual recommendations
            recommendations.map((rec) => {
              // Get image_url string from images array
              // Backend mengirim images array dengan struktur: [{ id, image_url, is_primary }]
              let primaryImageUrl = null;
              
              if (rec.images && Array.isArray(rec.images) && rec.images.length > 0) {
                // Find primary image
                const primaryImg = rec.images.find(img => img.is_primary);
                primaryImageUrl = primaryImg?.image_url || rec.images[0]?.image_url;
              } else if (rec.image_url) {
                // Fallback to direct image_url if exists
                primaryImageUrl = rec.image_url;
              }
              
              // Prepare product for discount calculation
              const product = {
                id: rec.product_id,
                name: rec.product_name,
                category: rec.category_name,
                image: primaryImageUrl, // Use extracted image URL string
                price: rec.selling_price || rec.price || 0,
                stock: rec.total_stock || rec.stock || 0,
                discount: rec.discount ? {
                  finalPrice: rec.final_price || rec.selling_price
                } : null,
              };

              const { hasDiscount, discountPercentage, finalPrice, originalPrice } = calculateDiscount(product);
              const categoryName = getCategoryName(product.category);
              const matchPercentage = Math.round((rec.similarity_score || 0) * 100);
              
              return (
                <div
                  key={rec.product_id}
                  className="group bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer flex flex-col"
                  onClick={() => navigate(`/products/${rec.product_id}`)}
                >
                  {/* Product Image */}
                  <div className="relative">
                    <ProductImage
                      src={primaryImageUrl}
                      alt={rec.product_name}
                      discountPercentage={hasDiscount ? discountPercentage : 0}
                      category={categoryName}
                      showBadges={true}
                    />
                    
                    {/* Out of stock overlay */}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black bg-opacity-60 rounded-t-lg z-10"></div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-3 flex-1 flex flex-col">
                    {/* Product Name */}
                    <h3 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2 min-h-[40px]">
                      {rec.product_name}
                    </h3>

                    {/* Price */}
                    <div className="min-h-[52px] flex flex-col justify-start mb-2">
                      <ProductPrice
                        finalPrice={finalPrice}
                        originalPrice={originalPrice}
                        hasDiscount={hasDiscount}
                        formatPrice={formatCurrency}
                        size="sm"
                      />
                    </div>

                    {/* Add to Cart Button */}
                    <div className="mt-auto">
                      <AddToCartButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product, 1)(e);
                        }}
                        stock={product.stock}
                        loading={isProcessing}
                        size="sm"
                        variant="primary"
                        fullWidth={true}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Login Modal */}
        <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)} 
        />
      </div>
    </section>
  );
};

export default SimilarProducts;

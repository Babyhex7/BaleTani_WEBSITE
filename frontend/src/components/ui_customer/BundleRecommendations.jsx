/**
 * Bundle Recommendations Component
 * Display rekomendasi produk untuk bundle/paket di cart page
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBundleRecommendations } from "../../services/services_customer/recommendationService";
import ProductImage from "../ui/ProductImage";
import ProductPrice from "../ui/ProductPrice";
import AddToCartButton from "../ui/AddToCartButton";
import ProductCardSkeleton from "../ui/ProductCardSkeleton";
import useAddToCart from "../../hooks/hook_customer/useAddToCart";
import { formatCurrency } from "../../utils/formatCurrency";
import { getImageUrl } from "../../utils/imageUtils";
import { calculateDiscount, getCategoryName } from "../../utils/productUtils";
import LoginModal from "../ui/LoginModal";

const BundleRecommendations = ({ cartProducts }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { handleAddToCart, showLoginModal, setShowLoginModal, isProcessing } = useAddToCart();

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
          
          // Debug: Log full response untuk analisis
          console.log('📦 [BUNDLE] Full API Response:', JSON.stringify(response.data, null, 2));
          
          // Debug: Log setiap recommendation detail
          recs.forEach((rec, idx) => {
            console.log(`🔍 [BUNDLE] Recommendation ${idx + 1}:`, {
              product_id: rec.product_id,
              product_name: rec.product_name,
              has_images: !!rec.images,
              images_count: rec.images?.length || 0,
              images_detail: rec.images?.map(img => ({
                id: img.id,
                url: img.image_url,
                is_primary: img.is_primary
              })),
              has_direct_image_url: !!rec.image_url,
              direct_image_url: rec.image_url
            });
          });
          
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
          <h3 className="text-xl font-bold text-gray-800">
            Lengkapi Belanjaan Anda
          </h3>
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
                
                console.log(`🖼️ [BUNDLE RENDER] ${rec.product_name}:`, {
                  has_images: true,
                  images_count: rec.images.length,
                  primary_found: !!primaryImg,
                  selected_url: primaryImageUrl
                });
              } else if (rec.image_url) {
                // Fallback to direct image_url if exists
                primaryImageUrl = rec.image_url;
                console.log(`🖼️ [BUNDLE RENDER] ${rec.product_name}: Using direct image_url:`, primaryImageUrl);
              } else {
                console.warn(`⚠️ [BUNDLE RENDER] ${rec.product_name}: NO IMAGE DATA!`, {
                  has_images_array: !!rec.images,
                  images_is_array: Array.isArray(rec.images),
                  images_length: rec.images?.length,
                  has_image_url: !!rec.image_url,
                  full_rec: rec
                });
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

export default BundleRecommendations;

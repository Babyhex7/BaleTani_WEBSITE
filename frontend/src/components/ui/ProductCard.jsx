import { ShoppingCart, Tag, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Button from './Button';
import LoginModal from './LoginModal';
import useAuthStore from '../../store/store_customer/useAuthStore';
import useCartStore from '../../store/store_customer/useCartStore';

const ProductCard = ({ 
  product, 
  formatPrice,
  className = '',
  showToast // Toast function from parent
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const addItem = useCartStore((state) => state.addItem);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Calculate discount display
  const hasDiscount = product.discount && product.discount.finalPrice < product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.price - product.discount.finalPrice) / product.price) * 100)
    : 0;
  
  const finalPrice = hasDiscount ? product.discount.finalPrice : product.price;

  // Handle add to cart with auth check
  const handleAddToCart = (e) => {
    e.stopPropagation(); // Prevent card click

    // Check authentication - show modal instead of redirect
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    // Check stock
    if (product.stock === 0) {
      if (showToast) {
        showToast('Maaf, produk ini sedang habis stok', 'error');
      }
      return;
    }

    // Add to cart
    addItem(product, 1);
    if (showToast) {
      showToast(`${product.name} berhasil ditambahkan ke keranjang!`, 'success');
    } else {
      alert(`${product.name} berhasil ditambahkan ke keranjang!`);
    }
  };

  // Navigate to product detail
  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  // Get correct image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/300x300?text=No+Image';
    
    // If already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // If relative path, prepend backend URL
    const backendUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${backendUrl}/${imagePath}`;
  };
  
  return (
    <div 
      onClick={handleCardClick}
      className={`group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-300 cursor-pointer ${className}`}
    >
      {/* Product Image */}
      <div className="relative overflow-hidden bg-gray-100">
        <img 
          src={getImageUrl(product.image)} 
          alt={product.name}
          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
          }}
        />
        
        {/* Discount Badge - Kanan Atas */}
        {hasDiscount && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse z-10">
            -{discountPercentage}%
          </div>
        )}
        
        {/* Category Badge - Kiri Atas (sejajar dengan diskon) */}
        {product.category && (
          <div className="absolute top-3 left-3 bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md max-w-[50%] truncate">
            {typeof product.category === 'string' ? product.category : product.category.name}
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="p-5 space-y-3">
        {/* Product Name */}
        <div>
          <h3 className="font-bold text-lg text-gray-900 group-hover:text-green-600 transition-colors duration-300 line-clamp-2">
            {product.name}
          </h3>
        </div>

        {/* Description - With Icon & Highlight */}
        {product.description && (
          <div className="flex items-start gap-2">
            <FileText size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>
        )}
        
        {/* Price Section - Responsive Layout */}
        <div>
          {/* Current Price */}
          <div className="mb-2">
            <span className="text-2xl font-bold text-green-600">
              {formatPrice(finalPrice)}
            </span>
          </div>
          
          {/* Original Price (if discount) - Below */}
          {hasDiscount && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base text-gray-400 line-through">
                {formatPrice(product.price)}
              </span>
              <span className="text-xs text-red-600 font-semibold bg-red-50 px-2 py-1 rounded">
                Hemat {formatPrice(product.price - finalPrice)}
              </span>
            </div>
          )}
        </div>
        
        {/* Action Button - Tambah ke Keranjang */}
        <div className="pt-2">
          <Button 
            size="md"
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="mr-2" size={16} />
            {product.stock === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
          </Button>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
};

export default ProductCard;
import { ShoppingCart, Tag } from 'lucide-react';
import Button from './Button';

const ProductCard = ({ 
  product, 
  onAddToCart, 
  formatPrice,
  className = '' 
}) => {
  // Calculate discount display
  const hasDiscount = product.discount && product.discount.finalPrice < product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.price - product.discount.finalPrice) / product.price) * 100)
    : 0;
  
  const finalPrice = hasDiscount ? product.discount.finalPrice : product.price;
  
  return (
    <div className={`group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-300 ${className}`}>
      {/* Product Image */}
      <div className="relative overflow-hidden bg-gray-100">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
          }}
        />
        
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
            -{discountPercentage}%
          </div>
        )}
        
        {/* Category Badge - Hijau Tua */}
        {product.category && (
          <div className="absolute top-3 left-3 bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
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

        {/* Description */}
        {product.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {product.description}
          </p>
        )}
        
        {/* Price Section - Horizontal Layout */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Current Price */}
          <span className="text-2xl font-bold text-green-600">
            {formatPrice(finalPrice)}
          </span>
          
          {/* Original Price (if discount) - Di Samping */}
          {hasDiscount && (
            <>
              <span className="text-lg text-gray-400 line-through">
                {formatPrice(product.price)}
              </span>
              <span className="text-xs text-red-600 font-semibold bg-red-50 px-2 py-1 rounded">
                Hemat {formatPrice(product.price - finalPrice)}
              </span>
            </>
          )}
        </div>
        
        {/* Action Button - Tambah ke Keranjang */}
        <div className="pt-2">
          <Button 
            size="md"
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all duration-300"
            onClick={() => onAddToCart && onAddToCart(product)}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="mr-2" size={16} />
            {product.stock === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
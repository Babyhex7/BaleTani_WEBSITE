/**
 * CART ITEM COMPONENT
 * Reusable cart item card
 */

import { Trash2, Plus, Minus } from 'lucide-react';

const CartItem = ({ item, onUpdateQuantity, onRemove, disabled = false }) => {
  
  // Get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/100x100?text=No+Image';
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    const backendUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${backendUrl}${imagePath}`;
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity >= 1 && newQuantity <= item.stock) {
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  const hasDiscount = item.discount && item.finalPrice < item.price;
  const subtotal = item.finalPrice * item.quantity;

  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 transition-colors">
      {/* Product Image */}
      <div className="flex-shrink-0">
        <img
          src={getImageUrl(item.image)}
          alt={item.name}
          className="w-24 h-24 object-cover rounded-lg"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
          }}
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        {/* Name & Description */}
        <h3 className="font-semibold text-gray-900 truncate mb-1">
          {item.name}
        </h3>
        {item.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
            {item.description}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-green-600">
            {formatPrice(item.finalPrice)}
          </span>
          {hasDiscount && (
            <>
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(item.price)}
              </span>
              <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded">
                Hemat
              </span>
            </>
          )}
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={disabled || item.quantity <= 1}
              className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Minus size={16} />
            </button>
            <span className="w-12 text-center font-semibold">
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(1)}
              disabled={disabled || item.quantity >= item.stock}
              className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Stock Info */}
          <span className="text-sm text-gray-500">
            Maks. {item.stock}
          </span>
        </div>
      </div>

      {/* Right Side: Subtotal & Actions */}
      <div className="flex flex-col items-end justify-between">
        {/* Subtotal */}
        <div className="text-right">
          <p className="text-sm text-gray-500 mb-1">Subtotal</p>
          <p className="text-lg font-bold text-gray-900">
            {formatPrice(subtotal)}
          </p>
        </div>

        {/* Remove Button */}
        <button
          onClick={() => onRemove(item.id)}
          disabled={disabled}
          className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
        >
          <Trash2 size={16} />
          <span className="text-sm font-medium">Hapus</span>
        </button>
      </div>
    </div>
  );
};

export default CartItem;

/**
 * CART ITEM COMPONENT
 * Reusable cart item card
 */

import { Trash2, Plus, Minus } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUtils';

const CartItem = ({ item, onUpdateQuantity, onRemove, disabled = false }) => {

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
    <div data-cy="cart-item" className="card-cart-item p-3 sm:p-4">
      {/* Mobile Layout: Stacked */}
      <div className="flex gap-3 sm:gap-4">
        {/* Product Image - Smaller on mobile */}
        <div className="flex-shrink-0">
          <img
            src={getImageUrl(item.image)}
            alt={item.name}
            className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-cover rounded-lg"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
            }}
          />
        </div>

        {/* Product Info - Full Width on Mobile */}
        <div className="flex-1 min-w-0">
          {/* Name */}
          <h3 data-cy="product-name" className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2 mb-1">
            {item.name}
          </h3>
          
          {/* Description - Hidden on mobile */}
          {item.description && (
            <p className="hidden sm:block text-sm text-gray-600 line-clamp-1 mb-2">
              {item.description}
            </p>
          )}

          {/* Price - Tokopedia style: big and prominent */}
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
            <span data-cy="product-price" className="text-base sm:text-lg font-bold text-green-600">
              {formatPrice(item.finalPrice)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-xs sm:text-sm text-gray-400 line-through">
                  {formatPrice(item.price)}
                </span>
                <span className="px-1.5 sm:px-2 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded">
                  Hemat
                </span>
              </>
            )}
          </div>

          {/* Bottom Row: Quantity Controls + Remove Button (Mobile: Side by Side) */}
          <div className="flex items-center justify-between gap-2">
            {/* Quantity Controls - Touch friendly */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                data-cy="quantity-decrease"
                onClick={() => handleQuantityChange(-1)}
                disabled={disabled || item.quantity <= 1}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Minus size={14} className="sm:w-4 sm:h-4" />
              </button>
              <span data-cy="quantity-input" className="w-8 sm:w-10 text-center font-semibold text-sm sm:text-base">
                {item.quantity}
              </span>
              <button
                data-cy="quantity-increase"
                onClick={() => handleQuantityChange(1)}
                disabled={disabled || item.quantity >= item.stock}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus size={14} className="sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Stock Info - Compact on mobile */}
            <span className="text-xs sm:text-sm text-gray-500">
              Maks. {item.stock}
            </span>

            {/* Remove Button - Icon only on mobile */}
            <button
              data-cy="remove-item-btn"
              onClick={() => onRemove(item.id)}
              disabled={disabled}
              className="btn-touch px-2 sm:px-3 py-1.5 text-red-600 hover:bg-red-50 active:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <Trash2 size={16} className="sm:hidden" />
              <span className="hidden sm:flex items-center gap-1">
                <Trash2 size={16} />
                <span className="text-sm font-medium">Hapus</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Subtotal Row - Below on mobile (Tokopedia style) */}
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
        <span className="text-xs sm:text-sm text-gray-500">Subtotal</span>
        <span data-cy="subtotal" className="text-base sm:text-lg font-bold text-gray-900">
          {formatPrice(subtotal)}
        </span>
      </div>
    </div>
  );
};

export default CartItem;

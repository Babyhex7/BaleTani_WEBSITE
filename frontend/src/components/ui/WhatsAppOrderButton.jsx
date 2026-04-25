/**
 * ============================================
 * WHATSAPP ORDER BUTTON COMPONENT
 * ============================================
 * Komponen reusable untuk tombol pesan via WhatsApp
 * Langsung redirect ke WhatsApp tanpa perlu login
 * 
 * FEATURES:
 * - Multiple states: normal, disabled, loading, out of stock
 * - 3 size variants: sm, md, lg
 * - WhatsApp green color
 * - Responsive design
 * - Accessible dengan ARIA labels
 * - Keyboard support
 * 
 * STATES:
 * - Normal: Hijau WhatsApp, clickable
 * - Out of Stock: Abu-abu, disabled
 * - Loading: Opacity 75%, cursor wait
 * - Disabled: Abu-abu, cursor not-allowed
 * 
 * USE CASES:
 * - ProductCard (list view)
 * - ProductDetail (detail page)
 * - QuickView Modal
 * - Related Products
 * - Featured Products
 * 
 * @module WhatsAppOrderButton
 * 
 * @author BaleTani Development Team
 * @created 2025-04-25
 */

import { MessageCircle } from 'lucide-react';

/**
 * WhatsAppOrderButton Component
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onClick - Click handler function (event handler)
 * @param {Number} [props.stock=0] - Jumlah stok produk tersedia
 * @param {Boolean} [props.disabled=false] - Disabled state manual (force disable)
 * @param {Boolean} [props.loading=false] - Loading state
 * @param {String} [props.size='md'] - Ukuran button: 'sm', 'md', 'lg'
 * @param {String} [props.className=''] - Additional CSS classes
 * @param {Boolean} [props.fullWidth=true] - Full width button atau tidak
 * @param {String} [props.label='Pesan WA'] - Custom button label
 * 
 * @example
 * // Basic usage
 * <WhatsAppOrderButton 
 *   onClick={handleWhatsAppOrder}
 *   stock={10}
 * />
 * 
 * @example
 * // Out of stock
 * <WhatsAppOrderButton 
 *   onClick={handleWhatsAppOrder}
 *   stock={0}
 * />
 */
const WhatsAppOrderButton = ({ 
  onClick, 
  stock = 0, 
  disabled = false,
  loading = false,
  size = 'md',
  className = '',
  fullWidth = true,
  label = 'Pesan WA'
}) => {
  // ========================================
  // COMPUTED STATES
  // ========================================
  
  // Button out of stock jika stock = 0
  const isOutOfStock = stock === 0;
  
  // Button disabled jika:
  const isDisabled = disabled || isOutOfStock || loading;

  // ========================================
  // SIZE VARIANTS
  // ========================================
  const sizeClasses = {
    xs: 'text-[9px] xs:text-[10px] sm:text-xs py-1 sm:py-1.5 px-1.5 sm:px-2 rounded',
    sm: 'text-[10px] sm:text-xs py-1 sm:py-1.5 px-2 rounded',
    md: 'text-xs md:text-sm py-1.5 md:py-2 px-3 rounded',
    lg: 'text-sm md:text-base py-2 md:py-3 px-4 rounded-lg'
  };

  // ========================================
  // COLOR VARIANTS (WhatsApp Green)
  // ========================================
  const colorClasses = isDisabled
    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
    : 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white shadow-sm hover:shadow-md';

  // ========================================
  // BUTTON TEXT LOGIC
  // ========================================
  const getButtonText = () => {
    if (loading) {
      return 'Memproses...';
    }
    
    if (isOutOfStock) {
      return 'Stok Habis';
    }
    
    return (
      <span className="flex items-center justify-center gap-1">
        <MessageCircle size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} />
        {label}
      </span>
    );
  };

  // ========================================
  // ARIA LABEL untuk accessibility
  // ========================================
  const getAriaLabel = () => {
    if (loading) return 'Sedang memproses pesanan WhatsApp';
    if (isOutOfStock) return 'Produk habis';
    return 'Pesan via WhatsApp';
  };

  return (
    <button
      data-cy="whatsapp-order-btn"
      onClick={(e) => {
        // Prevent event bubbling to parent (card navigation)
        e.stopPropagation();
        e.preventDefault();
        // Call original handler
        if (onClick && !isDisabled) {
          onClick(e);
        }
      }}
      disabled={isDisabled}
      type="button"
      className={`
        ${fullWidth ? 'w-full' : ''}
        font-medium 
        transition-all 
        duration-200
        ${sizeClasses[size]}
        ${colorClasses}
        ${loading ? 'opacity-75 cursor-wait' : ''}
        ${className}
      `}
      aria-label={getAriaLabel()}
      aria-disabled={isDisabled}
      aria-busy={loading}
    >
      <span className="flex items-center justify-center gap-1">
        {/* Loading Spinner */}
        {loading && (
          <svg 
            className="animate-spin h-4 w-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        
        {/* Button Content */}
        {getButtonText()}
      </span>
    </button>
  );
};

export default WhatsAppOrderButton;

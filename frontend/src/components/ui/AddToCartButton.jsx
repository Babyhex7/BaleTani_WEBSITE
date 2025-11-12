/**
 * ============================================
 * ADD TO CART BUTTON COMPONENT
 * ============================================
 * Komponen reusable untuk tombol tambah ke keranjang
 * Support berbagai state dan variant
 * 
 * FEATURES:
 * - Multiple states: normal, disabled, loading, out of stock
 * - 3 size variants: sm, md, lg
 * - 2 color variants: primary (green), secondary (blue)
 * - Optional icon display
 * - Responsive design
 * - Accessible dengan ARIA labels
 * - Keyboard support
 * 
 * STATES:
 * - Normal: Hijau, clickable
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
 * @module AddToCartButton
 * 
 * @author BaleTani Development Team
 * @created 2025-11-12
 */

/**
 * AddToCartButton Component
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onClick - Click handler function (event handler)
 * @param {Number} [props.stock=0] - Jumlah stok produk tersedia
 * @param {Boolean} [props.disabled=false] - Disabled state manual (force disable)
 * @param {Boolean} [props.loading=false] - Loading state saat proses add to cart
 * @param {String} [props.size='md'] - Ukuran button: 'sm', 'md', 'lg'
 * @param {String} [props.variant='primary'] - Color variant: 'primary' (green), 'secondary' (blue)
 * @param {String} [props.className=''] - Additional CSS classes
 * @param {Boolean} [props.fullWidth=true] - Full width button atau tidak
 * 
 * @example
 * // Basic usage
 * <AddToCartButton 
 *   onClick={handleAddToCart}
 *   stock={10}
 * />
 * 
 * @example
 * // Out of stock
 * <AddToCartButton 
 *   onClick={handleAddToCart}
 *   stock={0}
 * />
 * 
 * @example
 * // Loading state
 * <AddToCartButton 
 *   onClick={handleAddToCart}
 *   stock={10}
 *   loading={true}
 * />
 * 
 * @example
 * // Large size for detail page
 * <AddToCartButton 
 *   onClick={handleAddToCart}
 *   stock={10}
 *   size="lg"
 * />
 * 
 * @example
 * // Secondary variant (blue)
 * <AddToCartButton 
 *   onClick={handleAddToCart}
 *   stock={10}
 *   variant="secondary"
 * />
 */
const AddToCartButton = ({ 
  onClick, 
  stock = 0, 
  disabled = false,
  loading = false,
  size = 'md',
  variant = 'primary',
  className = '',
  fullWidth = true
}) => {
  // ========================================
  // COMPUTED STATES
  // Hitung state button berdasarkan props
  // ========================================
  
  // Button out of stock jika stock = 0
  const isOutOfStock = stock === 0;
  
  // Button disabled jika:
  // 1. Manual disabled via prop
  // 2. Out of stock
  // 3. Sedang loading
  const isDisabled = disabled || isOutOfStock || loading;

  // ========================================
  // SIZE VARIANTS
  // Responsive padding dan font size
  // ========================================
  const sizeClasses = {
    sm: 'text-xs py-1 px-2 rounded',
    md: 'text-xs md:text-sm py-1.5 md:py-2 px-3 rounded',
    lg: 'text-sm md:text-base py-2 md:py-3 px-4 rounded-lg'
  };

  // ========================================
  // COLOR VARIANTS
  // Primary: Green (BaleTani brand)
  // Secondary: Blue (alternative)
  // ========================================
  const variantClasses = {
    primary: isDisabled
      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
      : 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white shadow-sm hover:shadow-md',
    secondary: isDisabled
      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
      : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm hover:shadow-md'
  };

  // ========================================
  // BUTTON TEXT LOGIC
  // Teks berubah sesuai state
  // ========================================
  const getButtonText = () => {
    // Loading state
    if (loading) {
      return 'Menambahkan...';
    }
    
    // Out of stock state
    if (isOutOfStock) {
      return 'Habis';
    }
    
    // Normal state
    return '+ Keranjang';
  };

  // ========================================
  // ARIA LABEL untuk accessibility
  // ========================================
  const getAriaLabel = () => {
    if (loading) return 'Sedang menambahkan produk ke keranjang';
    if (isOutOfStock) return 'Produk habis';
    return 'Tambahkan ke keranjang';
  };

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      type="button"
      className={`
        ${fullWidth ? 'w-full' : ''}
        font-medium 
        transition-all 
        duration-200
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${loading ? 'opacity-75 cursor-wait' : ''}
        ${className}
      `}
      aria-label={getAriaLabel()}
      aria-disabled={isDisabled}
      aria-busy={loading}
    >
      {/* ========================================
          BUTTON CONTENT
          Flexbox untuk center content
          ======================================== */}
      <span className="flex items-center justify-center gap-1">
        {/* Loading Spinner - Muncul saat loading */}
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
        
        {/* Button Text */}
        {getButtonText()}
      </span>
    </button>
  );
};

export default AddToCartButton;

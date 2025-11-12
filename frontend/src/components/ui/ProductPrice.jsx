/**
 * ============================================
 * PRODUCT PRICE COMPONENT
 * ============================================
 * Komponen reusable untuk menampilkan harga produk
 * Mendukung harga normal dan harga diskon
 * 
 * FEATURES:
 * - Display harga final (setelah diskon)
 * - Display harga asli (dicoret jika ada diskon)
 * - Discount percentage badge
 * - Responsive text sizes
 * - 3 size variants: sm, md, lg
 * - Accessible dengan ARIA labels
 * 
 * USE CASES:
 * - ProductCard (list view)
 * - ProductDetail (detail page)
 * - Cart items
 * - Checkout summary
 * - Order confirmation
 * - Invoice/Receipt
 * 
 * @module ProductPrice
 * 
 * @author BaleTani Development Team
 * @created 2025-11-12
 */

// Default currency formatter (IDR)
const defaultFormatPrice = (price) => {
  try {
    const value = typeof price === 'number' ? price : parseFloat(price || 0);
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(isNaN(value) ? 0 : value);
  } catch {
    return `Rp ${price ?? 0}`;
  }
};

/**
 * ProductPrice Component
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Number} props.finalPrice - Harga final setelah diskon (harga yang dibayar)
 * @param {Number} props.originalPrice - Harga asli sebelum diskon
 * @param {Number} props.discountPercentage - Persentase diskon (0-100)
 * @param {Boolean} props.hasDiscount - Flag apakah produk memiliki diskon
 * @param {Function} props.formatPrice - Function untuk format harga ke currency (Rp 50.000)
 * @param {String} [props.size='md'] - Ukuran teks: 'sm', 'md', 'lg'
 * @param {String} [props.layout='vertical'] - Layout: 'vertical', 'horizontal'
 * @param {String} [props.className=''] - Additional CSS classes
 * 
 * @example
 * // Basic usage - no discount
 * <ProductPrice 
 *   finalPrice={50000}
 *   originalPrice={50000}
 *   discountPercentage={0}
 *   hasDiscount={false}
 *   formatPrice={formatCurrency}
 * />
 * 
 * @example
 * // With discount - medium size
 * <ProductPrice 
 *   finalPrice={40000}
 *   originalPrice={50000}
 *   discountPercentage={20}
 *   hasDiscount={true}
 *   formatPrice={formatCurrency}
 *   size="md"
 * />
 * 
 * @example
 * // Large size for detail page
 * <ProductPrice 
 *   finalPrice={40000}
 *   originalPrice={50000}
 *   discountPercentage={20}
 *   hasDiscount={true}
 *   formatPrice={formatCurrency}
 *   size="lg"
 * />
 * 
 * @example
 * // Small size for cart
 * <ProductPrice 
 *   finalPrice={40000}
 *   hasDiscount={false}
 *   formatPrice={formatCurrency}
 *   size="sm"
 * />
 */
const ProductPrice = ({ 
  finalPrice, 
  originalPrice, 
  discountPercentage, 
  hasDiscount,
  formatPrice,
  size = 'md',
  layout = 'vertical',
  className = ''
}) => {
  // Use provided formatter or fallback to default
  const format = typeof formatPrice === 'function' ? formatPrice : defaultFormatPrice;
  // ========================================
  // SIZE VARIANTS
  // Responsive text sizes untuk berbagai device
  // Pattern: text-[mobile] md:text-[desktop]
  // ========================================
  const sizeClasses = {
    // Small - untuk cart items, compact views
    sm: {
      final: 'text-sm md:text-base',
      original: 'text-[10px] md:text-xs',
      badge: 'text-[9px] md:text-[10px] px-1 py-0.5'
    },
    // Medium - untuk product cards (default)
    md: {
      final: 'text-base md:text-lg',
      original: 'text-[10px] md:text-xs',
      badge: 'text-[10px] md:text-xs px-1 py-0.5'
    },
    // Large - untuk detail page, checkout
    lg: {
      final: 'text-lg md:text-2xl',
      original: 'text-xs md:text-sm',
      badge: 'text-xs md:text-sm px-2 py-1'
    }
  };

  // Get current size classes atau fallback ke medium
  const currentSize = sizeClasses[size] || sizeClasses.md;

  // ========================================
  // LAYOUT VARIANTS
  // ========================================
  const layoutClasses = {
    vertical: 'flex-col items-start',
    horizontal: 'flex-row items-center gap-2'
  };

  const currentLayout = layoutClasses[layout] || layoutClasses.vertical;

  return (
    <div className={`flex ${currentLayout} ${className}`}>
      {/* ========================================
          FINAL PRICE - Harga yang dibayar customer
          - Bold font untuk emphasis
          - Dark gray color untuk readability
          - Responsive sizing
          ======================================== */}
      <div className="flex items-baseline gap-1">
        <span 
          className={`${currentSize.final} font-bold text-gray-900`}
          role="text"
          aria-label={`Harga: ${format(finalPrice)}`}
        >
          {format(finalPrice)}
        </span>
      </div>
      
      {/* ========================================
          DISCOUNT INFO
          Hanya muncul jika hasDiscount = true
          Menampilkan:
          1. Harga asli (dicoret)
          2. Badge persentase diskon
          ======================================== */}
      {hasDiscount && (
        <div className="flex items-center gap-1 mt-0.5">
          {/* ========================================
              ORIGINAL PRICE - Harga sebelum diskon
              - Dicoret (line-through) untuk menunjukkan harga lama
              - Gray color untuk de-emphasize
              - Smaller font size
              ======================================== */}
          <span 
            className={`${currentSize.original} text-gray-400 line-through`}
            role="text"
            aria-label={`Harga asli: ${format(originalPrice)}`}
          >
            {format(originalPrice)}
          </span>

          {/* ========================================
              DISCOUNT BADGE - Persentase diskon
              - Red color untuk highlight savings
              - Light red background
              - Rounded corners
              - Semibold font untuk emphasis
              ======================================== */}
          <span 
            className={`
              ${currentSize.badge}
              text-red-500 
              font-semibold 
              bg-red-50 
              rounded
            `}
            role="status"
            aria-label={`Hemat ${discountPercentage} persen`}
          >
            -{discountPercentage}%
          </span>
        </div>
      )}
    </div>
  );
};

export default ProductPrice;

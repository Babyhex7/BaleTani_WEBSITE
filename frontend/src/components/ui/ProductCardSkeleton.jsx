/**
 * ============================================
 * PRODUCT CARD SKELETON COMPONENT
 * ============================================
 * Loading skeleton untuk ProductCard
 * Ditampilkan saat fetch products dari API
 * 
 * FEATURES:
 * - Shimmer animation effect
 * - Match exact ProductCard layout
 * - Responsive design (mobile → desktop)
 * - Multiple skeleton support (grid)
 * 
 * USAGE:
 * - ProductList page (saat loading)
 * - CategoryDetail page (saat loading)
 * - SearchResults page (saat loading)
 * - HomePage (featured products loading)
 * 
 * @module ProductCardSkeleton
 * @author BaleTani Development Team
 * @created 2025-11-14
 */

/**
 * ProductCardSkeleton Component
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Number} [props.count=8] - Jumlah skeleton cards yang ditampilkan
 * @param {String} [props.className=''] - Additional CSS classes
 * 
 * @example
 * // Basic usage
 * <ProductCardSkeleton />
 * 
 * @example
 * // Custom count
 * <ProductCardSkeleton count={12} />
 * 
 * @example
 * // Conditional rendering
 * {isLoading ? (
 *   <ProductCardSkeleton count={8} />
 * ) : (
 *   products.map(product => <ProductCard key={product.id} product={product} />)
 * )}
 */
const ProductCardSkeleton = ({ count = 8, className = '' }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`
            min-w-[46%] sm:min-w-[42%] md:min-w-0
            bg-white 
            rounded-md 
            sm:rounded-lg 
            overflow-hidden 
            shadow-sm 
            border 
            border-gray-200
            animate-pulse
            ${className}
          `}
          aria-label="Loading product..."
        >
          {/* ========================================
              IMAGE SKELETON
              Match ProductImage height
              ======================================== */}
          <div className="relative">
            {/* Image placeholder */}
            <div className="
              h-[180px] 
              sm:h-[200px] 
              bg-gray-200
            " />
            
            {/* Discount badge skeleton (top-left) */}
            <div className="
              absolute 
              top-1.5 
              sm:top-2 
              left-1.5 
              sm:left-2 
              w-12 
              sm:w-14 
              h-5 
              sm:h-6 
              bg-gray-300 
              rounded
            " />
            
            {/* Category badge skeleton (top-right) */}
            <div className="
              absolute 
              top-1.5 
              sm:top-2 
              right-1.5 
              sm:right-2 
              w-16 
              sm:w-20 
              h-5 
              sm:h-6 
              bg-gray-300 
              rounded
            " />
          </div>
          
          {/* ========================================
              CONTENT SKELETON
              Match ProductCard padding & layout
              ======================================== */}
          <div className="p-1.5 sm:p-2 md:p-2.5 lg:p-3">
            
            {/* Product name skeleton (2 lines) */}
            <div className="mb-1 sm:mb-1.5 md:mb-2 space-y-1.5">
              <div className="h-3 sm:h-3.5 bg-gray-200 rounded w-full" />
              <div className="h-3 sm:h-3.5 bg-gray-200 rounded w-4/5" />
            </div>
            
            {/* Price skeleton */}
            <div className="min-h-[52px] sm:min-h-[56px] flex flex-col justify-start mb-1.5 sm:mb-2 md:mb-3">
              {/* Final price */}
              <div className="h-4 sm:h-5 md:h-6 bg-gray-200 rounded w-2/3 mb-1" />
              {/* Original price (strikethrough) */}
              <div className="h-3 sm:h-3.5 bg-gray-200 rounded w-1/2" />
            </div>
            
            {/* Button skeleton */}
            <div className="h-7 sm:h-8 md:h-9 bg-gray-200 rounded w-full" />
          </div>
        </div>
      ))}
    </>
  );
};

export default ProductCardSkeleton;

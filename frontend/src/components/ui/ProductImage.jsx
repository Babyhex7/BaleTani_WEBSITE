/**
 * ============================================
 * PRODUCT IMAGE COMPONENT
 * ============================================
 * Komponen reusable untuk menampilkan gambar produk
 * Dilengkapi dengan discount badge dan category badge
 * 
 * FEATURES:
 * - Lazy loading untuk performa
 * - Error handling dengan placeholder
 * - Discount badge (top-left, red)
 * - Category badge (top-right, green)
 * - Hover effect: scale up
 * - Responsive design
 * - Customizable aspect ratio
 * 
 * USE CASES:
 * - ProductCard (list view)
 * - ProductDetail (detail page)
 * - Cart items
 * - Order history
 * - Admin product management
 * - Related products
 * 
 * @module ProductImage
 * @requires utils/imageUtils
 * 
 * @author BaleTani Development Team
 * @created 2025-11-12
 */

import { getImageUrl, handleImageError } from '../../utils/imageUtils';

/**
 * ProductImage Component
 * 
 * @component
 * @param {Object} props - Component props
 * @param {String} props.src - Image source URL dari database
 * @param {String} props.alt - Image alt text untuk SEO dan accessibility
 * @param {Number} [props.discountPercentage=0] - Persentase diskon (0-100). 0 = tidak ada diskon
 * @param {String} [props.category=''] - Nama kategori produk untuk badge
 * @param {String} [props.className=''] - Additional CSS classes untuk customization
 * @param {Boolean} [props.showBadges=true] - Toggle untuk show/hide badges
 * @param {String} [props.aspectRatio='aspect-square'] - Aspect ratio gambar (Tailwind class)
 * @param {String} [props.hoverEffect='scale'] - Hover effect: 'scale', 'zoom', 'none'
 * 
 * @example
 * // Basic usage
 * <ProductImage 
 *   src={product.image}
 *   alt={product.name}
 * />
 * 
 * @example
 * // With discount and category
 * <ProductImage 
 *   src={product.image}
 *   alt={product.name}
 *   discountPercentage={20}
 *   category="Sayuran"
 * />
 * 
 * @example
 * // Custom aspect ratio (for cart)
 * <ProductImage 
 *   src={product.image}
 *   alt={product.name}
 *   aspectRatio="aspect-[4/3]"
 *   showBadges={false}
 * />
 * 
 * @example
 * // Large image for detail page
 * <ProductImage 
 *   src={product.image}
 *   alt={product.name}
 *   aspectRatio="aspect-[16/9]"
 *   hoverEffect="zoom"
 * />
 */
const ProductImage = ({ 
  src, 
  alt, 
  discountPercentage = 0, 
  category = '',
  className = '',
  showBadges = true,
  aspectRatio = 'aspect-square',
  hoverEffect = 'scale'
}) => {
  // ========================================
  // HOVER EFFECT VARIANTS
  // ========================================
  const hoverEffects = {
    scale: 'group-hover:scale-105',
    zoom: 'group-hover:scale-110',
    none: '',
  };

  const currentHoverEffect = hoverEffects[hoverEffect] || hoverEffects.scale;

  return (
    <div 
      className={`
        relative 
        overflow-hidden 
        bg-gray-100 
        ${aspectRatio} 
        ${className}
      `}
      aria-label={`Gambar ${alt}`}
    >
      {/* ========================================
          PRODUCT IMAGE
          - Lazy loading: Hanya load saat terlihat di viewport
          - Object-fit cover: Memenuhi container tanpa distorsi
          - Transition smooth: 300ms untuk hover effect
          - Error handling: Ganti dengan placeholder jika gagal
          ======================================== */}
      <img 
        src={getImageUrl(src, 'product')} 
        alt={alt}
        loading="lazy"
        className={`
          w-full 
          h-full 
          object-cover 
          ${currentHoverEffect}
          transition-transform 
          duration-300
        `}
        onError={(e) => handleImageError(e, 'product')}
      />
      
      {/* ========================================
          BADGES OVERLAY
          Conditional render berdasarkan showBadges prop
          ======================================== */}
      {showBadges && (
        <>
          {/* ========================================
              DISCOUNT BADGE - Top Left
              - Background: Red (#EF4444)
              - Position: Absolute top-left dengan padding
              - Z-index: 10 untuk tampil di atas gambar
              - Conditional: Hanya muncul jika discountPercentage > 0
              ======================================== */}
          {discountPercentage > 0 && (
            <div 
              className="
                absolute 
                top-2 
                left-2 
                bg-red-500 
                text-white 
                text-xs 
                font-bold 
                px-2 
                py-1 
                rounded 
                shadow-md 
                z-10
              "
              role="status"
              aria-label={`Diskon ${discountPercentage} persen`}
            >
              {discountPercentage}%
            </div>
          )}

          {/* ========================================
              CATEGORY BADGE - Top Right
              - Background: Green (#16A34A)
              - Position: Absolute top-right dengan padding
              - Z-index: 10 untuk tampil di atas gambar
              - Truncate: Potong teks jika terlalu panjang
              - Max-width: 50% dari container width
              - Conditional: Hanya muncul jika category tidak kosong
              ======================================== */}
          {category && (
            <div 
              className="
                absolute 
                top-2 
                right-2 
                bg-green-600 
                text-white 
                text-xs 
                font-semibold 
                px-2 
                py-1 
                rounded 
                shadow-md 
                max-w-[50%] 
                truncate 
                z-10
              "
              role="status"
              aria-label={`Kategori ${category}`}
              title={category}
            >
              {category}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductImage;

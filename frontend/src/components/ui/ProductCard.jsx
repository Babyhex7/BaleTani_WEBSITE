/**
 * ============================================
 * PRODUCT CARD COMPONENT - MAIN
 * ============================================
 * Komponen utama untuk menampilkan kartu produk
 * Style: Tokopedia-inspired compact design
 * Architecture: Modular & Reusable
 * 
 * MODULAR STRUCTURE:
 * - Uses ProductImage component (reusable)
 * - Uses ProductPrice component (reusable)
 * - Uses AddToCartButton component (reusable)
 * - Uses useAddToCart hook (reusable logic)
 * - Uses productUtils (helper functions)
 * 
 * FEATURES:
 * - Click to navigate to detail
 * - Add to cart with validation
 * - Login modal for unauthenticated users
 * - Discount badge & category badge
 * - Responsive design
 * - Keyboard accessible
 * 
 * USE CASES:
 * - Product List Page (/products)
 * - Category Page (/category/:id)
 * - Search Results (/search?q=...)
 * - Home Page (Featured/New Products)
 * - Related Products section
 * - Admin Product Preview
 * 
 * @module ProductCard
 * @requires react-router-dom
 * @requires components/ui/LoginModal
 * @requires components/ui/ProductImage
 * @requires components/ui/ProductPrice
 * @requires components/ui/AddToCartButton
 * @requires hooks/hook_customer/useAddToCart
 * @requires utils/productUtils
 * 
 * @author BaleTani Development Team
 * @created 2025-11-12
 */

import { useNavigate } from 'react-router-dom';
import LoginModal from './LoginModal';
import ProductImage from './ProductImage';
import ProductPrice from './ProductPrice';
import AddToCartButton from './AddToCartButton';
import useAddToCart from '../../hooks/hook_customer/useAddToCart';
import { calculateDiscount, getCategoryName } from '../../utils/productUtils';

/**
 * ProductCard Component
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.product - Product data object dari API
 * @param {String} props.product.id - Product ID (UUID)
 * @param {String} props.product.name - Product name
 * @param {Number} props.product.price - Original price
 * @param {Number} props.product.stock - Available stock
 * @param {String} props.product.image - Image URL
 * @param {Object} props.product.category - Category object/string
 * @param {Object} props.product.discount - Discount object (optional)
 * @param {Function} props.formatPrice - Function untuk format harga (Rp 50.000)
 * @param {String} [props.className=''] - Additional CSS classes untuk customization
 * @param {Boolean} [props.showCategory=true] - Tampilkan category badge
 * @param {Function} [props.onCardClick] - Custom handler saat card diklik (override default)
 * 
 * @example
 * // Basic usage
 * <ProductCard 
 *   product={productData}
 *   formatPrice={formatCurrency}
 * />
 * 
 * @example
 * // Without category badge
 * <ProductCard 
 *   product={productData}
 *   formatPrice={formatCurrency}
 *   showCategory={false}
 * />
 * 
 * @example
 * // Custom card click handler
 * <ProductCard 
 *   product={productData}
 *   formatPrice={formatCurrency}
 *   onCardClick={(product) => console.log('Clicked:', product)}
 * />
 */
const ProductCard = ({ 
  product, 
  formatPrice,
  className = '',
  showCategory = true,
  onCardClick
}) => {
  // ========================================
  // HOOKS
  // ========================================
  
  // React Router navigation
  const navigate = useNavigate();
  
  // Custom hook untuk add to cart logic
  // Returns: handleAddToCart, showLoginModal, setShowLoginModal, isProcessing
  const { 
    handleAddToCart, 
    showLoginModal, 
    setShowLoginModal,
    isProcessing 
  } = useAddToCart();

  // ========================================
  // COMPUTED VALUES
  // Menggunakan utility functions dari productUtils.js
  // ========================================
  
  /**
   * Hitung diskon dan harga final
   * Returns: { hasDiscount, discountPercentage, finalPrice, originalPrice, savingsAmount }
   */
  const { 
    hasDiscount, 
    discountPercentage, 
    finalPrice, 
    originalPrice 
  } = calculateDiscount(product);
  
  /**
   * Get category name
   * Handle format object atau string
   */
  const categoryName = showCategory ? getCategoryName(product.category) : '';

  // ========================================
  // EVENT HANDLERS
  // ========================================
  
  /**
   * Handle card click - Navigate ke product detail
   * Bisa di-override dengan onCardClick prop untuk custom behavior
   * 
   * @param {Event} e - Click event (optional, for keyboard support)
   */
  const handleCardClick = (e) => {
    // Jika ada custom handler, gunakan itu
    if (onCardClick) {
      onCardClick(product);
    } else {
      // Default: Navigate ke detail page
      navigate(`/products/${product.id}`);
    }
  };
  
  // ========================================
  // RENDER COMPONENT
  // ========================================
  return (
    <div 
      onClick={handleCardClick}
      className={`
        min-w-[46%] sm:min-w-[42%] md:min-w-0
        group 
        bg-white 
        rounded-md 
        sm:rounded-lg 
        overflow-hidden 
        shadow-sm 
        hover:shadow-md
        sm:hover:shadow-lg 
        transition-all 
        duration-200 
        border 
        border-gray-200 
        hover:border-green-500 
        cursor-pointer
        ${className}
      `}
      role="button"
      tabIndex={0}
      aria-label={`Lihat detail ${product.name}`}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* ========================================
          PRODUCT IMAGE SECTION
          Menggunakan ProductImage component (reusable)
          Props:
          - src: URL gambar produk
          - alt: Nama produk untuk SEO
          - discountPercentage: Badge diskon (0 jika tidak ada)
          - category: Badge kategori
          - showBadges: Toggle badges
          ======================================== */}
      <ProductImage 
        src={product.image}
        alt={product.name}
        discountPercentage={discountPercentage}
        category={categoryName}
        showBadges={true}
        aspectRatio={"aspect-[4/5] sm:aspect-square"}
        hoverEffect={"scale"}
      />
      
      {/* ========================================
          PRODUCT INFO SECTION
          Compact Tokopedia-style layout
          Padding: p-1.5 (mobile) → p-2.5 (tablet) → p-3 (desktop)
          ======================================== */}
      <div className="p-1.5 sm:p-2 md:p-2.5 lg:p-3">
        
        {/* ========================================
            PRODUCT NAME
            - Max 2 lines dengan ellipsis (line-clamp-2)
            - Min height untuk konsistensi card height
            - Title attribute untuk full name on hover
            - Extra compact di mobile untuk grid 2 kolom
            ======================================== */}
        <h3 
          className="
            text-[10px] 
            xs:text-[11px]
            sm:text-xs 
            md:text-sm 
            text-gray-900 
            line-clamp-2 
            mb-1 
            sm:mb-1.5
            md:mb-2 
            leading-tight 
            min-h-[2rem] 
            sm:min-h-[2.3rem]
            md:min-h-[2.5rem]
            lg:min-h-[2.8rem]
          "
          title={product.name}
        >
          {product.name}
        </h3>
        
        {/* ========================================
            PRICE SECTION
            Menggunakan ProductPrice component (reusable)
            Props:
            - finalPrice: Harga setelah diskon
            - originalPrice: Harga asli
            - discountPercentage: Persentase diskon
            - hasDiscount: Flag diskon
            - formatPrice: Function formatter
            - size: 'sm' untuk mobile, 'md' untuk desktop
            - className: Spacing bottom - compact di mobile
            ======================================== */}
        <ProductPrice 
          finalPrice={finalPrice}
          originalPrice={originalPrice}
          discountPercentage={discountPercentage}
          hasDiscount={hasDiscount}
          formatPrice={formatPrice}
          size="sm"
          className="mb-1.5 sm:mb-2 md:mb-3"
        />

        {/* ========================================
            ADD TO CART BUTTON
            Menggunakan AddToCartButton component (reusable)
            Props:
            - onClick: Handler dari useAddToCart hook
            - stock: Jumlah stok tersedia
            - loading: State processing dari hook
            - size: 'xs' untuk mobile grid 2 kolom, 'sm' tablet, 'md' desktop
            - variant: 'primary' (green)
            - fullWidth: true untuk full width
            ======================================== */}
        <AddToCartButton 
          onClick={handleAddToCart(product, 1)}
          stock={product.stock}
          loading={isProcessing}
          size="xs"
          variant="primary"
          fullWidth={true}
        />
      </div>

      {/* ========================================
          LOGIN MODAL
          Muncul saat user belum login dan klik add to cart
          State dihandle oleh useAddToCart hook
          ======================================== */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
};

export default ProductCard;
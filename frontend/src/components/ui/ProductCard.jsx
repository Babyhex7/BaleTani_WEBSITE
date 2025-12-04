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
import toast from 'react-hot-toast'; // ✅ ADDED: For error notifications
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
  // COMPUTED VALUES - DISKON REAL DARI DATABASE
  // Menggunakan utility functions dari productUtils.js
  // 
  // ✅ PENTING: calculateDiscount() sudah di-refactor untuk:
  // - STRICT VALIDATION: Hanya return hasDiscount=true jika ada discount object dari backend
  // - NO FALLBACK: Tidak ada perhitungan palsu jika tidak ada data diskon dari database
  // - DATA DRIVEN: Semua data dari backend ProductDiscount table (pre-calculated)
  // 
  // ✅ Backend flow:
  // 1. Admin create discount di database (table: discounts)
  // 2. Admin assign product ke discount
  // 3. Backend calculate & save ke ProductDiscount table (discounted_price, original_price)
  // 4. Frontend ambil data pre-calculated dari API
  // 5. Display HANYA jika product.discount object exists
  // ========================================
  
  /**
   * Hitung diskon dan harga final dari data backend
   * Returns: { hasDiscount, discountPercentage, displayPercentage, finalPrice, originalPrice, savingsAmount, maxDiscount }
   * 
   * hasDiscount = true HANYA JIKA:
   * - product.discount object exists dari backend
   * - product.discount.finalPrice < product.price (ada diskon nyata)
   * - Semua validasi passed
   */
  const { 
    hasDiscount,        // ✅ true = diskon REAL dari database
    discountPercentage, // ✅ Actual % setelah max_discount applied
    displayPercentage,  // ✅ Original % untuk badge display (contoh: 80%)
    finalPrice,         // ✅ Harga setelah diskon (dari backend)
    originalPrice       // ✅ Harga asli sebelum diskon
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
   * ✅ FIXED: Proper event handling dan error handling
   * 
   * @param {Event} e - Click event (optional, for keyboard support)
   */
  const handleCardClick = (e) => {
    // ✅ CRITICAL: Null check untuk event
    if (e) {
      e.preventDefault();
      // Tidak perlu stopPropagation di sini karena ini parent handler
    }
    
    // Jika ada custom handler, gunakan itu
    if (onCardClick) {
      onCardClick(product);
      return;
    }
    
    // ✅ CRITICAL: Validate product.id sebelum navigate
    if (!product?.id) {
      console.error('ProductCard: Cannot navigate, invalid product ID');
      toast.error('Produk tidak valid');
      return;
    }
    
    // Default: Navigate ke detail page
    try {
      navigate(`/products/${product.id}`);
    } catch (error) {
      console.error('ProductCard: Navigation error', error);
      toast.error('Gagal membuka detail produk');
    }
  };
  
  // ========================================
  // RENDER COMPONENT
  // ========================================
  return (
    <div 
      data-cy="product-card"
      onClick={handleCardClick}
      className={`
        w-full
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
        ${isProcessing ? 'pointer-events-none opacity-75' : ''}
        ${className}
      `}
      role="button"
      tabIndex={0}
      aria-label={`Lihat detail ${product.name}`}
      onKeyPress={(e) => {
        // ✅ FIXED: Pass event ke handler dan handle space key properly
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation(); // Prevent scroll on space
          handleCardClick(e);
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
      <div className="relative">
        <ProductImage 
          src={product.image}
          alt={product.name}
          discountPercentage={displayPercentage} // ✅ Use original % for badge (60%)
          category={categoryName}
          showBadges={true}
          aspectRatio={"h-[180px] sm:h-[200px]"}
          hoverEffect={"scale"}
        />
        
        {/* ========================================
            OUT OF STOCK OVERLAY
            Overlay hitam transparan jika stock = 0
            ======================================== */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-60 rounded-t-md sm:rounded-t-lg z-10"></div>
        )}
      </div>
      
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
          data-cy="product-name"
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
            h-[40px]
            overflow-hidden
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
        <div data-cy="product-price" className="min-h-[52px] sm:min-h-[56px] flex flex-col justify-start">
          {/* Use displayPercentage (original %) not actual % - seperti Shopee */}
          <ProductPrice 
            finalPrice={finalPrice}
            originalPrice={originalPrice}
            discountPercentage={displayPercentage}
            hasDiscount={hasDiscount}
            formatPrice={formatPrice}
            size="sm"
            className="mb-1.5 sm:mb-2 md:mb-3"
          />
        </div>

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
            
            ✅ CRITICAL: stopPropagation untuk prevent bubble ke card onClick
            ======================================== */}
        <AddToCartButton 
          data-cy="add-to-cart-btn"
          onClick={(e) => {
            // ✅ CRITICAL: Stop propagation agar tidak trigger handleCardClick
            if (e) {
              e.stopPropagation();
            }
            // handleAddToCart sudah return function, langsung call
            handleAddToCart(product, 1)(e);
          }}
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
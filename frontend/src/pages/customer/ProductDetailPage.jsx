/**
 * PRODUCT DETAIL PAGE
 * Menampilkan detail lengkap produk tanpa rating
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import LoginModal from '../../components/ui/LoginModal';
import Button from '../../components/ui/Button';
import useAuthStore from '../../store/store_customer/useAuthStore';
import useCartStore from '../../store/store_customer/useCartStore';
import useAddToCart from '../../hooks/hook_customer/useAddToCart'; // ✅ Import hook
import productService from '../../services/services_customer/productService';
import { getImageUrl as getImageUrlUtil } from '../../utils/imageUtils';
import { calculateDiscount } from '../../utils/productUtils';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const addItem = useCartStore((state) => state.addItem);
  
  // ✅ Use hook untuk consistent validation
  const { 
    handleAddToCart: hookHandleAddToCart, 
    showLoginModal, 
    setShowLoginModal,
    isProcessing 
  } = useAddToCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Fetch product detail
  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        const response = await productService.getProductDetail(id);
        
        if (response.success) {
          setProduct(response.data);
        }
      } catch (error) {
        console.error('Error fetching product detail:', error);
        toast.error('Gagal memuat detail produk');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetail();
    }
  }, [id]);

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Handle quantity change
  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  // ✅ Handle add to cart - Use hook dengan semua validasi
  const handleAddToCart = () => {
    // Call hook handler yang sudah ada validasi lengkap:
    // - Debounce (300ms)
    // - isProcessing check
    // - Stock availability
    // - Cart quantity check
    // - Store stock validation
    hookHandleAddToCart(product, quantity, false)(); // Call returned function
    
    // Reset quantity setelah berhasil (delay sedikit)
    setTimeout(() => setQuantity(1), 500);
  };

  // ✅ Handle buy now - Direct redirect, no toast
  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (product.stock === 0) {
      toast.error('Produk habis');
      return;
    }

    try {
      // Add to cart silently (no toast)
      // Parameters: (product, quantity, stopPropagation, silent)
      await hookHandleAddToCart(product, quantity, false, true)(); // silent = true
      
      // Redirect immediately to cart
      navigate('/cart');
    } catch (error) {
      console.error('Error buy now:', error);
      toast.error('Gagal menambahkan ke keranjang');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center py-12 sm:py-16 md:py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-green-600 border-t-transparent"></div>
            <p className="mt-4 text-body text-gray-600">Memuat detail produk...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center py-12 sm:py-16 md:py-20 px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400" />
            </div>
            <h2 className="heading-sub text-gray-900 mb-2">Produk Tidak Ditemukan</h2>
            <p className="text-body text-gray-600 mb-6">Maaf, produk yang Anda cari tidak tersedia.</p>
            <Button onClick={() => navigate('/products')} className="btn-touch">
              <ArrowLeft className="mr-2" size={16} />
              Kembali ke Daftar Produk
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // ========================================
  // DISKON CALCULATION - HANYA DARI DATABASE
  // ========================================
  // ✅ SHOPEE-STYLE DISCOUNT: Tampilkan % original (contoh: 78%), tapi gunakan harga dengan max discount
  // ✅ Gunakan logic yang SAMA dengan ProductCard (dari productUtils.js)
  // ✅ STRICT: hasDiscount = true HANYA jika ada discount object dari backend API
  // 
  // Backend sudah pre-calculate semua di ProductDiscount table:
  // - original_price: Harga asli saat assign
  // - discounted_price: Harga setelah diskon (dengan max_discount applied)
  // - Frontend tinggal display, NO calculation
  // ========================================
  const { 
    hasDiscount,        // ✅ true = diskon REAL dari database
    displayPercentage,  // ✅ Original % untuk badge (contoh: 80%)
    finalPrice,         // ✅ Harga final setelah diskon
    originalPrice,      // ✅ Harga asli
    savingsAmount       // ✅ Jumlah hemat (Rp)
  } = calculateDiscount(product);

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gray-50 section-py">
        <div className="container-app">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="btn-touch flex items-center text-gray-600 hover:text-green-600 mb-4 sm:mb-6 transition-colors"
          >
            <ArrowLeft size={18} className="mr-2 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Kembali</span>
          </button>

          {/* Product Detail Grid */}
          <div className="card-responsive overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8">
              
              {/* Left: Images */}
              <div>
                {/* Main Image with Navigation Arrows */}
                <div className="relative bg-gray-100 rounded-lg sm:rounded-xl overflow-hidden mb-3 sm:mb-4 aspect-square group">
                  <img
                    src={getImageUrlUtil(product.images[selectedImage], 'large')}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/500x500?text=No+Image';
                    }}
                  />
                  
                  {/* Navigation Arrows - hanya muncul jika ada > 1 gambar */}
                  {product.images.length > 1 && (
                    <>
                      {/* Previous Button */}
                      <button
                        onClick={() => setSelectedImage(prev => prev > 0 ? prev - 1 : product.images.length - 1)}
                        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="text-gray-700" size={20} />
                      </button>
                      
                      {/* Next Button */}
                      <button
                        onClick={() => setSelectedImage(prev => prev < product.images.length - 1 ? prev + 1 : 0)}
                        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                        aria-label="Next image"
                      >
                        <ChevronRight className="text-gray-700" size={20} />
                      </button>
                      
                      {/* Image Counter */}
                      <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 px-2 sm:px-3 py-1 bg-black/60 text-white text-xs sm:text-sm rounded-full font-medium">
                        {selectedImage + 1} / {product.images.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnail Images */}
                {product.images.length > 1 && (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`btn-touch aspect-square rounded-md sm:rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === index
                            ? 'border-green-600 ring-2 ring-green-200'
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                      >
                        <img
                          src={getImageUrlUtil(image, 'thumbnail')}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Product Info */}
              <div className="flex flex-col">
                {/* Category Badge */}
                {product.category && (
                  <div className="mb-3">
                    <span data-cy="category-badge" className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-green-100 text-green-800">
                      <Tag size={12} className="mr-1 sm:w-3.5 sm:h-3.5" />
                      {product.category.name}
                    </span>
                  </div>
                )}

                {/* Product Name */}
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                  {product.name}
                </h1>

                {/* Price Section */}
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <span className="text-2xl sm:text-3xl font-bold text-green-600">
                      {formatPrice(finalPrice)}
                    </span>
                    {hasDiscount && (
                      <>
                        <span className="text-base sm:text-lg text-gray-400 line-through">
                          {formatPrice(product.price)}
                        </span>
                        <span className="px-2 py-1 bg-red-500 text-white text-xs sm:text-sm font-bold rounded">
                          -{displayPercentage}% {/* ✅ Show original % (60%) */}
                        </span>
                      </>
                    )}
                  </div>
                  {hasDiscount && savingsAmount > 0 && (
                    <p className="text-xs sm:text-sm text-red-600 font-medium">
                      Hemat {formatPrice(savingsAmount)} {/* ✅ Gunakan savings dari backend (sudah include max_discount) */}
                    </p>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <div className="mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Deskripsi</h3>
                    <p className="text-caption sm:text-body text-gray-700 leading-relaxed whitespace-pre-line">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Stock Info */}
                <div className="mb-4 sm:mb-6">
                  <span className="text-caption sm:text-sm text-gray-700">
                    Stok: <span className={`font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.stock > 0 ? `${product.stock}` : 'Habis'}
                    </span>
                  </span>
                </div>

                {/* Quantity Selector */}
                {product.stock > 0 && (
                  <div className="mb-4 sm:mb-6">
                    <label className="block text-caption sm:text-sm font-medium text-gray-700 mb-2">
                      Jumlah
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        data-cy="quantity-decrease"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="btn-touch w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-gray-300 flex items-center justify-center text-lg font-semibold hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        -
                      </button>
                      <span data-cy="quantity-input" className="w-12 sm:w-16 text-center text-base sm:text-lg font-semibold">
                        {quantity}
                      </span>
                      <button
                        data-cy="quantity-increase"
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= product.stock}
                        className="btn-touch w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-gray-300 flex items-center justify-center text-lg font-semibold hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        +
                      </button>
                      <span className="text-xs sm:text-sm text-gray-500 ml-2">
                        Maks. {product.stock} 
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-4 border-t border-gray-100">
                  <button
                    data-cy="add-to-cart-btn"
                    onClick={handleAddToCart}
                    disabled={product.stock === 0 || isProcessing}
                    className="btn-touch flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-lg bg-green-600 text-white text-sm sm:text-base font-semibold hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        <span>Menambahkan...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={16} className="sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Tambah ke Keranjang</span>
                        <span className="sm:hidden">+ Keranjang</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={product.stock === 0 || isProcessing}
                    className="btn-touch flex-1 flex items-center justify-center px-4 sm:px-6 py-3 rounded-lg bg-white border-2 border-green-600 text-green-600 text-sm sm:text-base font-semibold hover:bg-green-50 active:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isProcessing ? 'Memproses...' : 'Beli Sekarang'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      <Footer />
    </>
  );
};

export default ProductDetailPage;

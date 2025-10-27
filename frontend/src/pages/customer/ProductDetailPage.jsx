/**
 * PRODUCT DETAIL PAGE
 * Menampilkan detail lengkap produk tanpa rating
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import LoginModal from '../../components/ui/LoginModal';
import Button from '../../components/ui/Button';
import useAuthStore from '../../store/store_customer/useAuthStore';
import useCartStore from '../../store/store_customer/useCartStore';
import productService from '../../services/services_customer/productService';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const addItem = useCartStore((state) => state.addItem);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

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
        showToast('Gagal memuat detail produk', 'error');
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

  // Get image URL with backend URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/500x500?text=No+Image';
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    const backendUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${backendUrl}/${imagePath}`;
  };

  // Show toast notification
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'info' });
    }, 3000);
  };

  // Handle quantity change
  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (product.stock === 0) {
      showToast('Maaf, produk ini sedang habis stok', 'error');
      return;
    }

    addItem(product, quantity);
    showToast(`${quantity} ${product.name} berhasil ditambahkan ke keranjang!`, 'success');
    setQuantity(1);
  };

  // Handle buy now
  const handleBuyNow = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (product.stock === 0) {
      showToast('Maaf, produk ini sedang habis stok', 'error');
      return;
    }

    addItem(product, quantity);
    navigate('/cart');
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat detail produk...</p>
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
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Produk Tidak Ditemukan</h2>
            <p className="text-gray-600 mb-6">Maaf, produk yang Anda cari tidak tersedia.</p>
            <Button onClick={() => navigate('/products')}>
              <ArrowLeft className="mr-2" size={16} />
              Kembali ke Daftar Produk
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const hasDiscount = product.discount && product.discount.finalPrice < product.price;
  const finalPrice = hasDiscount ? product.discount.finalPrice : product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.price - finalPrice) / product.price) * 100)
    : 0;

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-green-600 mb-6 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Kembali
          </button>

          {/* Product Detail Grid */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
              
              {/* Left: Images */}
              <div>
                {/* Main Image with Navigation Arrows */}
                <div className="relative bg-gray-100 rounded-xl overflow-hidden mb-4 aspect-square group">
                  <img
                    src={getImageUrl(product.images[selectedImage])}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/500x500?text=No+Image';
                    }}
                  />
                  
                  {/* Navigation Arrows - hanya muncul jika ada > 1 gambar */}
                  {product.images.length > 1 && (
                    <>
                      {/* Previous Button */}
                      <button
                        onClick={() => setSelectedImage(prev => prev > 0 ? prev - 1 : product.images.length - 1)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="text-gray-700" size={24} />
                      </button>
                      
                      {/* Next Button */}
                      <button
                        onClick={() => setSelectedImage(prev => prev < product.images.length - 1 ? prev + 1 : 0)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                        aria-label="Next image"
                      >
                        <ChevronRight className="text-gray-700" size={24} />
                      </button>
                      
                      {/* Image Counter */}
                      <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 text-white text-sm rounded-full font-medium">
                        {selectedImage + 1} / {product.images.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnail Images */}
                {product.images.length > 1 && (
                  <div className="grid grid-cols-5 gap-2">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === index
                            ? 'border-green-600 ring-2 ring-green-200'
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                      >
                        <img
                          src={getImageUrl(image)}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
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
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <Tag size={14} className="mr-1" />
                      {product.category.name}
                    </span>
                  </div>
                )}

                {/* Product Name */}
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>

                {/* Price Section */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl font-bold text-green-600">
                      {formatPrice(finalPrice)}
                    </span>
                    {hasDiscount && (
                      <>
                        <span className="text-lg text-gray-400 line-through">
                          {formatPrice(product.price)}
                        </span>
                        <span className="px-2 py-1 bg-red-500 text-white text-sm font-bold rounded">
                          -{discountPercentage}%
                        </span>
                      </>
                    )}
                  </div>
                  {hasDiscount && (
                    <p className="text-sm text-red-600 font-medium">
                      Hemat {formatPrice(product.price - finalPrice)}
                    </p>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Deskripsi</h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Stock Info */}
                <div className="mb-6">
                  <span className="text-gray-700">
                    Stok: <span className={`font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.stock > 0 ? `${product.stock}` : 'Habis'}
                    </span>
                  </span>
                </div>

                {/* Quantity Selector */}
                {product.stock > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jumlah
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        -
                      </button>
                      <span className="w-16 text-center text-lg font-semibold">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= product.stock}
                        className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        +
                      </button>
                      <span className="text-sm text-gray-500 ml-2">
                        Maks. {product.stock} 
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-auto">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ShoppingCart size={18} />
                    Tambah ke Keranjang
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    className="flex-1 flex items-center justify-center px-6 py-3 rounded-lg bg-white border-2 border-green-600 text-green-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Beli Sekarang
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
          <div className={`flex items-center gap-3 p-4 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            toast.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        </div>
      )}

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

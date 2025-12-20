import { useState, useEffect } from 'react';
import { 
  Package, 
  Tag, 
  ArrowRight, 
  TrendingUp,
  AlertCircle,
  Grid
} from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/store_customer/useAuthStore';
import useCartStore from '../../store/store_customer/useCartStore';
import apiClient from '../../utils/apiClient';
import ProductCard from '../../components/ui/ProductCard';
import ProductCardSkeleton from '../../components/ui/ProductCardSkeleton';
import ErrorBoundary from '../../components/ErrorBoundary';
import Pagination from '../../components/ui/Pagination';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const Home = () => {
  const { user } = useAuthStore();
  const { cart: cartItems } = useCartStore();
  
  // State management
  const [featuredProducts, setFeaturedProducts] = useState([]);
  
  // Pagination states
  const [productPage, setProductPage] = useState(1);
  const [productPagination, setProductPagination] = useState(null);
  
  // Loading states
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  // Error states
  const [errorProducts, setErrorProducts] = useState(null);


  // Fetch Featured Products dari API dengan Pagination
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoadingProducts(true);
        const response = await apiClient.get('/public/products', {
          params: {
            sortBy: 'newest',
            limit: 6,
            page: productPage
          }
        });
        
        if (response.data.success) {
          setFeaturedProducts(response.data.data.products);
          setProductPagination(response.data.data.pagination);
          setErrorProducts(null);
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
        setErrorProducts('Gagal memuat produk');
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchFeaturedProducts();
  }, [productPage]);



  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />

      {/* Hero Section - Modern & Clean */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-green-600 to-green-700 py-8 sm:py-12 lg:py-16">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative container-app">
          <div className="max-w-4xl">
            {/* Main Heading */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight">
              Halo, <span className="text-yellow-300">{user?.name || user?.full_name || user?.username || 'Customer'}</span>! 👋
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-green-50 mb-6 sm:mb-8 max-w-2xl leading-relaxed">
              Dari kebun ke Balé, dari Balé ke rumahmu. Belanja produk segar hari ini!
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/products">
                <button className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-green-700 font-semibold rounded-lg hover:bg-green-50 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                  Mulai Belanja
                </button>
              </Link>
              <Link to="/promo">
                <button className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg border-2 border-white/30 hover:bg-white/20 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base">
                  <Tag className="w-5 h-5" />
                  Lihat Promo
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-8 sm:h-12 md:h-16" preserveAspectRatio="none">
            <path fill="#ffffff" d="M0,64 L48,58.7 C96,53,192,43,288,42.7 C384,43,480,53,576,58.7 C672,64,768,64,864,58.7 C960,53,1056,43,1152,42.7 C1248,43,1344,53,1392,58.7 L1440,64 L1440,120 L0,120 Z"></path>
          </svg>
        </div>
      </section>



      {/* Promo Section - Removed as requested */}

      {/* Featured Products - Modern Grid */}
      <section className="section-py bg-gray-50">
        <div className="container-app">
          {/* Section Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between gap-3 mb-1 sm:mb-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg flex-shrink-0">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <h2 className="heading-section text-gray-900">
                  Produk Terbaru
                </h2>
              </div>
              <Link to="/products">
                <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 sm:gap-2 group flex-shrink-0">
                  Lihat Semua
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
            <p className="text-caption text-gray-600">Produk segar langsung dari kebun</p>
          </div>

          {/* Products Grid */}
          {loadingProducts ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : errorProducts ? (
            <div className="bg-white rounded-2xl p-6 sm:p-8 lg:p-12 text-center shadow-md">
              <AlertCircle className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto text-red-500 mb-4" />
              <p className="text-red-600 text-sm sm:text-base lg:text-lg mb-4">{errorProducts}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          ) : featuredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {featuredProducts.map((product) => (
                  <ErrorBoundary key={product.id}>
                    <ProductCard product={product} />
                  </ErrorBoundary>
                ))}
              </div>

              {/* Product Pagination */}
              {productPagination && productPagination.total_pages > 1 && (
                <Pagination
                  currentPage={productPagination.current_page}
                  totalPages={productPagination.total_pages}
                  totalItems={productPagination.total_items}
                  itemsPerPage={productPagination.items_per_page}
                  onPageChange={setProductPage}
                />
              )}
            </>
          ) : (
            <div className="bg-white rounded-2xl p-6 sm:p-8 lg:p-12 text-center shadow-md">
              <Package className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-sm sm:text-base text-gray-600 mb-4">Belum ada produk tersedia</p>
              <Link to="/products">
                <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors">
                  Refresh Produk
                </button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;

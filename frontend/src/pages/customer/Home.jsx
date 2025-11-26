import { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Package, 
  Tag, 
  ArrowRight, 
  Sparkles,
  TrendingUp,
  Clock,
  Star,
  Zap,
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
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { formatCurrency } from '../../utils/formatCurrency';

const Home = () => {
  const { user } = useAuthStore();
  const { cart: cartItems } = useCartStore();
  
  // Debug: Check user data
  console.log('User data from store:', user);
  
  // State management
  const [categories, setCategories] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  
  // Loading states
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingDiscounts, setLoadingDiscounts] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  // Error states
  const [errorCategories, setErrorCategories] = useState(null);
  const [errorDiscounts, setErrorDiscounts] = useState(null);
  const [errorProducts, setErrorProducts] = useState(null);

  // Fetch Categories dari API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await apiClient.get('/public/categories');
        
        if (response.data.success) {
          setCategories(response.data.data.slice(0, 4)); // Ambil 4 kategori pertama
          setErrorCategories(null);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setErrorCategories('Gagal memuat kategori');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Discounts/Promo dari API
  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        setLoadingDiscounts(true);
        const response = await apiClient.get('/public/discounts');
        
        if (response.data.success) {
          setDiscounts(response.data.data.slice(0, 2)); // Ambil 2 promo utama
          setErrorDiscounts(null);
        }
      } catch (error) {
        console.error('Error fetching discounts:', error);
        setErrorDiscounts('Gagal memuat promo');
      } finally {
        setLoadingDiscounts(false);
      }
    };
    fetchDiscounts();
  }, []);

  // Fetch Featured Products dari API
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoadingProducts(true);
        const response = await apiClient.get('/public/products', {
          params: {
            sortBy: 'newest',
            limit: 6,
            page: 1
          }
        });
        
        if (response.data.success) {
          setFeaturedProducts(response.data.data.products);
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
  }, []);

  // Format tanggal untuk display promo
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get discount badge color
  const getDiscountColor = (type) => {
    return type === 'percentage' ? 'bg-red-500' : 'bg-green-500';
  };

  // Get discount display value
  const getDiscountDisplay = (discount) => {
    if (discount.discount_type === 'percentage') {
      return `${discount.discount_value}%`;
    }
    return formatCurrency(discount.discount_value);
  };

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



      {/* Promo Section - Modern Design */}
      <section className="section-py">
        <div className="container-app">
          {/* Section Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between gap-3 mb-1 sm:mb-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg flex-shrink-0">
                  <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                </div>
                <h2 className="heading-section text-gray-900">
                  Promo Spesial
                </h2>
              </div>
              <Link to="/promo">
                <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 sm:gap-2 group flex-shrink-0">
                  Lihat Semua
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
            <p className="text-caption text-gray-600">Jangan sampai kehabisan penawaran terbaik!</p>
          </div>

          {/* Promo Cards */}
          {loadingDiscounts ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-md animate-pulse">
                  <div className="h-4 sm:h-6 bg-gray-200 rounded mb-3 sm:mb-4 w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : errorDiscounts ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-md">
              <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
              <p className="text-red-600 text-lg">{errorDiscounts}</p>
            </div>
          ) : discounts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {discounts.slice(0, 3).map((discount, index) => (
                <Link
                  key={discount.id}
                  to={`/promo/${discount.id}`}
                  className="group relative bg-gradient-to-br from-white to-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden">
                
                  {/* Discount Badge */}
                  <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10">
                    <div className="px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 bg-red-500 text-white font-bold text-xs sm:text-sm lg:text-base rounded-full shadow-lg flex items-center gap-1">
                      <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                      {getDiscountDisplay(discount)}
                    </div>
                  </div>

                  {/* Decorative Element */}
                  <div className="absolute -right-6 -bottom-6 sm:-right-8 sm:-bottom-8 w-24 h-24 sm:w-32 sm:h-32 bg-red-500/5 rounded-full group-hover:scale-110 transition-transform duration-500"></div>

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="mb-3 sm:mb-4">
                      <div className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold mb-2 sm:mb-3">
                        <Star className="w-3 h-3 fill-red-500" />
                        Promo Aktif
                      </div>
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                        {discount.discount_name}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {discount.description}
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 my-3 sm:my-4"></div>

                    {/* Details */}
                    <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                      <div className="flex items-center justify-between text-gray-700">
                        <span className="flex items-center gap-1 sm:gap-2">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                          <span className="text-xs sm:text-sm">Berlaku hingga</span>
                        </span>
                        <span className="font-semibold text-xs sm:text-sm">{formatDate(discount.end_date)}</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-700">
                        <span className="flex items-center gap-1 sm:gap-2">
                          <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                          <span className="text-xs sm:text-sm">Min. Pembelian</span>
                        </span>
                        <span className="font-semibold text-xs sm:text-sm">{formatCurrency(discount.min_purchase || 0)}</span>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="mt-3 sm:mt-4">
                      <div className="flex items-center justify-between text-red-600 text-xs sm:text-sm font-semibold group-hover:text-red-700">
                        <span>Gunakan Promo</span>
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 sm:p-8 text-center shadow-sm">
              <Tag className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-sm sm:text-base text-gray-600">Belum ada promo aktif saat ini</p>
            </div>
          )}
        </div>
      </section>

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
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {featuredProducts.map((product) => (
                <ErrorBoundary key={product.id}>
                  <ProductCard product={product} />
                </ErrorBoundary>
              ))}
            </div>
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

      {/* Categories - Modern Cards */}
      <section className="section-py">
        <div className="container-app">
          {/* Section Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between gap-3 mb-1 sm:mb-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                  <Grid className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <h2 className="heading-section text-gray-900">
                  Kategori Populer
                </h2>
              </div>
              <Link to="/categories">
                <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-600 hover:bg-gray-700 text-white text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 sm:gap-2 group flex-shrink-0">
                  Semua Kategori
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
            <p className="text-caption text-gray-600">Jelajahi produk berdasarkan kategori</p>
          </div>

          {/* Categories Grid */}
          {loadingCategories ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 animate-pulse">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-200 rounded-xl mx-auto mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : errorCategories ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-md">
              <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
              <p className="text-red-600 text-lg">{errorCategories}</p>
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {categories.map((category) => (
                <Link 
                  key={category.id}
                  to={`/category/${category.id}`}
                  className="group relative bg-gradient-to-br from-white to-gray-50 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-green-400 p-3 sm:p-4 lg:p-6 text-center overflow-hidden">
                
                  {/* Hover Effect Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon Container */}
                    <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-green-100 rounded-lg sm:rounded-xl group-hover:bg-green-200 group-hover:scale-110 transition-all duration-300 mb-2 sm:mb-3">
                      <Package className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-green-600" />
                    </div>
                    
                    {/* Category Name */}
                    <h3 className="font-bold text-sm sm:text-base text-gray-900 mb-1 line-clamp-2 group-hover:text-green-600 transition-colors">
                      {category.category_name}
                    </h3>
                    
                    {/* Product Count */}
                    <p className="text-xs sm:text-sm text-gray-600">
                      {category.product_count || 0} produk
                    </p>
                  </div>

                  {/* Arrow Icon on Hover - Hidden on Mobile */}
                  <div className="hidden sm:block absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-4 h-4 text-green-600" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 sm:p-8 lg:p-12 text-center shadow-md">
              <Package className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-sm sm:text-base text-gray-600">Belum ada kategori tersedia</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;

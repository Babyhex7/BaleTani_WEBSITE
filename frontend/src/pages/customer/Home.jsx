import { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Heart, 
  TrendingUp, 
  Package, 
  Clock, 
  ArrowRight, 
  Leaf, 
  Apple, 
  Beef,
  Popcorn,
  Tag,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/store_customer/useAuthStore';
import useCartStore from '../../store/store_customer/useCartStore';
import productService from '../../services/services_customer/productService';
import apiClient from '../../utils/apiClient';
import Button from '../../components/ui/Button';
import ProductCard from '../../components/ui/ProductCard';
import ProductCardSkeleton from '../../components/ui/ProductCardSkeleton';
import ErrorBoundary from '../../components/ErrorBoundary';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { formatCurrency } from '../../utils/formatCurrency';

const Home = () => {
  const { user } = useAuthStore();
  const { cart: cartItems } = useCartStore();
  
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

  // Icon map untuk kategori
  const icons = { Leaf, Apple, Beef, Popcorn };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Welcome Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Selamat datang kembali, {user?.name || 'Customer'}!
              </h1>
              <p className="text-xl opacity-90 text-green-100">
                Apa yang ingin Anda beli hari ini?
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/products" className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-green-300 text-center p-6">
              <Package className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold">Semua Produk</h3>
              <p className="text-sm text-gray-600">Lihat katalog lengkap</p>
            </Link>

            <Link to="/promo" className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-red-300 text-center p-6">
              <Tag className="w-8 h-8 text-red-600 mx-auto mb-3" />
              <h3 className="font-semibold">Promo Spesial</h3>
              <p className="text-sm text-gray-600">Lihat semua promo</p>
            </Link>

            <Link to="/cart" className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-green-300 text-center p-6">
              <ShoppingCart className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold">Keranjang Saya</h3>
              <p className="text-sm text-gray-600">{cartItems?.length || 0} item</p>
            </Link>

            <Link to="/purchase-history" className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-blue-300 text-center p-6">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold">Riwayat</h3>
              <p className="text-sm text-gray-600">Pesanan saya</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Promo Section - REAL DATA dari BE */}
      <section className="py-8 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              <Tag className="inline mr-2" size={24} />
              Promo Spesial
            </h2>
            <Link to="/promo">
              <Button className="bg-red-600 hover:bg-red-700 text-white text-sm">
                Lihat Semua Promo
              </Button>
            </Link>
          </div>

          {loadingDiscounts ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-lg animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : errorDiscounts ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm">
              <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
              <p className="text-red-600">{errorDiscounts}</p>
            </div>
          ) : discounts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {discounts.map((discount, index) => (
                <Link
                  key={discount.id}
                  to={`/promo/${discount.id}`}
                  className={`${
                    index === 0
                      ? 'bg-gradient-to-r from-red-500 to-red-600'
                      : 'bg-gradient-to-r from-green-500 to-green-600'
                  } text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{discount.discount_name}</h3>
                      <p className="opacity-90 text-sm line-clamp-2">{discount.description}</p>
                    </div>
                    <div className="bg-white text-red-600 font-bold text-lg px-3 py-1 rounded-lg flex-shrink-0">
                      {getDiscountDisplay(discount)}
                    </div>
                  </div>
                  <div className="border-t border-white/20 pt-4 mt-4">
                    <div className="flex justify-between text-sm flex-wrap gap-2">
                      <span>Berlaku sampai: {formatDate(discount.end_date)}</span>
                      <span>Min: {formatCurrency(discount.min_purchase || 0)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm">
              <Tag className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">Belum ada promo aktif saat ini</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products - REAL DATA dari BE */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              <TrendingUp className="inline mr-2" size={24} />
              Produk Terbaru
            </h2>
            <Link to="/products">
              <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
                Lihat Semua
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : errorProducts ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm">
              <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
              <p className="text-red-600">{errorProducts}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4 bg-green-600 hover:bg-green-700 text-white"
              >
                Coba Lagi
              </Button>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <ErrorBoundary key={product.id}>
                  <ProductCard product={product} />
                </ErrorBoundary>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">Belum ada produk tersedia</p>
              <Link to="/products" className="mt-4 inline-block">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  Refresh Produk
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Categories - REAL DATA dari BE */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Kategori Populer</h2>
            <Link to="/categories">
              <Button className="bg-gray-600 hover:bg-gray-700 text-white text-sm">
                Semua Kategori
              </Button>
            </Link>
          </div>

          {loadingCategories ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 rounded-full mx-auto mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : errorCategories ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm">
              <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
              <p className="text-red-600">{errorCategories}</p>
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category, index) => {
                // Default icons based on category name or index
                const iconMap = {
                  0: Leaf,
                  1: Apple,
                  2: Beef,
                  3: Popcorn
                };
                const IconComponent = iconMap[index] || Package;
                
                return (
                  <Link 
                    key={category.id}
                    to={`/category/${category.id}`}
                    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-green-300 text-center p-6 group"
                  >
                    <IconComponent className="w-10 h-10 text-green-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-gray-900">{category.category_name}</h3>
                    <p className="text-sm text-gray-600">{category.product_count || 0} produk</p>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">Belum ada kategori tersedia</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;

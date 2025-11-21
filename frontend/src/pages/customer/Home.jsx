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
  Popcorn
} from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/store_customer/useAuthStore';
import productService from '../../services/services_customer/productService';
import Button from '../../components/ui/Button';
import ProductCard from '../../components/ui/ProductCard';
import ProductCardSkeleton from '../../components/ui/ProductCardSkeleton';
import ErrorBoundary from '../../components/ErrorBoundary';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const Home = () => {
  const { user } = useAuthStore();
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await productService.getFeaturedProducts(6);
        if (response.success) {
          setFeaturedProducts(response.data);
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedProducts();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleAddToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }

    alert(`${product.name} ditambahkan ke keranjang`);
  };

  const handleToggleWishlist = (product) => {
    const isInWishlist = wishlist.find(item => item.id === product.id);

    if (isInWishlist) {
      setWishlist(wishlist.filter(item => item.id !== product.id));
      alert(`${product.name} dihapus dari wishlist`);
    } else {
      setWishlist([...wishlist, product]);
      alert(`${product.name} ditambahkan ke wishlist`);
    }
  };

  const handleWhatsAppOrder = (productName, price, unit) => {
    const userName = user?.name || 'Customer';
    const message = `Halo, saya ${userName} ingin memesan ${productName} seharga ${formatPrice(price)}/${unit}. Mohon info ketersediaan dan cara pemesanannya. Terima kasih!`;
    const whatsappUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
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
              <TrendingUp className="w-8 h-8 text-red-600 mx-auto mb-3" />
              <h3 className="font-semibold">Promo Spesial</h3>
              <p className="text-sm text-gray-600">Lihat semua promo</p>
            </Link>

            <Link to="/cart" className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-green-300 text-center p-6">
              <ShoppingCart className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold">Keranjang Saya</h3>
              <p className="text-sm text-gray-600">{cart.length} item menunggu</p>
            </Link>

            <Link to="/wishlist" className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-pink-300 text-center p-6">
              <Heart className="w-8 h-8 text-pink-600 mx-auto mb-3" />
              <h3 className="font-semibold">Wishlist</h3>
              <p className="text-sm text-gray-600">{wishlist.length} produk favorit</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Member Promos */}
      <section className="py-8 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Promo Khusus Member</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl p-6 shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">Diskon 20% Produk Segar</h3>
                  <p className="opacity-90">Berlaku untuk semua produk kategori Sayuran & Buah</p>
                </div>
                <div className="bg-white text-red-600 font-bold text-lg px-3 py-1 rounded-lg">
                  20%
                </div>
              </div>
              <div className="border-t border-white/20 pt-4 mt-4">
                <div className="flex justify-between text-sm">
                  <span>Berlaku sampai: 31 Okt 2025</span>
                  <span>Min. pembelian: Rp 100.000</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">Gratis Ongkir</h3>
                  <p className="opacity-90">Pengiriman gratis ke seluruh Indonesia</p>
                </div>
                <div className="bg-white text-green-600 font-bold text-lg px-3 py-1 rounded-lg">
                  FREE
                </div>
              </div>
              <div className="border-t border-white/20 pt-4 mt-4">
                <div className="flex justify-between text-sm">
                  <span>Berlaku sampai: 15 Nov 2025</span>
                  <span>Min. pembelian: Rp 150.000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              <TrendingUp className="inline mr-2" size={24} />
              Produk Unggulan Hari Ini
            </h2>
            <Link to="/products">
              <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
                Lihat Semua
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <ProductCardSkeleton count={6} />
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <ErrorBoundary key={product.id}>
                  <ProductCard
                    product={product}
                    formatPrice={formatPrice}
                    onWhatsAppOrder={handleWhatsAppOrder}
                    onAddToCart={handleAddToCart}
                  />
                </ErrorBoundary>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">Belum ada produk unggulan</p>
            </div>
          )}
        </div>
      </section>

      {/* Categories Quick Access */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Kategori Populer</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Sayuran', icon: 'Leaf', count: '15 produk', href: '/products?category=sayuran' },
              { name: 'Buah', icon: 'Apple', count: '8 produk', href: '/products?category=buah' },
              { name: 'Daging', icon: 'Beef', count: '6 produk', href: '/products?category=daging' },
              { name: 'Bumbu', icon: 'Popcorn', count: '5 produk', href: '/products?category=bumbu' }
            ].map((category) => {
              const IconComponent = icons[category.icon];

              return (
                <Link 
                  key={category.name}
                  to={category.href}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-green-300 text-center p-6"
                >
                  <IconComponent className="w-10 h-10 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-600">{category.count}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Aktivitas Terakhir</h2>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="text-center text-gray-500 py-8">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Belum ada aktivitas pembelian</p>
              <p className="text-sm">Mulai berbelanja untuk melihat riwayat aktivitas Anda</p>
              <Link to="/products" className="mt-4 inline-block">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  Mulai Belanja
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;

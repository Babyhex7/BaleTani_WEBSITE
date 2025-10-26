import { useState, useEffect } from 'react';
import { ShoppingCart, Star, MessageCircle, Heart, TrendingUp, Package, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/store_customer/useAuthStore';
import productService from '../../services/services_customer/productService';
import Button from '../../components/ui/Button';
import ProductCard from '../../components/ui/ProductCard';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

/**
 * Komponen Home untuk pengguna yang sudah login
 * Menampilkan dashboard personal, produk rekomendasi, dan fitur khusus member
 */
const Home = () => {
  const { user } = useAuthStore();
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch featured products from API
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

  // Data promo khusus member
  const memberPromos = [
    {
      id: 1,
      title: 'Diskon 20% Seafood Fresh',
      description: 'Berlaku untuk semua produk seafood',
      discount: '20%',
      validUntil: '2025-10-10',
      minPurchase: 100000
    },
    {
      id: 2,
      title: 'Gratis Ongkir',
      description: 'Pembelian minimal Rp 150.000',
      discount: 'FREE',
      validUntil: '2025-10-15',
      minPurchase: 150000
    }
  ];

  /**
   * Fungsi untuk memformat harga dalam format rupiah
   * @param {number} price - Harga dalam angka
   * @returns {string} Harga dalam format Rupiah
   */
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  /**
   * Fungsi untuk menambahkan produk ke keranjang
   * @param {object} product - Data produk
   */
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

  /**
   * Fungsi untuk menambahkan/menghapus dari wishlist
   * @param {object} product - Data produk
   */
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

  /**
   * Fungsi untuk pemesanan via WhatsApp
   * @param {string} productName - Nama produk
   * @param {number} price - Harga produk
   * @param {string} unit - Unit produk
   */
  const handleWhatsAppOrder = (productName, price, unit) => {
    const userName = user?.name || 'Customer';
    const message = `Halo, saya ${userName} ingin memesan ${productName} seharga ${formatPrice(price)}/${unit}. Mohon info ketersediaan dan cara pemesanannya. Terima kasih!`;
    const whatsappUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Welcome Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Selamat datang kembali, {user?.name || 'Customer'}! 👋
              </h1>
              <p className="text-xl opacity-90 text-green-100">
                Apa yang ingin Anda beli hari ini?
              </p>
            </div>
            
            <div className="flex space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{cart.length}</div>
                <div className="text-sm opacity-90">Item di Keranjang</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{wishlist.length}</div>
                <div className="text-sm opacity-90">Wishlist</div>
              </div>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🎉 Promo Khusus Member</h2>
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
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Memuat produk...</p>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  formatPrice={formatPrice}
                  onWhatsAppOrder={handleWhatsAppOrder}
                  onAddToCart={handleAddToCart}
                />
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
              { name: 'Sayuran', icon: '🥬', count: '15 produk', href: '/products?category=sayuran' },
              { name: 'Buah', icon: '🍎', count: '8 produk', href: '/products?category=buah' },
              { name: 'Daging', icon: '🥩', count: '6 produk', href: '/products?category=daging' },
              { name: 'Seafood', icon: '🐟', count: '5 produk', href: '/products?category=seafood' }
            ].map((category) => (
              <Link 
                key={category.name}
                to={category.href}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-green-300 text-center p-6"
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.count}</p>
              </Link>
            ))}
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
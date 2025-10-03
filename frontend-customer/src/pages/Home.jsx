import { useState, useEffect } from 'react';
import { ShoppingCart, Star, MessageCircle, Heart, TrendingUp, Package, Clock, Filter, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import Button from '../components/ui/Button';

/**
 * Komponen Home untuk pengguna yang sudah login
 * Menampilkan dashboard personal, produk rekomendasi, dan fitur khusus member
 */
const Home = () => {
  const { user } = useAuthStore();
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  // Data produk rekomendasi berdasarkan history user
  const recommendedProducts = [
    {
      id: 1,
      name: 'Udang Sedang Fresh',
      price: 65000,
      originalPrice: 70000,
      image: '/api/placeholder/300/300',
      category: 'Seafood',
      stock: 50,
      discount: 7,
      unit: 'kg',
      rating: 4.8,
      sold: 125
    },
    {
      id: 7,
      name: 'Ayam Filet Premium',
      price: 43000,
      originalPrice: 48000,
      image: '/api/placeholder/300/300',
      category: 'Daging & Unggas',
      stock: 30,
      discount: 10,
      unit: 'kg',
      rating: 4.9,
      sold: 89
    },
    {
      id: 24,
      name: 'Apel Segar',
      price: 30000,
      originalPrice: 35000,
      image: '/api/placeholder/300/300',
      category: 'Buah',
      stock: 25,
      discount: 14,
      unit: 'kg',
      rating: 4.7,
      sold: 156
    }
  ];

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
    
    toast.success(`${product.name} ditambahkan ke keranjang`);
  };

  /**
   * Fungsi untuk menambahkan/menghapus dari wishlist
   * @param {object} product - Data produk
   */
  const handleToggleWishlist = (product) => {
    const isInWishlist = wishlist.find(item => item.id === product.id);
    
    if (isInWishlist) {
      setWishlist(wishlist.filter(item => item.id !== product.id));
      toast.success(`${product.name} dihapus dari wishlist`);
    } else {
      setWishlist([...wishlist, product]);
      toast.success(`${product.name} ditambahkan ke wishlist`);
    }
  };

  /**
   * Fungsi untuk pemesanan via WhatsApp
   * @param {string} productName - Nama produk
   * @param {number} price - Harga produk
   * @param {string} unit - Unit produk
   */
  const handleWhatsAppOrder = (productName, price, unit) => {
    const message = `Halo, saya ${user?.name} ingin memesan ${productName} seharga ${formatPrice(price)}/${unit}. Mohon info ketersediaan dan cara pemesanannya. Terima kasih!`;
    const whatsappUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Section */}
      <section className="bg-gradient-to-r from-primary-500 to-primary-600 text-white py-12">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Selamat datang kembali, {user?.name}! 👋
              </h1>
              <p className="text-xl opacity-90">
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
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/products" className="card card-hover text-center p-6">
              <Package className="w-8 h-8 text-primary-500 mx-auto mb-3" />
              <h3 className="font-semibold">Semua Produk</h3>
              <p className="text-sm text-gray-600">Lihat katalog lengkap</p>
            </Link>
            
            <Link to="/cart" className="card card-hover text-center p-6">
              <ShoppingCart className="w-8 h-8 text-primary-500 mx-auto mb-3" />
              <h3 className="font-semibold">Keranjang Saya</h3>
              <p className="text-sm text-gray-600">{cart.length} item menunggu</p>
            </Link>
            
            <Link to="/orders" className="card card-hover text-center p-6">
              <Clock className="w-8 h-8 text-primary-500 mx-auto mb-3" />
              <h3 className="font-semibold">Pesanan Saya</h3>
              <p className="text-sm text-gray-600">Lacak pesanan Anda</p>
            </Link>
            
            <Link to="/wishlist" className="card card-hover text-center p-6">
              <Heart className="w-8 h-8 text-primary-500 mx-auto mb-3" />
              <h3 className="font-semibold">Wishlist</h3>
              <p className="text-sm text-gray-600">{wishlist.length} produk favorit</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Member Promos */}
      <section className="py-8">
        <div className="container-custom">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🎉 Promo Khusus Member</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {memberPromos.map((promo) => (
              <div key={promo.id} className="bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{promo.title}</h3>
                    <p className="opacity-90">{promo.description}</p>
                  </div>
                  <div className="bg-white text-accent-600 font-bold text-lg px-3 py-1 rounded-lg">
                    {promo.discount}
                  </div>
                </div>
                <div className="border-t border-white/20 pt-4 mt-4">
                  <div className="flex justify-between text-sm">
                    <span>Berlaku sampai: {promo.validUntil}</span>
                    <span>Min. pembelian: {formatPrice(promo.minPurchase)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended Products */}
      <section className="py-8">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              <TrendingUp className="inline mr-2" size={24} />
              Rekomendasi Untuk Anda
            </h2>
            <Link to="/products">
              <Button variant="outline">Lihat Semua</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendedProducts.map((product) => (
              <div key={product.id} className="card card-hover group">
                <div className="relative overflow-hidden rounded-t-xl">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.discount > 0 && (
                    <div className="promo-badge">
                      -{product.discount}%
                    </div>
                  )}
                  <button
                    onClick={() => handleToggleWishlist(product)}
                    className={`absolute top-2 right-2 p-2 rounded-full ${
                      wishlist.find(item => item.id === product.id)
                        ? 'bg-red-500 text-white'
                        : 'bg-white/80 text-gray-600 hover:bg-white'
                    } transition-colors`}
                  >
                    <Heart size={16} />
                  </button>
                  <div className="absolute top-2 left-2 bg-primary-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    {product.category}
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{product.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-primary-500">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-sm text-gray-500">/{product.unit}</span>
                      {product.originalPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Stok: {product.stock}</span>
                    <div className="flex items-center space-x-1">
                      <Star className="text-yellow-400 fill-current" size={16} />
                      <span>{product.rating}</span>
                      <span>({product.sold} terjual)</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      variant="primary" 
                      className="w-full"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart className="mr-2" size={16} />
                      Tambah ke Keranjang
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleWhatsAppOrder(product.name, product.price, product.unit)}
                    >
                      <MessageCircle className="mr-2" size={16} />
                      Pesan via WhatsApp
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Quick Access */}
      <section className="py-8 bg-white">
        <div className="container-custom">
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
                className="card card-hover text-center p-6"
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
        <div className="container-custom">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Aktivitas Terakhir</h2>
          <div className="card p-6">
            <div className="text-center text-gray-500 py-8">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Belum ada aktivitas pembelian</p>
              <p className="text-sm">Mulai berbelanja untuk melihat riwayat aktivitas Anda</p>
              <Link to="/products" className="mt-4 inline-block">
                <Button variant="primary">Mulai Belanja</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
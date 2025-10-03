import { useState, useEffect } from 'react';
import { ShoppingCart, Star, MessageCircle, Heart, TrendingUp, Package, Clock, Filter } from 'lucide-react';
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

import { useState, useEffect } from 'react';
import { ShoppingCart, Star, MessageCircle, Heart, TrendingUp, Package, Clock, Filter } from 'lucide-react';
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

            <div className="relative">
              <div className="relative z-10">
                <img 
                  src="/api/placeholder/600/500" 
                  alt="Fresh Market Products" 
                  className="rounded-2xl shadow-2xl w-full h-auto animate-float"
                />
              </div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-secondary-400 rounded-full opacity-20 animate-pulse-slow"></div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-accent-500 rounded-full opacity-20 animate-pulse-slow"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Promo Section */}
      <section className="bg-gradient-to-r from-accent-500 to-accent-600 text-white py-12">
        <div className="container-custom">
          <div className="text-center space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold">🔥 Promo Hari Ini!</h2>
            <p className="text-xl">Dapatkan diskon hingga 30% untuk pembelian paket sayur mingguan</p>
            <Button variant="secondary" size="lg" className="mt-4">
              Lihat Semua Promo
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="products" className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Produk Unggulan Hari Ini
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Pilihan terbaik produk segar dengan kualitas premium dan harga terjangkau
            </p>
          </div>

          <div className="product-grid mb-12">
            {featuredProducts.map((product) => (
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
                      {product.originalPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Stok: {product.stock} tersedia</span>
                    <div className="flex items-center space-x-1">
                      <Star className="text-yellow-400 fill-current" size={16} />
                      <span>4.8</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <a
                      href={generateWhatsAppMessage(product.name, product.price)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button variant="accent" className="w-full">
                        <MessageCircle className="mr-2" size={16} />
                        Pesan via WhatsApp
                      </Button>
                    </a>
                    <Button variant="outline" className="w-full">
                      <ShoppingCart className="mr-2" size={16} />
                      Tambah ke Keranjang
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/products">
              <Button variant="primary" size="lg">
                Lihat Semua Produk
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Kategori Produk
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Temukan berbagai macam produk segar berkualitas dalam setiap kategori
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link 
                key={category.name} 
                to={category.href}
                className="card card-hover group"
              >
                <div className="relative overflow-hidden rounded-t-xl">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                    <p className="text-sm opacity-90">{category.itemCount} produk</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-600 text-sm">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Testimoni Pelanggan
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Apa kata pelanggan setia BaleTani tentang produk dan layanan kami
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="card">
                <div className="p-6 space-y-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="text-yellow-400 fill-current" size={16} />
                    ))}
                  </div>
                  <p className="text-gray-700 italic">"{testimonial.comment}"</p>
                  <div className="flex items-center space-x-3">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Tentang BaleTani Fresh Market
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Kami berkomitmen menyediakan produk segar berkualitas tinggi langsung dari kebun ke rumah Anda. 
                  Dengan visi menjadi brand yang jujur dan terpercaya, kami memastikan setiap produk yang sampai 
                  ke tangan Anda adalah yang terbaik.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Produk Segar Berkualitas</h3>
                    <p className="text-gray-600">Langsung dari kebun pilihan dengan standar kualitas tinggi</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Pengiriman Cepat & Aman</h3>
                    <p className="text-gray-600">Sistem pengiriman terpercaya untuk menjaga kesegaran produk</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Harga Terjangkau</h3>
                    <p className="text-gray-600">Harga bersahabat tanpa mengurangi kualitas produk</p>
                  </div>
                </div>
              </div>

              <div className="bg-primary-50 p-6 rounded-xl">
                <p className="text-primary-700 font-semibold text-lg italic text-center">
                  "Dari kebun ke Balé, dari Balé ke rumahmu"
                </p>
              </div>
            </div>

            <div className="relative">
              <img 
                src="/api/placeholder/500/400" 
                alt="About BaleTani" 
                className="rounded-2xl shadow-xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-500 to-primary-600 text-white section-padding">
        <div className="container-custom text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              Siap Belanja Produk Segar Hari Ini?
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Jangan tunggu lagi! Pesan sekarang dan nikmati kesegaran langsung dari kebun
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/6281234567890?text=Halo%2C%20saya%20tertarik%20untuk%20berbelanja%20di%20BaleTani%20Fresh%20Market"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="secondary" size="lg" className="text-lg px-8">
                <MessageCircle className="mr-2" size={20} />
                Pesan via WhatsApp
              </Button>
            </a>
            <Link to="/products">
              <Button variant="outline" size="lg" className="text-lg px-8 border-white text-white hover:bg-white hover:text-primary-500">
                Lihat Katalog Produk
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
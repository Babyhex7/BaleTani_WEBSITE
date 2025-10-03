import { ArrowRight, ShoppingCart, Star, MessageCircle, Truck, Shield, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import Button from '../components/ui/Button';

/**
 * Komponen Landing Page untuk BaleTani Fresh Market
 * Menampilkan hero section, produk unggulan, kategori, dan informasi bisnis
 */
const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // Data produk unggulan untuk ditampilkan di landing page
  const featuredProducts = [
    {
      id: 1,
      name: 'Udang Sedang Fresh',
      price: 65000,
      originalPrice: 70000,
      image: '/api/placeholder/300/300',
      category: 'Seafood',
      stock: 50,
      discount: 7,
      unit: 'kg'
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
      unit: 'kg'
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
      unit: 'kg'
    },
    {
      id: 19,
      name: 'Tomat Segar',
      price: 10000,
      originalPrice: 12000,
      image: '/api/placeholder/300/300',
      category: 'Sayuran',
      stock: 40,
      discount: 17,
      unit: 'kg'
    }
  ];

  // Data kategori produk
  const categories = [
    {
      name: 'Sayuran Segar',
      description: 'Sayuran organik langsung dari kebun',
      image: '/api/placeholder/250/200',
      itemCount: 15,
      href: '/products?category=sayuran'
    },
    {
      name: 'Buah-buahan',
      description: 'Buah segar dan manis pilihan terbaik',
      image: '/api/placeholder/250/200',
      itemCount: 8,
      href: '/products?category=buah'
    },
    {
      name: 'Daging & Unggas',
      description: 'Daging dan unggas segar berkualitas premium',
      image: '/api/placeholder/250/200',
      itemCount: 6,
      href: '/products?category=daging'
    },
    {
      name: 'Seafood',
      description: 'Ikan dan seafood langsung dari laut',
      image: '/api/placeholder/250/200',
      itemCount: 5,
      href: '/products?category=seafood'
    }
  ];

  // Data testimoni pelanggan
  const testimonials = [
    {
      id: 1,
      name: 'Sari Dewi',
      location: 'Jakarta',
      rating: 5,
      comment: 'Produknya selalu segar dan berkualitas! Pengiriman juga cepat. Recommended banget!',
      image: '/api/placeholder/60/60'
    },
    {
      id: 2,
      name: 'Budi Santoso',
      location: 'Bogor',
      rating: 5,
      comment: 'Harga terjangkau dan produknya fresh. Sudah berlangganan di BaleTani lebih dari 6 bulan.',
      image: '/api/placeholder/60/60'
    },
    {
      id: 3,
      name: 'Maya Indah',
      location: 'Depok',
      rating: 5,
      comment: 'Paket sayur mingguannya sangat membantu untuk kebutuhan rumah tangga. Terima kasih BaleTani!',
      image: '/api/placeholder/60/60'
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
   * Fungsi untuk menangani pemesanan via WhatsApp
   * Mengecek status login sebelum mengizinkan pemesanan
   * @param {string} productName - Nama produk
   * @param {number} price - Harga produk
   * @param {string} unit - Unit produk (kg, pcs, dll)
   */
  const handleWhatsAppOrder = (productName, price, unit) => {
    if (!isAuthenticated) {
      toast.error('Silakan login terlebih dahulu untuk memesan produk');
      navigate('/login');
      return;
    }

    const message = `Halo, saya tertarik dengan ${productName} seharga ${formatPrice(price)}/${unit}. Mohon info ketersediaan dan cara pemesanannya. Terima kasih!`;
    const whatsappUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  /**
   * Fungsi untuk menangani penambahan ke keranjang
   * Mengecek status login sebelum mengizinkan penambahan ke keranjang
   * @param {object} product - Data produk
   */
  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      toast.error('Silakan login terlebih dahulu untuk menambah ke keranjang');
      navigate('/login');
      return;
    }

    // TODO: Implementasi add to cart
    toast.success(`${product.name} berhasil ditambahkan ke keranjang`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="hero-gradient section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Belanja Segar & Hemat,{' '}
                  <span className="text-gradient">Langsung dari Kebun</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Pilih produk terbaik, pesan instan via WhatsApp. 
                  Dari kebun ke Balé, dari Balé ke rumahmu.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="text-lg px-8"
                  onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}
                >
                  Belanja Sekarang
                  <ArrowRight className="ml-2" size={20} />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8"
                  onClick={() => handleWhatsAppOrder('Konsultasi Produk', 0, 'gratis')}
                >
                  <MessageCircle className="mr-2" size={20} />
                  Hubungi WhatsApp
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap gap-8 pt-8 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <Shield className="text-primary-500" size={20} />
                  <span className="text-sm font-medium text-gray-700">100% Segar</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="text-primary-500" size={20} />
                  <span className="text-sm font-medium text-gray-700">Pengiriman Cepat</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="text-primary-500" size={20} />
                  <span className="text-sm font-medium text-gray-700">Order 24/7</span>
                </div>
              </div>
            </div>

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
            <p className="text-xl">Dapatkan produk segar terbaik dengan harga spesial</p>
            <Link to="/products">
              <Button variant="secondary" size="lg" className="mt-4">
                Lihat Semua Produk
              </Button>
            </Link>
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
                      <span className="text-sm text-gray-500">/{product.unit}</span>
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
                    <Button 
                      variant="accent" 
                      className="w-full"
                      onClick={() => handleWhatsAppOrder(product.name, product.price, product.unit)}
                    >
                      <MessageCircle className="mr-2" size={16} />
                      Pesan via WhatsApp
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleAddToCart(product)}
                    >
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
            <Button
              variant="secondary"
              size="lg"
              className="text-lg px-8"
              onClick={() => handleWhatsAppOrder('Konsultasi Pemesanan', 0, 'gratis')}
            >
              <MessageCircle className="mr-2" size={20} />
              Pesan via WhatsApp
            </Button>
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

export default LandingPage;
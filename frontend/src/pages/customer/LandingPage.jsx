import { ArrowRight, MessageCircle, Truck, Shield, Clock, Users, Award, CheckCircle, Leaf, Heart, Zap, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/store_customer/useAuthStore';
import Button from '../../components/ui/Button';
import ProductCard from '../../components/ui/ProductCard';

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

  // Data statistik dan pencapaian
  const achievements = [
    { number: '500+', label: 'Produk Segar', icon: Leaf },
    { number: '10,000+', label: 'Pelanggan Puas', icon: Users },
    { number: '24/7', label: 'Layanan', icon: Clock },
    { number: '100%', label: 'Terpercaya', icon: Award }
  ];

  // Data keunggulan BaleTani
  const benefits = [
    {
      icon: Shield,
      title: 'Jaminan Kesegaran',
      description: 'Produk segar langsung dari kebun dengan standar kualitas premium dan jaminan uang kembali'
    },
    {
      icon: Truck,
      title: 'Pengiriman Express',
      description: 'Pengiriman cepat dan aman dalam 24 jam dengan sistem cold chain untuk menjaga kesegaran'
    },
    {
      icon: Heart,
      title: 'Ramah Lingkungan',
      description: 'Mendukung petani lokal dan praktik pertanian berkelanjutan untuk masa depan yang lebih hijau'
    },
    {
      icon: Zap,
      title: 'Pesan Instan',
      description: 'Pemesanan mudah via WhatsApp 24/7 dengan respon cepat dan pelayanan yang ramah'
    }
  ];
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
    <div className="min-h-screen  bg-white">
      {/* Hero Section */}
      <section className="relative bg-white py-16 lg:py-18">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-blue-50 opacity-40"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                  Segar Langsung dari Kebun
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Belanja Segar & Hemat,{' '}
                  <span className="text-green-600">Langsung dari Kebun</span>
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Nikmati produk segar berkualitas premium dengan pengiriman cepat. 
                  Pesan mudah via WhatsApp, dari kebun ke meja makan Anda.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="small" 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}
                >
                  Belanja Sekarang
                  <ArrowRight className="ml-2" size={20} />
                </Button>
                <Button 
                  variant="outline" 
                  size="small" 
                  className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                  onClick={() => handleWhatsAppOrder('Konsultasi Produk', 0, 'gratis')}
                >
                  <MessageCircle className="mr-2" size={20} />
                  Chat WhatsApp
                </Button>
              </div>

             
            </div>

            <div className="relative">
              <div className="relative z-10">
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <img 
                    src="/api/placeholder/600/500" 
                    alt="Fresh Market Products" 
                    className="rounded-xl w-full h-auto"
                  />
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-green-200 rounded-full opacity-60"></div>
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-blue-200 rounded-full opacity-60"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => {
              const IconComponent = achievement.icon;
              return (
                <div key={index} className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <IconComponent className="text-green-600" size={24} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{achievement.number}</div>
                  <div className="text-gray-600 text-sm font-medium">{achievement.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Special Offer Banner */}
      <section className="py-8 bg-green-600">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Promo Spesial Hari Ini!</h2>
            <p className="text-lg text-green-100">Diskon hingga 25% untuk pembelian pertama</p>
            <Button 
              variant="secondary" 
              size="md"
              className="bg-white text-green-600 hover:bg-gray-100"
              onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}
            >
              Belanja Sekarang
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="products" className="py-16 bg-white">
        <div className="container w-full mx-auto px-2 max-w-screen-xl">
          <div className="text-center space-y-4 mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-4">
              Produk Terlaris
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Produk Unggulan Hari Ini
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Pilihan terbaik produk segar dengan kualitas premium dan harga terjangkau untuk keluarga Indonesia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onWhatsAppOrder={handleWhatsAppOrder}
                onAddToCart={handleAddToCart}
                formatPrice={formatPrice}
              />
            ))}
          </div>

          <div className="text-center">
            <Link to="/products">
              <Button 
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Lihat Semua Produk
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Mengapa Pilih BaleTani?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Kami berkomitmen memberikan pengalaman belanja terbaik dengan jaminan kualitas dan layanan premium
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className="p-6 bg-white rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all duration-300 group">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors duration-300">
                    <IconComponent className="text-green-600" size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Kategori Produk Pilihan
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Jelajahi koleksi lengkap produk segar berkualitas premium dari berbagai kategori terbaik
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link 
                key={category.name} 
                to={category.href}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-green-200"
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-300"></div>
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                    <span className="text-xs font-semibold text-gray-800">{category.itemCount} produk</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-green-600 transition-colors duration-300">{category.name}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
              Kata Mereka
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Testimoni Pelanggan Setia
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ribuan pelanggan telah merasakan pengalaman berbelanja terbaik bersama BaleTani
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="space-y-4">
                  <div className="flex items-center space-x-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="text-yellow-400 fill-current" size={18} />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 leading-relaxed">
                    "{testimonial.comment}"
                  </blockquote>
                  <div className="flex items-center space-x-3 pt-3 border-t border-gray-100">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                      <p className="text-gray-600 text-sm">{testimonial.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                  Tentang Kami
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  BaleTani Fresh Market
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Kami berkomitmen menyediakan produk segar berkualitas tinggi langsung dari kebun ke rumah Anda. 
                  Dengan visi menjadi brand yang jujur dan terpercaya, kami memastikan setiap produk yang sampai 
                  ke tangan Anda adalah yang terbaik.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="text-green-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Produk Segar Berkualitas</h3>
                    <p className="text-gray-600 text-sm">Langsung dari kebun pilihan dengan standar kualitas tinggi dan proses seleksi ketat</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Pengiriman Cepat & Aman</h3>
                    <p className="text-gray-600 text-sm">Sistem pengiriman terpercaya dengan cold chain untuk menjaga kesegaran produk</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Harga Terjangkau</h3>
                    <p className="text-gray-600 text-sm">Harga bersahabat langsung dari petani tanpa mengurangi kualitas produk</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
                <p className="text-green-800 font-bold text-lg text-center leading-relaxed">
                  "Dari kebun ke Balé, dari Balé ke rumahmu"
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white p-4 rounded-2xl shadow-lg">
                <img 
                  src="/api/placeholder/500/400" 
                  alt="About BaleTani" 
                  className="rounded-xl w-full h-auto"
                />
              </div>
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-green-200 rounded-full opacity-60"></div>
              <div className="absolute -bottom-4 -left-4 w-10 h-10 bg-blue-200 rounded-full opacity-60"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-600">
        <div className="container mx-auto px-4 text-center space-y-6">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Siap Belanja Produk Segar Hari Ini?
            </h2>
            <p className="text-lg text-green-100 max-w-2xl mx-auto leading-relaxed">
              Bergabunglah dengan ribuan pelanggan yang telah merasakan pengalaman berbelanja terbaik. 
              Pesan sekarang dan nikmati kesegaran langsung dari kebun!
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="whatsapp"
              size="lg"
              className="focus:ring-[#25D366]"
              onClick={() => handleWhatsAppOrder('Konsultasi Produk', 0, 'gratis')}
            >
              <MessageCircle className="mr-2" size={20} />
              Chat WhatsApp
            </Button>

            <Link to="/products">
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white text-white hover:bg-white hover:text-green-600"
              >
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
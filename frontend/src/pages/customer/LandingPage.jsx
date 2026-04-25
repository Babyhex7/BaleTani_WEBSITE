import { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, MessageCircle, Truck, Shield, Clock, Users, Award, CheckCircle, 
  Leaf, Heart, Zap, Star, ChevronLeft, ChevronRight, 
  Salad, Apple, Beef, Fish, Soup, Milk, ShoppingBag, Carrot 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import Button from '../../components/ui/Button';
import { getWhatsAppURL } from '../../utils/contactConfig';
import ProductCard from '../../components/ui/ProductCard';
import ProductCardSkeleton from '../../components/ui/ProductCardSkeleton';
import ErrorBoundary from '../../components/ErrorBoundary';
import productService from '../../services/services_customer/productService';
import categoryService from '../../services/services_customer/categoryService';
// Navbar & Footer disediakan oleh CustomerLayout pada routing level

/**
 * Komponen Landing Page untuk BaleTani Fresh Market
 * Menampilkan hero section, produk unggulan, kategori, dan informasi bisnis
 * Dengan animasi Framer Motion dan data dari API
 */
const LandingPage = () => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  
  // State untuk data dari API
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Refs untuk infinite carousel
  const carouselRef = useRef(null);
  const autoPlayRef = useRef(null);

  // Fetch data dari API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch products dan categories secara parallel
        const [productsResponse, categoriesResponse] = await Promise.all([
          productService.getAllProducts({ limit: 12, sortBy: 'newest' }),
          categoryService.getAllCategories()
        ]);
        
        if (productsResponse.success) {
          setProducts(productsResponse.data.products || []);
        }
        
        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data || []);
        }
      } catch (error) {
        console.error('Error fetching landing page data:', error);
        toast.error('Gagal memuat data produk');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto play carousel
  useEffect(() => {
    if (products.length > 0) {
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % products.length);
      }, 5000); // Change slide every 5 seconds

      return () => {
        if (autoPlayRef.current) {
          clearInterval(autoPlayRef.current);
        }
      };
    }
  }, [products.length]);

  // Navigate carousel
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % products.length);
    resetAutoPlay();
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + products.length) % products.length);
    resetAutoPlay();
  };

  const resetAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % products.length);
      }, 5000);
    }
  };

  // Get visible slides - responsive: 4 mobile, 6 tablet, 10 desktop
  const getVisibleProducts = () => {
    if (products.length === 0) return [];
    
    // Show 10 products at a time (2x5 grid on mobile, 2x3 on tablet, 2x5 on desktop)
    const result = [];
    const itemsToShow = 10;
    
    for (let i = 0; i < Math.min(itemsToShow, products.length); i++) {
      const index = (currentSlide + i) % products.length;
      result.push(products[index]);
    }
    return result;
  };

  // Helper function untuk icon kategori - returns Icon Component
  const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || '';
    if (name.includes('sayur')) return Salad;
    if (name.includes('buah')) return Apple;
    if (name.includes('daging') || name.includes('unggas') || name.includes('ayam')) return Beef;
    if (name.includes('seafood') || name.includes('ikan') || name.includes('udang')) return Fish;
    if (name.includes('bumbu') || name.includes('rempah')) return Soup;
    if (name.includes('susu') || name.includes('dairy')) return Milk;
    if (name.includes('wortel') || name.includes('carrot')) return Carrot;
    return ShoppingBag;
  };

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
   * Langsung redirect ke WhatsApp tanpa perlu login
   * Format pesan umum tanpa detail produk spesifik
   */
  const handleWhatsAppOrder = () => {
    const message = `Halo BaleTani, saya tertarik dengan produk di BaleTani. Mohon info ketersediaan, harga, dan cara pemesanannya. Terima kasih!`;
    const whatsappUrl = getWhatsAppURL(message);
    window.open(whatsappUrl, '_blank');
  };

  const handleAddToCart = () => {
    handleWhatsAppOrder();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Full Width Image dengan Overlay */}
      <section className="relative min-h-[60vh] md:min-h-[70vh] lg:min-h-[80vh] overflow-hidden">
        {/* Background Image dengan Overlay */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1200&h=800&fit=crop" 
            alt="Fresh Organic Vegetables" 
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay untuk readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/40"></div>
          
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2djRoNHYtNGgtNHptLTIgNnY0aDR2LTRoLTR6bS00IDR2NGg0di00aC00em0tMiA2djRoNHYtNGgtNHptLTQgNHY0aDR2LTRoLTR6bS0yIDZ2NGg0di00aC00em0tNCA0djRoNHYtNGgtNHptLTIgNnY0aDR2LTRoLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 container-app h-full min-h-[60vh] md:min-h-[70vh] lg:min-h-[80vh] flex items-center">
          <div className="w-full max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6 md:space-y-8"
            >
              {/* Badge */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium"
              >
                <Leaf className="w-4 h-4 mr-2" />
                100% Produk Organik Segar
              </motion.div>

              {/* Main Heading */}
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
              >
                Belanja Sayur & Buah
                <br />
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-green-400"
                >
                  Segar Setiap Hari
                </motion.span>
              </motion.h1>

              {/* Description */}
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="text-base sm:text-lg md:text-xl text-white/90 max-w-xl leading-relaxed"
              >
                Langsung dari kebun ke rumah Anda. Produk segar, bergizi, dan terpercaya dengan pengiriman cepat.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="lg" 
                    className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto shadow-xl hover:shadow-2xl"
                    onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <ShoppingBag className="mr-2" size={20} />
                    Belanja Sekarang
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="lg" 
                    className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/30 w-full sm:w-auto"
                    onClick={handleWhatsAppOrder}
                  >
                    <MessageCircle className="mr-2" size={20} />
                    Chat WhatsApp
                  </Button>
                </motion.div>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="flex flex-wrap items-center gap-6 pt-6"
              >
                <div className="flex items-center gap-2 text-white/90">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-medium">Jaminan Segar</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <Truck className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-medium">Gratis Ongkir</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <Shield className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-medium">Terpercaya</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden lg:block"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 text-white/70"
          >
            <span className="text-xs uppercase tracking-wider">Scroll</span>
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
              <motion.div 
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-1.5 h-1.5 bg-white/70 rounded-full"
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Statistics Section dengan Counter Animation */}
      <section className="section-padding-responsive bg-gray-50">
        <div className="container-app">
          <div className="grid-features">
            {achievements.map((achievement, index) => {
              const IconComponent = achievement.icon;
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ 
                    y: -5,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                  }}
                  className="text-center p-6 bg-white rounded-xl shadow-sm transition-shadow duration-300"
                >
                  <motion.div 
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 200 }}
                    className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3"
                  >
                    <IconComponent className="text-green-600" size={24} />
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="heading-card text-gray-900 mb-1"
                  >
                    {achievement.number}
                  </motion.div>
                  <div className="text-caption text-gray-600 font-medium">{achievement.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Special Offer Banner dengan Pulse Animation */}
      <section className="py-8 bg-gradient-to-r from-green-600 to-green-700 relative overflow-hidden">
        {/* Animated background shapes */}
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full"
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4"
          >
            <motion.h2 
              initial={{ y: -20 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-2xl md:text-3xl font-bold text-white"
            >
              Promo Spesial Hari Ini!
            </motion.h2>
            <motion.p 
              initial={{ y: 20 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-lg text-green-100"
            >
              Diskon hingga 25% untuk pembelian pertama
            </motion.p>
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="secondary" 
                size="md"
                className="bg-white text-green-600 hover:bg-gray-100"
                onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}
              >
                Belanja Sekarang
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products - Unlimited Carousel dengan Framer Motion */}
      <section id="products" className="section-py bg-white overflow-hidden">
        <div className="container-app">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4 mb-12"
          >
            <motion.div 
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-4"
            >
              <Star className="w-4 h-4 mr-2" />
              Produk Terlaris
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="heading-section text-gray-900"
            >
              Produk Unggulan Hari Ini
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-body text-gray-600 max-w-2xl mx-auto"
            >
              Pilihan terbaik produk segar dengan kualitas premium dan harga terjangkau untuk keluarga Indonesia
            </motion.p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent"></div>
            </div>
          ) : products.length > 0 ? (
            <>
              {/* Carousel Container */}
              <div className="relative mb-12">
                {/* Navigation Buttons - Hidden on mobile */}
                <button
                  onClick={prevSlide}
                  className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 md:p-3 transition-all duration-300 hover:scale-110 items-center justify-center"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-800" />
                </button>
                <button
                  onClick={nextSlide}
                  className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 md:p-3 transition-all duration-300 hover:scale-110 items-center justify-center"
                  aria-label="Next"
                >
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-800" />
                </button>

                {/* Carousel Content */}
                <div className="overflow-hidden px-2 sm:px-8 md:px-12">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentSlide}
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.5 }}
                      className="flex overflow-x-auto gap-3 snap-x snap-mandatory touch-pan-x -mx-2 px-2 md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-4"
                    >
                      {getVisibleProducts().map((product, index) => (
                        <motion.div
                          key={`${product.id}-${currentSlide}`}
                          initial={{ opacity: 0, y: 50 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                          className="snap-start min-w-[46%] sm:min-w-[42%] md:min-w-0"
                        >
                          <ErrorBoundary>
                            <ProductCard
                              product={product}
                              onWhatsAppOrder={handleWhatsAppOrder}
                              onAddToCart={handleAddToCart}
                              formatPrice={formatPrice}
                              className="mx-2"
                            />
                          </ErrorBoundary>
                        </motion.div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Carousel Indicators */}
                <div className="flex justify-center gap-1.5 md:gap-2 mt-6 md:mt-8 px-4">
                  {products.slice(0, 6).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentSlide(index);
                        resetAutoPlay();
                      }}
                      className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${
                        index === currentSlide 
                          ? 'w-6 md:w-8 bg-green-600' 
                          : 'w-1.5 md:w-2 bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                  {products.length > 6 && (
                    <span className="text-xs text-gray-400 ml-1">+{products.length - 6}</span>
                  )}
                </div>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="text-center"
              >
                <Link to="/products">
                  <Button 
                    size="md"
                    className="bg-green-600 hover:bg-green-700 text-white btn-touch"
                  >
                    Lihat Semua {products.length} Produk
                    <ArrowRight className="ml-1.5 sm:ml-2" size={18} />
                  </Button>
                </Link>
              </motion.div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Belum ada produk tersedia</p>
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section dengan Scroll Animation */}
      <section className="section-py bg-gradient-to-br from-gray-50 to-white">
        <div className="container-app">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4 mb-12"
          >
            <motion.h2 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="heading-section text-gray-900"
            >
              Mengapa Pilih BaleTani?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-body text-gray-600 max-w-2xl mx-auto"
            >
              Kami berkomitmen memberikan pengalaman belanja terbaik dengan jaminan kualitas dan layanan premium
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ 
                    y: -10,
                    transition: { duration: 0.2 }
                  }}
                  className="p-6 bg-white rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-xl transition-all duration-300 group cursor-pointer"
                >
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors duration-300"
                  >
                    <IconComponent className="text-green-600" size={24} />
                  </motion.div>
                  <h3 className="heading-card text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-caption sm:text-body text-gray-600 leading-relaxed">{benefit.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section dengan Data dari API */}
      <section className="section-py bg-gray-50">
        <div className="container-app">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4 mb-12"
          >
            <motion.h2 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="heading-section text-gray-900"
            >
              Kategori Produk Pilihan
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-body text-gray-600 max-w-2xl mx-auto"
            >
              Jelajahi koleksi lengkap produk segar berkualitas premium dari berbagai kategori terbaik
            </motion.p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
            </div>
          ) : categories.length > 0 ? (
            <>
              <div className="grid-categories">
                {categories.slice(0, 8).map((category, index) => {
                  const IconComponent = getCategoryIcon(category.category_name);
                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05, duration: 0.5 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                    >
                      <Link 
                        to={`/categories/${category.id}`}
                        className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200 block h-full"
                      >
                        <div className="relative overflow-hidden h-32 bg-gradient-to-br from-green-50 via-green-100 to-emerald-100">
                          <motion.div 
                            whileHover={{ scale: 1.15, rotate: 5 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-green-600 transition-colors duration-300">
                              <IconComponent className="w-10 h-10 text-green-600 group-hover:text-white transition-colors duration-300" />
                            </div>
                          </motion.div>
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm">
                            <span className="text-xs font-bold text-gray-800">
                              {category.product_count}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="heading-card text-gray-900 mb-1 group-hover:text-green-600 transition-colors duration-300 line-clamp-1">
                            {category.category_name}
                          </h3>
                          <p className="text-caption sm:text-body text-gray-600 leading-relaxed line-clamp-2">
                            {category.description || 'Produk segar berkualitas premium'}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Show more button if there are more than 8 categories */}
              {categories.length > 8 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="text-center mt-6 sm:mt-8"
                >
                  <Link to="/categories">
                    <Button 
                      size="md"
                      variant="outline"
                      className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white btn-touch"
                    >
                      Lihat Semua Kategori ({categories.length})
                      <ArrowRight className="ml-1.5 sm:ml-2" size={18} />
                    </Button>
                  </Link>
                </motion.div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Belum ada kategori tersedia</p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials dengan Stagger Animation */}
      <section className="section-py bg-white">
        <div className="container-app">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4 mb-12"
          >
            <motion.div 
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4"
            >
              <Star className="w-4 h-4 mr-2" />
              Kata Mereka
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="heading-section text-gray-900"
            >
              Testimoni Pelanggan Setia
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-body text-gray-600 max-w-2xl mx-auto"
            >
              Ribuan pelanggan telah merasakan pengalaman berbelanja terbaik bersama BaleTani
            </motion.p>
          </motion.div>

              <div className="flex overflow-x-auto gap-4 md:gap-6 snap-x snap-mandatory touch-pan-x -mx-4 px-4 md:grid md:grid-cols-3 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={testimonial.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ 
                  y: -10,
                  boxShadow: "0 20px 30px rgba(0,0,0,0.1)"
                }}
                className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 snap-start min-w-[78%] sm:min-w-[60%] md:min-w-0"
              >
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section dengan Parallax Effect */}
      <section className="section-py bg-gray-50 overflow-hidden">
        <div className="container-app">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium"
                >
                  <Leaf className="w-4 h-4 mr-2" />
                  Tentang Kami
                </motion.div>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="heading-section text-gray-900"
                >
                  BaleTani Fresh Market
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="text-body text-gray-600 leading-relaxed"
                >
                  Kami berkomitmen menyediakan produk segar berkualitas tinggi langsung dari kebun ke rumah Anda. 
                  Dengan visi menjadi brand yang jujur dan terpercaya, kami memastikan setiap produk yang sampai 
                  ke tangan Anda adalah yang terbaik.
                </motion.p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    icon: CheckCircle,
                    color: 'green',
                    title: 'Produk Segar Berkualitas',
                    desc: 'Langsung dari kebun pilihan dengan standar kualitas tinggi dan proses seleksi ketat'
                  },
                  {
                    icon: CheckCircle,
                    color: 'blue',
                    title: 'Pengiriman Cepat & Aman',
                    desc: 'Sistem pengiriman terpercaya dengan cold chain untuk menjaga kesegaran produk'
                  },
                  {
                    icon: CheckCircle,
                    color: 'purple',
                    title: 'Harga Terjangkau',
                    desc: 'Harga bersahabat langsung dari petani tanpa mengurangi kualitas produk'
                  }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                    whileHover={{ x: 10, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                    className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm"
                  >
                    <div className={`w-10 h-10 bg-${item.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <item.icon className={`text-${item.color}-600`} size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
                className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200"
              >
                <p className="text-green-800 font-bold text-lg text-center leading-relaxed">
                  "Dari kebun ke Balé, dari Balé ke rumahmu"
                </p>
              </motion.div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <motion.div 
                whileHover={{ scale: 1.03, rotate: 2 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-4 rounded-2xl shadow-lg"
              >
                <img 
                  src="/api/placeholder/500/400" 
                  alt="About BaleTani" 
                  className="rounded-xl w-full h-auto"
                />
              </motion.div>
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.8, 0.6] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 w-12 h-12 bg-green-200 rounded-full"
              />
              <motion.div 
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.7, 0.5] }}
                transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                className="absolute -bottom-4 -left-4 w-10 h-10 bg-blue-200 rounded-full"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section dengan Magnetic Effect */}
      <section className="section-py bg-gradient-to-r from-green-600 to-green-700 relative overflow-hidden">
        {/* Animated background shapes */}
        <motion.div
          animate={{ 
            x: [-100, 100, -100],
            y: [-50, 50, -50],
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            x: [100, -100, 100],
            y: [50, -50, 50],
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-0 right-0 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl"
        />

        <div className="container-app text-center space-y-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <motion.h2 
              initial={{ y: -30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="heading-section text-white"
            >
              Siap Belanja Produk Segar Hari Ini?
            </motion.h2>
            <motion.p 
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-body text-green-100 max-w-2xl mx-auto leading-relaxed"
            >
              Bergabunglah dengan ribuan pelanggan yang telah merasakan pengalaman berbelanja terbaik. 
              Pesan sekarang dan nikmati kesegaran langsung dari kebun!
            </motion.p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="md"
                style={{ backgroundColor: "#FFFFFF", color: "#16A34A" }} 
                className="hover:!bg-green-600 hover:!text-white w-full sm:w-auto"
                onClick={() => handleWhatsAppOrder('Konsultasi Pemesanan', 0, 'gratis')}
              >
                <MessageCircle className="mr-1.5 sm:mr-2" size={18} />
                Pesan via WhatsApp
              </Button>
            </motion.div>

            <Link to="/products">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  size="md"
                  style={{ 
                    backgroundColor: "#16A34A",
                    color: "#FFFFFF",
                    borderColor: "#16A34A"
                  }}
                  className="hover:!bg-white hover:!text-green-600 hover:!border-green-600 w-full sm:w-auto"
                >
                  Lihat Katalog Produk
                  <ArrowRight className="ml-1.5 sm:ml-2" size={18} />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
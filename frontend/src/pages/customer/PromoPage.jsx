/**
 * PROMO PAGE - CUSTOMER SIDE
 * Displays all products with active discounts/promotions
 */

import { useState, useEffect } from 'react';
import { Tag, Clock, Search, Filter, X, SlidersHorizontal, MessageCircle } from 'lucide-react';
import ProductCard from '../../components/ui/ProductCard';
import Button from '../../components/ui/Button';
import productService from '../../services/services_customer/productService';
import useDebounce from '../../hooks/useDebounce';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const PromoPage = () => {
  const [promoProducts, setPromoProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  
  // Debounce search input
  const debouncedSearch = useDebounce(searchInput, 500);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);

  // Format price to Rupiah
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Fetch promo products
  useEffect(() => {
    const fetchPromoProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await productService.getFeaturedProducts(50);
        
        if (response.success) {
          // Filter only products with discount
          const productsWithDiscount = response.data.filter(p => p.discount && p.discount.finalPrice < p.price);
          setPromoProducts(productsWithDiscount);
          setFilteredProducts(productsWithDiscount);
          
          // Extract unique categories
          const uniqueCategories = [...new Set(
            productsWithDiscount
              .map(p => p.category)
              .filter(Boolean)
          )];
          setCategories(uniqueCategories);
        }
      } catch (err) {
        console.error('Error fetching promo products:', err);
        setError(err.message || 'Gagal memuat produk promo');
      } finally {
        setLoading(false);
      }
    };

    fetchPromoProducts();
  }, []);

  // Group products by promo
  const groupedByPromo = filteredProducts.reduce((acc, product) => {
    if (product.discount && product.discount.name) {
      const promoName = product.discount.name;
      if (!acc[promoName]) {
        acc[promoName] = {
          name: promoName,
          description: product.discount.description || '',
          products: []
        };
      }
      acc[promoName].products.push(product);
    }
    return acc;
  }, {});

  // Apply filters (with debounced search)
  useEffect(() => {
    let filtered = [...promoProducts];

    // Search filter (using debounced value)
    if (debouncedSearch) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => 
          (a.discount?.finalPrice || a.price) - (b.discount?.finalPrice || b.price)
        );
        break;
      case 'price-desc':
        filtered.sort((a, b) => 
          (b.discount?.finalPrice || b.price) - (a.discount?.finalPrice || a.price)
        );
        break;
      case 'discount':
        filtered.sort((a, b) => {
          const discountA = a.discount ? ((a.price - a.discount.finalPrice) / a.price) * 100 : 0;
          const discountB = b.discount ? ((b.price - b.discount.finalPrice) / b.price) * 100 : 0;
          return discountB - discountA;
        });
        break;
      case 'newest':
      default:
        // Already sorted by newest from backend
        break;
    }

    setFilteredProducts(filtered);
  }, [debouncedSearch, selectedCategory, sortBy, promoProducts]);

  // Clear filters
  const clearFilters = () => {
    setSearchInput('');
    setSelectedCategory('');
    setSortBy('newest');
  };

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    // Search is already handled by useEffect
  };

  // Handle WhatsApp order
  const handleWhatsAppOrder = (productName, price, unit) => {
    const message = `Halo, saya ingin memesan produk promo:\n\nProduk: ${productName}\nHarga Promo: ${formatPrice(price)}\n\nMohon informasi lebih lanjut.`;
    const whatsappUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Handle add to cart
  const handleAddToCart = (product) => {
    // TODO: Implement cart functionality
    console.log('Add to cart:', product);
    alert(`${product.name} ditambahkan ke keranjang!`);
  };

  // Calculate time remaining for a discount
  const getTimeRemaining = (validUntil) => {
    const now = new Date();
    const end = new Date(validUntil);
    const diff = end - now;
    
    if (diff <= 0) return 'Berakhir';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} hari lagi`;
    return `${hours} jam lagi`;
  };

  // Calculate total savings
  const calculateTotalSavings = () => {
    return promoProducts.reduce((total, product) => {
      if (product.discount) {
        return total + (product.price - product.discount.finalPrice);
      }
      return total;
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section with Flash Sale Banner */}
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Flash Sale Badge */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <Tag size={32} className="animate-bounce" />
              <h1 className="text-4xl md:text-5xl font-bold">
                Promo Spesial
              </h1>
            </div>
            
            <p className="text-center text-lg text-red-100 mb-8">
              Jangan lewatkan penawaran terbaik untuk produk segar berkualitas tinggi
            </p>

            {/* Countdown Timer */}
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 mb-6 border-2 border-white/30">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Clock size={24} className="animate-spin" style={{ animationDuration: '3s' }} />
                <span className="text-xl font-bold">Flash Sale Hari Ini</span>
              </div>
              <p className="text-center text-sm text-red-100">
                Diskon hingga 50% - Terbatas!
              </p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Cari produk promo..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full px-6 py-4 pr-32 rounded-full text-gray-900 placeholder-gray-400 shadow-lg focus:outline-none focus:ring-4 focus:ring-red-200 hover:shadow-xl transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-medium transition-colors duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <Search size={20} />
                Cari
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Filters Bar - Mirip ProductPage */}
        {!loading && !error && promoProducts.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
            <div className="flex flex-wrap items-center gap-4">
              {/* Filter Toggle Button (Mobile) */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <SlidersHorizontal size={20} />
                Filter
              </button>

              {/* Category Filter */}
              <div className={`${showFilters ? 'flex' : 'hidden'} lg:flex items-center gap-2 flex-1`}>
                <Filter size={20} className="text-gray-500" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Semua Kategori</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Filter */}
              <div className={`${showFilters ? 'flex' : 'hidden'} lg:flex items-center gap-2`}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="newest">Terbaru</option>
                  <option value="price-asc">Harga Terendah</option>
                  <option value="price-desc">Harga Tertinggi</option>
                  <option value="discount">Diskon Terbesar</option>
                </select>
              </div>

              {/* Reset Button */}
              {(selectedCategory || sortBy !== 'newest' || searchInput) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                  Reset
                </button>
              )}

              {/* Results Count */}
              <div className="text-sm text-gray-600 font-medium ml-auto">
                {filteredProducts.length} produk ditemukan
              </div>
            </div>
          </div>
        )}
        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 font-medium">Memuat produk promo...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 font-medium">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Coba Lagi
            </Button>
          </div>
        )}

        {/* Products Grid - Grouped by Promo */}
        {!loading && !error && (
          <>
            {Object.keys(groupedByPromo).length > 0 ? (
              <div className="space-y-12">
                {Object.values(groupedByPromo).map((promo, index) => (
                  <div key={index} className="space-y-6">
                    {/* Promo Header Section */}
                    <div className="bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 border-l-4 border-red-500 rounded-lg p-6 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                            <Tag className="text-white" size={24} />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                            🎉 {promo.name}
                          </h3>
                          {promo.description && (
                            <p className="text-gray-700 leading-relaxed">
                              {promo.description}
                            </p>
                          )}
                          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                            <span className="bg-white px-3 py-1 rounded-full border border-gray-200 font-semibold">
                              {promo.products.length} Produk Tersedia
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Products Grid for this Promo */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {promo.products.map((product) => (
                        <div key={product.id} className="relative">
                          {/* Timer Badge on Card */}
                          {product.discount?.validUntil && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                              <Clock size={12} />
                              {getTimeRemaining(product.discount.validUntil)}
                            </div>
                          )}
                          
                          <ProductCard
                            product={product}
                      
                            formatPrice={formatPrice}
                            onAddToCart={handleAddToCart}
                            className="mt-3"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Tag size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-2xl font-bold text-gray-700 mb-2">
                  {searchInput || selectedCategory
                    ? 'Produk Promo Tidak Ditemukan' 
                    : 'Belum Ada Promo'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchInput || selectedCategory
                    ? 'Coba ubah filter atau kata kunci pencarian' 
                    : 'Promo spesial akan segera hadir. Pantau terus!'}
                </p>
                {(searchInput || selectedCategory) && (
                  <Button onClick={clearFilters}>
                    Lihat Semua Promo
                  </Button>
                )}
              </div>
            )}
          </>
        )}

        {/* Call to Action */}
        {!loading && !error && promoProducts.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-3">
              Ingin Mendapatkan Promo Eksklusif?
            </h3>
            <p className="text-green-100 mb-6">
              Daftarkan WhatsApp Anda dan dapatkan notifikasi promo terbaru langsung!
            </p>
            <Button 
              className="bg-white text-green-600 hover:bg-green-50 flex items-center gap-2 mx-auto"
              onClick={() => window.open('https://wa.me/6281234567890?text=Halo, saya ingin mendapatkan notifikasi promo!', '_blank')}
            >
              <MessageCircle size={20} />
              Hubungi via WhatsApp
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default PromoPage;

/**
 * PROMO PAGE - CUSTOMER SIDE
 * Displays all products with active discounts/promotions
 */

import { useState, useEffect } from 'react';
import { Tag, Clock, TrendingDown, Search } from 'lucide-react';
import ProductCard from '../../components/ui/ProductCard';
import Button from '../../components/ui/Button';
import productService from '../../services/services_customer/productService';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const PromoPage = () => {
  const [promoProducts, setPromoProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

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
        
        const response = await productService.getFeaturedProducts(20);
        
        if (response.success) {
          setPromoProducts(response.data);
          setFilteredProducts(response.data);
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

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchInput(value);
    
    if (value === '') {
      setFilteredProducts(promoProducts);
    } else {
      const filtered = promoProducts.filter(product =>
        product.name.toLowerCase().includes(value)
      );
      setFilteredProducts(filtered);
    }
  };

  // Handle WhatsApp order
  const handleWhatsAppOrder = (productName, price, unit) => {
    const message = `Halo, saya ingin memesan produk promo:\n\nProduk: ${productName}\nHarga Promo: ${formatPrice(price)}/${unit}\n\nMohon informasi lebih lanjut.`;
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

            {/* Countdown Timer (Static for now) */}
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 mb-6 border-2 border-white/30">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Clock size={24} className="animate-spin" style={{ animationDuration: '3s' }} />
                <span className="text-xl font-bold">✨ Flash Sale Hari Ini</span>
              </div>
              <p className="text-center text-sm text-red-100">
                Diskon hingga 50% - Terbatas!
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cari produk promo..."
                value={searchInput}
                onChange={handleSearch}
                className="w-full pl-12 pr-4 py-4 rounded-full text-gray-900 placeholder-gray-400 shadow-lg focus:outline-none focus:ring-4 focus:ring-red-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      {!loading && promoProducts.length > 0 && (
        <div className="bg-white border-b border-gray-200 py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center border border-green-200">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {promoProducts.length}
                </div>
                <div className="text-sm text-green-700 font-medium">Produk Promo</div>
              </div>
              
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 text-center border border-red-200">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {formatPrice(calculateTotalSavings())}
                </div>
                <div className="text-sm text-red-700 font-medium">Total Penghematan</div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 text-center border border-orange-200">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  <TrendingDown className="inline" size={32} />
                </div>
                <div className="text-sm text-orange-700 font-medium">Diskon Hingga 50%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
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

        {/* Products Grid */}
        {!loading && !error && (
          <>
            {filteredProducts.length > 0 ? (
              <>
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {searchInput ? `Hasil Pencarian "${searchInput}"` : '🔥 Produk Promo Terbaik'}
                  </h2>
                  <p className="text-gray-600">
                    {filteredProducts.length} produk dengan harga spesial
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
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
                        onWhatsAppOrder={handleWhatsAppOrder}
                        onAddToCart={handleAddToCart}
                        className="mt-3"
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🎁</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">
                  {searchInput ? 'Produk Promo Tidak Ditemukan' : 'Belum Ada Promo'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchInput 
                    ? 'Coba kata kunci pencarian lain' 
                    : 'Promo spesial akan segera hadir. Pantau terus!'}
                </p>
                {searchInput && (
                  <Button onClick={() => setSearchInput('')}>
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
              className="bg-white text-green-600 hover:bg-green-50"
              onClick={() => window.open('https://wa.me/6281234567890?text=Halo, saya ingin mendapatkan notifikasi promo!', '_blank')}
            >
              📱 Hubungi via WhatsApp
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default PromoPage;

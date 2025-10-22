import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Tag, 
  Clock, 
  ShoppingCart, 
  TrendingUp,
  Filter,
  Search
} from 'lucide-react';
import Button from '../../components/ui/Button';

const Promo = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('discount');

  // Countdown timer untuk flash sale
  useEffect(() => {
    const targetTime = new Date();
    targetTime.setHours(23, 59, 59, 999);

    const timer = setInterval(() => {
      const now = new Date();
      const difference = targetTime - now;

      if (difference > 0) {
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const promoProducts = [
    {
      id: 1,
      name: "Bayam Organik Premium",
      price: 8000,
      originalPrice: 12000,
      discount: 33,
      stock: 25,
      sold: 18,
      image: "https://via.placeholder.com/300x300/e5e7eb/6b7280?text=Bayam+Organik",
      category: "Sayuran"
    },
    {
      id: 2,
      name: "Apel Fuji Impor",
      price: 25000,
      originalPrice: 35000,
      discount: 29,
      stock: 15,
      sold: 8,
      image: "https://via.placeholder.com/300x300/e5e7eb/6b7280?text=Apel+Fuji",
      category: "Buah"
    },
    {
      id: 3,
      name: "Daging Sapi Premium",
      price: 120000,
      originalPrice: 150000,
      discount: 20,
      stock: 10,
      sold: 7,
      image: "https://via.placeholder.com/300x300/e5e7eb/6b7280?text=Daging+Sapi",
      category: "Daging"
    },
    {
      id: 4,
      name: "Salmon Fresh Norway",
      price: 150000,
      originalPrice: 200000,
      discount: 25,
      stock: 8,
      sold: 3,
      image: "https://via.placeholder.com/300x300/e5e7eb/6b7280?text=Salmon",
      category: "Seafood"
    },
    {
      id: 5,
      name: "Tomat Cherry Organik",
      price: 15000,
      originalPrice: 20000,
      discount: 25,
      stock: 30,
      sold: 12,
      image: "https://via.placeholder.com/300x300/e5e7eb/6b7280?text=Tomat+Cherry",
      category: "Sayuran"
    },
    {
      id: 6,
      name: "Jeruk Mandarin Sweet",
      price: 30000,
      originalPrice: 40000,
      discount: 25,
      stock: 20,
      sold: 15,
      image: "https://via.placeholder.com/300x300/e5e7eb/6b7280?text=Jeruk+Mandarin",
      category: "Buah"
    },
    {
      id: 7,
      name: "Ayam Kampung Segar",
      price: 80000,
      originalPrice: 100000,
      discount: 20,
      stock: 12,
      sold: 5,
      image: "https://via.placeholder.com/300x300/e5e7eb/6b7280?text=Ayam+Kampung",
      category: "Daging"
    },
    {
      id: 8,
      name: "Udang Segar Premium",
      price: 90000,
      originalPrice: 120000,
      discount: 25,
      stock: 15,
      sold: 8,
      image: "https://via.placeholder.com/300x300/e5e7eb/6b7280?text=Udang+Premium",
      category: "Seafood"
    }
  ];

  const categories = ['all', 'Sayuran', 'Buah', 'Daging', 'Seafood'];

  const filteredProducts = promoProducts
    .filter(product => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'discount') {
        return b.discount - a.discount;
      } else if (sortBy === 'price-low') {
        return a.price - b.price;
      } else if (sortBy === 'price-high') {
        return b.price - a.price;
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Tag className="w-8 h-8 text-green-600 mr-2" />
            <h1 className="text-4xl font-bold text-gray-800">Promo Spesial</h1>
          </div>
          <p className="text-lg text-gray-600">
            Jangan lewatkan penawaran terbaik untuk produk segar berkualitas tinggi
          </p>
        </div>

        {/* Flash Sale Timer */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-white mb-4 md:mb-0">
              <div className="flex items-center mb-2">
                <TrendingUp className="w-6 h-6 mr-2" />
                <h2 className="text-2xl font-bold">Flash Sale Hari Ini</h2>
              </div>
              <p className="text-green-50">Diskon hingga 50% - Terbatas!</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Clock className="w-6 h-6 text-white" />
              <div className="flex space-x-2">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 min-w-[70px] text-center">
                  <div className="text-2xl font-bold text-white">{String(timeLeft.hours).padStart(2, '0')}</div>
                  <div className="text-xs text-green-50">Jam</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 min-w-[70px] text-center">
                  <div className="text-2xl font-bold text-white">{String(timeLeft.minutes).padStart(2, '0')}</div>
                  <div className="text-xs text-green-50">Menit</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 min-w-[70px] text-center">
                  <div className="text-2xl font-bold text-white">{String(timeLeft.seconds).padStart(2, '0')}</div>
                  <div className="text-xs text-green-50">Detik</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari produk promo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'Semua Kategori' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="discount">Diskon Terbesar</option>
                <option value="price-low">Harga Terendah</option>
                <option value="price-high">Harga Tertinggi</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              {filteredProducts.length} Produk Promo
            </h3>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-200">
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/300x300/e5e7eb/6b7280?text=${encodeURIComponent(product.name)}`;
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        -{product.discount}%
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded">
                        {product.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
                    
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-xl font-bold text-green-600">
                        Rp {product.price.toLocaleString('id-ID')}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        Rp {product.originalPrice.toLocaleString('id-ID')}
                      </span>
                    </div>

                    {/* Stock Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Terjual: {product.sold}</span>
                        <span>Stok: {product.stock}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(product.sold / (product.sold + product.stock)) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <Link to={`/products/${product.id}`}>
                      <Button 
                        variant="primary" 
                        className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Beli Sekarang
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Tidak ada produk promo yang sesuai dengan pencarian</p>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white text-center shadow-lg">
          <h3 className="text-2xl font-bold mb-3">Ingin Mendapatkan Promo Eksklusif?</h3>
          <p className="text-green-50 mb-6">
            Daftarkan WhatsApp Anda dan dapatkan notifikasi promo terbaru langsung!
          </p>
          <a 
            href="https://wa.me/6285885725027?text=Halo%20BaleTani,%20saya%20ingin%20mendapatkan%20info%20promo%20terbaru"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Hubungi via WhatsApp
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Promo;
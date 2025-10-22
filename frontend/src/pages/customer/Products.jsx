import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, Squares2X2Icon, ListBulletIcon, ChevronDownIcon, ChatBubbleLeftIcon, ShoppingCartIcon, HeartIcon, MapPinIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { useSearchParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/store_customer/useAuthStore';
import Button from '../../components/ui/Button';
import ProductCard from '../../components/ui/ProductCard';
import productService from '../../services/services_customer/productService';

/**
 * Halaman Produk - Modern & Clean Design
 */
const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  
  // State management
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [showFilters, setShowFilters] = useState(false);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        console.log('🔄 Loading products and categories...');
        
        // Load products and categories in parallel
        const [productsRes, categoriesRes] = await Promise.all([
          productService.getAll({
            category: selectedCategory !== 'all' ? selectedCategory : null,
            search: searchQuery || null
          }),
          productService.getCategories()
        ]);
        
        console.log('📦 Products response:', productsRes);
        console.log('📂 Categories response:', categoriesRes);
        
        const productData = productsRes.data || [];
        const categoryData = categoriesRes.data || [];
        
        console.log('📦 Setting products:', productData.length, 'items');
        console.log('📂 Setting categories:', categoryData.length, 'items');
        
        setProducts(productData);
        setCategories(categoryData);
        
        console.log('✅ Data loaded successfully');
      } catch (error) {
        console.error('❌ Error loading data:', error);
        toast.error('Gagal memuat data produk');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedCategory, searchQuery]);

  // Old mock data replaced with API calls
  const allProducts = products || [
    // Sayuran
    {
      id: 1,
      name: 'Bayam Segar Organik',
      price: 8000,
      originalPrice: 10000,
      image: 'https://placehold.co/300x300',
      category: 'sayuran',
      stock: 50,
      discount: 20,
      unit: 'ikat',
      seller: 'Pak Budi',
      location: 'Bogor',
      rating: 4.8,
      reviews: 45,
      description: 'Bayam organik segar langsung dari kebun, kaya akan zat besi dan vitamin.'
    },
    {
      id: 2,
      name: 'Tomat Cherry Premium',
      price: 15000,
      originalPrice: 18000,
      image: 'https://placehold.co/300x300',
      category: 'sayuran',
      stock: 30,
      discount: 17,
      unit: 'kg',
      seller: 'Bu Sari',
      location: 'Cianjur',
      rating: 4.9,
      reviews: 67,
      description: 'Tomat cherry manis dan segar, cocok untuk salad dan garnish.'
    },
    {
      id: 3,
      name: 'Kangkung Hidroponik',
      price: 5000,
      originalPrice: 6000,
      image: 'https://placehold.co/300x300',
      category: 'sayuran',
      stock: 40,
      discount: 17,
      unit: 'ikat',
      seller: 'Hidroponik Farm',
      location: 'Bandung',
      rating: 4.7,
      reviews: 89,
      description: 'Kangkung hidroponik bersih, segar, dan bebas pestisida.'
    },
    
    // Buah-buahan
    {
      id: 4,
      name: 'Apel Fuji Import',
      price: 35000,
      originalPrice: 40000,
      image: 'https://placehold.co/300x300',
      category: 'buah',
      stock: 25,
      discount: 13,
      unit: 'kg',
      seller: 'Fresh Fruit Co',
      location: 'Jakarta',
      rating: 4.9,
      reviews: 123,
      description: 'Apel Fuji import premium, manis, renyah, dan kaya vitamin C.'
    },
    {
      id: 5,
      name: 'Pisang Cavendish',
      price: 12000,
      originalPrice: 15000,
      image: 'https://placehold.co/300x300',
      category: 'buah',
      stock: 60,
      discount: 20,
      unit: 'sisir',
      seller: 'Kebun Pisang Nusantara',
      location: 'Lampung',
      rating: 4.6,
      reviews: 78,
      description: 'Pisang Cavendish matang sempurna, manis dan bergizi tinggi.'
    },
    {
      id: 6,
      name: 'Jeruk Pontianak',
      price: 20000,
      originalPrice: 23000,
      image: 'https://placehold.co/300x300',
      category: 'buah',
      stock: 35,
      discount: 13,
      unit: 'kg',
      seller: 'Pak Agus',
      location: 'Pontianak',
      rating: 4.8,
      reviews: 92,
      description: 'Jeruk Pontianak asli, manis segar dengan kandungan vitamin C tinggi.'
    },

    // Daging & Unggas
    {
      id: 7,
      name: 'Ayam Kampung Segar',
      price: 45000,
      originalPrice: 50000,
      image: 'https://placehold.co/300x300',
      category: 'daging',
      stock: 20,
      discount: 10,
      unit: 'ekor',
      seller: 'Peternakan Sejahtera',
      location: 'Sukabumi',
      rating: 4.9,
      reviews: 156,
      description: 'Ayam kampung segar, dipelihara secara tradisional tanpa hormon.'
    },
    {
      id: 8,
      name: 'Daging Sapi Premium',
      price: 120000,
      originalPrice: 135000,
      image: 'https://placehold.co/300x300',
      category: 'daging',
      stock: 15,
      discount: 11,
      unit: 'kg',
      seller: 'Rumah Potong Modern',
      location: 'Bekasi',
      rating: 4.8,
      reviews: 203,
      description: 'Daging sapi premium grade A, segar dan berkualitas tinggi.'
    },

    // Seafood
    {
      id: 9,
      name: 'Ikan Salmon Fillet',
      price: 85000,
      originalPrice: 95000,
      image: 'https://placehold.co/300x300',
      category: 'seafood',
      stock: 12,
      discount: 11,
      unit: 'kg',
      seller: 'Ocean Fresh',
      location: 'Jakarta',
      rating: 4.9,
      reviews: 87,
      description: 'Salmon fillet segar import, kaya omega-3 dan protein tinggi.'
    },
    {
      id: 10,
      name: 'Udang Vaname Jumbo',
      price: 75000,
      originalPrice: 85000,
      image: 'https://placehold.co/300x300',
      category: 'seafood',
      stock: 18,
      discount: 12,
      unit: 'kg',
      seller: 'Tambak Udang Jaya',
      location: 'Sidoarjo',
      rating: 4.7,
      reviews: 134,
      description: 'Udang vaname jumbo segar dari tambak langsung, ukuran besar.'
    }
  ];

  // Dynamic categories for filter
  const categoryOptions = [
    { id: 'all', name: 'Semua Produk', count: allProducts.length },
    ...categories.map(cat => ({
      id: cat.slug,
      name: cat.name,
      count: allProducts.filter(p => p.category?.slug === cat.slug).length
    }))
  ];

  // Sort options
  const sortOptions = [
    { value: 'name', label: 'Nama A-Z' },
    { value: 'price-low', label: 'Harga Terendah' },
    { value: 'price-high', label: 'Harga Tertinggi' },
    { value: 'rating', label: 'Rating Tertinggi' },
    { value: 'discount', label: 'Diskon Terbesar' }
  ];

  // Load dan filter produk
  useEffect(() => {
    setLoading(true);
    let filteredProducts = [...allProducts];

    // Filter by category
    if (selectedCategory !== 'all') {
      filteredProducts = filteredProducts.filter(product => product.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.seller.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by price range
    filteredProducts = filteredProducts.filter(product =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Sort products
    filteredProducts.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'discount':
          return b.discount - a.discount;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setTimeout(() => {
      setProducts(filteredProducts);
      setLoading(false);
    }, 300);
  }, [selectedCategory, searchQuery, sortBy, priceRange]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    setSearchParams(params);
  }, [searchQuery, selectedCategory, setSearchParams]);

  /**
   * Format harga ke format Rupiah
   */
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  /**
   * Handle WhatsApp order
   */
  const handleWhatsAppOrder = (productName, price, unit) => {
    const message = `Halo, saya tertarik dengan produk:\n\n${productName}\nHarga: ${formatPrice(price)}/${unit}\n\nMohon informasi lebih lanjut.`;
    const whatsappUrl = `https://wa.me/6285885725027?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    toast.success('Mengarahkan ke WhatsApp...');
  };

  /**
   * Handle add to cart (placeholder)
   */
  const handleAddToCart = (product) => {
    toast.success(`${product.name} ditambahkan ke keranjang`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Semua Produk</h1>
          <p className="text-gray-600">Temukan produk segar berkualitas premium untuk kebutuhan Anda</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-4">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <FunnelIcon className="w-5 h-5 mr-2" />
                Filter
              </h3>

              {/* Categories */}
              <div className="space-y-3 mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Kategori</h4>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-green-50 text-green-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Semua Kategori
                </button>
                {categoryOptions.slice(1).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-green-50 text-green-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{cat.name}</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                        {cat.count}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div className="space-y-3 border-t border-gray-200 pt-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Urutkan</h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Quick Filters */}
              <div className="space-y-3 border-t border-gray-200 pt-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Rentang Harga</h4>
                <button
                  onClick={() => setPriceRange([0, 20000])}
                  className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  Di bawah Rp 20.000
                </button>
                <button
                  onClick={() => setPriceRange([20000, 50000])}
                  className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  Rp 20.000 - Rp 50.000
                </button>
                <button
                  onClick={() => setPriceRange([50000, 1000000])}
                  className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  Di atas Rp 50.000
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Search & View Toggle */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                {/* Search */}
                <div className="flex-1 w-full">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari produk..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* View Mode Toggle */}
                <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white text-green-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Squares2X2Icon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white text-green-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <ListBulletIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Active Filters */}
              {(selectedCategory !== 'all' || searchQuery) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedCategory !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                      {categoryOptions.find(c => c.id === selectedCategory)?.name}
                      <button
                        onClick={() => setSelectedCategory('all')}
                        className="hover:text-green-900 ml-1"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                      "{searchQuery}"
                      <button
                        onClick={() => setSearchQuery('')}
                        className="hover:text-green-900 ml-1"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Products Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                Menampilkan <span className="font-semibold text-gray-900">{products.length}</span> produk
              </p>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : !products || products.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Produk tidak ditemukan</h3>
                <p className="text-gray-600 mb-6">Coba ubah filter atau kata kunci pencarian</p>
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setPriceRange([0, 1000000]);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Reset Filter
                </Button>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1'
              }`}>
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onWhatsAppOrder={handleWhatsAppOrder}
                    onAddToCart={handleAddToCart}
                    formatPrice={formatPrice}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;
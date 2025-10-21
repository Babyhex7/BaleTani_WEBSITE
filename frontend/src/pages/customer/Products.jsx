import { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, ArrowRight, MessageCircle, Heart, Star, MapPin } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/store_customer/useAuthStore';
import Button from '../../components/ui/Button';
import ProductCard from '../../components/ui/ProductCard';
import productService from '../../services/services_customer/productService';

/**
 * Halaman Produk - Menampilkan catalog lengkap dengan filter dan search
 * Fitur: Filter kategori, pencarian, sorting, grid/list view, WhatsApp integration
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
  const handleWhatsAppOrder = (product) => {
    if (!isAuthenticated) {
      toast.error('Silakan login terlebih dahulu untuk memesan produk');
      return;
    }

    const message = `Halo ${product.seller}! 🌾

Saya tertarik dengan produk:
📦 ${product.name}
💰 ${formatPrice(product.price)}/${product.unit}
📍 ${product.location}

Apakah masih tersedia? Terima kasih!`;

    const whatsappUrl = `https://wa.me/6285885725027?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast.success('Mengarahkan ke WhatsApp...');
  };

  /**
   * Handle add to cart (placeholder)
   */
  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      toast.error('Silakan login terlebih dahulu untuk menambah ke keranjang');
      return;
    }
    
    toast.success(`${product.name} ditambahkan ke keranjang`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Katalog Produk BaleTani
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Temukan produk segar berkualitas premium langsung dari petani lokal terpercaya
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cari produk, penjual, atau lokasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Filter Produk</h2>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
                >
                  <Filter size={20} />
                </button>
              </div>

              <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Categories */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Kategori</h3>
                  <div className="space-y-2">
                    {categoryOptions.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 ${
                          selectedCategory === category.id
                            ? 'bg-green-100 text-green-800 font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{category.name}</span>
                          <span className="text-sm bg-gray-200 px-2 py-1 rounded-full">
                            {category.count}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Rentang Harga</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 100000])}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                    </div>
                  </div>
                </div>

                {/* Quick Filters */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Filter Cepat</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setPriceRange([0, 20000])}
                      className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      Di bawah Rp 20.000
                    </button>
                    <button
                      onClick={() => setPriceRange([20000, 50000])}
                      className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      Rp 20.000 - Rp 50.000
                    </button>
                    <button
                      onClick={() => setPriceRange([50000, 100000])}
                      className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      Di atas Rp 50.000
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:w-3/4">
            {/* Controls Bar */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Menampilkan {products.length} produk
                  {searchQuery && <span> untuk "{searchQuery}"</span>}
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  {/* View Mode */}
                  <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-green-600 text-white' : 'bg-white text-gray-600'}`}
                    >
                      <Grid size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-green-600 text-white' : 'bg-white text-gray-600'}`}
                    >
                      <List size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
                    <div className="bg-gray-300 rounded-lg h-48 mb-4"></div>
                    <div className="space-y-2">
                      <div className="bg-gray-300 h-4 rounded w-3/4"></div>
                      <div className="bg-gray-300 h-4 rounded w-1/2"></div>
                      <div className="bg-gray-300 h-8 rounded w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : !products || products.length === 0 ? (
              /* No Products Found */
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="text-gray-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Produk Tidak Ditemukan</h3>
                <p className="text-gray-600 mb-6">
                  Tidak ada produk yang sesuai dengan kriteria pencarian Anda.
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setPriceRange([0, 100000]);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Reset Filter
                </Button>
              </div>
            ) : (
              /* Products Grid */
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {(products || []).map((product) => (
                  viewMode === 'grid' ? (
                    <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
                      <div className="relative overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {product.discount > 0 && (
                          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-semibold">
                            -{product.discount}%
                          </div>
                        )}
                        <button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                          <Heart size={16} className="text-gray-600" />
                        </button>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                              {product.name}
                            </h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                              <MapPin size={14} />
                              <span>{product.seller} • {product.location}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={`${
                                  i < Math.floor(product.rating) 
                                    ? 'text-yellow-400 fill-current' 
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            {product.rating} ({product.reviews})
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-baseline space-x-2">
                            <span className="text-lg font-bold text-green-600">
                              {formatPrice(product.price)}
                            </span>
                            <span className="text-sm text-gray-500">/{product.unit}</span>
                          </div>
                          {product.originalPrice > product.price && (
                            <div className="text-sm text-gray-500 line-through">
                              {formatPrice(product.originalPrice)}
                            </div>
                          )}
                          <div className="text-sm text-gray-600">
                            Stok: {product.stock} {product.unit}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddToCart(product)}
                            className="flex-1 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                          >
                            Keranjang
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleWhatsAppOrder(product)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          >
                            <MessageCircle size={16} className="mr-1" />
                            WhatsApp
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* List View */
                    <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/4 relative">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-48 md:h-full object-cover"
                          />
                          {product.discount > 0 && (
                            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-semibold">
                              -{product.discount}%
                            </div>
                          )}
                        </div>
                        
                        <div className="md:w-3/4 p-6">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-green-600 transition-colors">
                                {product.name}
                              </h3>
                              
                              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                                <MapPin size={14} />
                                <span>{product.seller} • {product.location}</span>
                              </div>

                              <div className="flex items-center space-x-1 mb-3">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      size={14}
                                      className={`${
                                        i < Math.floor(product.rating) 
                                          ? 'text-yellow-400 fill-current' 
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-600">
                                  {product.rating} ({product.reviews} ulasan)
                                </span>
                              </div>

                              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                {product.description}
                              </p>
                            </div>

                            <div className="md:text-right md:ml-6">
                              <div className="space-y-2 mb-4">
                                <div className="flex md:justify-end items-baseline space-x-2">
                                  <span className="text-2xl font-bold text-green-600">
                                    {formatPrice(product.price)}
                                  </span>
                                  <span className="text-sm text-gray-500">/{product.unit}</span>
                                </div>
                                {product.originalPrice > product.price && (
                                  <div className="text-sm text-gray-500 line-through">
                                    {formatPrice(product.originalPrice)}
                                  </div>
                                )}
                                <div className="text-sm text-gray-600">
                                  Stok: {product.stock} {product.unit}
                                </div>
                              </div>

                              <div className="flex md:justify-end space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAddToCart(product)}
                                  className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                                >
                                  Keranjang
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleWhatsAppOrder(product)}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <MessageCircle size={16} className="mr-1" />
                                  WhatsApp
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}

            {/* Load More Button */}
            {products.length > 0 && products.length >= 9 && (
              <div className="text-center mt-12">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                >
                  Muat Lebih Banyak
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;
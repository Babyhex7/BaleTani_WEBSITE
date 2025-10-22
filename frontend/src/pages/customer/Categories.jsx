import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBagIcon, 
  SparklesIcon,
  TruckIcon,
  FireIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  FunnelIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import ProductCard from '../../components/ui/ProductCard';
import { toast } from 'react-hot-toast';

const Categories = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default'); // default, price-low, price-high, name

  // Categories data  
  const categories = [
    {
      id: 'all',
      name: 'Semua Kategori',
      description: 'Lihat semua produk segar kami',
      image: 'https://placehold.co/250x200',
      color: 'from-green-400 to-green-600',
      products: 0
    },
    {
      id: 'sayuran',
      name: 'Sayuran Segar',
      description: 'Sayuran organik pilihan dari petani lokal',
      image: 'https://placehold.co/250x200',
      color: 'from-green-500 to-emerald-600',
      products: 0
    },
    {
      id: 'buah-buahan',
      name: 'Buah-buahan',
      description: 'Buah segar kaya vitamin dan antioksidan',
      image: 'https://placehold.co/250x200',
      color: 'from-red-400 to-pink-600',
      products: 0
    },
    {
      id: 'daging',
      name: 'Daging & Unggas',
      description: 'Daging segar berkualitas premium',
      image: 'https://placehold.co/250x200',
      color: 'from-red-500 to-red-700',
      products: 0
    },
    {
      id: 'seafood',
      name: 'Seafood Fresh',
      description: 'Ikan dan seafood segar langsung dari laut',
      image: 'https://placehold.co/250x200',
      color: 'from-blue-400 to-blue-600',
      products: 0
    }
  ];

  // Extended mock products
  const mockProducts = [
    // Sayuran
    {
      id: 1,
      name: "Bayam Organik",
      category: "sayuran",
      price: 8000,
      unit: "ikat",
      image: "/api/placeholder/300/200",
      rating: 4.8,
      reviews: 45,
      seller: "Pak Budi Farm",
      location: "Bogor",
      freshness: "Dipetik hari ini"
    },
    {
      id: 2,
      name: "Tomat Cherry",
      category: "sayuran",
      price: 15000,
      unit: "kg",
      image: "/api/placeholder/300/200",
      rating: 4.9,
      reviews: 67,
      seller: "Bu Sari",
      location: "Cianjur",
      freshness: "Ultra fresh"
    },
    {
      id: 3,
      name: "Kangkung Organik",
      category: "sayuran",
      price: 6000,
      unit: "ikat",
      image: "/api/placeholder/300/200",
      rating: 4.7,
      reviews: 32,
      seller: "Tani Sejahtera",
      location: "Bekasi",
      freshness: "Baru dipanen"
    },
    
    // Buah-buahan
    {
      id: 4,
      name: "Apel Fuji Premium",
      category: "buah-buahan",
      price: 25000,
      unit: "kg",
      image: "/api/placeholder/300/200",
      rating: 4.7,
      reviews: 89,
      seller: "Fresh Fruit Co",
      location: "Bandung",
      freshness: "Import segar"
    },
    {
      id: 5,
      name: "Mangga Harum Manis",
      category: "buah-buahan",
      price: 18000,
      unit: "kg",
      image: "/api/placeholder/300/200",
      rating: 4.8,
      reviews: 56,
      seller: "Kebun Manis",
      location: "Cirebon",
      freshness: "Matang sempurna"
    },
    {
      id: 6,
      name: "Pisang Cavendish",
      category: "buah-buahan",
      price: 12000,
      unit: "sisir",
      image: "/api/placeholder/300/200",
      rating: 4.6,
      reviews: 43,
      seller: "Banana Farm",
      location: "Lampung",
      freshness: "Tingkat kematangan pas"
    },

    // Daging
    {
      id: 7,
      name: "Daging Sapi Premium",
      category: "daging",
      price: 120000,
      unit: "kg",
      image: "/api/placeholder/300/200",
      rating: 4.9,
      reviews: 124,
      seller: "Premium Meat",
      location: "Jakarta",
      freshness: "Grade A"
    },
    {
      id: 8,
      name: "Ayam Kampung Segar",
      category: "daging",
      price: 45000,
      unit: "ekor",
      image: "/api/placeholder/300/200",
      rating: 4.8,
      reviews: 87,
      seller: "Peternakan Sehat",
      location: "Sukabumi",
      freshness: "Free range"
    },

    // Seafood
    {
      id: 9,
      name: "Salmon Norway",
      category: "seafood",
      price: 180000,
      unit: "kg",
      image: "/api/placeholder/300/200",
      rating: 4.9,
      reviews: 76,
      seller: "Ocean Fresh",
      location: "Surabaya",
      freshness: "Import langsung"
    },
    {
      id: 10,
      name: "Udang Vaname",
      category: "seafood",
      price: 85000,
      unit: "kg",
      image: "/api/placeholder/300/200",
      rating: 4.7,
      reviews: 65,
      seller: "Tambak Jaya",
      location: "Sidoarjo",
      freshness: "Segar dari tambak"
    },

    // Dairy
    {
      id: 11,
      name: "Susu Sapi Murni",
      category: "dairy",
      price: 15000,
      unit: "liter",
      image: "/api/placeholder/300/200",
      rating: 4.8,
      reviews: 92,
      seller: "Dairy Farm",
      location: "Malang",
      freshness: "Diperah pagi ini"
    },
    {
      id: 12,
      name: "Keju Mozzarella",
      category: "dairy",
      price: 45000,
      unit: "250g",
      image: "/api/placeholder/300/200",
      rating: 4.6,
      reviews: 38,
      seller: "Cheese Corner",
      location: "Bandung",
      freshness: "Homemade"
    },

    // Rempah
    {
      id: 13,
      name: "Cabai Merah Keriting",
      category: "rempah",
      price: 35000,
      unit: "kg",
      image: "/api/placeholder/300/200",
      rating: 4.7,
      reviews: 54,
      seller: "Spice Garden",
      location: "Purwokerto",
      freshness: "Pedas mantap"
    },
    {
      id: 14,
      name: "Bawang Merah Brebes",
      category: "rempah",
      price: 28000,
      unit: "kg",
      image: "/api/placeholder/300/200",
      rating: 4.8,
      reviews: 71,
      seller: "Brebes Agro",
      location: "Brebes",
      freshness: "Super kering"
    },

    // Beras
    {
      id: 15,
      name: "Beras Pandan Wangi",
      category: "beras",
      price: 75000,
      unit: "5kg",
      image: "/api/placeholder/300/200",
      rating: 4.9,
      reviews: 156,
      seller: "Rice Master",
      location: "Cianjur",
      freshness: "Panen terbaru"
    },
    {
      id: 16,
      name: "Beras Merah Organik",
      category: "beras",
      price: 85000,
      unit: "5kg",
      image: "/api/placeholder/300/200",
      rating: 4.7,
      reviews: 94,
      seller: "Organic Rice",
      location: "Yogyakarta",
      freshness: "Bebas pestisida"
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
      setLoading(false);
    }, 800);
  }, []);

  // Update product counts for categories
  const updatedCategories = categories.map(cat => ({
    ...cat,
    products: cat.id === 'all' 
      ? products.length 
      : products.filter(p => p.category === cat.id).length
  }));

  // Filter products by category, search, and sort
  useEffect(() => {
    let filtered = products;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.seller?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        // Keep original order
        break;
    }
    
    setFilteredProducts(filtered);
  }, [selectedCategory, products, searchTerm, sortBy]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  // WhatsApp handler
  const handleWhatsAppOrder = (productName, price, unit) => {
    const message = `Halo, saya tertarik dengan produk:\n\n${productName}\nHarga: ${formatPrice(price)}/${unit}\n\nMohon informasi lebih lanjut.`;
    const phoneNumber = '6282299374545';
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
  };

  // Add to cart handler
  const handleAddToCart = (product) => {
    toast.success(`${product.name} ditambahkan ke keranjang`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Kategori Produk</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Jelajahi berbagai kategori produk segar pilihan kami
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari produk, penjual, atau lokasi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm text-base"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter and Sort Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 text-gray-700">
              <Squares2X2Icon className="w-5 h-5 text-green-600" />
              <span className="font-medium">
                {filteredProducts.length} dari {products.length} produk
              </span>
              {selectedCategory !== 'all' && (
                <span className="ml-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  {updatedCategories.find(c => c.id === selectedCategory)?.name}
                </span>
              )}
              {searchTerm && (
                <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  Pencarian: "{searchTerm}"
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <FunnelIcon className="w-5 h-5 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-sm font-medium"
              >
                <option value="default">Urutkan: Default</option>
                <option value="name">Nama (A-Z)</option>
                <option value="price-low">Harga Terendah</option>
                <option value="price-high">Harga Tertinggi</option>
                <option value="rating">Rating Tertinggi</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Pilih Kategori</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {updatedCategories.map((category) => (
              <Link
                key={category.id}
                to={category.id === 'all' ? '/products' : `/products?category=${category.id}`}
                onClick={() => handleCategoryChange(category.id)}
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
                    <span className="text-xs font-semibold text-gray-800">{category.products} produk</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-green-600 transition-colors duration-300">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Products Section */}
        {(selectedCategory !== 'all' || searchTerm || sortBy !== 'default') && filteredProducts.length > 0 && (
          <div className="mb-8">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <ShoppingBagIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-green-800 font-medium">
                  {selectedCategory !== 'all' && (
                    <span>Kategori: <span className="font-bold">{updatedCategories.find(c => c.id === selectedCategory)?.name}</span></span>
                  )}
                  {searchTerm && (
                    <span className="ml-2">• Pencarian: <span className="font-bold">"{searchTerm}"</span></span>
                  )}
                  {sortBy !== 'default' && (
                    <span className="ml-2">• Diurutkan berdasarkan: <span className="font-bold capitalize">{sortBy.replace('-', ' ')}</span></span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedCategory === 'all' ? 'Semua Produk' : updatedCategories.find(c => c.id === selectedCategory)?.name}
            </h2>
            <p className="text-gray-600">
              {filteredProducts.length} produk ditemukan
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {searchTerm ? (
                  <MagnifyingGlassIcon className="w-12 h-12 text-gray-400" />
                ) : (
                  <ShoppingBagIcon className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchTerm ? 'Produk tidak ditemukan' : 'Belum ada produk'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? `Tidak ada produk yang cocok dengan "${searchTerm}"`
                  : 'Produk untuk kategori ini akan segera hadir'
                }
              </p>
              {(searchTerm || selectedCategory !== 'all' || sortBy !== 'default') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSortBy('default');
                  }}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                >
                  Reset Filter
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white text-center">
          <SparklesIcon className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-3xl font-bold mb-4">Tidak Menemukan Yang Anda Cari?</h3>
          <p className="text-lg mb-6 opacity-90">
            Hubungi kami untuk request produk khusus atau konsultasi kebutuhan fresh market Anda
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-white text-green-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2">
              <TruckIcon className="w-5 h-5" />
              Hubungi Kami
            </button>
            <button className="bg-yellow-400 text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-yellow-500 transition-colors flex items-center gap-2">
              <FireIcon className="w-5 h-5" />
              Chat WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
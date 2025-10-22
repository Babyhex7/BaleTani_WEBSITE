import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockProducts, mockCategories } from '../../utils/mockData';
import ProductCard from '../../components/ui/ProductCard';

const ProductsSimple = () => {
  const navigate = useNavigate();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const isAuthenticated = () => {
    // Sesuaikan key dengan implementasi autentikasi project Anda (contoh: 'authToken' atau 'user')
    return Boolean(localStorage.getItem('authToken') || localStorage.getItem('user'));
  };
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState({});
  const [wishlist, setWishlist] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = () => {
      console.log('🔄 Loading simple products...');
      
      // Complete fresh market products
      const simpleProducts = [
        {
          id: 1,
          name: "Bayam Segar",
          description: "Bayam organik segar dari petani lokal, kaya akan zat besi dan vitamin",
          price: 8000,
          unit: "ikat",
          category: "sayuran",
          stock: 50,
          rating: 4.8,
          reviews: 45,
          discount: 20,
          image: "https://placehold.co/300x200"
        },
        {
          id: 2,
          name: "Tomat Cherry",
          description: "Tomat cherry manis dan segar, cocok untuk salad atau camilan sehat",
          price: 15000,
          unit: "kg",
          category: "sayuran",
          stock: 30,
          rating: 4.9,
          reviews: 67,
          discount: 17,
          image: "https://placehold.co/300x200"
        },
        {
          id: 3,
          name: "Apel Fuji",
          description: "Apel fuji impor berkualitas tinggi, renyah dan manis",
          price: 25000,
          unit: "kg",
          category: "buah-buahan",
          stock: 20,
          rating: 4.7,
          reviews: 89,
          discount: 15,
          image: "https://placehold.co/300x200"
        },
        {
          id: 4,
          name: "Daging Sapi Segar",
          description: "Daging sapi premium grade A, segar dan berkualitas tinggi",
          price: 120000,
          unit: "kg",
          category: "daging",
          stock: 15,
          rating: 4.9,
          reviews: 124,
          discount: 10,
          image: "https://placehold.co/300x200"
        },
        {
          id: 5,
          name: "Ikan Salmon",
          description: "Salmon fresh import dari Norwegia, kaya omega-3",
          price: 180000,
          unit: "kg",
          category: "seafood",
          stock: 8,
          rating: 4.8,
          reviews: 76,
          discount: 25,
          image: "https://placehold.co/300x200"
        }
      ];
      
      const simpleCategories = [
        { id: 1, name: "Sayuran", value: "sayuran", icon: "🥬" },
        { id: 2, name: "Buah-buahan", value: "buah-buahan", icon: "🍎" },
        { id: 3, name: "Daging & Unggas", value: "daging", icon: "🥩" },
        { id: 4, name: "Seafood", value: "seafood", icon: "🐟" }
      ];
      
      console.log('Simple products:', simpleProducts);
      console.log('Simple categories:', simpleCategories);
      
      setProducts(simpleProducts);
      setFilteredProducts(simpleProducts);
      setCategories(simpleCategories);
      setLoading(false);
      
      console.log('✅ Simple data loaded');
    };

    loadData();
    }, []);

  // Filter products based on category and search
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
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
  }, [selectedCategory, products, searchTerm]);  // Filter products by category
  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId === 'all') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => product.category === categoryId);
      setFilteredProducts(filtered);
    }
  };

  // Add to cart functionality
  const handleAddToCart = (product) => {
    if (!isAuthenticated()) {
      setShowLoginPrompt(true);
      return;
    }

    setCart(prev => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + 1
    }));
    
    // Show success notification
    alert(`${product.name} ditambahkan ke keranjang!`);
  };
 
   // Toggle wishlist
   const handleToggleWishlist = (productId) => {
     if (!isAuthenticated()) {
       setShowLoginPrompt(true);
       return;
     }

     if (wishlist.includes(productId)) {
       setWishlist(wishlist.filter(id => id !== productId));
     } else {
       setWishlist([...wishlist, productId]);
     }
   };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-gray-200 mx-auto"></div>
            <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-green-500 absolute top-0 left-1/2 transform -translate-x-1/2"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl">
              🌿
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xl font-semibold text-gray-800">Memuat Produk Segar...</p>
            <p className="text-gray-600">Menyiapkan yang terbaik untuk Anda</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-green-700 mb-4">
            BaleTani Fresh Market
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            Produk segar langsung dari petani lokal, untuk keluarga sehat Indonesia
          </p>
          
          {/* Cart & Wishlist Summary */}
          {(Object.keys(cart).length > 0 || wishlist.length > 0) && (
            <div className="flex justify-center space-x-4">
              {Object.keys(cart).length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 flex items-center space-x-2">
                  <span className="text-green-700 font-medium">
                    {Object.values(cart).reduce((sum, qty) => sum + qty, 0)} item di keranjang
                  </span>
                </div>
              )}
              {wishlist.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 flex items-center space-x-2">
                  <span className="text-red-700 font-medium">
                    {wishlist.length} item di wishlist
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Search Bar */}
        <div className="mb-8">
          <div className="max-w-md mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
            </div>
            <input
              type="text"
              placeholder="Cari produk segar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Kategori Produk</h2>
            <div className="h-1 bg-green-400 rounded-full flex-1 ml-6 max-w-32"></div>
          </div>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => handleCategoryFilter('all')}
              className={`group px-6 py-3 border rounded-full font-medium transition-all duration-300 shadow-sm hover:shadow-lg transform hover:-translate-y-1 ${
                selectedCategory === 'all'
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'bg-white hover:bg-green-500 border-green-200 hover:border-green-500 text-green-700 hover:text-white'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>🏪</span>
                <span>Semua Produk</span>
              </span>
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => handleCategoryFilter(category.value)}
                className={`group px-6 py-3 border rounded-full font-medium transition-all duration-300 shadow-sm hover:shadow-lg transform hover:-translate-y-1 ${
                  selectedCategory === category.value
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'bg-white hover:bg-green-500 border-green-200 hover:border-green-500 text-green-700 hover:text-white'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Products Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Produk Pilihan</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Menampilkan {filteredProducts.length} dari {products.length} produk</span>
              {selectedCategory !== 'all' && (
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                  Kategori: {categories.find(c => c.value === selectedCategory)?.name || selectedCategory}
                </span>
              )}
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🔍</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Tidak ada produk ditemukan</h3>
              <p className="text-gray-600 mb-6">
                Coba pilih kategori lain atau lihat semua produk yang tersedia.
              </p>
              <button
                onClick={() => handleCategoryFilter('all')}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                Lihat Semua Produk
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Floating Cart Button */}
      {Object.keys(cart).length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <button className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center space-x-3">
            <div className="relative">
              <span className="text-2xl">🛒</span>
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {Object.values(cart).reduce((sum, qty) => sum + qty, 0)}
              </div>
            </div>
            <span className="font-medium hidden sm:inline">Lihat Keranjang</span>
          </button>
        </div>
      )}

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Anda perlu login
            </h3>
            <p className="text-gray-600 mb-6">
              Silakan login untuk menambahkan produk ke keranjang atau wishlist.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  setShowLoginPrompt(false);
                  navigate('/login');
                }}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300"
              >
                Masuk
              </button>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-all duration-300"
              >
                Nanti saja
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsSimple;
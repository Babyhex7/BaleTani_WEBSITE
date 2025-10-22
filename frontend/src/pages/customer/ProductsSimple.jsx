import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon,
  XMarkIcon,
  ShoppingCartIcon,
  HeartIcon,
  Squares2X2Icon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import { 
  ShoppingCartIcon as ShoppingCartSolid,
  HeartIcon as HeartSolid 
} from '@heroicons/react/24/solid';
import { mockProducts, mockCategories } from '../../utils/mockData';
import ProductCard from '../../components/ui/ProductCard';

// Helper function to get category icon
const getCategoryIcon = (iconName) => {
  const icons = {
    leaf: (props) => (
      <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882-.265-4.185-.75M12 20.25c1.472 0 2.882-.265 4.185-.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
      </svg>
    ),
    apple: (props) => (
      <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
    meat: (props) => (
      <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
      </svg>
    ),
    fish: (props) => (
      <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.115 5.19l.319 1.913A6 6 0 008.11 10.36L9.75 12l-.387.775c-.217.433-.132.956.21 1.298l1.348 1.348c.21.21.329.497.329.795v1.089c0 .426.24.815.622 1.006l.153.076c.433.217.956.132 1.298-.21l.723-.723a8.7 8.7 0 002.288-4.042 1.087 1.087 0 00-.358-1.099l-1.33-1.108c-.251-.21-.582-.299-.905-.245l-1.17.195a1.125 1.125 0 01-.98-.314l-.295-.295a1.125 1.125 0 010-1.591l.13-.132a1.125 1.125 0 011.3-.21l.603.302a.809.809 0 001.086-1.086L14.25 7.5l1.256-.837a4.5 4.5 0 001.528-1.732l.146-.292M6.115 5.19A9 9 0 1017.18 4.64M6.115 5.19A8.965 8.965 0 0112 3c1.929 0 3.716.607 5.18 1.64" />
      </svg>
    ),
  };
  return icons[iconName] || icons.leaf;
};

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
        { id: 1, name: "Sayuran", value: "sayuran", icon: "leaf" },
        { id: 2, name: "Buah-buahan", value: "buah-buahan", icon: "apple" },
        { id: 3, name: "Daging & Unggas", value: "daging", icon: "meat" },
        { id: 4, name: "Seafood", value: "seafood", icon: "fish" }
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
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto"></div>
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
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Katalog Produk <span className="text-green-600">BaleTani</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            Produk segar langsung dari petani lokal untuk keluarga sehat Indonesia
          </p>
          
          {/* Cart & Wishlist Summary */}
          {(Object.keys(cart).length > 0 || wishlist.length > 0) && (
            <div className="flex justify-center gap-4 flex-wrap">
              {Object.keys(cart).length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 flex items-center gap-2">
                  <ShoppingCartSolid className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 font-medium">
                    {Object.values(cart).reduce((sum, qty) => sum + qty, 0)} item di keranjang
                  </span>
                </div>
              )}
              {wishlist.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 flex items-center gap-2">
                  <HeartSolid className="w-5 h-5 text-red-600" />
                  <span className="text-red-700 font-medium">
                    {wishlist.length} item di wishlist
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Search Bar & Filter */}
        <div className="mb-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar - Wider */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Cari produk segar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-12 pr-10 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm text-base"
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

              {/* Category Dropdown Filter */}
              <div className="md:w-64">
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryFilter(e.target.value)}
                    className="block w-full px-4 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm text-base font-medium appearance-none cursor-pointer"
                  >
                    <option value="all">📦 Semua Kategori</option>
                    {categories.map(category => {
                      const icons = {
                        leaf: '🌿',
                        apple: '🍎',
                        meat: '🥩',
                        fish: '🐟'
                      };
                      return (
                        <option key={category.id} value={category.value}>
                          {icons[category.icon]} {category.name}
                        </option>
                      );
                    })}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Info Badge */}
        {(selectedCategory !== 'all' || searchTerm) && (
          <div className="mb-6 max-w-4xl mx-auto">
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <ShoppingBagIcon className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">
                  {filteredProducts.length} dari {products.length} produk
                </span>
                {selectedCategory !== 'all' && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {categories.find(c => c.value === selectedCategory)?.name}
                  </span>
                )}
                {searchTerm && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    "{searchTerm}"
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchTerm('');
                }}
                className="text-green-700 hover:text-green-900 font-medium text-sm"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Products Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Produk Pilihan</h2>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-lg border border-gray-200">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MagnifyingGlassIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Tidak ada produk ditemukan</h3>
              <p className="text-gray-600 mb-6">
                Coba pilih kategori lain atau lihat semua produk yang tersedia.
              </p>
              <button
                onClick={() => {
                  handleCategoryFilter('all');
                  setSearchTerm('');
                }}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
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
          <button className="bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center gap-3">
            <div className="relative">
              <ShoppingCartSolid className="w-6 h-6" />
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
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
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <ShoppingCartIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Anda Perlu Login
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Silakan login untuk menambahkan produk ke keranjang atau wishlist.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowLoginPrompt(false);
                  navigate('/login');
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300"
              >
                Masuk
              </button>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-all duration-300"
              >
                Nanti Saja
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsSimple;
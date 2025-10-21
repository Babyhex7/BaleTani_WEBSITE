import React, { useState, useEffect } from 'react';
import { mockProducts, mockCategories } from '../../utils/mockData';

const ProductsSimple = () => {
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
          seller: "Pak Budi",
          location: "Bogor",
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
          seller: "Bu Sari",
          location: "Cianjur",
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
          seller: "Toko Segar",
          location: "Bandung",
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
          seller: "Pak Joko",
          location: "Jakarta",
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
          seller: "Ocean Fresh",
          location: "Surabaya",
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
    setCart(prev => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + 1
    }));
    
    // Show success notification
    alert(`${product.name} ditambahkan ke keranjang!`);
  };

  // Toggle wishlist
  const handleToggleWishlist = (productId) => {
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
                  <span>🛒</span>
                  <span className="text-green-700 font-medium">
                    {Object.values(cart).reduce((sum, qty) => sum + qty, 0)} item di keranjang
                  </span>
                </div>
              )}
              {wishlist.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 flex items-center space-x-2">
                  <span>❤️</span>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {filteredProducts.map(product => (
              <div key={product.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl overflow-hidden transition-all duration-500 transform hover:-translate-y-2">
                {/* Product Image */}
                <div className="relative overflow-hidden">
                  <img 
                    src={product.image || 'https://placehold.co/300x200'} 
                    alt={String(product.name || 'Product')}
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {(product.discount || 0) > 0 && (
                    <div className="absolute top-4 left-4">
                      <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        -{String(product.discount || 0)}%
                      </span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-red-500 hover:bg-white transition-all duration-200 shadow-lg">
                      <span className="text-lg">🤍</span>
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <div className="mb-3">
                    <h3 className="font-bold text-xl text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
                      {String(product.name || '')}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                      {String(product.description || '')}
                    </p>
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-baseline justify-between mb-4">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-2xl font-bold text-green-600">
                        Rp {(product.price || 0).toLocaleString('id-ID')}
                      </span>
                      <span className="text-sm text-gray-500">/{String(product.unit || '')}</span>
                    </div>
                  </div>
                  
                  {/* Seller Info */}
                  <div className="flex items-center justify-between text-sm mb-4 py-3 px-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">👨‍🌾</span>
                      <span className="font-medium text-gray-700">{String(product.seller || '')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">📍</span>
                      <span className="text-gray-600">{String(product.location || '')}</span>
                    </div>
                  </div>
                  
                  {/* Rating & Stock */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1">
                      <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-lg">
                        <span className="text-yellow-500">⭐</span>
                        <span className="text-sm font-medium text-yellow-700">
                          {String(product.rating || 0)}
                        </span>
                        <span className="text-xs text-gray-500">({String(product.reviews || 0)})</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500 bg-green-50 px-2 py-1 rounded-lg">
                        Stok: {String(product.stock || 0)} {String(product.unit || '')}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <span className="flex items-center justify-center space-x-2">
                        <span>🛒</span>
                        <span className="text-sm">
                          {cart[product.id] ? `Di Keranjang (${cart[product.id]})` : 'Tambah Keranjang'}
                        </span>
                      </span>
                    </button>
                    
                    <button 
                      onClick={() => handleToggleWishlist(product.id)}
                      className={`px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                        wishlist.includes(product.id)
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-white hover:bg-red-50 text-gray-600 hover:text-red-500 border border-gray-200 hover:border-red-300'
                      }`}
                    >
                      <span className="text-lg">{wishlist.includes(product.id) ? '❤️' : '♡'}</span>
                    </button>
                  </div>
                </div>
                </div>
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

      {/* Floating Cart Button */}
      {Object.keys(cart).length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-full shadow-2xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-3">
            <span className="text-2xl">🛒</span>
            <div className="flex flex-col items-start">
              <span className="text-sm">Keranjang</span>
              <span className="text-xs opacity-90">
                {Object.values(cart).reduce((sum, qty) => sum + qty, 0)} item
              </span>
            </div>
            <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              {Object.keys(cart).length}
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductsSimple;
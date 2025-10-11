import React, { useState, useEffect } from 'react';

const Categories = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock categories with detailed info
  const categories = [
    {
      id: 'all',
      name: 'Semua Kategori',
      icon: '🏪',
      description: 'Lihat semua produk segar kami',
      color: 'from-green-400 to-green-600',
      products: 0
    },
    {
      id: 'sayuran',
      name: 'Sayuran Segar',
      icon: '🥬',
      description: 'Sayuran organik pilihan dari petani lokal',
      color: 'from-green-500 to-emerald-600',
      products: 0
    },
    {
      id: 'buah-buahan',
      name: 'Buah-buahan',
      icon: '🍎',
      description: 'Buah segar kaya vitamin dan antioksidan',
      color: 'from-red-400 to-pink-600',
      products: 0
    },
    {
      id: 'daging',
      name: 'Daging & Unggas',
      icon: '🥩',
      description: 'Daging segar berkualitas premium',
      color: 'from-red-500 to-red-700',
      products: 0
    },
    {
      id: 'seafood',
      name: 'Seafood Fresh',
      icon: '🐟',
      description: 'Ikan dan seafood segar langsung dari laut',
      color: 'from-blue-400 to-blue-600',
      products: 0
    },
    {
      id: 'dairy',
      name: 'Dairy & Susu',
      icon: '🥛',
      description: 'Produk susu dan dairy segar',
      color: 'from-yellow-300 to-yellow-500',
      products: 0
    },
    {
      id: 'rempah',
      name: 'Rempah & Bumbu',
      icon: '🌶️',
      description: 'Rempah alami untuk cita rasa otentik',
      color: 'from-orange-400 to-red-500',
      products: 0
    },
    {
      id: 'beras',
      name: 'Beras & Sereal',
      icon: '🌾',
      description: 'Beras premium dan aneka sereal sehat',
      color: 'from-amber-400 to-yellow-600',
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

  // Filter products by category
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(product => product.category === selectedCategory));
    }
  }, [selectedCategory, products]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-gray-200 mx-auto"></div>
            <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-green-500 absolute top-0 left-1/2 transform -translate-x-1/2"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl">
              🏪
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xl font-semibold text-gray-800">Memuat Kategori...</p>
            <p className="text-gray-600">Menyiapkan kategori produk untuk Anda</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            🏪 Kategori Produk
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Jelajahi berbagai kategori produk segar pilihan kami. 
            Dari sayuran organik hingga seafood premium, semua ada di sini!
          </p>
          
          {/* Stats */}
          <div className="flex justify-center space-x-8 bg-white rounded-2xl p-6 shadow-lg max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{updatedCategories.length - 1}</div>
              <div className="text-sm text-gray-600">Kategori</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{products.length}</div>
              <div className="text-sm text-gray-600">Total Produk</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">100%</div>
              <div className="text-sm text-gray-600">Fresh Quality</div>
            </div>
          </div>
        </div>

        {/* Category Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Pilih Kategori</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {updatedCategories.map(category => (
              <div
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`cursor-pointer transform transition-all duration-300 hover:scale-105 ${
                  selectedCategory === category.id ? 'scale-105' : ''
                }`}
              >
                <div className={`bg-gradient-to-br ${category.color} rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl ${
                  selectedCategory === category.id ? 'ring-4 ring-white ring-opacity-60' : ''
                }`}>
                  <div className="text-center">
                    <div className="text-5xl mb-4">{category.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                    <p className="text-sm opacity-90 mb-4 leading-relaxed">{category.description}</p>
                    <div className="bg-white bg-opacity-20 rounded-full py-2 px-4">
                      <span className="text-sm font-semibold">
                        {category.products} Produk
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Category Info */}
        {selectedCategory !== 'all' && (
          <div className="mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-4xl">
                    {updatedCategories.find(c => c.id === selectedCategory)?.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {updatedCategories.find(c => c.id === selectedCategory)?.name}
                    </h3>
                    <p className="text-gray-600">
                      {updatedCategories.find(c => c.id === selectedCategory)?.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {filteredProducts.length}
                  </div>
                  <div className="text-sm text-gray-500">Produk tersedia</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {selectedCategory === 'all' ? 'Semua Produk' : 'Produk Terpilih'}
            </h2>
            <div className="text-sm text-gray-500">
              Menampilkan {filteredProducts.length} produk
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📦</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Belum ada produk</h3>
              <p className="text-gray-600 mb-6">
                Kategori ini sedang dalam pengembangan. Coba kategori lain!
              </p>
              <button
                onClick={() => handleCategoryChange('all')}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                Lihat Semua Produk
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {updatedCategories.find(c => c.id === product.category)?.icon}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
                        {product.freshness}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
                      {product.name}
                    </h3>
                    
                    {/* Price */}
                    <div className="flex items-baseline space-x-1 mb-3">
                      <span className="text-2xl font-bold text-green-600">
                        Rp {product.price.toLocaleString('id-ID')}
                      </span>
                      <span className="text-sm text-gray-500">/{product.unit}</span>
                    </div>

                    {/* Rating & Reviews */}
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-lg">
                        <span className="text-yellow-500 text-sm">⭐</span>
                        <span className="text-sm font-medium text-yellow-700">{product.rating}</span>
                        <span className="text-xs text-gray-500">({product.reviews})</span>
                      </div>
                    </div>

                    {/* Seller Info */}
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4 py-2 px-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span>👨‍🌾</span>
                        <span className="font-medium">{product.seller}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>📍</span>
                        <span>{product.location}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                      <span className="flex items-center justify-center space-x-2">
                        <span>🛒</span>
                        <span>Tambah Keranjang</span>
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-8 text-white text-center">
          <h3 className="text-3xl font-bold mb-4">🌟 Tidak Menemukan Yang Anda Cari?</h3>
          <p className="text-lg mb-6">
            Hubungi kami untuk request produk khusus atau konsultasi kebutuhan fresh market Anda
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-white text-green-600 font-bold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors">
              📞 Hubungi Kami
            </button>
            <button className="bg-yellow-400 text-gray-800 font-bold px-6 py-3 rounded-lg hover:bg-yellow-500 transition-colors">
              💬 Chat WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
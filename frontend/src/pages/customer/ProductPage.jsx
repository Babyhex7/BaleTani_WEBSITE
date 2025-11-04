/**
 * PRODUCT PAGE - CUSTOMER SIDE
 * Displays all products with search, filter, and pagination
 */

import { useState } from 'react';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import ProductCard from '../../components/ui/ProductCard';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import useProducts from '../../hooks/hook_customer/useProducts';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const ProductPage = () => {
  const {
    products,
    loading,
    error,
    pagination,
    filters,
    categories,
    searchProducts,
    filterByCategory,
    sortProducts,
    changePage,
    resetFilters,
  } = useProducts();

  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSort, setSelectedSort] = useState('newest');

  // Format price to Rupiah
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    searchProducts(searchInput);
  };

  // Handle category filter
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    filterByCategory(categoryId);
  };

  // Handle sort
  const handleSortChange = (sortValue) => {
    setSelectedSort(sortValue);
    sortProducts(sortValue);
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setSearchInput('');
    setSelectedCategory('');
    setSelectedSort('newest');
    resetFilters();
  };

  // Handle WhatsApp order
  const handleWhatsAppOrder = (productName, price, unit) => {
    const message = `Halo, saya ingin memesan:\n\nProduk: ${productName}\nHarga: ${formatPrice(price)}/${unit}\n\nMohon informasi lebih lanjut.`;
    const whatsappUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Handle add to cart
  const handleAddToCart = (product) => {
    // TODO: Implement cart functionality
    console.log('Add to cart:', product);
    alert(`${product.name} ditambahkan ke keranjang!`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Katalog Produk <span className="text-green-200">BaleTani</span>
            </h1>
            <p className="text-lg text-green-100 mb-8">
              Produk segar langsung dari petani lokal untuk keluarga sehat Indonesia
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Cari produk segar..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full px-6 py-4 pr-32 rounded-full text-gray-900 placeholder-gray-400 shadow-lg focus:outline-none focus:ring-4 focus:ring-green-300"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-medium transition-colors duration-200 flex items-center gap-2"
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
        {/* Filters Bar */}
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
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className={`${showFilters ? 'flex' : 'hidden'} lg:flex items-center gap-2`}>
              <select
                value={selectedSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="newest">Terbaru</option>
                <option value="name_asc">Nama A-Z</option>
                <option value="name_desc">Nama Z-A</option>
                <option value="price_asc">Harga Terendah</option>
                <option value="price_desc">Harga Tertinggi</option>
              </select>
            </div>

            {/* Reset Button */}
            {(filters.search || filters.category || filters.sortBy !== 'newest') && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              >
                <X size={20} />
                Reset
              </button>
            )}

            {/* Results Count */}
            <div className="text-sm text-gray-600 font-medium ml-auto">
              {pagination.totalItems} produk ditemukan
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(filters.search || filters.category) && (
          <div className="mb-6 flex flex-wrap gap-2">
            {filters.search && (
              <div className="bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                Pencarian: "{filters.search}"
                <button onClick={() => searchProducts('')}>
                  <X size={16} />
                </button>
              </div>
            )}
            {filters.category && (
              <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                Kategori: {categories.find(c => c.id === filters.category)?.name}
                <button onClick={() => handleCategoryChange('')}>
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 font-medium">Memuat produk...</p>
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
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    formatPrice={formatPrice}
                    onWhatsAppOrder={handleWhatsAppOrder}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">
                  Produk Tidak Ditemukan
                </h3>
                <p className="text-gray-500 mb-6">
                  Coba ubah filter atau kata kunci pencarian Anda
                </p>
                <Button onClick={handleResetFilters}>
                  Reset Filter
                </Button>
              </div>
            )}

            {/* Pagination */}
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              itemsPerPage={pagination.limit || 12}
              onPageChange={changePage}
            />
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ProductPage;

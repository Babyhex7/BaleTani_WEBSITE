/**
 * PRODUCT PAGE - TOKOPEDIA STYLE
 * Displays all products with sidebar filter, search, and pagination
 */

import { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronRight, Star, Search } from 'lucide-react';
import ProductCard from '../../components/ui/ProductCard';
import SearchBar from '../../components/ui/SearchBar';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import useProducts from '../../hooks/hook_customer/useProducts';
import useDebounce from '../../hooks/useDebounce';
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
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: false,
  });

  // Debounce search input
  const debouncedSearch = useDebounce(searchInput, 500);

  // Auto-search when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      searchProducts(debouncedSearch);
    }
  }, [debouncedSearch]);

  // Format price to Rupiah
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Handle search form submit
  const handleSearch = (e) => {
    e.preventDefault();
    searchProducts(searchInput);
  };

  // Handle category filter
  const handleCategoryChange = (categoryId) => {
    console.log('🔍 Category changed to:', categoryId);
    setSelectedCategory(categoryId);
    filterByCategory(categoryId);
  };

  // Handle sort
  const handleSortChange = (sortValue) => {
    console.log('🔍 Sort changed to:', sortValue);
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

  // Toggle section expand
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header Section with Search - Katalog Produk */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-6 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Title Section */}
            <div className="flex-shrink-0">
              <h1 className="text-2xl md:text-3xl font-bold">Katalog Produk</h1>
              <p className="text-green-100 text-sm md:text-base mt-1">Produk segar langsung dari petani lokal</p>
            </div>
            
            {/* Search Bar - Reusable Component */}
            <div className="lg:flex-1 lg:max-w-2xl">
              <SearchBar 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onClear={() => {
                  setSearchInput('');
                  searchProducts('');
                }}
                placeholder="Cari produk segar..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Tokopedia Layout */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          
          {/* Sidebar Filter - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-24">
              
              {/* Filter Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="font-bold text-lg">Filter</h2>
                {(selectedCategory || selectedSort !== 'newest') && (
                  <button
                    onClick={handleResetFilters}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="border-b border-gray-200">
                <button
                  onClick={() => toggleSection('category')}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">Kategori</span>
                  {expandedSections.category ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>
                
                {expandedSections.category && (
                  <div className="px-4 pb-4 space-y-2">
                    <label className="flex items-center gap-3 py-2 cursor-pointer hover:bg-gray-50 rounded px-2 -mx-2">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === ''}
                        onChange={() => handleCategoryChange('')}
                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                      <span className={`flex-1 text-sm ${selectedCategory === '' ? 'font-semibold text-green-600' : 'text-gray-700'}`}>
                        Semua Kategori
                      </span>
                    </label>
                    
                    {categories.map((category) => (
                      <label 
                        key={category.id}
                        className="flex items-center gap-3 py-2 cursor-pointer hover:bg-gray-50 rounded px-2 -mx-2"
                      >
                        <input
                          type="radio"
                          name="category"
                          checked={selectedCategory === category.id}
                          onChange={() => handleCategoryChange(category.id)}
                          className="w-4 h-4 text-green-600 focus:ring-green-500"
                        />
                        <span className={`flex-1 text-sm ${selectedCategory === category.id ? 'font-semibold text-green-600' : 'text-gray-700'}`}>
                          {category.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </aside>

          {/* Main Product Area */}
          <main className="flex-1 min-w-0">
            
            {/* Sort & Count Bar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Product Count */}
                <div className="text-sm text-gray-600">
                  Menampilkan <span className="font-semibold text-gray-900">{products.length}</span> dari <span className="font-semibold text-gray-900">{pagination.totalItems}</span> produk
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 hidden sm:inline">Urutkan:</span>
                  <select
                    value={selectedSort}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-white cursor-pointer"
                  >
                    <option value="newest">Terbaru</option>
                    <option value="name_asc">Nama A-Z</option>
                    <option value="name_desc">Nama Z-A</option>
                    <option value="price_asc">Harga Terendah</option>
                    <option value="price_desc">Harga Tertinggi</option>
                  </select>
                </div>
              </div>
              
              {/* Active Filters Tags */}
              {(filters.search || filters.category) && (
                <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-2">
                  {filters.search && (
                    <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
                      <Search size={14} />
                      "{filters.search}"
                      <button 
                        onClick={() => {
                          setSearchInput('');
                          searchProducts('');
                        }}
                        className="hover:bg-green-100 rounded-full p-0.5"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                  {filters.category && (
                    <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
                      {categories.find(c => c.id === filters.category)?.name}
                      <button 
                        onClick={() => handleCategoryChange('')}
                        className="hover:bg-blue-100 rounded-full p-0.5"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent"></div>
                <p className="mt-4 text-gray-600 font-medium">Memuat produk...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-600 font-medium">{error}</p>
                <Button onClick={() => window.location.reload()} className="mt-4">
                  Coba Lagi
                </Button>
              </div>
            )}

            {/* Products Grid - Tokopedia Style */}
            {!loading && !error && (
              <>
                {products.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4 mb-6">
                      {products.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          formatPrice={formatPrice}
                        />
                      ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <div className="mt-8">
                        <Pagination
                          currentPage={pagination.currentPage}
                          totalPages={pagination.totalPages}
                          totalItems={pagination.totalItems}
                          itemsPerPage={pagination.limit || 12}
                          onPageChange={changePage}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-white rounded-lg p-12 text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">
                      Produk Tidak Ditemukan
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Coba ubah kata kunci pencarian atau filter Anda
                    </p>
                    <Button onClick={handleResetFilters} variant="outline">
                      Reset Filter
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <Footer />
      
      {/* Mobile Filter Button - Floating */}
      <button
        onClick={() => setShowMobileFilter(true)}
        className="lg:hidden fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg z-50 flex items-center gap-2"
      >
        <ChevronRight size={20} />
        Filter
      </button>

      {/* Mobile Filter Modal */}
      {showMobileFilter && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full max-h-[80vh] rounded-t-2xl overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h2 className="font-bold text-lg">Filter</h2>
              <button
                onClick={() => setShowMobileFilter(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            {/* Category Filter Mobile */}
            <div className="p-4">
              <h3 className="font-semibold mb-3">Kategori</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-3 py-2">
                  <input
                    type="radio"
                    name="category-mobile"
                    checked={selectedCategory === ''}
                    onChange={() => handleCategoryChange('')}
                    className="w-4 h-4 text-green-600"
                  />
                  <span className={selectedCategory === '' ? 'font-semibold text-green-600' : 'text-gray-700'}>
                    Semua Kategori
                  </span>
                </label>
                
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center gap-3 py-2">
                    <input
                      type="radio"
                      name="category-mobile"
                      checked={selectedCategory === category.id}
                      onChange={() => handleCategoryChange(category.id)}
                      className="w-4 h-4 text-green-600"
                    />
                    <span className={selectedCategory === category.id ? 'font-semibold text-green-600' : 'text-gray-700'}>
                      {category.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
              <Button
                onClick={handleResetFilters}
                variant="outline"
                className="flex-1"
              >
                Reset
              </Button>
              <Button
                onClick={() => setShowMobileFilter(false)}
                className="flex-1"
              >
                Terapkan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;


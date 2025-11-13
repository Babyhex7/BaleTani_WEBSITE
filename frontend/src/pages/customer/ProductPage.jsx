/**
 * PRODUCT PAGE - TOKOPEDIA STYLE
 * Displays all products with sidebar filter, search, and pagination
 */

import { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronRight, Star, Search, SlidersHorizontal } from 'lucide-react';
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

  // Count active filters for badge
  const activeFiltersCount = [
    selectedCategory,
    filters.search
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header Section with Search - Katalog Produk */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white section-padding-responsive shadow-md">
        <div className="container-app">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-responsive">
            {/* Title Section */}
            <div className="flex-shrink-0">
              <h1 className="heading-section text-white">Katalog Produk</h1>
              <p className="text-body text-green-100 mt-1">Produk segar langsung dari petani lokal</p>
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
      <div className="container-app section-py">
        <div className="flex gap-4 lg:gap-6">
          
          {/* Sidebar Filter - Desktop */}
          <aside className="hidden lg:block w-56 xl:w-64 flex-shrink-0">
            <div className="card-responsive sticky top-24">
              
              {/* Filter Header */}
              <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="heading-sub">Filter</h2>
                {(selectedCategory || selectedSort !== 'newest') && (
                  <button
                    onClick={handleResetFilters}
                    className="text-caption sm:text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="border-b border-gray-200">
                <button
                  onClick={() => toggleSection('category')}
                  className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <span className="text-sm sm:text-base font-semibold text-gray-900">Kategori</span>
                  {expandedSections.category ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
                
                {expandedSections.category && (
                  <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-1.5 sm:space-y-2">
                    <label className="flex items-center gap-2.5 sm:gap-3 py-2 cursor-pointer hover:bg-gray-50 active:bg-gray-100 rounded px-2 -mx-2 btn-touch">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === ''}
                        onChange={() => handleCategoryChange('')}
                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                      <span className={`flex-1 text-caption sm:text-sm ${selectedCategory === '' ? 'font-semibold text-green-600' : 'text-gray-700'}`}>
                        Semua Kategori
                      </span>
                    </label>
                    
                    {categories.map((category) => (
                      <label 
                        key={category.id}
                        className="flex items-center gap-2.5 sm:gap-3 py-2 cursor-pointer hover:bg-gray-50 active:bg-gray-100 rounded px-2 -mx-2 btn-touch"
                      >
                        <input
                          type="radio"
                          name="category"
                          checked={selectedCategory === category.id}
                          onChange={() => handleCategoryChange(category.id)}
                          className="w-4 h-4 text-green-600 focus:ring-green-500"
                        />
                        <span className={`flex-1 text-caption sm:text-sm ${selectedCategory === category.id ? 'font-semibold text-green-600' : 'text-gray-700'}`}>
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
            <div className="card-responsive p-3 sm:p-4 mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Product Count */}
                <div className="text-caption sm:text-sm text-gray-600">
                  Menampilkan <span className="font-semibold text-gray-900">{products.length}</span> dari <span className="font-semibold text-gray-900">{pagination.totalItems}</span> produk
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-caption sm:text-sm text-gray-600 hidden sm:inline">Urutkan:</span>
                  <select
                    value={selectedSort}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="input-touch px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-caption sm:text-sm bg-white flex-1 sm:flex-none"
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
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
                  {filters.search && (
                    <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm">
                      <Search size={14} />
                      <span className="font-medium">"{filters.search}"</span>
                      <button 
                        onClick={() => {
                          setSearchInput('');
                          searchProducts('');
                        }}
                        className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
                        aria-label="Hapus pencarian"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  )}
                  {filters.category && (
                    <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm">
                      <span className="font-medium">{categories.find(c => c.id === filters.category)?.name}</span>
                      <button 
                        onClick={() => handleCategoryChange('')}
                        className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
                        aria-label="Hapus filter kategori"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12 sm:py-16 md:py-20">
                <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-green-600 border-t-transparent"></div>
                <p className="mt-4 text-body text-gray-600">Memuat produk...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="card-responsive bg-red-50 border border-red-200 p-5 sm:p-6 text-center">
                <p className="text-body text-red-600 font-medium mb-3">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="btn-touch px-4 sm:px-5 py-2 sm:py-2.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 active:bg-red-800"
                >
                  Coba Lagi
                </button>
              </div>
            )}

            {/* Products Grid - Tokopedia Style */}
            {!loading && !error && (
              <>
                {products.length > 0 ? (
                  <>
                    <div className="grid-products-sidebar mb-6">
                      {products.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          formatPrice={formatPrice}
                        />
                      ))}
                    </div>

                    {/* Pagination */}
                    <div className="mt-6 sm:mt-8">
                      <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.totalItems}
                        itemsPerPage={pagination.limit || 12}
                        onPageChange={changePage}
                        alwaysShow
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 sm:py-16 md:py-20">
                    <div className="text-5xl sm:text-6xl mb-4">🔍</div>
                    <h3 className="heading-card text-gray-700 mb-2">
                      Produk Tidak Ditemukan
                    </h3>
                    <p className="text-body text-gray-500 mb-4">
                      Coba ubah kata kunci pencarian atau filter Anda
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="btn-touch px-5 sm:px-6 py-2 sm:py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 text-sm font-medium transition-colors"
                    >
                      Reset Filter
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Floating Mobile Filter Button */}
      <button
        onClick={() => setShowMobileFilter(true)}
        className="lg:hidden fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white p-4 rounded-full shadow-lg z-50 flex items-center gap-2 transition-colors"
      >
        <SlidersHorizontal size={20} />
        <span className="text-sm font-medium">Filter</span>
        {activeFiltersCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
      </button>

      <Footer />

      {/* Mobile Filter Modal */}
      {showMobileFilter && (
        <div className="modal-bottom">
          <div className="modal-bottom-content">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="font-bold text-lg">Filter</h2>
              <button
                onClick={() => setShowMobileFilter(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
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
              <button
                onClick={handleResetFilters}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => setShowMobileFilter(false)}
                className="flex-1 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;


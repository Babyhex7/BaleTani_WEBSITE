/**
 * ============================================
 * CATEGORY PAGE - CUSTOMER SIDE
 * ============================================
 * Displays all categories with Tokopedia-style layout
 * 
 * FEATURES:
 * - Search categories
 * - Sort by name/product count
 * - Grid layout responsive
 * - Category cards with icons
 * - Reusable SearchBar component
 * 
 * @module CategoryPage
 * @requires components/ui/SearchBar
 * @requires hooks/useDebounce
 * 
 * @author BaleTani Development Team
 * @created 2025-11-12
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CubeIcon,
  ChevronRightIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  BeakerIcon,
  FireIcon,
  ShoppingBagIcon,
  CakeIcon,
  GiftIcon,
} from '@heroicons/react/24/solid';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import useDebounce from '../../hooks/useDebounce';
import categoryService from '../../services/services_customer/categoryService';

// Icon mapping untuk kategori berdasarkan nama
const getCategoryIcon = (categoryName) => {
  const name = categoryName.toLowerCase();
  
  if (name.includes('benih') || name.includes('seed')) return BeakerIcon;
  if (name.includes('pupuk') || name.includes('fertilizer')) return FireIcon;
  if (name.includes('sayur') || name.includes('vegetable')) return ShoppingBagIcon;
  if (name.includes('buah') || name.includes('fruit')) return CakeIcon;
  if (name.includes('bumbu') || name.includes('spice')) return SparklesIcon;
  
  return CubeIcon; // Default icon
};

const CategoryPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Count active filters
  const activeFiltersCount = (searchInput ? 1 : 0) + (sortBy !== 'name' ? 1 : 0);

  // Debounce search input
  const debouncedSearch = useDebounce(searchInput, 500);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await categoryService.getAllCategories();
        
        if (response.success) {
          setCategories(response.data);
          setFilteredCategories(response.data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err.message || 'Gagal memuat kategori. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };

    let isMounted = true;
    
    const loadCategories = async () => {
      if (isMounted) {
        await fetchCategories();
      }
    };
    
    loadCategories();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter and sort categories (with debounced search)
  useEffect(() => {
    let result = [...categories];

    // Search filter (using debounced value)
    if (debouncedSearch) {
      result = result.filter(category =>
        category.category_name.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    // Sort
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.category_name.localeCompare(b.category_name));
        break;
      case 'products':
        result.sort((a, b) => (b.product_count || 0) - (a.product_count || 0));
        break;
      default:
        break;
    }

    setFilteredCategories(result);
    // Reset to first page whenever filters/sort change
    setCurrentPage(1);
    
    // Debug pagination
    const totalPages = Math.ceil(result.length / itemsPerPage);
    // Pagination calculated
  }, [debouncedSearch, sortBy, categories, itemsPerPage]);

  // Handle category click
  const handleCategoryClick = (categoryId) => {
    navigate(`/categories/${categoryId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header Section with Search - Kategori Produk */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white section-padding-responsive shadow-md">
        <div className="container-app">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-responsive">
            {/* Title Section */}
            <div className="flex-shrink-0">
              <h1 className="heading-section text-white">Kategori Produk</h1>
              <p className="text-body text-green-100 mt-1">Jelajahi berbagai kategori produk segar pilihan</p>
            </div>
            
            {/* Search Bar - Reusable Component */}
            <div className="lg:flex-1 lg:max-w-2xl">
              <SearchBar 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onClear={() => setSearchInput('')}
                placeholder="Cari kategori..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
          MAIN CONTENT - SIDEBAR + GRID LAYOUT
          ============================================ */}
      <div className="container-app section-py">
        <div className="flex gap-4 lg:gap-6">
          
          {/* ========== SIDEBAR FILTER (Desktop Only) ========== */}
          <aside className="hidden lg:block w-56 xl:w-64 flex-shrink-0">
            <div className="card-responsive sticky top-24">
              
              {/* Filter Header */}
              <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="heading-sub">Filter</h2>
                {(searchInput || sortBy !== 'name') && (
                  <button
                    onClick={() => {
                      setSearchInput('');
                      setSortBy('name');
                    }}
                    className="text-caption sm:text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Sort Section */}
              <div className="border-b border-gray-200">
                <div className="p-3 sm:p-4">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">Urutkan</h3>
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="flex items-center gap-2.5 sm:gap-3 py-2 cursor-pointer hover:bg-gray-50 active:bg-gray-100 rounded px-2 -mx-2 btn-touch">
                      <input
                        type="radio"
                        name="sort"
                        value="name"
                        checked={sortBy === 'name'}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                      <span className={`flex-1 text-caption sm:text-sm ${sortBy === 'name' ? 'font-semibold text-green-600' : 'text-gray-700'}`}>
                        Nama A-Z
                      </span>
                    </label>
                    <label className="flex items-center gap-2.5 sm:gap-3 py-2 cursor-pointer hover:bg-gray-50 active:bg-gray-100 rounded px-2 -mx-2 btn-touch">
                      <input
                        type="radio"
                        name="sort"
                        value="products"
                        checked={sortBy === 'products'}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                      <span className={`flex-1 text-caption sm:text-sm ${sortBy === 'products' ? 'font-semibold text-green-600' : 'text-gray-700'}`}>
                        Jumlah Produk
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Search Info Section */}
              {searchInput && (
                <div className="p-3 sm:p-4 border-b border-gray-200">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">Pencarian Aktif</h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-caption sm:text-sm text-gray-700">
                      <span className="font-medium text-green-700">"{searchInput}"</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Results Count - Bottom */}
              <div className="p-3 sm:p-4">
                <p className="text-caption sm:text-sm text-gray-600">
                  Menampilkan <span className="font-semibold text-gray-900">{filteredCategories.length}</span> kategori
                  {categories.length !== filteredCategories.length && (
                    <span className="text-gray-500 block mt-1">dari {categories.length} total</span>
                  )}
                </p>
              </div>
            </div>
          </aside>

          {/* ========== MAIN CONTENT AREA ========== */}
          <main className="flex-1 min-w-0">

            {/* Sort & Count Bar */}
            <div className="card-responsive p-3 sm:p-4 mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Category Count */}
                <div className="text-caption sm:text-sm text-gray-600">
                  Menampilkan <span className="font-semibold text-gray-900">{filteredCategories.length}</span> dari <span className="font-semibold text-gray-900">{categories.length}</span> kategori
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-caption sm:text-sm text-gray-600 hidden sm:inline">Urutkan:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="input-touch px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-caption sm:text-sm bg-white flex-1 sm:flex-none"
                  >
                    <option value="name">Nama A-Z</option>
                    <option value="products">Jumlah Produk</option>
                  </select>
                </div>
              </div>
              
              {/* Active Search Tag */}
              {searchInput && (
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100 mt-3">
                  <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-caption sm:text-sm">
                    <span className="font-medium">"{searchInput}"</span>
                    <button 
                      onClick={() => setSearchInput('')}
                      className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
                      aria-label="Hapus pencarian"
                    >
                      <XMarkIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </span>
                </div>
              )}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12 sm:py-16 md:py-20">
                <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-green-600 border-t-transparent"></div>
                <p className="mt-4 text-body text-gray-600">Memuat kategori...</p>
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

            {/* Categories Grid */}
            {!loading && !error && (
              <>
                {filteredCategories.length > 0 ? (
                  <>
                    <div className="grid-products-sidebar mb-6">
              {filteredCategories
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((category) => {
              const IconComponent = getCategoryIcon(category.category_name);
              const hasImage = category.category_image;
              
              return (
                <div
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className="card-promo group cursor-pointer"
                >
                  <div className="p-4 sm:p-6 flex flex-col h-full">
                    {/* Image or Icon */}
                    {hasImage ? (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 overflow-hidden rounded-2xl group-hover:scale-110 transition-transform duration-300">
                        <img
                          src={`${import.meta.env.VITE_STATIC_BASE_URL}${category.category_image}`}
                          alt={category.category_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="hidden w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-100 to-green-50 rounded-2xl items-center justify-center">
                          <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-100 to-green-50 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                      </div>
                    )}

                    {/* Category Name */}
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors duration-200">
                      {category.category_name}
                    </h3>

                    {/* Description - Desktop Only, Hidden on Mobile */}
                    <div className="hidden sm:block flex-grow">
                      {category.description && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {category.description}
                        </p>
                      )}
                    </div>

                    {/* Product Count - Bottom */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                      <span className="text-xs sm:text-sm text-gray-500 font-medium">
                        {category.product_count || 0} produk
                      </span>
                      <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </div>
                </div>
                  );
                  })}
                    </div>

                    {/* Pagination */}
                    <div className="mt-6 sm:mt-8">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={Math.max(1, Math.ceil(filteredCategories.length / itemsPerPage))}
                        totalItems={filteredCategories.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={(p) => setCurrentPage(Math.max(1, Math.min(p, Math.ceil(filteredCategories.length / itemsPerPage))))}
                        alwaysShow
                      />
                    </div>
                  </>
                ) : (
                  /* Empty State */
                  <div className="text-center py-12 sm:py-16 md:py-20">
                    <CubeIcon className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-gray-300 mx-auto mb-4" />
                    <h3 className="heading-sub text-gray-700 mb-2">
                      Kategori tidak ditemukan
                    </h3>
                    <p className="text-body text-gray-500 mb-4">
                      {searchInput 
                        ? `Tidak ada kategori yang sesuai dengan pencarian "${searchInput}"`
                        : 'Belum ada kategori yang tersedia'
                      }
                    </p>
                    {searchInput && (
                      <button
                        onClick={() => setSearchInput('')}
                        className="btn-touch px-4 sm:px-6 py-2 sm:py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors text-sm sm:text-base"
                      >
                        Lihat Semua Kategori
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <Footer />

      {/* Floating Mobile Filter Button */}
      <button
        onClick={() => setShowMobileFilter(true)}
        className="floating-button bg-green-600 hover:bg-green-700 active:bg-green-800 text-white"
      >
        <AdjustmentsHorizontalIcon className="w-5 h-5" />
        <span className="text-sm font-medium">Filter</span>
        {activeFiltersCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Mobile Filter Modal */}
      {showMobileFilter && (
        <div className="modal-bottom animate-fade-in-fast" onClick={() => setShowMobileFilter(false)}>
          <div className="modal-bottom-content animate-slide-up-modal" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-sticky">
              <h2 className="font-bold text-lg">Filter & Urutkan</h2>
              <button
                onClick={() => setShowMobileFilter(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4">
              {/* Sort Filter */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Urutkan Berdasarkan</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 py-2">
                    <input
                      type="radio"
                      name="sort-mobile"
                      value="name"
                      checked={sortBy === 'name'}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-4 h-4 text-green-600"
                    />
                    <span className={sortBy === 'name' ? 'font-semibold text-green-600' : 'text-gray-700'}>
                      Nama A-Z
                    </span>
                  </label>
                  <label className="flex items-center gap-3 py-2">
                    <input
                      type="radio"
                      name="sort-mobile"
                      value="products"
                      checked={sortBy === 'products'}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-4 h-4 text-green-600"
                    />
                    <span className={sortBy === 'products' ? 'font-semibold text-green-600' : 'text-gray-700'}>
                      Jumlah Produk
                    </span>
                  </label>
                </div>
              </div>

              {/* Search Info */}
              {searchInput && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Pencarian Aktif</h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium text-green-700">"{searchInput}"</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Results Count */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Menampilkan <span className="font-semibold text-gray-900">{filteredCategories.length}</span> kategori
                  {categories.length !== filteredCategories.length && (
                    <span className="text-gray-500 block mt-1">dari {categories.length} total</span>
                  )}
                </p>
              </div>
            </div>

            {/* Modal Footer - Action Buttons */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-3">
              <button
                onClick={() => {
                  setSortBy('name');
                  setSearchInput('');
                }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => setShowMobileFilter(false)}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;

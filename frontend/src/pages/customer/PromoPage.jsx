/**
 * ============================================
 * PROMO PAGE - CUSTOMER SIDE
 * ============================================
 * Displays all products with active discounts/promotions
 * Style: Tokopedia-inspired dengan sidebar filter
 * 
 * FEATURES:
 * - Filter by discount name (nama promo)
 * - Filter by category
 * - Sort by discount percentage, price, name
 * - Search products
 * - Reuse ProductCard component
 * - Responsive layout
 * 
 * @module PromoPage
 * @requires components/ui/ProductCard
 * @requires services/services_customer/discountService
 * @requires hooks/useDebounce
 * 
 * @author BaleTani Development Team
 * @created 2025-11-12
 */

import { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronRight, Percent, SlidersHorizontal } from 'lucide-react';
import ProductCard from '../../components/ui/ProductCard';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import discountService from '../../services/services_customer/discountService';
import useDebounce from '../../hooks/useDebounce';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const PromoPage = () => {
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const [promoProducts, setPromoProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filter states
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDiscount, setSelectedDiscount] = useState(''); // Filter by discount name
  const [sortBy, setSortBy] = useState('discount_desc'); // Default: diskon terbesar
  
  // UI states
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    discount: true,
    category: true,
  });
  
  // Available filters
  const [categories, setCategories] = useState([]);
  const [discounts, setDiscounts] = useState([]); // List of discount names
  
  // Debounce search input
  const debouncedSearch = useDebounce(searchInput, 500);
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // show more products per page on promo

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================
  
  /**
   * Toggle section expand/collapse
   */
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  /**
   * Handle reset all filters
   */
  const handleResetFilters = () => {
    setSearchInput('');
    setSelectedCategory('');
    setSelectedDiscount('');
    setSortBy('discount_desc');
  };

  // ========================================
  // FETCH PROMO PRODUCTS
  // ========================================
  useEffect(() => {
    const fetchPromoProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🎁 [PROMO PAGE] Fetching discounts...');
        
        const response = await discountService.getAllDiscounts();
        
        if (response.success) {
          console.log('✅ [PROMO PAGE] Received', response.data.length, 'discounts');
          
          // Transform ke flat array of products
          const productsWithDiscounts = response.data.flatMap(discount => 
            (discount.products || []).map(product => ({
              id: product.id,
              name: product.name,
              description: product.description,
              price: product.price,
              stock: product.stock,
              category: product.category,
              image: product.image,
              discount: {
                id: discount.id,
                name: discount.name,
                type: discount.type,
                value: discount.value,
                finalPrice: product.discountedPrice,
                validUntil: discount.endDate,
              }
            }))
          );
          
          console.log('📦 [PROMO PAGE] Total products:', productsWithDiscounts.length);
          
          setPromoProducts(productsWithDiscounts);
          setFilteredProducts(productsWithDiscounts);
          
          // Extract unique categories (filter out null/undefined)
          const uniqueCategories = [...new Set(
            productsWithDiscounts
              .map(p => p.category)
              .filter(cat => cat !== null && cat !== undefined && cat !== '')
          )];
          setCategories(uniqueCategories);
          
          // Extract unique discount names
          const uniqueDiscounts = [...new Set(
            response.data
              .map(d => d.name)
              .filter(name => name !== null && name !== undefined)
          )];
          setDiscounts(uniqueDiscounts);
          
        }
      } catch (err) {
        console.error('❌ [PROMO PAGE] Error:', err);
        setError(err.message || 'Gagal memuat produk promo');
      } finally {
        setLoading(false);
      }
    };

    fetchPromoProducts();
  }, []);

  // Group products by promo
  const groupedByPromo = filteredProducts.reduce((acc, product) => {
    if (product.discount && product.discount.name) {
      const promoName = product.discount.name;
      if (!acc[promoName]) {
        acc[promoName] = {
          name: promoName,
          description: product.discount.description || '',
          products: []
        };
      }
      acc[promoName].products.push(product);
    }
    return acc;
  }, {});

  // ========================================
  // FILTER & SORT LOGIC
  // ========================================
  useEffect(() => {
    let result = [...promoProducts];

    // 1. Filter by search (debounced)
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      result = result.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.discount?.name?.toLowerCase().includes(searchLower)
      );
    }

    // 2. Filter by category
    if (selectedCategory) {
      result = result.filter(product => product.category === selectedCategory);
    }

    // 3. Filter by discount name
    if (selectedDiscount) {
      result = result.filter(product => product.discount?.name === selectedDiscount);
    }

    // 4. Sort
    switch (sortBy) {
      case 'discount_desc':
        result.sort((a, b) => {
          const discountA = ((a.price - a.discount.finalPrice) / a.price) * 100;
          const discountB = ((b.price - b.discount.finalPrice) / b.price) * 100;
          return discountB - discountA;
        });
        break;
      case 'discount_asc':
        result.sort((a, b) => {
          const discountA = ((a.price - a.discount.finalPrice) / a.price) * 100;
          const discountB = ((b.price - b.discount.finalPrice) / b.price) * 100;
          return discountA - discountB;
        });
        break;
      case 'price_asc':
        result.sort((a, b) => a.discount.finalPrice - b.discount.finalPrice);
        break;
      case 'price_desc':
        result.sort((a, b) => b.discount.finalPrice - a.discount.finalPrice);
        break;
      case 'name_asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    setFilteredProducts(result);
    console.log('🔍 [PROMO FILTER] Results:', result.length, 'products');
    // reset pagination when filters change
    setCurrentPage(1);
    
    // Debug pagination
    const totalPages = Math.ceil(result.length / itemsPerPage);
    console.log('📄 [PROMO PAGE] Total products:', result.length, '| Pages:', totalPages, '| Items per page:', itemsPerPage);
  }, [promoProducts, debouncedSearch, selectedCategory, selectedDiscount, sortBy, itemsPerPage]);

  // ========================================
  // COMPUTED VALUES
  // ========================================
  
  /**
   * Count active filters
   */
  const activeFiltersCount = [
    selectedCategory,
    selectedDiscount,
    debouncedSearch
  ].filter(Boolean).length;

  /**
   * Check if any filter is active
   */
  const hasActiveFilters = activeFiltersCount > 0 || sortBy !== 'discount_desc';

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* ============================================
          HEADER WITH SEARCH BAR - RED GRADIENT (PROMO STYLE)
          ============================================ */}
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white section-padding-responsive shadow-md">
        <div className="container-app">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-responsive">
            
            {/* Title Section */}
            <div className="flex-shrink-0">
              <h1 className="heading-section text-white">🎉 Promo Spesial</h1>
              <p className="text-body text-red-100 mt-1">Jangan lewatkan penawaran terbaik untuk produk segar</p>
            </div>
            
            {/* Search Bar - Reusable Component */}
            <div className="lg:flex-1 lg:max-w-2xl w-full">
              <SearchBar 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onClear={() => {
                  setSearchInput('');
                }}
                placeholder="Cari produk promo..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
          MAIN CONTENT - TOKOPEDIA LAYOUT
          ============================================ */}
      <div className="container-app section-py">
        <div className="flex gap-4 lg:gap-6">
          
          {/* ============================================
              SIDEBAR FILTER (Desktop) - SAMA SEPERTI PRODUCT PAGE
              ============================================ */}
          
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-56 xl:w-64 flex-shrink-0">
            <div className="card-responsive sticky top-24">
              
              {/* Filter Header */}
              <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="heading-sub">Filter</h2>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="text-caption sm:text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Discount Name Filter */}
              <div className="border-b border-gray-200">
                <button
                  onClick={() => toggleSection('discount')}
                  className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <span className="text-sm sm:text-base font-semibold text-gray-900">Nama Promo</span>
                  {expandedSections.discount ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>

                {expandedSections.discount && (
                  <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-1.5 sm:space-y-2">
                    <label className="flex items-center gap-2.5 sm:gap-3 py-2 cursor-pointer hover:bg-gray-50 active:bg-gray-100 rounded px-2 -mx-2 btn-touch">
                      <input
                        type="radio"
                        name="discount"
                        checked={selectedDiscount === ''}
                        onChange={() => setSelectedDiscount('')}
                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                      <span className={`flex-1 text-caption sm:text-sm ${selectedDiscount === '' ? 'font-semibold text-green-600' : 'text-gray-700'}`}>
                        Semua Promo
                      </span>
                    </label>
                    {discounts.map((discount) => (
                      <label key={discount} className="flex items-center gap-2.5 sm:gap-3 py-2 cursor-pointer hover:bg-gray-50 active:bg-gray-100 rounded px-2 -mx-2 btn-touch">
                        <input
                          type="radio"
                          name="discount"
                          checked={selectedDiscount === discount}
                          onChange={() => setSelectedDiscount(discount)}
                          className="w-4 h-4 text-green-600 focus:ring-green-500"
                        />
                        <span className={`flex-1 text-caption sm:text-sm ${selectedDiscount === discount ? 'font-semibold text-green-600' : 'text-gray-700'}`}>
                          {discount}
                        </span>
                      </label>
                    ))}
                  </div>
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
                        onChange={() => setSelectedCategory('')}
                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                      <span className={`flex-1 text-caption sm:text-sm ${selectedCategory === '' ? 'font-semibold text-green-600' : 'text-gray-700'}`}>
                        Semua Kategori
                      </span>
                    </label>
                    {categories.map((category) => (
                      <label key={category} className="flex items-center gap-2.5 sm:gap-3 py-2 cursor-pointer hover:bg-gray-50 active:bg-gray-100 rounded px-2 -mx-2 btn-touch">
                        <input
                          type="radio"
                          name="category"
                          checked={selectedCategory === category}
                          onChange={() => setSelectedCategory(category)}
                          className="w-4 h-4 text-green-600 focus:ring-green-500"
                        />
                        <span className={`flex-1 text-caption sm:text-sm ${selectedCategory === category ? 'font-semibold text-green-600' : 'text-gray-700'}`}>
                          {category}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Mobile Filter Modal - Slide from Bottom like ProductPage */}
          {isMobileFilterOpen && (
            <div className="modal-bottom" onClick={() => setIsMobileFilterOpen(false)}>
              <div className="modal-bottom-content" onClick={(e) => e.stopPropagation()}>
                
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                  <h2 className="font-bold text-lg">Filter</h2>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-4">
                  {/* Discount Filter */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">Nama Promo</h3>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 py-2">
                        <input
                          type="radio"
                          name="discount-mobile"
                          checked={selectedDiscount === ''}
                          onChange={() => setSelectedDiscount('')}
                          className="w-4 h-4 text-green-600"
                        />
                        <span className={selectedDiscount === '' ? 'font-semibold text-green-600' : 'text-gray-700'}>
                          Semua Promo
                        </span>
                      </label>
                      {discounts.map((discount) => (
                        <label key={discount} className="flex items-center gap-3 py-2">
                          <input
                            type="radio"
                            name="discount-mobile"
                            checked={selectedDiscount === discount}
                            onChange={() => setSelectedDiscount(discount)}
                            className="w-4 h-4 text-green-600"
                          />
                          <span className={selectedDiscount === discount ? 'font-semibold text-green-600' : 'text-gray-700'}>
                            {discount}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">Kategori</h3>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 py-2">
                        <input
                          type="radio"
                          name="category-mobile"
                          checked={selectedCategory === ''}
                          onChange={() => setSelectedCategory('')}
                          className="w-4 h-4 text-green-600"
                        />
                        <span className={selectedCategory === '' ? 'font-semibold text-green-600' : 'text-gray-700'}>
                          Semua Kategori
                        </span>
                      </label>
                      {categories.map((category) => (
                        <label key={category} className="flex items-center gap-3 py-2">
                          <input
                            type="radio"
                            name="category-mobile"
                            checked={selectedCategory === category}
                            onChange={() => setSelectedCategory(category)}
                            className="w-4 h-4 text-green-600"
                          />
                          <span className={selectedCategory === category ? 'font-semibold text-green-600' : 'text-gray-700'}>
                            {category}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Modal Footer - Action Buttons */}
                <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
                  <button
                    onClick={() => {
                      handleResetFilters();
                      setIsMobileFilterOpen(false);
                    }}
                    className="flex-1 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="flex-1 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
                  >
                    Terapkan
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================
              MAIN CONTENT (Sort + Products Grid)
              ============================================ */}
          <div className="flex-1">
            
            {/* Sort Bar & Active Filters */}
            <div className="card-responsive p-3 sm:p-4 mb-4">
              
              {/* Sort Dropdown & Results */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-caption sm:text-sm text-gray-600">
                  Menampilkan <span className="font-semibold text-gray-900">{filteredProducts.length}</span> produk
                  {promoProducts.length !== filteredProducts.length && (
                    <span className="text-gray-500"> dari {promoProducts.length} total</span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-caption sm:text-sm text-gray-600 hidden sm:inline">Urutkan:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="input-touch px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-caption sm:text-sm bg-white flex-1 sm:flex-none"
                  >
                    <option value="discount_desc">Diskon Terbesar</option>
                    <option value="discount_asc">Diskon Terkecil</option>
                    <option value="price_asc">Harga Terendah</option>
                    <option value="price_desc">Harga Tertinggi</option>
                    <option value="name_asc">Nama A-Z</option>
                    <option value="name_desc">Nama Z-A</option>
                  </select>
                </div>
              </div>

              {/* Active Filters Tags */}
              {(selectedCategory || selectedDiscount || debouncedSearch) && (
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
                  {selectedCategory && (
                    <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm">
                      <span className="font-medium">{selectedCategory}</span>
                      <button 
                        onClick={() => setSelectedCategory('')} 
                        className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
                        aria-label="Hapus filter kategori"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  )}
                  {selectedDiscount && (
                    <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm">
                      <span className="font-medium">{selectedDiscount}</span>
                      <button 
                        onClick={() => setSelectedDiscount('')} 
                        className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
                        aria-label="Hapus filter promo"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  )}
                  {debouncedSearch && (
                    <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm">
                      <span className="font-medium">"{debouncedSearch}"</span>
                      <button 
                        onClick={() => setSearchInput('')} 
                        className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
                        aria-label="Hapus pencarian"
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
                <p className="mt-4 text-body text-gray-600">Memuat produk promo...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="card-responsive bg-red-50 border border-red-200 p-5 sm:p-6 text-center">
                <Percent size={40} className="mx-auto text-red-400 mb-3 sm:w-12 sm:h-12" />
                <p className="text-body text-red-600 font-medium mb-3">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="btn-touch px-4 sm:px-5 py-2 sm:py-2.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 active:bg-red-800"
                >
                  Coba Lagi
                </button>
              </div>
            )}

            {/* Products Grid */}
            {!loading && !error && (
              <>
                {filteredProducts.length > 0 ? (
                  <>
                    <div className="grid-products-sidebar mb-6">
                      {filteredProducts
                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                        .map((product) => (
                          <ProductCard 
                            key={`${product.id}-${product.discount?.id || 'no'}`}
                            product={product} 
                          />
                        ))}
                    </div>

                    {/* Pagination for promo products (client-side) */}
                    <div className="mt-6 sm:mt-8">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage))}
                        totalItems={filteredProducts.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={(p) => setCurrentPage(Math.max(1, Math.min(p, Math.ceil(filteredProducts.length / itemsPerPage))))}
                        alwaysShow
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 sm:py-16 md:py-20">
                    <Percent size={48} className="mx-auto text-gray-300 mb-4 sm:w-16 sm:h-16" />
                    <h3 className="heading-card text-gray-700 mb-2">
                      Tidak ada produk ditemukan
                    </h3>
                    <p className="text-body text-gray-500 mb-4">
                      Coba ubah filter atau kata kunci pencarian
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={handleResetFilters}
                        className="btn-touch px-5 sm:px-6 py-2 sm:py-2.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 active:bg-green-800"
                      >
                        Reset Filter
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Floating Mobile Filter Button - Like ProductPage */}
      <button
        onClick={() => setIsMobileFilterOpen(true)}
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
    </div>
  );
};

export default PromoPage;

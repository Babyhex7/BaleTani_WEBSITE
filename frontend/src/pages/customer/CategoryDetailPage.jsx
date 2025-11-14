/**
 * CATEGORY DETAIL PAGE - CUSTOMER SIDE
 * Displays all products in a specific category
 * Mobile responsive with global CSS utilities
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Package, 
  ArrowLeft, 
  X, 
  ChevronDown,
  Filter
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ProductCard from '../../components/ui/ProductCard';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import categoryService from '../../services/services_customer/categoryService';
import useDebounce from '../../hooks/useDebounce';

const CategoryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  // Debounce search input - hanya trigger API setelah user berhenti mengetik 500ms
  const debouncedSearch = useDebounce(searchInput, 500);

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Fetch category and products
  useEffect(() => {
    const fetchCategoryDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await categoryService.getCategoryDetail(id, {
          page: pagination.currentPage,
          limit: 12,
          search: debouncedSearch,
          sort_by: sortBy === 'newest' ? 'created_at' : 'selling_price',
          sort_order: sortBy === 'newest' ? 'DESC' : sortBy === 'price-low' ? 'ASC' : 'DESC',
        });
        
        if (response.success) {
          setCategory(response.data.category);
          setProducts(response.data.products);
          setFilteredProducts(response.data.products);
          setPagination(response.data.pagination);
        }
      } catch (err) {
        console.error('Error fetching category detail:', err);
        setError(err.message || 'Gagal memuat kategori. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryDetail();
  }, [id, pagination.currentPage, debouncedSearch, sortBy]);

  // Handle sort change
  const handleSortChange = (value) => {
    setSortBy(value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Handle page change
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchInput('');
    setSortBy('newest');
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center py-12 sm:py-16">
            <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-green-600 border-t-transparent"></div>
            <p className="mt-4 text-body text-gray-600">Memuat kategori...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !category) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 section-py">
          <div className="container-app">
            <div className="card-responsive text-center py-12 sm:py-16">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Package className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
              </div>
              <h2 className="heading-sub sm:heading-card mb-2 text-red-600">
                {error || 'Kategori tidak ditemukan'}
              </h2>
              <p className="text-body text-gray-600 mb-6">
                Kategori yang Anda cari tidak tersedia atau telah dihapus.
              </p>
              <button
                onClick={() => navigate('/categories')}
                className="btn-touch px-6 sm:px-8 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold rounded-lg transition-colors"
              >
                Kembali ke Kategori
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      {/* Header Section with Search - Same as CategoryPage */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md">
        <div className="container-app py-4 sm:py-6 lg:py-8">
          {/* Back Button */}
          <button
            onClick={() => navigate('/categories')}
            className="btn-touch mb-3 sm:mb-4 px-0 flex items-center gap-2 text-green-100 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base font-medium">Kembali ke Kategori</span>
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 lg:gap-6">
            {/* Title Section */}
            <div className="flex-shrink-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">
                {category.category_name}
              </h1>
              <p className="text-xs sm:text-sm text-green-100">
                Produk segar langsung dari petani lokal
              </p>
            </div>

            {/* Search Bar - Reusable Component */}
            <div className="lg:flex-1 lg:max-w-2xl">
              <SearchBar 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onClear={() => setSearchInput('')}
                placeholder="Cari produk dalam kategori ini..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Mobile Responsive */}
      <div className="bg-gray-50 section-py">
        <div className="container-app">

          {/* Filter & Sort Bar - Mobile Friendly */}
          <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Results Count */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm text-gray-600">
                  Menampilkan <span className="font-semibold text-gray-900">{filteredProducts.length}</span> dari <span className="font-semibold text-gray-900">{pagination.totalItems || filteredProducts.length}</span> produk
                </span>
                {searchInput && (
                  <>
                    <span className="hidden sm:inline text-gray-400">•</span>
                    <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium">
                      <span className="max-w-[120px] sm:max-w-[200px] truncate">"{searchInput}"</span>
                      <button
                        onClick={() => setSearchInput('')}
                        className="hover:bg-green-100 rounded-full p-0.5 transition-colors flex-shrink-0"
                        aria-label="Clear search filter"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Sort Dropdown - Touch Friendly */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">Urutkan:</span>
                <div className="relative flex-1 sm:flex-initial min-w-[140px] sm:min-w-[160px]">
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-lg pl-3 pr-8 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer transition-colors"
                  >
                    <option value="newest">Terbaru</option>
                    <option value="price-low">Harga Terendah</option>
                    <option value="price-high">Harga Tertinggi</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid - Same as other pages */}
          {filteredProducts.length > 0 ? (
            <>
              {/* Grid layout: 1 col mobile, 2 cols tablet, 3 cols desktop, 4 cols xl */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      ...product,
                      category: category.category_name,
                    }}
                    formatPrice={formatPrice}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.totalItems}
                  itemsPerPage={pagination.itemsPerPage || 12}
                  onPageChange={handlePageChange}
                  alwaysShow
                />
              )}
            </>
          ) : (
            /* Empty State - Mobile Responsive */
            <div className="card-responsive text-center py-12 sm:py-16">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Package className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
              </div>
              <h3 className="heading-sub sm:heading-card mb-2">
                Produk tidak ditemukan
              </h3>
              <p className="text-body text-gray-600 mb-6 max-w-md mx-auto px-4">
                {searchInput 
                  ? `Tidak ada produk yang sesuai dengan pencarian "${searchInput}" dalam kategori ini`
                  : 'Belum ada produk dalam kategori ini'
                }
              </p>
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  className="btn-touch px-6 sm:px-8 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold rounded-lg transition-colors"
                >
                  Lihat Semua Produk
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default CategoryDetailPage;

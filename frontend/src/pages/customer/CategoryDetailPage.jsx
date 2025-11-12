/**
 * CATEGORY DETAIL PAGE - CUSTOMER SIDE
 * Displays all products in a specific category
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CubeIcon,
  ArrowLeftIcon,
  XMarkIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import {
  BeakerIcon,
  FireIcon,
  ShoppingBagIcon,
  CakeIcon,
  SparklesIcon,
} from '@heroicons/react/24/solid';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ProductCard from '../../components/ui/ProductCard';
import Pagination from '../../components/ui/Pagination';
import SearchBar from '../../components/ui/SearchBar';
import axios from 'axios';

// Custom debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Icon mapping untuk kategori
const getCategoryIcon = (categoryName) => {
  const name = categoryName.toLowerCase();
  
  if (name.includes('benih') || name.includes('seed')) return BeakerIcon;
  if (name.includes('pupuk') || name.includes('fertilizer')) return FireIcon;
  if (name.includes('sayur') || name.includes('vegetable')) return ShoppingBagIcon;
  if (name.includes('buah') || name.includes('fruit')) return CakeIcon;
  if (name.includes('bumbu') || name.includes('spice')) return SparklesIcon;
  
  return CubeIcon;
};

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
        const response = await axios.get(`http://localhost:5000/api/public/categories/${id}`, {
          params: {
            page: pagination.currentPage,
            limit: 12,
            search: debouncedSearch,
            sort_by: sortBy === 'newest' ? 'created_at' : sortBy === 'price-low' ? 'selling_price' : 'selling_price',
            sort_order: sortBy === 'newest' ? 'DESC' : sortBy === 'price-low' ? 'ASC' : 'DESC',
          }
        });
        
        if (response.data.success) {
          setCategory(response.data.data.category);
          setProducts(response.data.data.products);
          setFilteredProducts(response.data.data.products);
          // Map snake_case to camelCase for internal use
          setPagination({
            currentPage: response.data.data.pagination.current_page || 1,
            totalPages: response.data.data.pagination.total_pages || 1,
            totalItems: response.data.data.pagination.total_items || 0,
            itemsPerPage: response.data.data.pagination.items_per_page || 12,
          });
        }
      } catch (err) {
        console.error('Error fetching category detail:', err);
        setError('Gagal memuat kategori. Silakan coba lagi.');
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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600">Memuat kategori...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600">{error || 'Kategori tidak ditemukan'}</p>
            <button
              onClick={() => navigate('/categories')}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-medium transition-colors duration-200"
            >
              Kembali ke Kategori
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const IconComponent = getCategoryIcon(category.category_name);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header with Search */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <button
            onClick={() => navigate('/categories')}
            className="flex items-center gap-2 text-green-100 hover:text-white mb-4 transition-colors duration-200"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Kembali ke Kategori</span>
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Title */}
            <div className="flex-shrink-0">
              <h1 className="text-2xl md:text-3xl font-bold mb-1">
                {category.category_name}
              </h1>
              <p className="text-green-100 text-sm md:text-base">
                Produk segar langsung dari petani lokal
              </p>
            </div>

            {/* Search Bar */}
            <div className="w-full lg:max-w-2xl">
              <SearchBar
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onClear={() => setSearchInput('')}
                placeholder="Cari produk segar..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Sort Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Results Count */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">
                Menampilkan <span className="font-semibold text-gray-900">{filteredProducts.length}</span> dari <span className="font-semibold text-gray-900">{pagination.totalItems || filteredProducts.length}</span> produk
              </span>
              {searchInput && (
                <>
                  <span className="text-sm text-gray-400">•</span>
                  <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                    <span>"{searchInput}"</span>
                    <button
                      onClick={() => setSearchInput('')}
                      className="hover:bg-green-100 rounded-full p-0.5 transition-colors"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Urutkan:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors cursor-pointer"
                >
                  <option value="newest">Terbaru</option>
                  <option value="price-low">Harga Terendah</option>
                  <option value="price-high">Harga Tertinggi</option>
                </select>
                <ChevronDownIcon className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-8">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    unit: product.unit,
                    stock: product.stock,
                    image: product.image,
                    category: category.category_name,
                    discount: product.discount,
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
              />
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm text-center py-16 px-4">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CubeIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Produk tidak ditemukan
              </h3>
              <p className="text-gray-600 mb-6">
                {searchInput 
                  ? `Tidak ada produk yang sesuai dengan pencarian "${searchInput}" dalam kategori ini`
                  : 'Belum ada produk dalam kategori ini'
                }
              </p>
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Lihat Semua Produk
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CategoryDetailPage;

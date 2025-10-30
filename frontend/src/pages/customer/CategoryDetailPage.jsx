/**
 * CATEGORY DETAIL PAGE - CUSTOMER SIDE
 * Displays all products in a specific category
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon,
  CubeIcon,
  ArrowLeftIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
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
import axios from 'axios';

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
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

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
            search: searchInput,
            sort_by: sortBy === 'newest' ? 'created_at' : sortBy === 'price-low' ? 'selling_price' : 'selling_price',
            sort_order: sortBy === 'newest' ? 'DESC' : sortBy === 'price-low' ? 'ASC' : 'DESC',
          }
        });
        
        if (response.data.success) {
          setCategory(response.data.data.category);
          setProducts(response.data.data.products);
          setFilteredProducts(response.data.data.products);
          setPagination(response.data.data.pagination);
        }
      } catch (err) {
        console.error('Error fetching category detail:', err);
        setError('Gagal memuat kategori. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryDetail();
  }, [id, pagination.currentPage, searchInput, sortBy]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
  };

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

  // Pagination buttons
  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            i === pagination.currentPage
              ? 'bg-green-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-green-50 hover:text-green-600 border border-gray-200'
          }`}
        >
          {i}
        </button>
      );
    }

    return pages;
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
      
      {/* Category Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => navigate('/categories')}
              className="flex items-center gap-2 text-green-100 hover:text-white mb-6 transition-colors duration-200"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Kembali ke Kategori
            </button>

            {/* Category Info */}
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <IconComponent className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {category.category_name}
                </h1>
                {category.description && (
                  <p className="text-green-100 text-lg">
                    {category.description}
                  </p>
                )}
                <p className="text-green-200 mt-2">
                  {category.product_count} produk tersedia
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Cari produk dalam kategori ini..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </form>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="newest">Terbaru</option>
                <option value="price-low">Harga Terendah</option>
                <option value="price-high">Harga Tertinggi</option>
              </select>

              {(searchInput || sortBy !== 'newest') && (
                <button
                  onClick={handleResetFilters}
                  className="p-2 text-gray-500 hover:text-red-600 transition-colors duration-200"
                  title="Reset Filter"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
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
                  }}
                  formatPrice={formatPrice}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-4 py-2 rounded-lg font-medium bg-white text-gray-700 hover:bg-green-50 hover:text-green-600 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Sebelumnya
                </button>
                
                {renderPagination()}
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-4 py-2 rounded-lg font-medium bg-white text-gray-700 hover:bg-green-50 hover:text-green-600 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Selanjutnya
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <CubeIcon className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Produk tidak ditemukan
            </h3>
            <p className="text-gray-600 mb-6">
              {searchInput 
                ? `Tidak ada produk yang sesuai dengan pencarian "${searchInput}"`
                : 'Belum ada produk dalam kategori ini'
              }
            </p>
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-medium transition-colors duration-200"
              >
                Lihat Semua Produk
              </button>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CategoryDetailPage;

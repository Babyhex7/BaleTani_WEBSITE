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
import useDebounce from '../../hooks/useDebounce';
import axios from 'axios';

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

  // Debounce search input
  const debouncedSearch = useDebounce(searchInput, 500);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/public/categories');
        
        if (response.data.success) {
          setCategories(response.data.data);
          setFilteredCategories(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Gagal memuat kategori. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
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
  }, [debouncedSearch, sortBy, categories]);

  // Handle category click
  const handleCategoryClick = (categoryId) => {
    navigate(`/categories/${categoryId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* ============================================
          HEADER WITH SEARCH BAR - GREEN GRADIENT
          ============================================ */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-6 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            
            {/* Title Section */}
            <div className="flex-shrink-0">
              <h1 className="text-2xl md:text-3xl font-bold">Kategori Produk</h1>
              <p className="text-green-100 text-sm md:text-base mt-1">Jelajahi berbagai kategori produk segar pilihan</p>
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
          MAIN CONTENT
          ============================================ */}
      <div className="container mx-auto px-4 py-6">
        
        {/* Sort Bar & Results Count */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-sm text-gray-600">
              Menampilkan <span className="font-semibold text-gray-900">{filteredCategories.length}</span> kategori
              {categories.length !== filteredCategories.length && (
                <span className="text-gray-500"> dari {categories.length} total</span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-white"
              >
                <option value="name">Nama A-Z</option>
                <option value="products">Jumlah Produk</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
            <p className="text-gray-600">Memuat kategori...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Categories Grid */}
        {!loading && !error && filteredCategories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCategories.map((category) => {
              const IconComponent = getCategoryIcon(category.category_name);
              
              return (
                <div
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden border border-gray-200 hover:border-green-500"
                >
                  <div className="p-6">
                    {/* Icon */}
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-8 h-8 text-green-600" />
                    </div>

                    {/* Category Name */}
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors duration-200">
                      {category.category_name}
                    </h3>

                    {/* Description */}
                    {category.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {category.description}
                      </p>
                    )}

                    {/* Product Count */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-500">
                        {category.product_count || 0} produk
                      </span>
                      <ChevronRightIcon className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </div>

                  {/* Hover Effect Gradient */}
                  <div className="h-1 bg-gradient-to-r from-green-500 to-green-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredCategories.length === 0 && (
          <div className="text-center py-20">
            <CubeIcon className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Kategori tidak ditemukan
            </h3>
            <p className="text-gray-500 mb-4">
              {searchInput 
                ? `Tidak ada kategori yang sesuai dengan pencarian "${searchInput}"`
                : 'Belum ada kategori yang tersedia'
              }
            </p>
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Lihat Semua Kategori
              </button>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CategoryPage;

/**
 * CATEGORY PAGE - CUSTOMER SIDE
 * Displays all categories with search and filter using Heroicons
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon,
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

  // Filter and sort categories
  useEffect(() => {
    let result = [...categories];

    // Search filter
    if (searchInput) {
      result = result.filter(category =>
        category.category_name.toLowerCase().includes(searchInput.toLowerCase())
      );
    }

    // Sort
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.category_name.localeCompare(b.category_name));
        break;
      case 'products':
        result.sort((a, b) => b.product_count - a.product_count);
        break;
      default:
        break;
    }

    setFilteredCategories(result);
  }, [searchInput, sortBy, categories]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
  };

  // Handle category click
  const handleCategoryClick = (categoryId) => {
    navigate(`/categories/${categoryId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Kategori <span className="text-green-200">Produk</span>
            </h1>
            <p className="text-lg text-green-100 mb-8">
              Jelajahi berbagai kategori produk segar pilihan dari BaleTani
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Cari kategori..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full px-6 py-4 pr-32 rounded-full text-gray-900 placeholder-gray-400 shadow-lg focus:outline-none focus:ring-4 focus:ring-green-300"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-medium transition-colors duration-200 flex items-center gap-2"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
                Cari
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-medium">Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="name">Nama A-Z</option>
                <option value="products">Jumlah Produk</option>
              </select>
            </div>
            
            <div className="text-gray-600">
              Ditemukan <span className="font-semibold text-green-600">{filteredCategories.length}</span> kategori
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
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600">{error}</p>
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
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden"
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
                        {category.product_count} produk
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
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Kategori tidak ditemukan
            </h3>
            <p className="text-gray-600 mb-6">
              {searchInput 
                ? `Tidak ada kategori yang sesuai dengan pencarian "${searchInput}"`
                : 'Belum ada kategori yang tersedia'
              }
            </p>
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-medium transition-colors duration-200"
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

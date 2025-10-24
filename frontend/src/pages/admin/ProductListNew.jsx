import React, { useEffect, useState } from 'react';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { CubeIcon } from '@heroicons/react/24/solid';
import AdminSidebarNew from '../../components/layout_admin/AdminSidebarNew';
import AdminHeaderNew from '../../components/layout_admin/AdminHeaderNew';
import inventoryService from '../../services/services_admin/inventoryService';

const ProductListNew = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    lowStock: 0,
    outOfStock: 0
  });

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchQuery, filterType, filterStatus]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchQuery,
        product_type: filterType,
        status: filterStatus
      };

      const data = await inventoryService.getProducts(params);
      
      if (data.success) {
        setProducts(data.data.products || []);
        setTotalPages(data.data.pagination?.totalPages || 1);
        
        // Calculate stats
        const allProducts = data.data.products || [];
        setStats({
          total: allProducts.length,
          active: allProducts.filter(p => p.is_active).length,
          lowStock: allProducts.filter(p => p.total_stock <= 10 && p.total_stock > 0).length,
          outOfStock: allProducts.filter(p => p.total_stock === 0).length
        });
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  const getStockBadge = (stock) => {
    if (stock === 0) {
      return <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">0 kg</span>;
    } else if (stock <= 10) {
      return <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">{stock} kg</span>;
    } else {
      return <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">{stock} kg</span>;
    }
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full flex items-center gap-1">
        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
        Aktif
      </span>
    ) : (
      <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
        Inactive
      </span>
    );
  };

  const getTypeBadge = (type) => {
    return type === 'online' ? (
      <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
        🌐 Online
      </span>
    ) : (
      <span className="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
        🏪 Offline
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebarNew />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <AdminHeaderNew 
          title="Manajemen Produk" 
          subtitle="Kelola semua produk di BaleTani Fresh Market"
        />

        {/* Content */}
        <div className="flex-1 p-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Produk</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <CubeIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Produk Aktif</p>
                  <h3 className="text-2xl font-bold text-green-600">{stats.active}</h3>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <span className="text-2xl">✓</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Stok Menipis</p>
                  <h3 className="text-2xl font-bold text-yellow-600">{stats.lowStock}</h3>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <span className="text-2xl">⚠</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Stok Habis</p>
                  <h3 className="text-2xl font-bold text-red-600">{stats.outOfStock}</h3>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <span className="text-2xl">⊘</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari produk atau kategori..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Filter Type */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Semua Jenis</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>

              {/* Filter Status */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Tidak Aktif</option>
              </select>

              {/* Add Product Button */}
              <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 whitespace-nowrap">
                <PlusIcon className="w-5 h-5" />
                Tambah Produk
              </button>
            </div>

            {/* Reset Filter */}
            {(searchQuery || filterType || filterStatus) && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm text-gray-600">Filter aktif:</span>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterType('');
                    setFilterStatus('');
                  }}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  Reset Filter
                </button>
              </div>
            )}
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <p className="text-sm text-gray-600">
                Menampilkan {products.length} dari {stats.total} produk
              </p>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                <p className="mt-4 text-gray-600">Memuat data produk...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <p className="text-red-600">{error}</p>
              </div>
            ) : products.length === 0 ? (
              <div className="p-12 text-center">
                <CubeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Tidak ada produk ditemukan</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nama Produk
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jenis
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Harga Jual
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stok
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {product.category?.category_name || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getTypeBadge(product.product_type)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(product.selling_price)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStockBadge(product.total_stock)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(product.is_active)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Halaman {currentPage} dari {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListNew;

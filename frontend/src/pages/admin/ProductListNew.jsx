import React, { useEffect, useState } from 'react';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { CubeIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import toast, { Toaster } from 'react-hot-toast';
import AdminSidebarNew from '../../components/layout_admin/AdminSidebarNew';
import AdminHeaderNew from '../../components/layout_admin/AdminHeaderNew';
import ProductFormModal from '../../components/ui_admin/ProductFormModal';
import ProductDetailModal from '../../components/ui_admin/ProductDetailModal';
import DeleteConfirmModal from '../../components/ui_admin/DeleteConfirmModal';
import inventoryService from '../../services/services_admin/inventoryService';

const ProductListNew = () => {
  // State management
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    lowStock: 0,
    outOfStock: 0
  });

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Notification
  const [notification, setNotification] = useState(null);

  // Fetch data on mount and filter change
  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchQuery, filterType, filterStatus]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // API Calls
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
      
      console.log('API Response:', data); // Debug log
      
      if (data.success) {
        const products = data.data.products || [];
        console.log('Products loaded:', products); // Debug log
        
        setProducts(products);
        setTotalPages(data.data.pagination?.totalPages || 1);
        
        setStats({
          total: products.length,
          active: products.filter(p => p.is_active).length,
          lowStock: products.filter(p => p.total_stock <= 10 && p.total_stock > 0).length,
          outOfStock: products.filter(p => p.total_stock === 0).length
        });
        
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await inventoryService.getCategories();
      console.log('Categories Response:', data); // Debug log
      
      if (data.success) {
        // Handle response structure: data.data.categories or data.data
        const categoriesList = data.data.categories || data.data || [];
        console.log('Categories array:', categoriesList); // Debug log
        setCategories(Array.isArray(categoriesList) ? categoriesList : []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]); // Set empty array on error
    }
  };

  // CRUD Handlers
  const handleCreate = () => {
    setModalMode('create');
    setSelectedProduct(null);
    setShowFormModal(true);
  };

  const handleView = async (product) => {
    try {
      // Handle both 'id' and 'product_id' field names
      const productId = product.id || product.product_id;
      
      if (!productId) {
        showNotification('error', 'ID produk tidak valid');
        return;
      }

      const data = await inventoryService.getProductById(productId);
      if (data.success) {
        setSelectedProduct(data.data);
        setShowDetailModal(true);
      }
    } catch (err) {
      console.error('Error viewing product:', err);
      showNotification('error', err.message || 'Gagal memuat detail produk');
    }
  };

  const handleEdit = async (product) => {
    try {
      // Handle both 'id' and 'product_id' field names
      const productId = product.id || product.product_id;
      
      if (!productId) {
        showNotification('error', 'ID produk tidak valid');
        return;
      }

      const data = await inventoryService.getProductById(productId);
      if (data.success) {
        setSelectedProduct(data.data);
        setModalMode('edit');
        setShowFormModal(true);
      }
    } catch (err) {
      console.error('Error editing product:', err);
      showNotification('error', err.message || 'Gagal memuat data produk');
    }
  };

  const handleDelete = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleSubmitProduct = async (formData) => {
    try {
      if (modalMode === 'create') {
        await inventoryService.createProduct(formData);
        showNotification('success', 'Produk berhasil ditambahkan!');
      } else {
        // Handle both 'id' and 'product_id' field names
        const productId = selectedProduct.id || selectedProduct.product_id;
        
        if (!productId) {
          throw new Error('ID produk tidak valid');
        }

        await inventoryService.updateProduct(productId, formData);
        showNotification('success', 'Produk berhasil diupdate!');
      }
      
      await fetchProducts();
      setShowFormModal(false);
    } catch (err) {
      console.error('Error submitting product:', err);
      throw new Error(err.message || 'Gagal menyimpan produk');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleteLoading(true);
      
      // Handle both 'id' and 'product_id' field names
      const productId = selectedProduct.id || selectedProduct.product_id;
      
      if (!productId) {
        showNotification('error', 'ID produk tidak valid');
        setDeleteLoading(false);
        return;
      }

      await inventoryService.deleteProduct(productId);
      
      showNotification('success', 'Produk berhasil dihapus!');
      
      await fetchProducts();
      setShowDeleteModal(false);
      setSelectedProduct(null);
    } catch (err) {
      console.error('Error deleting product:', err);
      showNotification('error', err.message || 'Gagal menghapus produk');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Utilities
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  const getImageUrl = (product) => {
    // Get first image from ProductImages or images array
    const images = product.ProductImages || product.images || [];
    if (images.length > 0) {
      const imageUrl = images[0].image_url;
      if (imageUrl.startsWith('http')) return imageUrl;
      return `http://localhost:5000${imageUrl}`;
    }
    
    // Fallback to primary_image_url if exists
    if (product.primary_image_url) {
      if (product.primary_image_url.startsWith('http')) return product.primary_image_url;
      return `http://localhost:5000${product.primary_image_url}`;
    }
    
    return null;
  };

  const getStockBadge = (stock) => {
    if (stock === 0) {
      return <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">Habis</span>;
    } else if (stock <= 10) {
      return <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">Rendah ({stock})</span>;
    } else {
      return <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">{stock}</span>;
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
        Nonaktif
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebarNew />
      
      <div className="flex-1">
        <AdminHeaderNew 
          title="Product List" 
          subtitle="Kelola produk dan inventori"
        />
        
        <div className="p-6">
          {/* Notification */}
          {notification && (
            <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-3 rounded-lg shadow-lg transition-all ${
              notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}>
              {notification.type === 'success' ? <CheckCircleIcon className="w-5 h-5" /> : <ExclamationCircleIcon className="w-5 h-5" />}
              <span className="font-medium">{notification.message}</span>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Produk</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <CubeIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Produk Aktif</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Stok Rendah</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <ExclamationCircleIcon className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Stok Habis</p>
                  <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <ExclamationCircleIcon className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-900">Daftar Produk</h2>
                
                <button
                  onClick={handleCreate}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <PlusIcon className="w-5 h-5" />
                  Tambah Produk
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari nama produk..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <select
                    value={filterType}
                    onChange={(e) => {
                      setFilterType(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Semua Tipe</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>

                <div>
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Semua Status</option>
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <ArrowPathIcon className="w-8 h-8 text-green-600 animate-spin" />
                  <span className="ml-3 text-gray-600">Memuat data...</span>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <ExclamationCircleIcon className="w-12 h-12 text-red-500 mb-3" />
                  <p className="text-red-600 font-medium">{error}</p>
                  <button onClick={fetchProducts} className="mt-4 px-4 py-2 text-sm text-green-600 hover:text-green-700 font-medium">
                    Coba Lagi
                  </button>
                </div>
              ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <CubeIcon className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-gray-600 font-medium">Tidak ada produk</p>
                  <button onClick={handleCreate} className="mt-4 px-4 py-2 text-sm text-green-600 hover:text-green-700 font-medium">
                    + Tambah Produk Pertama
                  </button>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => {
                      // Handle both 'id' and 'product_id' field names
                      const productId = product.id || product.product_id;
                      const productName = product.name || product.product_name;
                      const categoryName = product.category?.category_name || product.Category?.category_name;
                      
                      return (
                      <tr key={productId} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {getImageUrl(product) ? (
                              <img 
                                src={getImageUrl(product)} 
                                alt={productName} 
                                className="w-12 h-12 rounded-lg object-cover border" 
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"%3E%3Cpath stroke-linecap="round" stroke-linejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" /%3E%3C/svg%3E';
                                }}
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                <CubeIcon className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900">{productName}</p>
                              <p className="text-xs text-gray-500">
                                {product.quantity_per_unit && product.quantity_per_unit > 1
                                  ? `${product.quantity_per_unit} ${product.unit} per ${product.unit_type || 'unit'}`
                                  : product.unit
                                }
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{categoryName || '-'}</td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900">{formatCurrency(product.selling_price)}</p>
                          {product.discount_price && product.discount_price < product.selling_price && (
                            <p className="text-xs text-green-600">Diskon: {formatCurrency(product.discount_price)}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {getStockBadge(product.total_stock)}
                          {product.quantity_per_unit && product.quantity_per_unit > 1 && product.total_stock > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              {product.total_stock} {product.unit_type || 'unit'}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(product.is_active)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            product.product_type === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {product.product_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleView(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="View">
                              <EyeIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleEdit(product)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Edit">
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDelete(product)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {!loading && !error && products.length > 0 && totalPages > 1 && (
              <div className="px-6 py-4 border-t flex items-center justify-between">
                <p className="text-sm text-gray-600">Halaman {currentPage} dari {totalPages}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50"
                  >
                    Sebelumnya
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProductFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setSelectedProduct(null);
        }}
        mode={modalMode}
        product={selectedProduct}
        categories={categories}
        onSubmit={handleSubmitProduct}
      />

      <ProductDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedProduct(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Hapus Produk"
        message="Apakah Anda yakin ingin menghapus produk ini?"
        itemName={selectedProduct?.product_name}
        loading={deleteLoading}
      />

      {/* Toaster untuk notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
};

export default ProductListNew;

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
import toast from 'react-hot-toast';
import AdminSidebarNew from '../../components/layout_admin/AdminSidebarNew';
import AdminHeaderNew from '../../components/layout_admin/AdminHeaderNew';
import ProductFormModal from '../../components/ui_admin/ProductFormModal';
import ProductDetailModal from '../../components/ui_admin/ProductDetailModal';
import DeleteConfirmModal from '../../components/ui_admin/DeleteConfirmModal';
import Pagination from '../../components/ui_admin/Pagination';
import inventoryService from '../../services/services_admin/inventoryService';
import useDebounce from '../../hooks/useDebounce';
import { getImageUrl as getImageUrlUtil } from '../../utils/imageUtils';

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
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 500);

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
  const [modalMode, setModalMode] = useState('create'); // 'create' atau 'edit'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch data on mount and filter change (with debounced search)
  useEffect(() => {
    let isMounted = true;
    
    const loadProducts = async () => {
      if (isMounted) {
        await fetchProducts();
      }
    };
    
    loadProducts();
    
    return () => {
      isMounted = false; // Cleanup to prevent state update on unmounted component
    };
  }, [currentPage, debouncedSearch, filterType, filterStatus, itemsPerPage]);

  useEffect(() => {
    let isMounted = true;
    
    const loadCategories = async () => {
      if (isMounted) {
        await fetchCategories();
      }
    };
    
    loadCategories();
    
    return () => {
      isMounted = false; // Cleanup
    };
  }, []);

  // API Calls
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch,
        product_type: filterType,
        status: filterStatus
      };

      const data = await inventoryService.getProducts(params);
      
      if (data.success) {
        const products = data.data.products || [];
        
        setProducts(products);
        setTotalPages(data.data.pagination?.total_pages || 1);
        setTotalItems(data.data.pagination?.total_items || 0);
        
        setStats({
          total: products.length,
          active: products.filter(p => p.is_active).length,
          lowStock: products.filter(p => p.total_stock <= 10 && p.total_stock > 0).length,
          outOfStock: products.filter(p => p.total_stock === 0).length
        });
        
        setError(null);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Gagal memuat produk';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await inventoryService.getCategories();
      
      if (data.success) {
        // Handle response structure: data.data.categories or data.data
        const categoriesList = data.data.categories || data.data || [];
        setCategories(Array.isArray(categoriesList) ? categoriesList : []);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Gagal memuat kategori';
      setCategories([]);
      toast.error(errorMsg);
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
      const errorMsg = err.response?.data?.message || err.message || 'Gagal memuat detail produk';
      showNotification('error', errorMsg);
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
      const errorMsg = err.response?.data?.message || err.message || 'Gagal memuat data produk';
      showNotification('error', errorMsg);
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
      const errorMsg = err.response?.data?.message || err.message || 'Gagal menyimpan produk';
      throw new Error(errorMsg);
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
      const errorMsg = err.response?.data?.message || err.message || 'Gagal menghapus produk';
      showNotification('error', errorMsg);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Utilities
  const showNotification = (type, message) => {
    if (type === 'success') {
      toast.success(message);
    } else {
      toast.error(message);
    }
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
      const imageUrl = images[0].image_url || images[0];
      return getImageUrlUtil(imageUrl);
    }
    
    // Fallback to primary_image_url if exists
    if (product.primary_image_url) {
      return getImageUrlUtil(product.primary_image_url);
    }
    
    // Fallback to image_url if exists
    if (product.image_url) {
      return getImageUrlUtil(product.image_url);
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
    <div className="flex min-h-screen bg-white">
      <AdminSidebarNew />
      
      <div className="flex-1 flex flex-col">
        <AdminHeaderNew 
          title="Product List" 
          subtitle="Kelola produk dan inventori"
        />
        
        <div className="admin-container px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Produk</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                  <CubeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Produk Aktif</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Stok Rendah</p>
                  <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
                </div>
                <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
                  <ExclamationCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Stok Habis</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.outOfStock}</p>
                </div>
                <div className="p-2 sm:p-3 bg-red-100 rounded-lg">
                  <ExclamationCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Daftar Produk</h2>
                
                <button
                  onClick={handleCreate}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors w-full sm:w-auto"
                >
                  <PlusIcon className="w-5 h-5" />
                  Tambah Produk
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="sm:col-span-1">
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
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Semua Status</option>
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <ArrowPathIcon className="w-8 h-8 text-green-600 animate-spin" />
                  <span className="ml-3 text-gray-600">Memuat data...</span>
                </div>
              ) : error ? (
                <div className="admin-empty-state">
                  <ExclamationCircleIcon className="admin-empty-icon text-red-500" />
                  <p className="admin-empty-text text-red-600">{error}</p>
                  <button onClick={fetchProducts} className="admin-btn-outline">
                    Coba Lagi
                  </button>
                </div>
              ) : products.length === 0 ? (
                <div className="admin-empty-state">
                  <CubeIcon className="admin-empty-icon" />
                  <p className="admin-empty-text">Tidak ada produk</p>
                  <button onClick={handleCreate} className="admin-btn-primary">
                    + Tambah Produk Pertama
                  </button>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
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
                                  className="w-12 h-12 rounded-lg object-cover border border-gray-200" 
                                  onError={(e) => {
                                    console.error('Image load error:', getImageUrl(product));
                                    e.target.onerror = null;
                                    e.target.src = getImageUrlUtil(null, 'thumbnail');
                                  }}
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                                  <CubeIcon className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-900">{productName}</p>
                                <p className="text-xs text-gray-500">{product.unit}</p>
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
                              <button onClick={() => handleView(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View">
                                <EyeIcon className="w-5 h-5" />
                              </button>
                              <button onClick={() => handleEdit(product)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Edit">
                                <PencilIcon className="w-5 h-5" />
                              </button>
                              <button onClick={() => handleDelete(product)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  </div>

                  {/* Mobile/Tablet Card View */}
                  <div className="lg:hidden divide-y divide-gray-200">
                    {products.map((product) => {
                      const productId = product.id || product.product_id;
                      const productName = product.name || product.product_name;
                      const categoryName = product.category?.category_name || product.Category?.category_name;
                      
                      return (
                        <div key={productId} className="p-4 sm:p-5 hover:bg-gray-50 transition-colors">
                          {/* Product Header */}
                          <div className="flex items-start gap-3 mb-3">
                            {getImageUrl(product) ? (
                              <img 
                                src={getImageUrl(product)} 
                                alt={productName} 
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border border-gray-200 flex-shrink-0" 
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = getImageUrlUtil(null, 'thumbnail');
                                }}
                              />
                            ) : (
                              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 flex-shrink-0">
                                <CubeIcon className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-semibold text-gray-900 mb-1">{productName}</h3>
                              <p className="text-xs text-gray-500 mb-2">{product.unit}</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                {getStatusBadge(product.is_active)}
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  product.product_type === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                }`}>
                                  {product.product_type}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Product Info Grid */}
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Kategori</div>
                              <div className="text-sm font-medium text-gray-900 truncate">{categoryName || '-'}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Harga</div>
                              <div className="text-sm font-semibold text-gray-900">{formatCurrency(product.selling_price)}</div>
                              {product.discount_price && product.discount_price < product.selling_price && (
                                <div className="text-xs text-green-600">Diskon: {formatCurrency(product.discount_price)}</div>
                              )}
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Stok</div>
                              <div>{getStockBadge(product.total_stock)}</div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                            <button
                              onClick={() => handleView(product)}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              <EyeIcon className="w-4 h-4" />
                              Detail
                            </button>
                            <button
                              onClick={() => handleEdit(product)}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                            >
                              <PencilIcon className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(product)}
                              className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                              title="Hapus"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Pagination */}
            {!loading && !error && products.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(newLimit) => {
                  setItemsPerPage(newLimit);
                  setCurrentPage(1);
                }}
              />
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

  {/* Toast Notification dipindah global di main.jsx */}
    </div>
  );
};

export default ProductListNew;

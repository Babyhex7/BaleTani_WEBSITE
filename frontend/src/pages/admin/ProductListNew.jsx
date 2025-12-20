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
        
        <div className="admin-container">
          {/* Stats Cards */}
          <div className="admin-stats-grid admin-section">
            <div className="admin-stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="admin-stat-label">Total Produk</p>
                  <p className="admin-stat-value">{stats.total}</p>
                </div>
                <div className="admin-stat-icon-wrapper bg-blue-100">
                  <CubeIcon className="admin-stat-icon text-blue-600" />
                </div>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="admin-stat-label">Produk Aktif</p>
                  <p className="admin-stat-value text-green-600">{stats.active}</p>
                </div>
                <div className="admin-stat-icon-wrapper bg-green-100">
                  <CheckCircleIcon className="admin-stat-icon text-green-600" />
                </div>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="admin-stat-label">Stok Rendah</p>
                  <p className="admin-stat-value text-yellow-600">{stats.lowStock}</p>
                </div>
                <div className="admin-stat-icon-wrapper bg-yellow-100">
                  <ExclamationCircleIcon className="admin-stat-icon text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="admin-stat-label">Stok Habis</p>
                  <p className="admin-stat-value text-red-600">{stats.outOfStock}</p>
                </div>
                <div className="admin-stat-icon-wrapper bg-red-100">
                  <ExclamationCircleIcon className="admin-stat-icon text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Card */}
          <div className="admin-card-compact overflow-hidden p-0">
            {/* Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Daftar Produk</h2>
                
                <button
                  onClick={handleCreate}
                  className="flex items-center justify-center gap-2 px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <PlusIcon className="w-5 h-5" />
                  Tambah Produk
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari nama produk..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-10 pr-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="w-full sm:w-auto">
                  <select
                    value={filterType}
                    onChange={(e) => {
                      setFilterType(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full sm:w-40 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Semua Tipe</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>

                <div className="w-full sm:w-auto">
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full sm:w-40 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                  <thead className="admin-table-header">
                    <tr>
                      <th className="admin-table-th">Produk</th>
                      <th className="admin-table-th">Kategori</th>
                      <th className="admin-table-th">Harga</th>
                      <th className="admin-table-th">Stok</th>
                      <th className="admin-table-th">Status</th>
                      <th className="admin-table-th">Tipe</th>
                      <th className="admin-table-th text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="admin-table-body">
                    {products.map((product) => {
                      // Handle both 'id' and 'product_id' field names
                      const productId = product.id || product.product_id;
                      const productName = product.name || product.product_name;
                      const categoryName = product.category?.category_name || product.Category?.category_name;
                      
                      return (
                      <tr key={productId} className="admin-table-tr">
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
                        <td className="admin-table-td">{categoryName || '-'}</td>
                        <td className="admin-table-td">
                          <p className="text-sm font-medium text-gray-900">{formatCurrency(product.selling_price)}</p>
                          {product.discount_price && product.discount_price < product.selling_price && (
                            <p className="text-xs text-green-600">Diskon: {formatCurrency(product.discount_price)}</p>
                          )}
                        </td>
                        <td className="admin-table-td">
                          {getStockBadge(product.total_stock)}
                        </td>
                        <td className="admin-table-td">{getStatusBadge(product.is_active)}</td>
                        <td className="admin-table-td">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            product.product_type === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {product.product_type}
                          </span>
                        </td>
                        <td className="admin-table-td text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleView(product)} className="admin-btn-icon text-blue-600 hover:bg-blue-50" title="View">
                              <EyeIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleEdit(product)} className="admin-btn-icon text-green-600 hover:bg-green-50" title="Edit">
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDelete(product)} className="admin-btn-icon text-red-600 hover:bg-red-50" title="Delete">
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

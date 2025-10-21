import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Eye, 
  Power,
  PowerOff,
  AlertCircle,
  ShoppingCart,
  Store,
  RefreshCw,
  Download
} from 'lucide-react';
import AdminLayout from '../../components/layout_admin/AdminLayout';
import Table from '../../components/ui_admin/Table';
import ModalAdmin, { ConfirmModal } from '../../components/ui_admin/ModalAdmin';
import { Badge, LoadingSpinner, EmptyState, Alert } from '../../components/ui_admin/CommonComponents';
import Pagination from '../../components/ui_admin/Pagination';
import { 
  mockProducts, 
  mockCategories, 
  formatCurrency, 
  formatDate 
} from '../../utils/mockProductData';
import toast from 'react-hot-toast';

/**
 * ProductManagement - Halaman manajemen produk lengkap
 * Fitur: CRUD, Filter, Search, Pagination, Status toggle
 */
const ProductManagement = () => {
  // State management
  const [products, setProducts] = useState(mockProducts);
  const [categories] = useState(mockCategories);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, online, offline
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive
  const [filterStock, setFilterStock] = useState('all'); // all, low, out
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    product_type: 'online',
    category_id: '',
    description: '',
    selling_price: '',
    unit: 'kg',
    shelf_life_days: '',
    total_stock: '',
    is_active: true
  });

  // Filter and search logic
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchType = filterType === 'all' || product.product_type === filterType;
      const matchStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' ? product.is_active : !product.is_active);
      const matchStock = filterStock === 'all' ||
                        (filterStock === 'low' && product.total_stock > 0 && product.total_stock <= 10) ||
                        (filterStock === 'out' && product.total_stock === 0);
      
      return matchSearch && matchType && matchStatus && matchStock;
    });
  }, [products, searchTerm, filterType, filterStatus, filterStock]);

  // Sort logic
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'selling_price' || sortField === 'total_stock') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredProducts, sortField, sortDirection]);

  // Pagination logic
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  // Handlers
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAddProduct = () => {
    setFormData({
      name: '',
      product_type: 'online',
      category_id: '',
      description: '',
      selling_price: '',
      unit: 'kg',
      shelf_life_days: '',
      total_stock: '',
      is_active: true
    });
    setShowAddModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      product_type: product.product_type,
      category_id: product.category_id,
      description: product.description,
      selling_price: product.selling_price,
      unit: product.unit,
      shelf_life_days: product.shelf_life_days,
      total_stock: product.total_stock,
      is_active: product.is_active
    });
    setShowEditModal(true);
  };

  const handleViewDetail = (product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  const handleDeleteProduct = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleToggleStatus = (product) => {
    const updatedProducts = products.map(p => 
      p.id === product.id ? { ...p, is_active: !p.is_active } : p
    );
    setProducts(updatedProducts);
    toast.success(`Produk "${product.name}" berhasil ${!product.is_active ? 'diaktifkan' : 'dinonaktifkan'}`);
  };

  const confirmDelete = () => {
    const updatedProducts = products.filter(p => p.id !== selectedProduct.id);
    setProducts(updatedProducts);
    setShowDeleteModal(false);
    toast.success(`Produk "${selectedProduct.name}" berhasil dihapus`);
  };

  const handleSubmitAdd = (e) => {
    e.preventDefault();
    
    const category = categories.find(c => c.id === formData.category_id);
    const newProduct = {
      id: `prod-${Date.now()}`,
      ...formData,
      category_name: category?.category_name || '',
      selling_price: Number(formData.selling_price),
      total_stock: Number(formData.total_stock),
      shelf_life_days: Number(formData.shelf_life_days),
      images: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setProducts([...products, newProduct]);
    setShowAddModal(false);
    toast.success(`Produk "${newProduct.name}" berhasil ditambahkan`);
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();
    
    const category = categories.find(c => c.id === formData.category_id);
    const updatedProducts = products.map(p =>
      p.id === selectedProduct.id
        ? {
            ...p,
            ...formData,
            category_name: category?.category_name || '',
            selling_price: Number(formData.selling_price),
            total_stock: Number(formData.total_stock),
            shelf_life_days: Number(formData.shelf_life_days),
            updated_at: new Date().toISOString()
          }
        : p
    );
    
    setProducts(updatedProducts);
    setShowEditModal(false);
    toast.success(`Produk "${formData.name}" berhasil diperbarui`);
  };

  // Stats calculation
  const stats = {
    total: products.length,
    active: products.filter(p => p.is_active).length,
    lowStock: products.filter(p => p.total_stock > 0 && p.total_stock <= 10).length,
    outOfStock: products.filter(p => p.total_stock === 0).length
  };

  // Table columns
  const columns = [
    {
      key: 'name',
      label: 'Nama Produk',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 h-10 w-10">
            <img
              className="h-10 w-10 rounded-lg object-cover"
              src={row.images[0]?.image_url || 'https://via.placeholder.com/100'}
              alt={value}
            />
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-xs text-gray-500">{row.category_name}</div>
          </div>
        </div>
      )
    },
    {
      key: 'product_type',
      label: 'Jenis',
      sortable: true,
      render: (value) => (
        <Badge variant={value === 'online' ? 'info' : 'purple'}>
          {value === 'online' ? (
            <><ShoppingCart className="w-3 h-3 mr-1" /> Online</>
          ) : (
            <><Store className="w-3 h-3 mr-1" /> Offline</>
          )}
        </Badge>
      )
    },
    {
      key: 'selling_price',
      label: 'Harga Jual',
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-gray-900">{formatCurrency(value)}</span>
      )
    },
    {
      key: 'total_stock',
      label: 'Stok',
      sortable: true,
      render: (value, row) => {
        let variant = 'success';
        let icon = null;
        
        if (value === 0) {
          variant = 'danger';
          icon = <AlertCircle className="w-3 h-3 mr-1" />;
        } else if (value <= 10) {
          variant = 'warning';
          icon = <AlertCircle className="w-3 h-3 mr-1" />;
        }
        
        return (
          <Badge variant={variant}>
            {icon}
            {value} {row.unit}
          </Badge>
        );
      }
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      render: (value, row) => (
        <button
          onClick={() => handleToggleStatus(row)}
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            value
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          {value ? (
            <><Power className="w-3 h-3 mr-1" /> Aktif</>
          ) : (
            <><PowerOff className="w-3 h-3 mr-1" /> Nonaktif</>
          )}
        </button>
      )
    }
  ];

  const actions = [
    {
      label: '',
      icon: <Eye className="w-4 h-4" />,
      onClick: handleViewDetail,
      className: 'text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded'
    },
    {
      label: '',
      icon: <Edit2 className="w-4 h-4" />,
      onClick: handleEditProduct,
      className: 'text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded'
    },
    {
      label: '',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: handleDeleteProduct,
      className: 'text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded'
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Package className="w-8 h-8 mr-3 text-green-600" />
              Manajemen Produk
            </h1>
            <p className="text-gray-600 mt-1">Kelola semua produk di BaleTani Fresh Market</p>
          </div>
          <button
            onClick={handleAddProduct}
            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Tambah Produk
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Produk</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Produk Aktif</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.active}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Power className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stok Menipis</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.lowStock}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stok Habis</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.outOfStock}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari produk atau kategori..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Type */}
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">Semua Jenis</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            {/* Filter Status */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>

            {/* Filter Stock */}
            <div>
              <select
                value={filterStock}
                onChange={(e) => setFilterStock(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">Semua Stok</option>
                <option value="low">Stok Menipis (&lt;10)</option>
                <option value="out">Stok Habis</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Menampilkan <span className="font-semibold">{paginatedProducts.length}</span> dari{' '}
              <span className="font-semibold">{sortedProducts.length}</span> produk
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setFilterStatus('all');
                setFilterStock('all');
              }}
              className="inline-flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Reset Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          data={paginatedProducts}
          actions={actions}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
          emptyMessage="Tidak ada produk yang ditemukan"
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}

        {/* Add Product Modal */}
        <ModalAdmin
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Tambah Produk Baru"
          size="lg"
        >
          <form onSubmit={handleSubmitAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Produk <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Contoh: Bayam Hijau Segar"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.filter(c => c.is_active).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Produk <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.product_type}
                  onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="kg">Kilogram (kg)</option>
                  <option value="pcs">Pieces (pcs)</option>
                  <option value="ikat">Ikat</option>
                  <option value="sisir">Sisir</option>
                  <option value="buah">Buah</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harga Jual (Rp) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.selling_price}
                  onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stok Awal <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.total_stock}
                  onChange={(e) => setFormData({ ...formData, total_stock: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shelf Life (hari) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.shelf_life_days}
                  onChange={(e) => setFormData({ ...formData, shelf_life_days: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="7"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="true">Aktif</option>
                  <option value="false">Nonaktif</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi
              </label>
              <textarea
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Deskripsi produk..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Simpan Produk
              </button>
            </div>
          </form>
        </ModalAdmin>

        {/* Edit Product Modal */}
        <ModalAdmin
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Produk"
          size="lg"
        >
          <form onSubmit={handleSubmitEdit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Produk <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.filter(c => c.is_active).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Produk <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.product_type}
                  onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="kg">Kilogram (kg)</option>
                  <option value="pcs">Pieces (pcs)</option>
                  <option value="ikat">Ikat</option>
                  <option value="sisir">Sisir</option>
                  <option value="buah">Buah</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harga Jual (Rp) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.selling_price}
                  onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stok <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.total_stock}
                  onChange={(e) => setFormData({ ...formData, total_stock: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shelf Life (hari) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.shelf_life_days}
                  onChange={(e) => setFormData({ ...formData, shelf_life_days: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="true">Aktif</option>
                  <option value="false">Nonaktif</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi
              </label>
              <textarea
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Update Produk
              </button>
            </div>
          </form>
        </ModalAdmin>

        {/* Detail Modal */}
        {selectedProduct && (
          <ModalAdmin
            isOpen={showDetailModal}
            onClose={() => setShowDetailModal(false)}
            title="Detail Produk"
            size="lg"
          >
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <img
                  src={selectedProduct.images[0]?.image_url || 'https://via.placeholder.com/200'}
                  alt={selectedProduct.name}
                  className="w-32 h-32 rounded-lg object-cover shadow-sm"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{selectedProduct.name}</h3>
                  <p className="text-gray-600 mt-1">{selectedProduct.category_name}</p>
                  <div className="flex items-center space-x-2 mt-3">
                    <Badge variant={selectedProduct.product_type === 'online' ? 'info' : 'purple'}>
                      {selectedProduct.product_type === 'online' ? 'Online' : 'Offline'}
                    </Badge>
                    <Badge variant={selectedProduct.is_active ? 'success' : 'default'}>
                      {selectedProduct.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-600">Harga Jual</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {formatCurrency(selectedProduct.selling_price)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Stok</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {selectedProduct.total_stock} {selectedProduct.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Shelf Life</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {selectedProduct.shelf_life_days} hari
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Unit</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {selectedProduct.unit}
                  </p>
                </div>
              </div>

              {selectedProduct.description && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Deskripsi</p>
                  <p className="text-gray-900">{selectedProduct.description}</p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Dibuat pada</p>
                    <p className="text-gray-900 font-medium">{formatDate(selectedProduct.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Terakhir diupdate</p>
                    <p className="text-gray-900 font-medium">{formatDate(selectedProduct.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </ModalAdmin>
        )}

        {/* Delete Confirmation Modal */}
        {selectedProduct && (
          <ConfirmModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={confirmDelete}
            title="Hapus Produk"
            message={`Apakah Anda yakin ingin menghapus produk "${selectedProduct.name}"? Aksi ini tidak dapat dibatalkan.`}
            confirmText="Hapus"
            cancelText="Batal"
            type="danger"
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default ProductManagement;

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AdminLayout from '../../components/layout_admin/AdminLayout';
import Table from '../../components/ui_admin/Table';
import SearchFilter from '../../components/ui_admin/SearchFilter';
import Pagination from '../../components/ui_admin/Pagination';
import ModalAdmin, { ConfirmModal } from '../../components/ui_admin/ModalAdmin';
import { LoadingSpinner, Alert, Badge, EmptyState } from '../../components/ui_admin/CommonComponents';
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct } from '../../services/services_admin/inventoryService';

// Lightweight debug panel (auto tree-shaken out in production builds when condition unused)
const DebugPanel = ({ data }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-blue-900 text-sm">Debug Info</h4>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="text-xs px-2 py-1 rounded border border-blue-300 text-blue-700 hover:bg-blue-100"
        >{open ? 'Hide' : 'Show'}</button>
      </div>
      {open && (
        <pre className="text-[10px] leading-snug text-blue-800 mt-2 overflow-x-auto max-h-48">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
};

/**
 * Halaman Inventory Management - Kelola Produk dan Stok
 * CRUD produk dengan filter, search, dan pagination
 */
const InventoryManagement = () => {
  // State untuk data
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk pagination dan filter
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // State untuk modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEdit, setIsEdit] = useState(false);

  // Mock data untuk development
  const mockProducts = [
    {
      id: 1,
      name: 'Benih Padi Unggul IR64',
      category_id: 1,
      category_name: 'Benih',
      base_price: 15000,
      stock: 150,
      description: 'Benih padi varietas unggul dengan hasil panen tinggi',
      created_at: '2025-01-01',
      updated_at: '2025-01-05'
    },
    {
      id: 2,
      name: 'Pupuk NPK 16-16-16',
      category_id: 2,
      category_name: 'Pupuk',
      base_price: 85000,
      stock: 75,
      description: 'Pupuk majemuk untuk pertumbuhan optimal tanaman',
      created_at: '2025-01-02',
      updated_at: '2025-01-05'
    },
    {
      id: 3,
      name: 'Pestisida Organik Neem',
      category_id: 3,
      category_name: 'Pestisida',
      base_price: 125000,
      stock: 25,
      description: 'Pestisida alami dari ekstrak neem untuk pengendalian hama',
      created_at: '2025-01-03',
      updated_at: '2025-01-05'
    },
    {
      id: 4,
      name: 'Alat Semprot Manual',
      category_id: 4,
      category_name: 'Alat Pertanian',
      base_price: 350000,
      stock: 12,
      description: 'Alat semprot manual berkualitas tinggi untuk aplikasi pestisida',
      created_at: '2025-01-04',
      updated_at: '2025-01-05'
    },
    {
      id: 5,
      name: 'Benih Jagung Hibrida',
      category_id: 1,
      category_name: 'Benih',
      base_price: 45000,
      stock: 5, // Low stock
      description: 'Benih jagung hibrida dengan produktivitas tinggi',
      created_at: '2025-01-05',
      updated_at: '2025-01-05'
    }
  ];

  const mockCategories = [
    { id: 1, name: 'Benih' },
    { id: 2, name: 'Pupuk' },
    { id: 3, name: 'Pestisida' },
    { id: 4, name: 'Alat Pertanian' }
  ];

  // Define callback functions first
  const loadCategories = useCallback(async () => {
    try {
      console.log('🔄 Loading categories...');
      const response = await getCategories();
      console.log('✅ Categories response:', response);
      
      if (response.success && response.data) {
        setCategories(response.data.categories || []);
        console.log(`📂 Loaded ${response.data.categories?.length || 0} categories`);
      } else {
        throw new Error('Invalid categories response');
      }
    } catch (err) {
      console.error('❌ Error loading categories:', err);
      // Fallback to mock categories if API fails
      setCategories(mockCategories);
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔄 Loading inventory data...');

      // Prepare API parameters
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchValue,
        category_id: selectedCategory,
        status: selectedStatus,
        sortBy: sortField,
        sortOrder: sortDirection
      };

      console.log('📡 API params:', params);

      // Load products from API
      const response = await getProducts(params);
      
      console.log('✅ Products response:', response);
      
      if (response.success && response.data) {
        const normalized = (response.data.products || []).map(p => ({
          ...p,
            base_price: (p.base_price === null || p.base_price === undefined || isNaN(p.base_price)) ? 0 : Number(p.base_price),
            stock: (p.stock === null || p.stock === undefined || isNaN(p.stock)) ? 0 : Number(p.stock),
            category_name: p.category_name || p.category?.name || 'Tidak Ada',
            updated_at: p.updated_at || p.updatedAt || p.created_at || p.createdAt || new Date().toISOString()
        }));
  setProducts(normalized);
  console.log('🧪 Normalized products sample:', normalized.slice(0,3));
        setTotalItems(response.data.pagination?.totalItems || 0);
        console.log(`📦 Loaded ${response.data.products?.length || 0} products`);
      } else {
        throw new Error('Invalid response structure');
      }

    } catch (err) {
      console.error('❌ Error loading products:', err);
      setError(err.message || 'Gagal memuat data produk');
      // Fallback to empty state rather than crash
      setProducts([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchValue, selectedCategory, selectedStatus, sortField, sortDirection]);

  // Load categories only once on mount
  useEffect(() => {
    console.log('🎯 InventoryManagement - component mounted, loading categories');
    loadCategories();
  }, [loadCategories]);

  // Load data when dependencies change
  useEffect(() => {
    console.log('🎯 InventoryManagement - useEffect dependencies changed');
    loadData();
  }, [loadData]);

  // Handler functions
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (key, value) => {
    if (key === 'category') setSelectedCategory(value);
    if (key === 'status') setSelectedStatus(value);
    setCurrentPage(1); // Reset ke halaman pertama saat filter berubah
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsEdit(false);
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsEdit(true);
    setShowProductModal(true);
  };

  const handleDeleteProduct = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      // await deleteProduct(selectedProduct.id);
      // Untuk demo, update state langsung
      setProducts(prev => prev.filter(p => p.id !== selectedProduct.id));
      setTotalItems(prev => prev - 1);
    } catch (err) {
      setError('Gagal menghapus produk');
    }
  };

  // Definisi kolom tabel
  const productColumns = [
    {
      key: 'name',
      label: 'Nama Produk',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">SKU: PRD-{row.id.toString().padStart(3, '0')}</div>
        </div>
      )
    },
    {
      key: 'category_name',
      label: 'Kategori',
      sortable: true
    },
    {
      key: 'base_price',
      label: 'Harga',
      sortable: true,
      render: (value) => {
        if (value === null || value === undefined || isNaN(value)) {
          return 'Rp -';
        }
        try {
          return `Rp ${Number(value).toLocaleString('id-ID')}`;
        } catch (e) {
          return 'Rp -';
        }
      }
    },
    {
      key: 'stock',
      label: 'Stok',
      sortable: true,
      render: (value) => (
        <div className="flex items-center">
          <span className={`font-medium ${
            value === 0 ? 'text-red-600' : 
            value <= 10 ? 'text-yellow-600' : 
            'text-green-600'
          }`}>
            {value} unit
          </span>
          {value <= 10 && value > 0 && (
            <Badge variant="warning" size="sm" className="ml-2">Menipis</Badge>
          )}
          {value === 0 && (
            <Badge variant="danger" size="sm" className="ml-2">Habis</Badge>
          )}
        </div>
      )
    },
    {
      key: 'updated_at',
      label: 'Terakhir Update',
      render: (value) => {
        if (!value) return '-';
        const dateObj = new Date(value);
        if (isNaN(dateObj.getTime())) return '-';
        return dateObj.toLocaleDateString('id-ID');
      }
    }
  ];

  // Actions untuk tabel
  const tableActions = [
    {
      label: 'Edit',
      icon: '✏️',
      onClick: handleEditProduct,
      className: 'text-blue-600 hover:text-blue-900'
    },
    {
      label: 'Hapus',
      icon: '🗑️',
      onClick: handleDeleteProduct,
      className: 'text-red-600 hover:text-red-900'
    }
  ];

  // Filter options
  const filterOptions = [
    {
      key: 'category',
      label: 'Kategori',
      value: selectedCategory,
      placeholder: 'Semua Kategori',
      options: categories.map(cat => ({ value: cat.id.toString(), label: cat.name }))
    },
    {
      key: 'status',
      label: 'Status Stok',
      value: selectedStatus,
      placeholder: 'Semua Status',
      options: [
        { value: 'in_stock', label: 'Stok Tersedia' },
        { value: 'low_stock', label: 'Stok Menipis' },
        { value: 'out_of_stock', label: 'Habis' }
      ]
    }
  ];

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  console.log('🎯 InventoryManagement render state:', { 
    isLoading, 
    error, 
    productsCount: products.length, 
    categoriesCount: categories.length,
    totalItems 
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
          <span className="ml-3 text-gray-600">Memuat data inventory...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Debug Info (development only) */}
        {import.meta.env.MODE !== 'production' && import.meta.env.VITE_DEBUG_AUTH === 'true' && (
          <DebugPanel
            data={{
              isLoading,
              error,
              productsCount: products.length,
              categoriesCount: categories.length,
              totalItems,
              currentPage,
              totalPages: Math.ceil(totalItems / itemsPerPage)
            }}
          />
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Inventory Management</h1>
            <p className="text-sm text-gray-600 mt-1">Kelola produk dan stok toko Anda</p>
          </div>
          <button
            onClick={handleAddProduct}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <span className="mr-2">➕</span>
            Tambah Produk
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert 
            type="error" 
            title="Terjadi Kesalahan"
            message={error}
            onClose={() => setError(null)}
          />
        )}

        {/* Search and Filter */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <SearchFilter
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            placeholder="Cari produk berdasarkan nama atau deskripsi..."
            filters={filterOptions}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Daftar Produk ({totalItems})
              </h3>
              <div className="text-sm text-gray-500">
                Halaman {currentPage} dari {totalPages}
              </div>
            </div>
          </div>

          <Table
            columns={productColumns}
            data={products}
            actions={tableActions}
            onSort={handleSort}
            sortField={sortField}
            sortDirection={sortDirection}
            isLoading={isLoading}
            emptyMessage="Belum ada produk yang ditambahkan"
          />

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          )}
        </div>

        {/* Product Modal */}
        <ProductModal
          isOpen={showProductModal}
          onClose={() => setShowProductModal(false)}
          product={selectedProduct}
          categories={categories}
          isEdit={isEdit}
          onSave={(productData) => {
            // Handle save logic here
            console.log('Saving product:', productData);
            setShowProductModal(false);
            loadData(); // Reload data
          }}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="Hapus Produk"
          message={`Apakah Anda yakin ingin menghapus produk "${selectedProduct?.name}"? Tindakan ini tidak dapat dibatalkan.`}
          confirmText="Hapus"
          type="danger"
        />
      </div>
    </AdminLayout>
  );
};

/**
 * Modal untuk form tambah/edit produk
 */
const ProductModal = ({ isOpen, onClose, product, categories, isEdit, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    base_price: '',
    stock: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product && isEdit) {
      setFormData({
        name: product.name || '',
        category_id: product.category_id?.toString() || '',
        base_price: product.base_price?.toString() || '',
        stock: product.stock?.toString() || '',
        description: product.description || ''
      });
    } else {
      setFormData({
        name: '',
        category_id: '',
        base_price: '',
        stock: '',
        description: ''
      });
    }
  }, [product, isEdit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validasi form
      if (!formData.name || !formData.category_id || !formData.base_price || !formData.stock) {
        throw new Error('Semua field wajib diisi');
      }

      await onSave({
        ...formData,
        base_price: parseFloat(formData.base_price),
        stock: parseInt(formData.stock),
        category_id: parseInt(formData.category_id)
      });
    } catch (err) {
      console.error('Error saving product:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <ModalAdmin
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nama Produk <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
            placeholder="Masukkan nama produk"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kategori <span className="text-red-500">*</span>
          </label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
            required
          >
            <option value="">Pilih Kategori</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Harga (Rp) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="base_price"
              value={formData.base_price}
              onChange={handleChange}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              placeholder="0"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stok <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              placeholder="0"
              min="0"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Deskripsi
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
            placeholder="Deskripsi produk (opsional)"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <LoadingSpinner size="sm" className="mr-2" />
                {isEdit ? 'Mengupdate...' : 'Menyimpan...'}
              </div>
            ) : (
              isEdit ? 'Update Produk' : 'Tambah Produk'
            )}
          </button>
        </div>
      </form>
    </ModalAdmin>
  );
};

export default InventoryManagement;
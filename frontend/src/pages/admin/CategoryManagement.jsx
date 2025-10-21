import React, { useState, useMemo } from 'react';
import {
  FolderOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  Power,
  PowerOff,
  RefreshCw
} from 'lucide-react';
import AdminLayout from '../../components/layout_admin/AdminLayout';
import Table from '../../components/ui_admin/Table';
import ModalAdmin, { ConfirmModal } from '../../components/ui_admin/ModalAdmin';
import { Badge } from '../../components/ui_admin/CommonComponents';
import Pagination from '../../components/ui_admin/Pagination';
import { mockCategories, formatDate } from '../../utils/mockProductData';
import toast from 'react-hot-toast';

/**
 * CategoryManagement - Halaman manajemen kategori produk
 * Fitur: CRUD kategori, Toggle status aktif/nonaktif
 */
const CategoryManagement = () => {
  // State management
  const [categories, setCategories] = useState(mockCategories);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('category_name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    category_name: '',
    description: '',
    is_active: true
  });

  // Filter logic
  const filteredCategories = useMemo(() => {
    return categories.filter(cat => {
      const matchSearch = cat.category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cat.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === 'all' ||
                         (filterStatus === 'active' ? cat.is_active : !cat.is_active);
      return matchSearch && matchStatus;
    });
  }, [categories, searchTerm, filterStatus]);

  // Sort logic
  const sortedCategories = useMemo(() => {
    return [...filteredCategories].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredCategories, sortField, sortDirection]);

  // Pagination
  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedCategories.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedCategories, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedCategories.length / itemsPerPage);

  // Stats
  const stats = {
    total: categories.length,
    active: categories.filter(c => c.is_active).length,
    inactive: categories.filter(c => !c.is_active).length
  };

  // Handlers
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAddCategory = () => {
    setFormData({
      category_name: '',
      description: '',
      is_active: true
    });
    setShowAddModal(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setFormData({
      category_name: category.category_name,
      description: category.description,
      is_active: category.is_active
    });
    setShowEditModal(true);
  };

  const handleDeleteCategory = (category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const handleToggleStatus = (category) => {
    const updatedCategories = categories.map(c =>
      c.id === category.id ? { ...c, is_active: !c.is_active } : c
    );
    setCategories(updatedCategories);
    toast.success(
      `Kategori "${category.category_name}" berhasil ${!category.is_active ? 'diaktifkan' : 'dinonaktifkan'}`
    );
  };

  const confirmDelete = () => {
    const updatedCategories = categories.filter(c => c.id !== selectedCategory.id);
    setCategories(updatedCategories);
    setShowDeleteModal(false);
    toast.success(`Kategori "${selectedCategory.category_name}" berhasil dihapus`);
  };

  const handleSubmitAdd = (e) => {
    e.preventDefault();

    const newCategory = {
      id: `cat-${Date.now()}`,
      ...formData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    };

    setCategories([...categories, newCategory]);
    setShowAddModal(false);
    toast.success(`Kategori "${newCategory.category_name}" berhasil ditambahkan`);
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();

    const updatedCategories = categories.map(c =>
      c.id === selectedCategory.id
        ? {
            ...c,
            ...formData,
            updated_at: new Date().toISOString()
          }
        : c
    );

    setCategories(updatedCategories);
    setShowEditModal(false);
    toast.success(`Kategori "${formData.category_name}" berhasil diperbarui`);
  };

  // Table columns
  const columns = [
    {
      key: 'category_name',
      label: 'Nama Kategori',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            {row.description && (
              <div className="text-xs text-gray-500 line-clamp-1">{row.description}</div>
            )}
          </div>
        </div>
      )
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
    },
    {
      key: 'created_at',
      label: 'Dibuat Pada',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600">{formatDate(value)}</span>
      )
    }
  ];

  const actions = [
    {
      label: '',
      icon: <Edit2 className="w-4 h-4" />,
      onClick: handleEditCategory,
      className: 'text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded'
    },
    {
      label: '',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: handleDeleteCategory,
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
              <FolderOpen className="w-8 h-8 mr-3 text-green-600" />
              Manajemen Kategori
            </h1>
            <p className="text-gray-600 mt-1">Kelola kategori produk BaleTani</p>
          </div>
          <button
            onClick={handleAddCategory}
            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Tambah Kategori
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Kategori</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FolderOpen className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Kategori Aktif</p>
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
                <p className="text-sm font-medium text-gray-600">Nonaktif</p>
                <p className="text-3xl font-bold text-gray-400 mt-2">{stats.inactive}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <PowerOff className="w-8 h-8 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari kategori..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

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
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Menampilkan <span className="font-semibold">{paginatedCategories.length}</span> dari{' '}
              <span className="font-semibold">{sortedCategories.length}</span> kategori
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
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
          data={paginatedCategories}
          actions={actions}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
          emptyMessage="Tidak ada kategori yang ditemukan"
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        )}

        {/* Add Category Modal */}
        <ModalAdmin
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Tambah Kategori Baru"
          size="md"
        >
          <form onSubmit={handleSubmitAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Kategori <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.category_name}
                onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Contoh: Sayuran Segar"
              />
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
                placeholder="Deskripsi kategori..."
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
                Simpan Kategori
              </button>
            </div>
          </form>
        </ModalAdmin>

        {/* Edit Category Modal */}
        <ModalAdmin
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Kategori"
          size="md"
        >
          <form onSubmit={handleSubmitEdit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Kategori <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.category_name}
                onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
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
                Update Kategori
              </button>
            </div>
          </form>
        </ModalAdmin>

        {/* Delete Confirmation Modal */}
        {selectedCategory && (
          <ConfirmModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={confirmDelete}
            title="Hapus Kategori"
            message={`Apakah Anda yakin ingin menghapus kategori "${selectedCategory.category_name}"? Aksi ini tidak dapat dibatalkan.`}
            confirmText="Hapus"
            cancelText="Batal"
            type="danger"
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default CategoryManagement;

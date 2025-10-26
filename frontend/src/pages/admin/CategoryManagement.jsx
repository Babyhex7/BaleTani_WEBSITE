import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  TagIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import AdminSidebarNew from '../../components/layout_admin/AdminSidebarNew';
import AdminHeaderNew from '../../components/layout_admin/AdminHeaderNew';
import CategoryFormModal from '../../components/ui_admin/CategoryFormModal';
import CategoryDetailModal from '../../components/ui_admin/CategoryDetailModal';
import DeleteConfirmModal from '../../components/ui_admin/DeleteConfirmModal';
import inventoryService from '../../services/services_admin/inventoryService';

const CategoryManagement = () => {
  // State management
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch data on mount and filter change
  useEffect(() => {
    fetchCategories();
  }, [currentPage, searchQuery, filterStatus]);

  // API Calls
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchQuery,
        is_active: filterStatus
      };

      const data = await inventoryService.getCategories(params);

      console.log('Categories API Response:', data);

      if (data.success) {
        const categoriesList = data.data.categories || [];
        console.log('Categories loaded:', categoriesList);

        setCategories(categoriesList);
        setTotalPages(data.data.pagination?.total_pages || 1);

        // Calculate stats
        setStats({
          total: categoriesList.length,
          active: categoriesList.filter(c => c.is_active).length,
          inactive: categoriesList.filter(c => !c.is_active).length
        });

        setError(null);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message || 'Gagal memuat kategori');
    } finally {
      setLoading(false);
    }
  };

  // CRUD Handlers
  const handleCreate = () => {
    setModalMode('create');
    setSelectedCategory(null);
    setShowFormModal(true);
  };

  const handleView = async (category) => {
    try {
      // Handle both 'id' and 'category_id' field names
      const categoryId = category.id || category.category_id;

      if (!categoryId) {
        showNotification('error', 'ID kategori tidak valid');
        return;
      }

      const data = await inventoryService.getCategoryById(categoryId);
      if (data.success) {
        setSelectedCategory(data.data);
        setShowDetailModal(true);
      }
    } catch (err) {
      console.error('Error viewing category:', err);
      showNotification('error', err.message || 'Gagal memuat detail kategori');
    }
  };

  const handleEdit = async (category) => {
    try {
      // Handle both 'id' and 'category_id' field names
      const categoryId = category.id || category.category_id;

      if (!categoryId) {
        showNotification('error', 'ID kategori tidak valid');
        return;
      }

      const data = await inventoryService.getCategoryById(categoryId);
      if (data.success) {
        setSelectedCategory(data.data);
        setModalMode('edit');
        setShowFormModal(true);
      }
    } catch (err) {
      console.error('Error editing category:', err);
      showNotification('error', err.message || 'Gagal memuat data kategori');
    }
  };

  const handleDelete = (category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const handleSubmitCategory = async (formData) => {
    try {
      if (modalMode === 'create') {
        await inventoryService.createCategory(formData);
        showNotification('success', 'Kategori berhasil ditambahkan!');
      } else {
        // Handle both 'id' and 'category_id' field names
        const categoryId = selectedCategory.id || selectedCategory.category_id;

        if (!categoryId) {
          throw new Error('ID kategori tidak valid');
        }

        await inventoryService.updateCategory(categoryId, formData);
        showNotification('success', 'Kategori berhasil diupdate!');
      }

      await fetchCategories();
      setShowFormModal(false);
    } catch (err) {
      console.error('Error submitting category:', err);
      throw new Error(err.message || 'Gagal menyimpan kategori');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleteLoading(true);

      // Handle both 'id' and 'category_id' field names
      const categoryId = selectedCategory.id || selectedCategory.category_id;

      if (!categoryId) {
        showNotification('error', 'ID kategori tidak valid');
        setDeleteLoading(false);
        return;
      }

      await inventoryService.deleteCategory(categoryId);

      showNotification('success', 'Kategori berhasil dihapus!');

      await fetchCategories();
      setShowDeleteModal(false);
      setSelectedCategory(null);
    } catch (err) {
      console.error('Error deleting category:', err);
      showNotification('error', err.message || 'Gagal menghapus kategori');
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

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full flex items-center gap-1 w-fit">
        <CheckCircleIcon className="w-3 h-3" />
        Aktif
      </span>
    ) : (
      <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full flex items-center gap-1 w-fit">
        <XCircleIcon className="w-3 h-3" />
        Nonaktif
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebarNew />

      <div className="flex-1">
        <AdminHeaderNew
          title="Category Management"
          subtitle="Kelola kategori produk"
        />

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Kategori</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TagIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Kategori Aktif</p>
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
                  <p className="text-sm text-gray-600 mb-1">Kategori Nonaktif</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
                </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <XCircleIcon className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-900">Daftar Kategori</h2>

                <button
                  onClick={handleCreate}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <PlusIcon className="w-5 h-5" />
                  Tambah Kategori
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari nama kategori..."
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
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Semua Status</option>
                    <option value="true">Aktif</option>
                    <option value="false">Nonaktif</option>
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
                  <XCircleIcon className="w-12 h-12 text-red-500 mb-3" />
                  <p className="text-red-600 font-medium">{error}</p>
                  <button onClick={fetchCategories} className="mt-4 px-4 py-2 text-sm text-green-600 hover:text-green-700 font-medium">
                    Coba Lagi
                  </button>
                </div>
              ) : categories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <TagIcon className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-gray-600 font-medium">Tidak ada kategori</p>
                  <button onClick={handleCreate} className="mt-4 px-4 py-2 text-sm text-green-600 hover:text-green-700 font-medium">
                    + Tambah Kategori Pertama
                  </button>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Kategori</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah Produk</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categories.map((category) => {
                      const categoryId = category.id || category.category_id;
                      const productCount = category.product_count || 0;

                      return (
                        <tr key={categoryId} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-green-100 rounded-lg">
                                <TagIcon className="w-5 h-5 text-green-600" />
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {category.category_name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-600 max-w-md truncate">
                              {category.description || '-'}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-900">{productCount} produk</span>
                          </td>
                          <td className="px-6 py-4">{getStatusBadge(category.is_active)}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => handleView(category)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="View">
                                <EyeIcon className="w-5 h-5" />
                              </button>
                              <button onClick={() => handleEdit(category)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Edit">
                                <PencilIcon className="w-5 h-5" />
                              </button>
                              <button onClick={() => handleDelete(category)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
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
            {!loading && !error && categories.length > 0 && totalPages > 1 && (
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
      <CategoryFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setSelectedCategory(null);
        }}
        mode={modalMode}
        category={selectedCategory}
        onSubmit={handleSubmitCategory}
      />

      <CategoryDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedCategory(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Hapus Kategori"
        message="Apakah Anda yakin ingin menghapus kategori ini? Kategori akan di-soft delete dan tidak akan muncul di daftar."
        itemName={selectedCategory?.category_name}
        loading={deleteLoading}
      />

  {/* Toast Notification dipindah global di main.jsx */}
    </div>
  );
};

export default CategoryManagement;

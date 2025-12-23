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
import Pagination from '../../components/ui_admin/Pagination';
import inventoryService from '../../services/services_admin/inventoryService';
import useDebounce from '../../hooks/useDebounce';
import { getImageUrl } from '../../utils/imageUtils';

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
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 500);

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

  // Fetch data on mount and filter change (with debounced search)
  useEffect(() => {
    fetchCategories();
  }, [currentPage, debouncedSearch, filterStatus, itemsPerPage]);

  // API Calls
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch,
        is_active: filterStatus
      };

      const data = await inventoryService.getCategories(params);

      if (data.success) {
        const categoriesList = data.data.categories || [];

        setCategories(categoriesList);
        setTotalPages(data.data.pagination?.total_pages || 1);
        setTotalItems(data.data.pagination?.total_items || 0);

        // Calculate stats
        setStats({
          total: categoriesList.length,
          active: categoriesList.filter(c => c.is_active).length,
          inactive: categoriesList.filter(c => !c.is_active).length
        });

        setError(null);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Gagal memuat kategori';
      setError(errorMsg);
      toast.error(errorMsg);
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
      const errorMsg = err.response?.data?.message || err.message || 'Gagal memuat detail kategori';
      showNotification('error', errorMsg);
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
      const errorMsg = err.response?.data?.message || err.message || 'Gagal memuat data kategori';
      showNotification('error', errorMsg);
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

      setShowFormModal(false);
      // Force refresh to get updated data including new images
      await fetchCategories();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Gagal menyimpan kategori';
      throw new Error(errorMsg);
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
      const errorMsg = err.response?.data?.message || err.message || 'Gagal menghapus kategori';
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
    <div className="flex min-h-screen bg-white">
      <AdminSidebarNew />

      <div className="flex-1 flex flex-col">
        <AdminHeaderNew
          title="Category Management"
          subtitle="Kelola kategori produk"
        />

        <div className="admin-container px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Kategori</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                  <TagIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Kategori Aktif</p>
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
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Kategori Nonaktif</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-600">{stats.inactive}</p>
                </div>
                <div className="p-2 sm:p-3 bg-gray-100 rounded-lg">
                  <XCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Daftar Kategori</h2>

                <button
                  onClick={handleCreate}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors w-full sm:w-auto"
                >
                  <PlusIcon className="w-5 h-5" />
                  Tambah Kategori
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Semua Status</option>
                    <option value="true">Aktif</option>
                    <option value="false">Nonaktif</option>
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
                <>
                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gambar</th>
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
                                {category.category_image ? (
                                  <img
                                    src={getImageUrl(category.category_image, 'thumbnail')}
                                    alt={category.category_name}
                                    className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = getImageUrl(null, 'thumbnail');
                                    }}
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                                    <TagIcon className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-gray-900">
                                {category.category_name}
                              </span>
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
                                <button onClick={() => handleView(category)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View">
                                  <EyeIcon className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleEdit(category)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Edit">
                                  <PencilIcon className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleDelete(category)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
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
                    {categories.map((category) => {
                      const categoryId = category.id || category.category_id;
                      const productCount = category.product_count || 0;

                      return (
                        <div key={categoryId} className="p-4 sm:p-5 hover:bg-gray-50 transition-colors">
                          {/* Header with Image */}
                          <div className="flex items-start gap-3 mb-3">
                            {category.category_image ? (
                              <img
                                src={getImageUrl(category.category_image, 'thumbnail')}
                                alt={category.category_name}
                                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = getImageUrl(null, 'thumbnail');
                                }}
                              />
                            ) : (
                              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 flex-shrink-0">
                                <TagIcon className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-semibold text-gray-900 mb-1">{category.category_name}</h3>
                              <div className="mb-2">
                                {getStatusBadge(category.is_active)}
                              </div>
                              <p className="text-xs text-gray-500 line-clamp-2">
                                {category.description || 'Tidak ada deskripsi'}
                              </p>
                            </div>
                          </div>

                          {/* Info */}
                          <div className="mb-3 pb-3 border-b border-gray-200">
                            <div className="text-xs text-gray-500 mb-1">Jumlah Produk</div>
                            <div className="text-sm font-medium text-gray-900">{productCount} produk</div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleView(category)}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              <EyeIcon className="w-4 h-4" />
                              Detail
                            </button>
                            <button
                              onClick={() => handleEdit(category)}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                            >
                              <PencilIcon className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(category)}
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
            {!loading && !error && categories.length > 0 && (
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

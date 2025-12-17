import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  QuestionMarkCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import AdminSidebarNew from '../../components/layout_admin/AdminSidebarNew';
import AdminHeaderNew from '../../components/layout_admin/AdminHeaderNew';
import FAQFormModal from '../../components/ui_admin/FAQFormModal';
import FAQDetailModal from '../../components/ui_admin/FAQDetailModal';
import DeleteConfirmModal from '../../components/ui_admin/DeleteConfirmModal';
import Pagination from '../../components/ui_admin/Pagination';
import faqService from '../../services/services_admin/faqService';
import useDebounce from '../../hooks/useDebounce';

const FAQManagement = () => {
  // State management
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
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
  const [selectedFAQ, setSelectedFAQ] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch data on mount and filter change (with debounced search)
  useEffect(() => {
    fetchFAQs();
  }, [currentPage, debouncedSearch, filterCategory, filterStatus, itemsPerPage]);

  // API Calls
  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch,
        category: filterCategory,
        is_active: filterStatus
      };

      const data = await faqService.getAllFAQs(params);

      if (data.success) {
        const faqsList = data.data || [];

        setFaqs(faqsList);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.total || 0);

        // Calculate stats from current page data
        setStats({
          total: data.pagination?.total || 0,
          active: faqsList.filter(f => f.is_active).length,
          inactive: faqsList.filter(f => !f.is_active).length
        });

        setError(null);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Gagal memuat FAQ';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // CRUD Handlers
  const handleCreate = () => {
    setModalMode('create');
    setSelectedFAQ(null);
    setShowFormModal(true);
  };

  const handleView = async (faq) => {
    try {
      const data = await faqService.getFAQById(faq.id);
      if (data.success) {
        setSelectedFAQ(data.data);
        setShowDetailModal(true);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Gagal memuat detail FAQ';
      toast.error(errorMsg);
    }
  };

  const handleEdit = async (faq) => {
    try {
      const data = await faqService.getFAQById(faq.id);
      if (data.success) {
        setSelectedFAQ(data.data);
        setModalMode('edit');
        setShowFormModal(true);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Gagal memuat data FAQ';
      toast.error(errorMsg);
    }
  };

  const handleDelete = (faq) => {
    setSelectedFAQ(faq);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      const data = await faqService.deleteFAQ(selectedFAQ.id);
      
      if (data.success) {
        toast.success('FAQ berhasil dihapus');
        setShowDeleteModal(false);
        fetchFAQs();
      }
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus FAQ');
    } finally {
      setDeleteLoading(false);
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

  const getCategoryBadge = (category) => {
    const categoryColors = {
      umum: 'bg-blue-100 text-blue-700',
      pembayaran: 'bg-purple-100 text-purple-700',
      pengiriman: 'bg-orange-100 text-orange-700',
      produk: 'bg-green-100 text-green-700'
    };

    const categoryLabels = {
      umum: 'Umum',
      pembayaran: 'Pembayaran',
      pengiriman: 'Pengiriman',
      produk: 'Produk'
    };

    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${categoryColors[category] || 'bg-gray-100 text-gray-700'}`}>
        {categoryLabels[category] || category}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-white">
      <AdminSidebarNew />

      <div className="flex-1 flex flex-col">
        <AdminHeaderNew
          title="FAQ Management"
          subtitle="Kelola pertanyaan yang sering ditanyakan"
        />

        <div className="admin-container">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total FAQ</p>
                  <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <QuestionMarkCircleIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">FAQ Aktif</p>
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
                  <p className="text-sm text-gray-600 mb-1">FAQ Nonaktif</p>
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
                <h2 className="text-xl font-bold text-gray-900">Daftar FAQ</h2>

                <button
                  onClick={handleCreate}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <PlusIcon className="w-5 h-5" />
                  Tambah FAQ
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari pertanyaan atau jawaban..."
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
                    value={filterCategory}
                    onChange={(e) => {
                      setFilterCategory(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Semua Kategori</option>
                    <option value="umum">Umum</option>
                    <option value="pembayaran">Pembayaran</option>
                    <option value="pengiriman">Pengiriman</option>
                    <option value="produk">Produk</option>
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
                  <ArrowPathIcon className="w-8 h-8 text-gray-400 animate-spin" />
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600">{error}</p>
                  <button
                    onClick={fetchFAQs}
                    className="mt-4 text-sm text-green-600 hover:text-green-700"
                  >
                    Coba lagi
                  </button>
                </div>
              ) : faqs.length === 0 ? (
                <div className="text-center py-12">
                  <QuestionMarkCircleIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Tidak ada FAQ</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pertanyaan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kategori
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Urutan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {faqs.map((faq) => (
                      <tr key={faq.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="max-w-md">
                            <p className="font-medium line-clamp-2">{faq.question}</p>
                            <p className="text-gray-500 text-xs mt-1 line-clamp-1">{faq.answer}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getCategoryBadge(faq.category)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {faq.display_order || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(faq.is_active)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleView(faq)}
                              className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Lihat detail"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(faq)}
                              className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(faq)}
                              className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              title="Hapus"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {!loading && !error && faqs.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={setItemsPerPage}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showFormModal && (
        <FAQFormModal
          isOpen={showFormModal}
          mode={modalMode}
          faq={selectedFAQ}
          onClose={() => setShowFormModal(false)}
          onSuccess={() => {
            setShowFormModal(false);
            fetchFAQs();
          }}
        />
      )}

      {showDetailModal && selectedFAQ && (
        <FAQDetailModal
          faq={selectedFAQ}
          onClose={() => setShowDetailModal(false)}
          onEdit={() => {
            setShowDetailModal(false);
            handleEdit(selectedFAQ);
          }}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="Hapus FAQ"
          message={`Apakah Anda yakin ingin menghapus FAQ "${selectedFAQ?.question}"?`}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

export default FAQManagement;

/**
 * ============================================
 * ADMIN FAQ MANAGEMENT PAGE
 * ============================================
 * Page untuk admin manage FAQ (CRUD operations)
 * dengan filtering, search, dan sorting
 * 
 * @page FAQManagement
 * @author BaleTani Development Team
 * @created 2025-11-15
 */

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, MoreHorizontal } from 'lucide-react';
import faqService from '../../services/services_admin/faqService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Pagination from '../../components/ui_admin/Pagination';
import FAQFormModal from '../../components/ui_admin/FAQFormModal';
import DeleteConfirmModal from '../../components/ui_admin/DeleteConfirmModal';

const FAQManagement = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalFAQs, setTotalFAQs] = useState(0);
  
  // Filters & Search
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    is_active: ''
  });

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState(null);
  const [formMode, setFormMode] = useState('create'); // 'create' or 'edit'

  // Categories for filter
  const categories = [
    { value: '', label: 'Semua Kategori' },
    { value: 'umum', label: 'Umum' },
    { value: 'pembayaran', label: 'Pembayaran' },
    { value: 'pengiriman', label: 'Pengiriman' },
    { value: 'produk', label: 'Produk' }
  ];

  // Status options for filter
  const statusOptions = [
    { value: '', label: 'Semua Status' },
    { value: 'true', label: 'Aktif' },
    { value: 'false', label: 'Tidak Aktif' }
  ];

  // Fetch FAQs
  useEffect(() => {
    fetchFAQs();
  }, [currentPage, filters]);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...filters
      };

      const response = await faqService.getAllFAQs(params);
      
      if (response.success) {
        setFaqs(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalFAQs(response.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle create FAQ
  const handleCreateFAQ = () => {
    setSelectedFAQ(null);
    setFormMode('create');
    setShowFormModal(true);
  };

  // Handle edit FAQ
  const handleEditFAQ = (faq) => {
    setSelectedFAQ(faq);
    setFormMode('edit');
    setShowFormModal(true);
  };

  // Handle delete FAQ
  const handleDeleteFAQ = (faq) => {
    setSelectedFAQ(faq);
    setShowDeleteModal(true);
  };

  // Confirm delete FAQ
  const confirmDeleteFAQ = async () => {
    try {
      await faqService.deleteFAQ(selectedFAQ.id);
      setShowDeleteModal(false);
      setSelectedFAQ(null);
      fetchFAQs(); // Refresh data
    } catch (error) {
      console.error('Error deleting FAQ:', error);
    }
  };

  // Handle form success
  const handleFormSuccess = () => {
    setShowFormModal(false);
    setSelectedFAQ(null);
    fetchFAQs(); // Refresh data
  };

  // Get category label
  const getCategoryLabel = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">FAQ Management</h1>
          <p className="text-gray-600">Kelola FAQ untuk customer</p>
        </div>
        <Button
          onClick={handleCreateFAQ}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tambah FAQ
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cari FAQ
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Cari pertanyaan atau jawaban..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategori
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.is_active}
              onChange={(e) => handleFilterChange('is_active', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setFilters({ search: '', category: '', is_active: '' });
                setCurrentPage(1);
              }}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* FAQ Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              FAQ List ({totalFAQs} total)
            </h3>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        ) : faqs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Tidak ada FAQ ditemukan
            </h3>
            <p className="text-gray-500 mb-4">
              Belum ada FAQ yang sesuai dengan filter Anda.
            </p>
            <Button onClick={handleCreateFAQ}>
              Tambah FAQ Pertama
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pertanyaan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Urutan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dibuat
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {faqs.map((faq) => (
                  <tr key={faq.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {faq.question}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {faq.answer.substring(0, 100)}...
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getCategoryLabel(faq.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        faq.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {faq.is_active ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {faq.order_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(faq.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditFAQ(faq)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteFAQ(faq)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && faqs.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* FAQ Form Modal */}
      {showFormModal && (
        <FAQFormModal
          isOpen={showFormModal}
          onClose={() => setShowFormModal(false)}
          onSuccess={handleFormSuccess}
          faq={selectedFAQ}
          mode={formMode}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDeleteFAQ}
          title="Hapus FAQ"
          message={`Apakah Anda yakin ingin menghapus FAQ "${selectedFAQ?.question}"?`}
        />
      )}
    </div>
  );
};

export default FAQManagement;
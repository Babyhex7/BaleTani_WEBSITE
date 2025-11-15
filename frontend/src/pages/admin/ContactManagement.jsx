import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import AdminSidebarNew from '../../components/layout_admin/AdminSidebarNew';
import AdminHeaderNew from '../../components/layout_admin/AdminHeaderNew';
import ContactDetailModal from '../../components/ui_admin/ContactDetailModal';
import Pagination from '../../components/ui_admin/Pagination';
import contactService from '../../services/services_admin/contactService';
import useDebounce from '../../hooks/useDebounce';

const ContactManagement = () => {
  // State management
  const [messages, setMessages] = useState([]);
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
    pending: 0,
    replied: 0,
    resolved: 0
  });

  // Modals
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Fetch data on mount and filter change (with debounced search)
  useEffect(() => {
    fetchMessages();
  }, [currentPage, debouncedSearch, filterStatus, itemsPerPage]);

  // API Calls
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch,
        status: filterStatus
      };

      const data = await contactService.getAllMessages(params);

      if (data.success) {
        const messagesList = data.data || [];

        setMessages(messagesList);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.total || 0);

        // Calculate stats from current page data
        setStats({
          total: data.pagination?.total || 0,
          pending: messagesList.filter(m => m.status === 'pending').length,
          replied: messagesList.filter(m => m.status === 'replied').length,
          resolved: messagesList.filter(m => m.status === 'resolved').length
        });

        setError(null);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err.message || 'Gagal memuat pesan');
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleView = async (message) => {
    try {
      const data = await contactService.getMessageById(message.id);
      if (data.success) {
        setSelectedMessage(data.data);
        setShowDetailModal(true);
      }
    } catch (err) {
      console.error('Error viewing message:', err);
      showNotification('error', err.message || 'Gagal memuat detail pesan');
    }
  };

  const handleUpdateStatus = async (messageId, newStatus) => {
    try {
      const data = await contactService.updateStatus(messageId, { status: newStatus });
      if (data.success) {
        showNotification('success', 'Status berhasil diperbarui');
        fetchMessages();
        if (selectedMessage?.id === messageId) {
          setShowDetailModal(false);
        }
      }
    } catch (err) {
      showNotification('error', err.message || 'Gagal memperbarui status');
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        icon: ClockIcon,
        label: 'Pending'
      },
      read: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        icon: EnvelopeIcon,
        label: 'Dibaca'
      },
      replied: {
        bg: 'bg-purple-100',
        text: 'text-purple-700',
        icon: ChatBubbleLeftRightIcon,
        label: 'Dibalas'
      },
      resolved: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        icon: CheckCircleIcon,
        label: 'Selesai'
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`px-3 py-1 text-xs font-medium ${config.bg} ${config.text} rounded-full flex items-center gap-1 w-fit`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      
      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return '-';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebarNew />

      <div className="flex-1">
        <AdminHeaderNew
          title="Contact Management"
          subtitle="Kelola pesan kontak pelanggan"
        />

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Pesan</p>
                  <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <EnvelopeIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <ClockIcon className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Dibalas</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.replied}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Selesai</p>
                  <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Daftar Pesan Kontak</h2>
            </div>

            {/* Filters */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari nama, email, atau subjek..."
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
                    <option value="pending">Pending</option>
                    <option value="read">Dibaca</option>
                    <option value="replied">Dibalas</option>
                    <option value="resolved">Selesai</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <ArrowPathIcon className="w-8 h-8 text-gray-400 animate-spin" />
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600">{error}</p>
                  <button
                    onClick={fetchMessages}
                    className="mt-4 text-sm text-green-600 hover:text-green-700"
                  >
                    Coba lagi
                  </button>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12">
                  <EnvelopeIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Tidak ada pesan</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nama
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subjek
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
                    {messages.map((message) => (
                      <tr key={message.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(message.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {message.name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {message.email || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="max-w-xs truncate">
                            {message.subject || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(message.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleView(message)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <EyeIcon className="w-4 h-4" />
                            Lihat
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {!loading && !error && messages.length > 0 && (
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
      {showDetailModal && selectedMessage && (
        <ContactDetailModal
          message={selectedMessage}
          onClose={() => setShowDetailModal(false)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
};

export default ContactManagement;

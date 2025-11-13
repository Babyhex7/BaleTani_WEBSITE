import React, { useEffect, useState } from 'react';
import AdminSidebarNew from '../../components/layout_admin/AdminSidebarNew';
import AdminHeaderNew from '../../components/layout_admin/AdminHeaderNew';
import Pagination from '../../components/ui/Pagination';
import { toast } from 'react-hot-toast';
import adminApiClient from '../../services/services_admin/adminApiClient';
import inventoryService from '../../services/services_admin/inventoryService';
import useAdminStore from '../../store/store_admin/useAdminStore';
import ProcurementDetailModal from '../../components/ui_admin/ProcurementDetailModal';
import ProcurementFormModal from '../../components/ui_admin/ProcurementFormModal';
import {
  PlusIcon,
  TruckIcon,
  CubeIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

const ProcurementList = () => {
  const { admin } = useAdminStore();
  const userRole = admin?.role?.role_name;

  const [procurements, setProcurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // stats
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, totalItems: 0 });

  // filters & pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // products for selection
  const [products, setProducts] = useState([]);

  // modals
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedProcurement, setSelectedProcurement] = useState(null);
  const [editData, setEditData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProcurements();
    fetchProductsForSelect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage, searchQuery, statusFilter, typeFilter, startDate, endDate]);

  const fetchProductsForSelect = async () => {
    try {
      const data = await inventoryService.getProducts({ limit: 1000 });
      if (data && data.success) {
        const list = data.data?.products || data.data || [];
        setProducts(Array.isArray(list) ? list : []);
      }
    } catch (err) {
      console.warn('Failed to fetch products for procurement select', err);
    }
  };

  const fetchProcurements = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        q: searchQuery || undefined,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        date_from: startDate || undefined,
        date_to: endDate || undefined,
      };

      const qs = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined))
      ).toString();
      
      const response = await adminApiClient.get(`/admin/procurements?${qs}`);
      const data = response.data;

      const items = data?.data?.items || [];
      const pagination = data?.data?.pagination || {};

      setProcurements(items);
      setTotalItems(pagination.total_items || items.length);
      setTotalPages(pagination.total_pages || 1);
      setCurrentPage(pagination.current_page || currentPage);

      const total = pagination.total_items || items.length;
      const pending = items.filter((i) => i.status === 'pending').length;
      const approved = items.filter((i) => i.status === 'approved').length;
      const totalIt = items.reduce((s, it) => s + ((it.items && it.items.length) || 0), 0);
      setStats({ total, pending, approved, totalItems: totalIt });
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Gagal mengambil data pengadaan');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (procurementId) => {
    try {
      const response = await adminApiClient.get(`/admin/procurements/${procurementId}`);
      if (response.data.success) {
        setSelectedProcurement(response.data.data);
        setShowDetailModal(true);
      }
    } catch (err) {
      console.error('Error fetching procurement detail:', err);
      toast.error('Gagal mengambil detail pengadaan');
    }
  };

  const handleCreate = () => {
    setEditData(null);
    setShowFormModal(true);
  };

  const handleEdit = (procurement) => {
    setEditData(procurement);
    setShowFormModal(true);
    setShowDetailModal(false);
  };

  const handleSubmitForm = async (payload) => {
    setIsSubmitting(true);
    try {
      if (editData) {
        // Update
        await adminApiClient.put(`/admin/procurements/${editData.id}`, payload);
        toast.success('Pengadaan berhasil diupdate');
      } else {
        // Create
        await adminApiClient.post('/admin/procurements', payload);
        toast.success('Pengadaan berhasil dibuat');
      }
      setShowFormModal(false);
      setEditData(null);
      fetchProcurements();
    } catch (err) {
      console.error('Submit procurement error', err);
      toast.error(err?.response?.data?.message || 'Gagal menyimpan pengadaan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (procurementId) => {
    if (!window.confirm('Apakah Anda yakin ingin menyetujui pengadaan ini?')) return;

    try {
      await adminApiClient.put(`/admin/procurements/${procurementId}/approve`);
      toast.success('Pengadaan berhasil disetujui');
      setShowDetailModal(false);
      fetchProcurements();
    } catch (err) {
      console.error('Approve error', err);
      toast.error(err?.response?.data?.message || 'Gagal menyetujui pengadaan');
    }
  };

  const handleReject = async (procurementId) => {
    const reason = window.prompt('Masukkan alasan penolakan:');
    if (!reason) return;

    try {
      await adminApiClient.put(`/admin/procurements/${procurementId}/reject`, {
        rejection_reason: reason,
      });
      toast.success('Pengadaan berhasil ditolak');
      setShowDetailModal(false);
      fetchProcurements();
    } catch (err) {
      console.error('Reject error', err);
      toast.error(err?.response?.data?.message || 'Gagal menolak pengadaan');
    }
  };

  const handleDelete = async (procurementId) => {
    const reason = window.prompt('Masukkan alasan penghapusan (opsional):');
    if (reason === null) return; // User cancelled

    try {
      await adminApiClient.delete(`/admin/procurements/${procurementId}`, {
        data: { reason: reason || 'Dihapus oleh admin' },
      });
      toast.success('Pengadaan berhasil dihapus');
      setShowDetailModal(false);
      fetchProcurements();
    } catch (err) {
      console.error('Delete error', err);
      toast.error(err?.response?.data?.message || 'Gagal menghapus pengadaan');
    }
  };

  const handleRestore = async (procurementId) => {
    if (!window.confirm('Apakah Anda yakin ingin memulihkan pengadaan ini?')) return;

    try {
      await adminApiClient.post(`/admin/procurements/${procurementId}/restore`);
      toast.success('Pengadaan berhasil dipulihkan');
      setShowDetailModal(false);
      fetchProcurements();
    } catch (err) {
      console.error('Restore error', err);
      toast.error(err?.response?.data?.message || 'Gagal memulihkan pengadaan');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    if (!status)
      return (
        <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">-</span>
      );
    if (status === 'approved') {
      return (
        <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          Disetujui
        </span>
      );
    }
    if (status === 'rejected') {
      return (
        <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full flex items-center gap-1">
          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
          Ditolak
        </span>
      );
    }
    return (
      <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full flex items-center gap-1">
        <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
        Menunggu
      </span>
    );
  };

  const getTypeBadge = (type) => {
    if (type === 'online') {
      return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">Online</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">Offline</span>;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebarNew />
      <div className="flex-1">
        <AdminHeaderNew title="Procurement Management" subtitle="Kelola pengadaan barang" />

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Pengadaan</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <CubeIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Menunggu Approval</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <ExclamationCircleIcon className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Disetujui</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Item</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TruckIcon className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-900">Daftar Pengadaan</h2>
                <button
                  onClick={handleCreate}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <PlusIcon className="w-5 h-5" />
                  Buat Pengadaan
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari kode, supplier..."
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
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Semua Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <select
                    value={typeFilter}
                    onChange={(e) => {
                      setTypeFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Semua Tipe</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Dari tanggal"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Sampai tanggal"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-600">Memuat pengadaan...</div>
              ) : error ? (
                <div className="p-8 text-center text-red-600">{error}</div>
              ) : procurements.length === 0 ? (
                <div className="p-8 text-center text-gray-600">
                  <CubeIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Belum ada data pengadaan</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Kode Procurement
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tanggal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Jenis
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Supplier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Total Nilai
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Dibuat Oleh
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {procurements.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {p.procurement_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {formatDate(p.procurement_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {getTypeBadge(p.procurement_type)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {p.supplier_name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(p.total_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {getStatusBadge(p.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {p.creator?.full_name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewDetail(p.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Lihat Detail"
                            >
                              <EyeIcon className="w-5 h-5" />
                            </button>
                            {p.status === 'pending' && !p.deleted_at && (
                              <>
                                <button
                                  onClick={() => handleEdit(p)}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <PencilIcon className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(p.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Hapus"
                                >
                                  <TrashIcon className="w-5 h-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {!loading && !error && procurements.length > 0 && (
              <div className="p-4 border-t border-gray-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={(p) => setCurrentPage(p)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedProcurement && (
        <ProcurementDetailModal
          procurement={selectedProcurement}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedProcurement(null);
          }}
          onApprove={handleApprove}
          onReject={handleReject}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRestore={handleRestore}
          userRole={userRole}
        />
      )}

      {/* Form Modal */}
      <ProcurementFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditData(null);
        }}
        onSubmit={handleSubmitForm}
        products={products}
        editData={editData}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default ProcurementList;

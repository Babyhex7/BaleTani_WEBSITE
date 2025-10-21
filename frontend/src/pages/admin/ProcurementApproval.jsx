import React, { useState } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '../../components/layout_admin/AdminLayout';
import { Badge } from '../../components/ui_admin/CommonComponents';
import Pagination from '../../components/ui_admin/Pagination';
import { formatCurrency, formatDateTime, mockProcurements } from '../../utils/mockProductData';

/**
 * ProcurementApproval - Halaman approval procurement
 * Untuk Super Admin & Super Inventory Admin approve/reject procurement
 */
const ProcurementApproval = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProcurement, setSelectedProcurement] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const itemsPerPage = 10;

  const [procurements, setProcurements] = useState(mockProcurements);

  // Calculate stats
  const stats = {
    pending: procurements.filter(p => p.status === 'pending').length,
    approved: procurements.filter(p => p.status === 'approved').length,
    rejected: procurements.filter(p => p.status === 'rejected').length,
    total: procurements.length,
  };

  // Filter
  const filteredProcurements = procurements.filter(proc => {
    const matchSearch = 
      proc.procurement_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proc.supplier_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || proc.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProcurements.length / itemsPerPage);
  const paginatedProcurements = filteredProcurements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleApprove = (procId) => {
    if (confirm('Approve procurement ini?')) {
      setProcurements(procurements.map(p => 
        p.id === procId ? { ...p, status: 'approved', approved_at: new Date().toISOString() } : p
      ));
      setShowDetailModal(false);
      alert('Procurement berhasil di-approve!');
    }
  };

  const handleReject = (procId) => {
    if (!rejectReason.trim()) {
      alert('Alasan reject wajib diisi!');
      return;
    }
    if (confirm('Reject procurement ini?')) {
      setProcurements(procurements.map(p => 
        p.id === procId ? { ...p, status: 'rejected', reject_reason: rejectReason, rejected_at: new Date().toISOString() } : p
      ));
      setShowDetailModal(false);
      setRejectReason('');
      alert('Procurement ditolak!');
    }
  };

  const handleViewDetail = (procurement) => {
    setSelectedProcurement(procurement);
    setShowDetailModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', icon: ClockIcon, text: 'Pending' },
      approved: { variant: 'success', icon: CheckCircleIcon, text: 'Approved' },
      rejected: { variant: 'danger', icon: XCircleIcon, text: 'Rejected' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge variant={config.variant} size="sm">
        <config.icon className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Procurement Approval</h1>
          <p className="text-gray-600 mt-1">Kelola persetujuan procurement dari Inventory Admin</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
              </div>
              <div className="p-4 bg-yellow-100 rounded-xl">
                <ClockIcon className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.approved}</p>
              </div>
              <div className="p-4 bg-green-100 rounded-xl">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</p>
              </div>
              <div className="p-4 bg-red-100 rounded-xl">
                <XCircleIcon className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Procurement</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="p-4 bg-blue-100 rounded-xl">
                <DocumentTextIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari kode procurement atau supplier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {['all', 'pending', 'approved', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    statusFilter === status
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'Semua' : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kode Procurement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Nilai
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dibuat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedProcurements.map((proc) => (
                  <tr key={proc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{proc.procurement_code}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{proc.supplier_name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(proc.total_amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{proc.items?.length || 0} items</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(proc.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{formatDateTime(proc.created_at)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleViewDetail(proc)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <EyeIcon className="w-5 h-5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedProcurement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Detail Procurement</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Header Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Kode Procurement</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedProcurement.procurement_code}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Supplier</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedProcurement.supplier_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedProcurement.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Total Nilai</label>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(selectedProcurement.total_amount)}</p>
                  </div>
                </div>

                {/* Items Table */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Detail Items</h4>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedProcurement.items?.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.product_name}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{item.quantity} {item.unit}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{formatCurrency(item.price)}</td>
                            <td className="px-4 py-2 text-sm font-semibold text-gray-900">
                              {formatCurrency(item.quantity * item.price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Approval Actions (hanya untuk pending) */}
                {selectedProcurement.status === 'pending' && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <h4 className="font-semibold text-gray-900">Approval Action</h4>
                    
                    {/* Reject Reason (conditional) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alasan Reject (Opsional untuk Approve, Wajib untuk Reject)
                      </label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Masukkan alasan jika reject..."
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(selectedProcurement.id)}
                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2"
                      >
                        <CheckCircleIcon className="w-5 h-5" />
                        Approve Procurement
                      </button>
                      <button
                        onClick={() => handleReject(selectedProcurement.id)}
                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center justify-center gap-2"
                      >
                        <XCircleIcon className="w-5 h-5" />
                        Reject Procurement
                      </button>
                    </div>
                  </div>
                )}

                {/* Show rejection reason if rejected */}
                {selectedProcurement.status === 'rejected' && selectedProcurement.reject_reason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-red-800">Alasan Reject:</p>
                    <p className="text-sm text-red-700 mt-1">{selectedProcurement.reject_reason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ProcurementApproval;

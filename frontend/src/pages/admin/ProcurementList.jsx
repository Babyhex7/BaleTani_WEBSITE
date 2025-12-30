import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import {
  ShoppingCartIcon,
  BanknotesIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";
import AdminSidebarNew from "../../components/layout_admin/AdminSidebarNew";
import AdminHeaderNew from "../../components/layout_admin/AdminHeaderNew";
import procurementService from "../../services/services_admin/procurementService";
import ProcurementFormModal from "../../components/ui_admin/ProcurementFormModal";
import ProcurementDetailModal from "../../components/ui_admin/ProcurementDetailModal";

const ProcurementList = () => {
  const [procurements, setProcurements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProcurement, setSelectedProcurement] = useState(null);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    fetchProcurements();
  }, [pagination.currentPage, statusFilter, typeFilter, dateFrom, dateTo]);

  const fetchProcurements = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        q: searchQuery,
        status: statusFilter,
        type: typeFilter,
        date_from: dateFrom,
        date_to: dateTo,
      };

      const response = await procurementService.getAllProcurements(params);

      if (response.success) {
        setProcurements(response.data.items);
        setPagination(response.data.pagination);
        calculateStats(response.data.items);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
  const normalize = (s) => {
    const map = {
      Menunggu: "pending",
      Disetujui: "approved",
      Ditolak: "rejected",
    };
    return map[s] || s;
  };

  const stats = {
    total: data.length,
    pending: data.filter((p) => normalize(p.status) === "pending").length,
    approved: data.filter((p) => normalize(p.status) === "approved").length,
    rejected: data.filter((p) => normalize(p.status) === "rejected").length,
    totalAmount: data.reduce((sum, p) => sum + parseFloat(p.total_amount), 0),
  };

  setStats(stats);
};


  const handleSearch = () => {
    setPagination({ ...pagination, currentPage: 1 });
    fetchProcurements();
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setTypeFilter("");
    setDateFrom("");
    setDateTo("");
    setPagination({ ...pagination, currentPage: 1 });
  };

  const handleCreateNew = () => {
    setSelectedProcurement(null);
    setShowFormModal(true);
  };

  const handleEdit = (procurement) => {
    if (procurement.status !== "pending") {
      toast.error("Hanya pengadaan pending yang dapat diedit");
      return;
    }
    setSelectedProcurement(procurement);
    setShowFormModal(true);
  };

  const handleViewDetail = (procurement) => {
    setSelectedProcurement(procurement);
    setShowDetailModal(true);
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menyetujui pengadaan ini?")) {
      return;
    }

    try {
      const response = await procurementService.approveProcurement(id);
      if (response.success) {
        toast.success("Pengadaan berhasil disetujui");
        fetchProcurements();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menyetujui pengadaan");
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Masukkan alasan penolakan:");
    if (!reason) return;

    try {
      const response = await procurementService.rejectProcurement(id, {
        rejection_reason: reason,
      });
      if (response.success) {
        toast.success("Pengadaan berhasil ditolak");
        fetchProcurements();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menolak pengadaan");
    }
  };

  const handleDelete = async (id) => {
    const reason = window.prompt("Masukkan alasan penghapusan (opsional):");
    if (reason === null) return;

    try {
      const response = await procurementService.deleteProcurement(id, {
        deleted_reason: reason || undefined,
      });
      if (response.success) {
        toast.success("Pengadaan berhasil dihapus");
        fetchProcurements();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menghapus pengadaan");
    }
  };

  const handleFormSubmit = () => {
    setShowFormModal(false);
    fetchProcurements();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
  // normalize Bahasa Indonesia → English
  const map = {
    Menunggu: "pending",
    Disetujui: "approved",
    Ditolak: "rejected",
  };

  const normalized = map[status] || status;

  const badges = {
    pending: "bg-yellow-100 text-yellow-800 border border-yellow-300",
    approved: "bg-green-100 text-green-800 border border-green-300",
    rejected: "bg-red-100 text-red-800 border border-red-300",
  };

  const labels = {
    pending: "Menunggu",
    approved: "Disetujui",
    rejected: "Ditolak",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[normalized]}`}
    >
      {labels[normalized] || status}
    </span>
  );
};

  const getTypeBadge = (type) => {
    const badges = {
      online: "bg-blue-100 text-blue-800",
      offline: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${badges[type]}`}
      >
        {type === "online" ? "Online" : "Offline"}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-white">
      <AdminSidebarNew />
      
      <div className="flex-1 flex flex-col">
        <AdminHeaderNew 
          title="Procurement List" 
          subtitle="Kelola pengadaan bahan baku"
        />
        
        <div className="admin-container px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Pengadaan</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                  <ShoppingCartIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Menunggu Persetujuan</p>
                  <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
                  <ClockIcon className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Disetujui</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Item</p>
                  <p className="text-lg sm:text-xl font-bold text-purple-600">
                    {stats.total}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
                  <ShoppingCartIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Daftar Pengadaan</h2>
                
                <button
                  onClick={handleCreateNew}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors w-full sm:w-auto"
                >
                  <PlusIcon className="w-5 h-5" />
                  Tambah Pengadaan
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
                <div className="sm:col-span-2 lg:col-span-2">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari no. pengadaan atau supplier..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                  >
                    <option value="" className="text-xs sm:text-sm">Semua Status</option>
                    <option value="pending" className="text-xs sm:text-sm">Menunggu</option>
                    <option value="approved" className="text-xs sm:text-sm">Disetujui</option>
                    <option value="rejected" className="text-xs sm:text-sm">Ditolak</option>
                  </select>
                </div>

                <div>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                  >
                    <option value="" className="text-xs sm:text-sm">Semua Tipe</option>
                    <option value="online" className="text-xs sm:text-sm">Online</option>
                    <option value="offline" className="text-xs sm:text-sm">Offline</option>
                  </select>
                </div>

                <div>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
                  />
                </div>

                <div>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <ArrowPathIcon className="w-8 h-8 text-green-600 animate-spin" />
                  <span className="ml-3 text-gray-600">Memuat data...</span>
                </div>
              ) : procurements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <ShoppingCartIcon className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-gray-600 font-medium">Tidak ada data pengadaan</p>
                  <button 
                    onClick={handleCreateNew} 
                    className="mt-4 px-4 py-2 text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    + Tambah Pengadaan Pertama
                  </button>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            No. Pengadaan
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
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Approved/Rejected By
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {procurements.map((procurement) => (
                          <tr key={procurement.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-mono font-semibold text-sm text-gray-900">
                                {procurement.procurement_number}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {formatDate(procurement.procurement_date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {getTypeBadge(procurement.procurement_type)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {procurement.supplier_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-semibold text-sm text-gray-900">
                                {formatCurrency(procurement.total_amount)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(procurement.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {procurement.creator?.full_name || "-"}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {procurement.status === "approved" && procurement.approver ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 text-green-700">
                                    <CheckIcon className="w-4 h-4 flex-shrink-0" />
                                    <span className="font-medium">{procurement.approver.full_name}</span>
                                  </div>
                                  <div className="text-xs text-gray-500 pl-5">
                                    {formatDate(procurement.approved_at)}
                                  </div>
                                </div>
                              ) : procurement.status === "rejected" && procurement.rejector ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 text-red-700">
                                    <XMarkIcon className="w-4 h-4 flex-shrink-0" />
                                    <span className="font-medium">{procurement.rejector.full_name}</span>
                                  </div>
                                  <div className="text-xs text-gray-500 pl-5">
                                    {formatDate(procurement.rejected_at)}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleViewDetail(procurement)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Detail"
                                >
                                  <EyeIcon className="w-5 h-5" />
                                </button>

                                {procurement.status === "pending" && (
                                  <>
                                    <button
                                      onClick={() => handleEdit(procurement)}
                                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                      title="Edit"
                                    >
                                      <PencilIcon className="w-5 h-5" />
                                    </button>

                                    <button
                                      onClick={() => handleDelete(procurement.id)}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Delete"
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
                  </div>

                  {/* Mobile/Tablet Card View */}
                  <div className="lg:hidden divide-y divide-gray-200">
                    {procurements.map((procurement) => (
                      <div 
                        key={procurement.id} 
                        className="p-4 sm:p-5 hover:bg-gray-50 transition-colors"
                      >
                        {/* Header Row */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0 pr-2">
                            <div className="font-mono font-semibold text-sm text-gray-900 mb-1 break-all">
                              {procurement.procurement_number}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(procurement.procurement_date)}
                            </div>
                          </div>
                          <div className="ml-2 flex-shrink-0">
                            {getStatusBadge(procurement.status)}
                          </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Jenis</div>
                            {getTypeBadge(procurement.procurement_type)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs text-gray-500 mb-1">Supplier</div>
                            <div className="text-sm font-medium text-gray-900 truncate" title={procurement.supplier_name}>
                              {procurement.supplier_name}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Total Nilai</div>
                            <div className="text-sm font-semibold text-gray-900 break-words">
                              {formatCurrency(procurement.total_amount)}
                            </div>
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs text-gray-500 mb-1">Dibuat Oleh</div>
                            <div className="text-sm text-gray-900 truncate" title={procurement.creator?.full_name || "-"}>
                              {procurement.creator?.full_name || "-"}
                            </div>
                          </div>
                        </div>

                        {/* Approved/Rejected By - Only show if approved or rejected */}
                        {(procurement.status === "approved" || procurement.status === "rejected") && (
                          <div className="mt-3 p-3 rounded-lg" style={{
                            backgroundColor: procurement.status === "approved" ? '#f0fdf4' : '#fef2f2',
                            borderLeft: `3px solid ${procurement.status === "approved" ? '#22c55e' : '#ef4444'}`
                          }}>
                            <div className="text-xs text-gray-600 mb-1">
                              {procurement.status === "approved" ? "✅ Disetujui Oleh" : "❌ Ditolak Oleh"}
                            </div>
                            <div className="text-sm font-medium" style={{
                              color: procurement.status === "approved" ? '#15803d' : '#991b1b'
                            }}>
                              {procurement.status === "approved" 
                                ? procurement.approver?.full_name || "-"
                                : procurement.rejector?.full_name || "-"}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {formatDate(procurement.status === "approved" ? procurement.approved_at : procurement.rejected_at)}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                          <button
                            onClick={() => handleViewDetail(procurement)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <EyeIcon className="w-4 h-4" />
                            Detail
                          </button>

                          {procurement.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleEdit(procurement)}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                              >
                                <PencilIcon className="w-4 h-4" />
                                Edit
                              </button>

                              <button
                                onClick={() => handleDelete(procurement.id)}
                                className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                title="Hapus"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Pagination */}
            {!loading && procurements.length > 0 && (
              <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                    Menampilkan{" "}
                    <span className="font-semibold">
                      {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
                    </span>{" "}
                    -{" "}
                    <span className="font-semibold">
                      {Math.min(
                        pagination.currentPage * pagination.itemsPerPage,
                        pagination.totalItems
                      )}
                    </span>{" "}
                    dari{" "}
                    <span className="font-semibold">{pagination.totalItems}</span>{" "}
                    data
                  </div>

                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() =>
                        setPagination({
                          ...pagination,
                          currentPage: pagination.currentPage - 1,
                        })
                      }
                      disabled={pagination.currentPage === 1}
                      className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-medium text-gray-700"
                    >
                      Prev
                    </button>

                    <div className="hidden sm:flex gap-1">
                      {Array.from(
                        { length: Math.min(pagination.totalPages, 5) },
                        (_, i) => i + 1
                      ).map((page) => (
                        <button
                          key={page}
                          onClick={() =>
                            setPagination({ ...pagination, currentPage: page })
                          }
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            pagination.currentPage === page
                              ? "bg-green-600 text-white"
                              : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    {/* Mobile page indicator */}
                    <div className="sm:hidden flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-xs font-medium text-gray-700">
                      {pagination.currentPage} / {pagination.totalPages}
                    </div>

                    <button
                      onClick={() =>
                        setPagination({
                          ...pagination,
                          currentPage: pagination.currentPage + 1,
                        })
                      }
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-medium text-gray-700"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showFormModal && (
        <ProcurementFormModal
          procurement={selectedProcurement}
          onClose={() => setShowFormModal(false)}
          onSuccess={handleFormSubmit}
        />
      )}

      {showDetailModal && selectedProcurement && (
        <ProcurementDetailModal
          procurementId={selectedProcurement.id}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  );
};

export default ProcurementList;

import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  FileText,
  Download,
  RefreshCw,
  Truck
} from 'lucide-react';
import AdminLayout from '../../components/layout_admin/AdminLayout';
import Table from '../../components/ui_admin/Table';
import ModalAdmin, { ConfirmModal } from '../../components/ui_admin/ModalAdmin';
import { Badge, LoadingSpinner, EmptyState } from '../../components/ui_admin/CommonComponents';
import Pagination from '../../components/ui_admin/Pagination';
import {
  mockProcurements,
  mockProducts,
  mockCategories,
  formatCurrency,
  formatDate,
  formatDateTime
} from '../../utils/mockProductData';
import toast from 'react-hot-toast';

/**
 * ProcurementManagement - Halaman manajemen procurement/pengadaan
 * Fitur: Create procurement, Approval, View detail, Filter
 */
const ProcurementManagement = () => {
  // State management
  const [procurements, setProcurements] = useState(mockProcurements);
  const [products] = useState(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, approved, rejected
  const [filterType, setFilterType] = useState('all'); // all, online, offline
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('procurement_date');
  const [sortDirection, setSortDirection] = useState('desc');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedProcurement, setSelectedProcurement] = useState(null);

  // Form state for new procurement
  const [formData, setFormData] = useState({
    procurement_type: 'online',
    supplier_name: '',
    procurement_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Procurement items state
  const [procurementItems, setProcurementItems] = useState([
    {
      id: Date.now(),
      product_id: '',
      quantity: '',
      purchase_price_per_unit: ''
    }
  ]);

  // Filter logic
  const filteredProcurements = useMemo(() => {
    return procurements.filter(proc => {
      const matchSearch =
        proc.procurement_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proc.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proc.created_by_name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = filterStatus === 'all' || proc.status === filterStatus;
      const matchType = filterType === 'all' || proc.procurement_type === filterType;

      return matchSearch && matchStatus && matchType;
    });
  }, [procurements, searchTerm, filterStatus, filterType]);

  // Sort logic
  const sortedProcurements = useMemo(() => {
    const sorted = [...filteredProcurements].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'total_amount') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else if (sortField === 'procurement_date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredProcurements, sortField, sortDirection]);

  // Pagination
  const paginatedProcurements = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedProcurements.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedProcurements, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedProcurements.length / itemsPerPage);

  // Stats calculation
  const stats = {
    total: procurements.length,
    pending: procurements.filter(p => p.status === 'pending').length,
    approved: procurements.filter(p => p.status === 'approved').length,
    rejected: procurements.filter(p => p.status === 'rejected').length,
    totalValue: procurements
      .filter(p => p.status === 'approved')
      .reduce((sum, p) => sum + p.total_amount, 0)
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

  const handleAddProcurement = () => {
    setFormData({
      procurement_type: 'online',
      supplier_name: '',
      procurement_date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setProcurementItems([
      {
        id: Date.now(),
        product_id: '',
        quantity: '',
        purchase_price_per_unit: ''
      }
    ]);
    setShowAddModal(true);
  };

  const handleViewDetail = (procurement) => {
    setSelectedProcurement(procurement);
    setShowDetailModal(true);
  };

  const handleApprove = (procurement) => {
    setSelectedProcurement(procurement);
    setShowApproveModal(true);
  };

  const handleReject = (procurement) => {
    setSelectedProcurement(procurement);
    setShowRejectModal(true);
  };

  const confirmApprove = () => {
    const updatedProcurements = procurements.map(p =>
      p.id === selectedProcurement.id
        ? {
            ...p,
            status: 'approved',
            approved_by: 'user-001',
            approved_by_name: 'Ahmad Dahlan',
            approved_at: new Date().toISOString()
          }
        : p
    );
    setProcurements(updatedProcurements);
    setShowApproveModal(false);
    toast.success(`Procurement ${selectedProcurement.procurement_code} berhasil disetujui`);
  };

  const confirmReject = () => {
    const updatedProcurements = procurements.map(p =>
      p.id === selectedProcurement.id
        ? {
            ...p,
            status: 'rejected',
            rejected_by: 'user-001',
            rejected_by_name: 'Ahmad Dahlan',
            rejected_at: new Date().toISOString()
          }
        : p
    );
    setProcurements(updatedProcurements);
    setShowRejectModal(false);
    toast.success(`Procurement ${selectedProcurement.procurement_code} ditolak`);
  };

  const addItem = () => {
    setProcurementItems([
      ...procurementItems,
      {
        id: Date.now(),
        product_id: '',
        quantity: '',
        purchase_price_per_unit: ''
      }
    ]);
  };

  const removeItem = (id) => {
    if (procurementItems.length > 1) {
      setProcurementItems(procurementItems.filter(item => item.id !== id));
    }
  };

  const updateItem = (id, field, value) => {
    setProcurementItems(
      procurementItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const calculateTotal = () => {
    return procurementItems.reduce((total, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.purchase_price_per_unit) || 0;
      return total + quantity * price;
    }, 0);
  };

  const handleSubmitProcurement = (e) => {
    e.preventDefault();

    // Validation
    const validItems = procurementItems.filter(
      item => item.product_id && item.quantity && item.purchase_price_per_unit
    );

    if (validItems.length === 0) {
      toast.error('Tambahkan minimal 1 item produk');
      return;
    }

    // Create procurement items with details
    const items = validItems.map(item => {
      const product = products.find(p => p.id === item.product_id);
      const quantity = parseFloat(item.quantity);
      const price = parseFloat(item.purchase_price_per_unit);
      const expiryDate = new Date(formData.procurement_date);
      expiryDate.setDate(expiryDate.getDate() + (product?.shelf_life_days || 7));

      return {
        id: `proc-item-${Date.now()}-${item.id}`,
        product_id: item.product_id,
        product_name: product?.name || '',
        quantity: quantity,
        unit: product?.unit || 'kg',
        purchase_price_per_unit: price,
        subtotal: quantity * price,
        expiry_date: expiryDate.toISOString().split('T')[0]
      };
    });

    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

    const newProcurement = {
      id: `proc-${Date.now()}`,
      procurement_code: `PROC-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(
        procurements.length + 1
      ).padStart(3, '0')}`,
      ...formData,
      total_amount: totalAmount,
      status: 'pending',
      created_by: 'user-002',
      created_by_name: 'Siti Aminah',
      approved_by: null,
      approved_by_name: null,
      approved_at: null,
      rejected_by: null,
      rejected_by_name: null,
      rejected_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: items
    };

    setProcurements([newProcurement, ...procurements]);
    setShowAddModal(false);
    toast.success(`Procurement ${newProcurement.procurement_code} berhasil dibuat`);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', icon: <Clock className="w-3 h-3 mr-1" />, text: 'Pending' },
      approved: { variant: 'success', icon: <CheckCircle className="w-3 h-3 mr-1" />, text: 'Approved' },
      rejected: { variant: 'danger', icon: <XCircle className="w-3 h-3 mr-1" />, text: 'Rejected' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <Badge variant={config.variant}>
        {config.icon}
        {config.text}
      </Badge>
    );
  };

  // Table columns
  const columns = [
    {
      key: 'procurement_code',
      label: 'Kode Procurement',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">{formatDate(row.procurement_date)}</div>
        </div>
      )
    },
    {
      key: 'supplier_name',
      label: 'Supplier',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="text-gray-900">{value}</div>
          <Badge variant={row.procurement_type === 'online' ? 'info' : 'purple'} size="sm">
            {row.procurement_type === 'online' ? 'Online' : 'Offline'}
          </Badge>
        </div>
      )
    },
    {
      key: 'total_amount',
      label: 'Total Nilai',
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-gray-900">{formatCurrency(value)}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => getStatusBadge(value)
    },
    {
      key: 'created_by_name',
      label: 'Dibuat Oleh',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">{formatDateTime(row.created_at)}</div>
        </div>
      )
    }
  ];

  const actions = [
    {
      label: '',
      icon: <Eye className="w-4 h-4" />,
      onClick: handleViewDetail,
      className: 'text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded'
    },
    {
      label: '',
      icon: <CheckCircle className="w-4 h-4" />,
      onClick: handleApprove,
      className: 'text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded',
      condition: (row) => row.status === 'pending'
    },
    {
      label: '',
      icon: <XCircle className="w-4 h-4" />,
      onClick: handleReject,
      className: 'text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded',
      condition: (row) => row.status === 'pending'
    }
  ].filter(action => !action.condition || action.condition);

  // Filter actions based on condition
  const getActionsForRow = (row) => {
    return actions.filter(action => !action.condition || action.condition(row));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Truck className="w-8 h-8 mr-3 text-green-600" />
              Manajemen Procurement
            </h1>
            <p className="text-gray-600 mt-1">Kelola pengadaan barang dan approval stok</p>
          </div>
          <button
            onClick={handleAddProcurement}
            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Buat Procurement
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Procurement</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.approved}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Nilai</p>
                <p className="text-xl font-bold text-green-600 mt-2">
                  {formatCurrency(stats.totalValue)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari kode, supplier, atau pembuat..."
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
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">Semua Jenis</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Menampilkan <span className="font-semibold">{paginatedProcurements.length}</span> dari{' '}
              <span className="font-semibold">{sortedProcurements.length}</span> procurement
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterType('all');
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
          data={paginatedProcurements}
          actions={actions}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
          emptyMessage="Tidak ada procurement yang ditemukan"
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        )}

        {/* Add Procurement Modal */}
        <ModalAdmin
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Buat Procurement Baru"
          size="xl"
        >
          <form onSubmit={handleSubmitProcurement} className="space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Procurement <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.procurement_type}
                  onChange={(e) =>
                    setFormData({ ...formData, procurement_type: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Supplier <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.supplier_name}
                  onChange={(e) =>
                    setFormData({ ...formData, supplier_name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nama supplier"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Pengadaan <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.procurement_date}
                  onChange={(e) =>
                    setFormData({ ...formData, procurement_date: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan (Opsional)
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Catatan tambahan"
                />
              </div>
            </div>

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Daftar Item Produk</h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex items-center px-3 py-1 text-sm bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Tambah Item
                </button>
              </div>

              <div className="space-y-3">
                {procurementItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-3 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="col-span-5">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Produk
                      </label>
                      <select
                        value={item.product_id}
                        onChange={(e) =>
                          updateItem(item.id, 'product_id', e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Pilih Produk</option>
                        {products
                          .filter(p => p.is_active)
                          .map(prod => (
                            <option key={prod.id} value={prod.id}>
                              {prod.name} ({prod.unit})
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="col-span-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>

                    <div className="col-span-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Harga/Unit
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={item.purchase_price_per_unit}
                        onChange={(e) =>
                          updateItem(item.id, 'purchase_price_per_unit', e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>

                    <div className="col-span-1 flex items-end">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        disabled={procurementItems.length === 1}
                        className="w-full p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle className="w-5 h-5 mx-auto" />
                      </button>
                    </div>

                    {item.product_id && item.quantity && item.purchase_price_per_unit && (
                      <div className="col-span-12 text-sm text-gray-600">
                        Subtotal: {formatCurrency(parseFloat(item.quantity) * parseFloat(item.purchase_price_per_unit))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-gray-900">Total Nilai Procurement:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
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
                Buat Procurement
              </button>
            </div>
          </form>
        </ModalAdmin>

        {/* Detail Modal */}
        {selectedProcurement && (
          <ModalAdmin
            isOpen={showDetailModal}
            onClose={() => setShowDetailModal(false)}
            title={`Detail Procurement - ${selectedProcurement.procurement_code}`}
            size="lg"
          >
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Kode Procurement</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {selectedProcurement.procurement_code}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedProcurement.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Supplier</p>
                  <p className="text-gray-900 mt-1">{selectedProcurement.supplier_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Jenis</p>
                  <div className="mt-1">
                    <Badge
                      variant={
                        selectedProcurement.procurement_type === 'online' ? 'info' : 'purple'
                      }
                    >
                      {selectedProcurement.procurement_type === 'online' ? 'Online' : 'Offline'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tanggal Pengadaan</p>
                  <p className="text-gray-900 mt-1">
                    {formatDate(selectedProcurement.procurement_date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Dibuat Oleh</p>
                  <p className="text-gray-900 mt-1">{selectedProcurement.created_by_name}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Daftar Item</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                          Produk
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                          Qty
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                          Harga/Unit
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                          Subtotal
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                          Exp. Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedProcurement.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.product_name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            {formatCurrency(item.purchase_price_per_unit)}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                            {formatCurrency(item.subtotal)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {formatDate(item.expiry_date)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan="3" className="px-4 py-3 text-sm font-bold text-gray-900">
                          Total
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-green-600 text-right">
                          {formatCurrency(selectedProcurement.total_amount)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Approval Info */}
              {selectedProcurement.status === 'approved' && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-800">
                    ✓ Disetujui oleh {selectedProcurement.approved_by_name}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {formatDateTime(selectedProcurement.approved_at)}
                  </p>
                </div>
              )}

              {selectedProcurement.status === 'rejected' && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-sm font-medium text-red-800">
                    ✗ Ditolak oleh {selectedProcurement.rejected_by_name}
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    {formatDateTime(selectedProcurement.rejected_at)}
                  </p>
                  {selectedProcurement.notes && (
                    <p className="text-sm text-red-700 mt-2">
                      Alasan: {selectedProcurement.notes}
                    </p>
                  )}
                </div>
              )}

              {selectedProcurement.notes && selectedProcurement.status !== 'rejected' && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">Catatan:</p>
                  <p className="text-sm text-gray-600 mt-1">{selectedProcurement.notes}</p>
                </div>
              )}
            </div>
          </ModalAdmin>
        )}

        {/* Approve Confirmation */}
        {selectedProcurement && (
          <ConfirmModal
            isOpen={showApproveModal}
            onClose={() => setShowApproveModal(false)}
            onConfirm={confirmApprove}
            title="Setujui Procurement"
            message={`Apakah Anda yakin ingin menyetujui procurement ${selectedProcurement.procurement_code}? Stok produk akan otomatis bertambah.`}
            confirmText="Setujui"
            cancelText="Batal"
            type="info"
          />
        )}

        {/* Reject Confirmation */}
        {selectedProcurement && (
          <ConfirmModal
            isOpen={showRejectModal}
            onClose={() => setShowRejectModal(false)}
            onConfirm={confirmReject}
            title="Tolak Procurement"
            message={`Apakah Anda yakin ingin menolak procurement ${selectedProcurement.procurement_code}?`}
            confirmText="Tolak"
            cancelText="Batal"
            type="danger"
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default ProcurementManagement;

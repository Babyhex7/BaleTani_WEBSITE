import React, { useState } from 'react';
import {
  ShoppingCartIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TruckIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout_admin/AdminLayout';
import { Badge } from '../../components/ui_admin/CommonComponents';
import Pagination from '../../components/ui_admin/Pagination';
import { formatCurrency, formatDateTime } from '../../utils/mockProductData';

/**
 * OrderManagement - Halaman manajemen pesanan
 * Menampilkan daftar pesanan dengan filter dan detail
 */
const OrderManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const itemsPerPage = 10;

  // Mock data orders
  const mockOrders = [
    {
      id: 1,
      order_code: 'ORD-2025-001',
      customer_name: 'Budi Santoso',
      customer_phone: '081234567890',
      order_type: 'online',
      total_amount: 350000,
      payment_status: 'paid',
      order_status: 'processing',
      payment_method: 'transfer',
      created_at: '2025-01-20 14:30:00',
      items: [
        { product_name: 'Benih Padi Unggul', quantity: 2, price: 125000 },
        { product_name: 'Pupuk Organik', quantity: 1, price: 100000 },
      ],
    },
    {
      id: 2,
      order_code: 'ORD-2025-002',
      customer_name: 'Siti Aminah',
      customer_phone: '082345678901',
      order_type: 'offline',
      total_amount: 500000,
      payment_status: 'paid',
      order_status: 'completed',
      payment_method: 'cash',
      created_at: '2025-01-20 13:15:00',
      items: [
        { product_name: 'Pestisida Organik', quantity: 3, price: 150000 },
        { product_name: 'Pupuk NPK', quantity: 1, price: 50000 },
      ],
    },
    {
      id: 3,
      order_code: 'ORD-2025-003',
      customer_name: 'Ahmad Rahman',
      customer_phone: '083456789012',
      order_type: 'b2b',
      total_amount: 2500000,
      payment_status: 'pending',
      order_status: 'pending',
      payment_method: 'transfer',
      created_at: '2025-01-20 12:00:00',
      items: [
        { product_name: 'Benih Jagung', quantity: 10, price: 200000 },
        { product_name: 'Pupuk Organik', quantity: 5, price: 100000 },
      ],
    },
    {
      id: 4,
      order_code: 'ORD-2025-004',
      customer_name: 'Dewi Lestari',
      customer_phone: '084567890123',
      order_type: 'online',
      total_amount: 750000,
      payment_status: 'paid',
      order_status: 'shipped',
      payment_method: 'e-wallet',
      created_at: '2025-01-19 16:45:00',
      items: [
        { product_name: 'Alat Semprot', quantity: 1, price: 450000 },
        { product_name: 'Sarung Tangan', quantity: 2, price: 150000 },
      ],
    },
    {
      id: 5,
      order_code: 'ORD-2025-005',
      customer_name: 'Joko Susilo',
      customer_phone: '085678901234',
      order_type: 'offline',
      total_amount: 200000,
      payment_status: 'cancelled',
      order_status: 'cancelled',
      payment_method: 'cash',
      created_at: '2025-01-19 15:30:00',
      items: [
        { product_name: 'Benih Cabai', quantity: 2, price: 100000 },
      ],
    },
  ];

  // Calculate stats
  const stats = {
    total: mockOrders.length,
    pending: mockOrders.filter(o => o.order_status === 'pending').length,
    processing: mockOrders.filter(o => o.order_status === 'processing').length,
    completed: mockOrders.filter(o => o.order_status === 'completed').length,
    cancelled: mockOrders.filter(o => o.order_status === 'cancelled').length,
    totalRevenue: mockOrders
      .filter(o => o.payment_status === 'paid')
      .reduce((sum, o) => sum + o.total_amount, 0),
  };

  // Filter orders
  const filteredOrders = mockOrders.filter(order => {
    const matchSearch = 
      order.order_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone.includes(searchTerm);
    
    const matchStatus = statusFilter === 'all' || order.order_status === statusFilter;
    const matchType = typeFilter === 'all' || order.order_type === typeFilter;
    
    return matchSearch && matchStatus && matchType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { variant: 'warning', label: 'Pending', icon: ClockIcon },
      processing: { variant: 'info', label: 'Processing', icon: TruckIcon },
      shipped: { variant: 'info', label: 'Shipped', icon: TruckIcon },
      completed: { variant: 'success', label: 'Completed', icon: CheckCircleIcon },
      cancelled: { variant: 'danger', label: 'Cancelled', icon: XCircleIcon },
    };
    const config = statusMap[status] || statusMap.pending;
    return (
      <Badge variant={config.variant} size="sm">
        <config.icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getPaymentBadge = (status) => {
    const statusMap = {
      pending: { variant: 'warning', label: 'Pending' },
      paid: { variant: 'success', label: 'Paid' },
      cancelled: { variant: 'danger', label: 'Cancelled' },
    };
    const config = statusMap[status] || statusMap.pending;
    return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
  };

  const getTypeBadge = (type) => {
    const typeMap = {
      online: { variant: 'info', label: 'Online' },
      offline: { variant: 'default', label: 'Offline' },
      b2b: { variant: 'primary', label: 'B2B' },
    };
    const config = typeMap[type] || typeMap.online;
    return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
  };

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = (orderId, newStatus) => {
    console.log(`Update order ${orderId} to status: ${newStatus}`);
    // TODO: API call to update order status
    setShowDetailModal(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-600 mt-1">Kelola semua pesanan pelanggan</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <DocumentArrowDownIcon className="w-5 h-5" />
            Export Data
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Processing</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.processing}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.completed}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Cancelled</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{stats.cancelled}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Revenue</p>
            <p className="text-xl font-bold text-green-600 mt-1">{formatCurrency(stats.totalRevenue)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari order code, nama, atau no telepon..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">Semua Tipe</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="b2b">B2B</option>
              </select>
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
                    Order Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{order.order_code}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{order.customer_name}</p>
                        <p className="text-xs text-gray-500">{order.customer_phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTypeBadge(order.order_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(order.total_amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentBadge(order.payment_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.order_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(order.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleViewDetail(order)}
                        className="text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                      >
                        <EyeIcon className="w-4 h-4" />
                        Detail
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
        {showDetailModal && selectedOrder && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowDetailModal(false)} />

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                <div className="bg-white px-6 pt-5 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Detail Order</h3>
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XCircleIcon className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Order Info */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">Order Code</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedOrder.order_code}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tanggal</p>
                        <p className="text-sm font-semibold text-gray-900">{formatDateTime(selectedOrder.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Customer</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedOrder.customer_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Telepon</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedOrder.customer_phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tipe Order</p>
                        <div className="mt-1">{getTypeBadge(selectedOrder.order_type)}</div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Payment Method</p>
                        <p className="text-sm font-semibold text-gray-900 capitalize">{selectedOrder.payment_method}</p>
                      </div>
                    </div>

                    {/* Items */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Items</h4>
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Produk</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Qty</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Harga</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedOrder.items.map((item, index) => (
                              <tr key={index}>
                                <td className="px-4 py-2 text-sm text-gray-900">{item.product_name}</td>
                                <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                                <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(item.price)}</td>
                                <td className="px-4 py-2 text-sm font-semibold text-gray-900">
                                  {formatCurrency(item.quantity * item.price)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-green-600">
                        {formatCurrency(selectedOrder.total_amount)}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Payment Status</p>
                        {getPaymentBadge(selectedOrder.payment_status)}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Order Status</p>
                        {getStatusBadge(selectedOrder.order_status)}
                      </div>
                    </div>

                    {/* Actions */}
                    {selectedOrder.order_status === 'pending' && (
                      <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder.id, 'processing')}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Approve & Process
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Cancel Order
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default OrderManagement;

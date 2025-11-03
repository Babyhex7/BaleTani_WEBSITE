/**
 * Order Management Page
 * Halaman untuk mengelola semua orders (online & offline)
 */

import { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  FunnelIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import {
  ShoppingCartIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CalendarIcon,
} from "@heroicons/react/24/solid";
import toast from "react-hot-toast";
import AdminSidebarNew from "../../components/layout_admin/AdminSidebarNew";
import AdminHeaderNew from "../../components/layout_admin/AdminHeaderNew";
import orderService from "../../services/orderService";
import { dummyOrders, dummyStatistics } from "../../data/dummyOrders";
import OrderTable from "../../components/ui_admin/OrderTable";
import OrderDetailModal from "../../components/ui_admin/OrderDetailModal";
import UpdateStatusModal from "../../components/ui_admin/UpdateStatusModal";
import OrderFilters from "../../components/ui_admin/OrderFilters";
import StatisticsCard from "../../components/ui_admin/StatisticsCard";
import Pagination from "../../components/ui_admin/Pagination";
import AddOfflineOrderModal from "../../components/ui_admin/AddOfflineOrderModal";

const OrderManagement = () => {
  // State untuk data
  const [orders, setOrders] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState(10);

  // State untuk filters
  const [filters, setFilters] = useState({
    order_status: "",
    payment_status: "",
    order_type: "",
    payment_method: "",
    delivery_method: "",
    date_from: "",
    date_to: "",
    search: "",
  });

  // State untuk modals
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Toggle untuk menggunakan dummy data atau real API
  const [useDummyData, setUseDummyData] = useState(false);

  /**
   * Fetch orders dari API atau dummy data
   */
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      if (useDummyData) {
        // Simulasi delay API
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Filter dummy data
        let filteredOrders = [...dummyOrders];

        if (filters.order_status) {
          filteredOrders = filteredOrders.filter(
            (o) => o.order_status === filters.order_status
          );
        }
        if (filters.payment_status) {
          filteredOrders = filteredOrders.filter(
            (o) => o.payment_status === filters.payment_status
          );
        }
        if (filters.order_type) {
          filteredOrders = filteredOrders.filter(
            (o) => o.order_type === filters.order_type
          );
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredOrders = filteredOrders.filter(
            (o) =>
              o.order_number.toLowerCase().includes(searchLower) ||
              o.customer_name.toLowerCase().includes(searchLower) ||
              o.customer_phone.includes(searchLower)
          );
        }

        setOrders(filteredOrders);
        setTotalItems(filteredOrders.length);
        setTotalPages(Math.ceil(filteredOrders.length / limit));
      } else {
        // Real API call
        const response = await orderService.getAllOrders({
          page: currentPage,
          limit,
          ...filters,
        });

        setOrders(response.data.orders);
        setTotalPages(response.data.pagination.totalPages);
        setTotalItems(response.data.pagination.totalItems);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.response?.data?.message || "Gagal memuat data orders");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch statistics
   */
  const fetchStatistics = async () => {
    try {
      if (useDummyData) {
        setStatistics(dummyStatistics);
      } else {
        const response = await orderService.getStatistics({
          date_from: filters.date_from,
          date_to: filters.date_to,
        });
        setStatistics(response.data);
      }
    } catch (err) {
      console.error("Error fetching statistics:", err);
    }
  };

  /**
   * Handle filter change
   */
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1); // Reset ke halaman pertama
  };

  /**
   * Handle reset filters
   */
  const handleResetFilters = () => {
    setFilters({
      order_status: "",
      payment_status: "",
      order_type: "",
      payment_method: "",
      delivery_method: "",
      date_from: "",
      date_to: "",
      search: "",
    });
    setCurrentPage(1);
  };

  /**
   * Handle view order detail
   */
  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  /**
   * Handle update status
   */
  const handleUpdateStatus = (order) => {
    setSelectedOrder(order);
    setShowStatusModal(true);
  };

  /**
   * Handle status updated
   */
  const handleStatusUpdated = () => {
    setShowStatusModal(false);
    fetchOrders();
    fetchStatistics();
  };

  /**
   * Handle export data
   */
  const handleExport = () => {
    // TODO: Implement export to Excel/PDF
    alert("Fitur export sedang dalam pengembangan");
  };

  // Load data on mount dan ketika filters/page berubah
  useEffect(() => {
    fetchOrders();
  }, [currentPage, limit, filters, useDummyData]);

  useEffect(() => {
    fetchStatistics();
  }, [filters.date_from, filters.date_to, useDummyData]);

  // Format currency
  const formatCurrency = (amount) => {
    // Safeguard against undefined/null/NaN values
    const n = typeof amount === "number" ? amount : Number(amount);
    const safe = Number.isFinite(n) ? n : 0;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(safe);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebarNew />
      
      <div className="flex-1">
        <AdminHeaderNew 
          title="Order Management" 
          subtitle="Kelola semua pesanan online dan offline"
        />
        
        <div className="p-6">
          {/* Stats Cards */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.overall.total_orders}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <ShoppingCartIcon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(statistics.overall.total_revenue)}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Online Orders</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {statistics.by_type.find((t) => t.order_type === "online")?.count || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <ChartBarIcon className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Offline Orders</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {statistics.by_type.find((t) => t.order_type === "offline")?.count || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <CalendarIcon className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-900">Daftar Orders</h2>
                
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <PlusIcon className="w-5 h-5" />
                  Tambah Order
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari order number, nama customer..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange("search", e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <select
                    value={filters.order_type}
                    onChange={(e) => handleFilterChange("order_type", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Semua Tipe</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>

                <div>
                  <select
                    value={filters.order_status}
                    onChange={(e) => handleFilterChange("order_status", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Semua Status</option>
                    <option value="pending_payment">Pending Payment</option>
                    <option value="paid">Paid</option>
                    <option value="processing">Processing</option>
                    <option value="ready_for_pickup">Ready for Pickup</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
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
                  <div className="text-red-500 mb-3">⚠️</div>
                  <p className="text-red-600 font-medium">{error}</p>
                  <button onClick={fetchOrders} className="mt-4 px-4 py-2 text-sm text-green-600 hover:text-green-700 font-medium">
                    Coba Lagi
                  </button>
                </div>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <ShoppingCartIcon className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-gray-600 font-medium">Tidak ada order</p>
                  <button onClick={() => toast.info("Fitur Add Order coming soon!")} className="mt-4 px-4 py-2 text-sm text-green-600 hover:text-green-700 font-medium">
                    + Tambah Order Pertama
                  </button>
                </div>
              ) : (
                <OrderTable
                  orders={orders}
                  loading={loading}
                  onViewDetail={handleViewDetail}
                  onUpdateStatus={handleUpdateStatus}
                />
              )}
            </div>

            {/* Pagination */}
            {!loading && orders.length > 0 && (
              <div className="border-t px-6 py-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={limit}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={setLimit}
                />
              </div>
            )}
          </div>

          {/* Modals */}
          {showDetailModal && selectedOrder && (
            <OrderDetailModal
              orderId={selectedOrder.id}
              useDummyData={useDummyData}
              onClose={() => setShowDetailModal(false)}
              onUpdateStatus={() => {
                setShowDetailModal(false);
                handleUpdateStatus(selectedOrder);
              }}
            />
          )}

          {showStatusModal && selectedOrder && (
            <UpdateStatusModal
              order={selectedOrder}
              useDummyData={useDummyData}
              onClose={() => setShowStatusModal(false)}
              onSuccess={handleStatusUpdated}
            />
          )}

          {showAddModal && (
            <AddOfflineOrderModal
              isOpen={showAddModal}
              onClose={() => setShowAddModal(false)}
              onSuccess={() => {
                fetchOrders();
                fetchStatistics();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;

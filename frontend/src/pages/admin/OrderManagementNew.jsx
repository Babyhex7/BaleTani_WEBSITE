import React, { useState, useEffect } from "react";
import {
  ShoppingCartIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout_admin/AdminLayout";
import Pagination from "../../components/ui_admin/Pagination";
import {
  OrderStatusBadge,
  OrderStatusSelector,
  OrderStatusTimeline,
} from "../../components/ui_admin/OrderStatus";
import ModalAdmin from "../../components/ui_admin/ModalAdmin";
import { formatCurrency, formatDateTime } from "../../utils/mockProductData";
import orderService from "../../services/services_admin/orderService";
import { toast } from "react-hot-toast";

/**
 * OrderManagement - Halaman manajemen pesanan dengan update status manual
 */
const OrderManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Fetch orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter,
        transactionType: typeFilter,
      };

      const response = await orderService.getAllOrders(params);
      setOrders(response.data.orders);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, searchTerm, statusFilter, typeFilter]);

  // Handle status change
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, {
        order_status: newStatus,
      });
      toast.success("Order status updated successfully");
      fetchOrders();
      
      // Update selected order if detail modal is open
      if (selectedOrder && selectedOrder.id === orderId) {
        const updatedOrder = await orderService.getOrderById(orderId);
        setSelectedOrder(updatedOrder.data);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  // View order detail
  const viewOrderDetail = async (order) => {
    try {
      const response = await orderService.getOrderById(order.id);
      setSelectedOrder(response.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error("Error fetching order detail:", error);
      toast.error("Failed to fetch order details");
    }
  };

  // Cancel order
  const handleCancelOrder = async (orderId) => {
    if (!confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      await orderService.cancelOrder(orderId, {
        cancellation_reason: "Cancelled by admin",
      });
      toast.success("Order cancelled successfully");
      fetchOrders();
      setShowDetailModal(false);
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Failed to cancel order");
    }
  };

  const getTransactionTypeBadge = (type) => {
    const types = {
      online: "bg-blue-100 text-blue-800",
      offline: "bg-gray-100 text-gray-800",
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${
          types[type] || types.offline
        }`}
      >
        {type?.toUpperCase()}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <ShoppingCartIcon className="w-8 h-8 text-green-600" />
              Order Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage and track all orders with real-time status updates
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <DocumentArrowDownIcon className="w-5 h-5" />
            Export
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order ID or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="checkout">Checkout</option>
              <option value="paid">Paid</option>
              <option value="processing">Processing</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
                setTypeFilter("");
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.customer_name || order.user?.fullName || "Guest"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.user?.phoneNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getTransactionTypeBadge(order.transaction_type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(order.total_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <OrderStatusSelector
                          currentStatus={order.order_status}
                          transactionType={order.transaction_type}
                          onStatusChange={(newStatus) =>
                            handleStatusChange(order.id, newStatus)
                          }
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(order.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => viewOrderDetail(order)}
                          className="text-green-600 hover:text-green-900 flex items-center gap-1"
                        >
                          <EyeIcon className="w-5 h-5" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && orders.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>

        {/* Order Detail Modal */}
        {showDetailModal && selectedOrder && (
          <ModalAdmin
            isOpen={showDetailModal}
            onClose={() => setShowDetailModal(false)}
            title={`Order Details - #${selectedOrder.id}`}
            size="lg"
          >
            <div className="space-y-6">
              {/* Status Timeline */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">
                  Order Progress
                </h3>
                <OrderStatusTimeline
                  currentStatus={selectedOrder.order_status}
                  transactionType={selectedOrder.transaction_type}
                />
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Customer Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Name:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedOrder.customer_name || selectedOrder.user?.fullName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Phone:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedOrder.user?.phoneNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedOrder.user?.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Order Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Transaction Type:</span>
                    {getTransactionTypeBadge(selectedOrder.transaction_type)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Payment Method:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedOrder.payment_method?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total:</span>
                    <span className="text-sm font-bold text-gray-900">
                      {formatCurrency(selectedOrder.total_price)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Update Status
                </h3>
                <OrderStatusSelector
                  currentStatus={selectedOrder.order_status}
                  transactionType={selectedOrder.transaction_type}
                  onStatusChange={(newStatus) =>
                    handleStatusChange(selectedOrder.id, newStatus)
                  }
                />
              </div>

              {/* Actions */}
              {selectedOrder.order_status !== "cancelled" &&
                selectedOrder.order_status !== "completed" && (
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <button
                      onClick={() => handleCancelOrder(selectedOrder.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
            </div>
          </ModalAdmin>
        )}
      </div>
    </AdminLayout>
  );
};

export default OrderManagement;

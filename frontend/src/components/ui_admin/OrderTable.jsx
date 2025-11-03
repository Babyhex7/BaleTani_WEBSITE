/**
 * Order Table Component
 * Reusable table untuk menampilkan list orders
 */

import {
  EyeIcon,
  PencilIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";

const OrderTable = ({ orders, loading, onViewDetail, onUpdateStatus }) => {
  /**
   * Format currency
   */
  const formatCurrency = (amount) => {
    const n = typeof amount === "number" ? amount : Number(amount);
    const safe = Number.isFinite(n) ? n : 0;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(safe);
  };

  /**
   * Format date
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  /**
   * Get status badge
   */
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending_payment: {
        label: "Pending Payment",
        color: "bg-yellow-100 text-yellow-800",
        icon: ClockIcon,
      },
      paid: {
        label: "Paid",
        color: "bg-blue-100 text-blue-800",
        icon: CheckCircleIcon,
      },
      processing: {
        label: "Processing",
        color: "bg-purple-100 text-purple-800",
        icon: ShoppingBagIcon,
      },
      ready_for_pickup: {
        label: "Ready for Pickup",
        color: "bg-cyan-100 text-cyan-800",
        icon: ShoppingBagIcon,
      },
      out_for_delivery: {
        label: "Out for Delivery",
        color: "bg-indigo-100 text-indigo-800",
        icon: ShoppingBagIcon,
      },
      completed: {
        label: "Completed",
        color: "bg-green-100 text-green-800",
        icon: CheckCircleIcon,
      },
      cancelled: {
        label: "Cancelled",
        color: "bg-red-100 text-red-800",
        icon: XCircleIcon,
      },
    };

    const config = statusConfig[status] || statusConfig.pending_payment;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  /**
   * Get payment status badge
   */
  const getPaymentBadge = (status) => {
    const statusConfig = {
      unpaid: {
        label: "Unpaid",
        color: "bg-red-100 text-red-800",
      },
      paid: {
        label: "Paid",
        color: "bg-green-100 text-green-800",
      },
      refunded: {
        label: "Refunded",
        color: "bg-gray-100 text-gray-800",
      },
    };

    const config = statusConfig[status] || statusConfig.unpaid;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  /**
   * Get order type badge
   */
  const getTypeBadge = (type) => {
    const typeConfig = {
      online: {
        label: "Online",
        color: "bg-blue-100 text-blue-800",
      },
      offline: {
        label: "Offline",
        color: "bg-gray-100 text-gray-800",
      },
    };

    const config = typeConfig[type] || typeConfig.online;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <p className="mt-2 text-gray-600">Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <ShoppingBagIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <p>Tidak ada order ditemukan</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Order
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Payment
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              {/* Order Info */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {order.order_number}
                </div>
                <div className="text-sm text-gray-500">
                  {order.items_count} items
                </div>
              </td>

              {/* Customer */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {order.customer_name}
                </div>
                <div className="text-sm text-gray-500">{order.customer_phone}</div>
              </td>

              {/* Type */}
              <td className="px-6 py-4 whitespace-nowrap">
                {getTypeBadge(order.order_type)}
              </td>

              {/* Order Status */}
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(order.order_status)}
              </td>

              {/* Payment Status */}
              <td className="px-6 py-4 whitespace-nowrap">
                {getPaymentBadge(order.payment_status)}
              </td>

              {/* Amount */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {formatCurrency(order.total_amount)}
                </div>
              </td>

              {/* Date */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(order.created_at)}
              </td>

              {/* Actions */}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onViewDetail(order)}
                  className="text-blue-600 hover:text-blue-900 mr-3"
                  title="View Detail"
                >
                  <EyeIcon className="w-5 h-5 inline" />
                </button>
                <button
                  onClick={() => onUpdateStatus(order)}
                  className="text-green-600 hover:text-green-900"
                  title="Update Status"
                >
                  <PencilIcon className="w-5 h-5 inline" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;

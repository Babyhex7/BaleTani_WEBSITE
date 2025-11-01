/**
 * Order Filters Component
 * Reusable filter panel untuk orders
 */

import { X } from "lucide-react";

const OrderFilters = ({ filters, onFilterChange, onReset }) => {
  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Order Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order Type
          </label>
          <select
            value={filters.order_type}
            onChange={(e) => onFilterChange("order_type", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
        </div>

        {/* Order Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order Status
          </label>
          <select
            value={filters.order_status}
            onChange={(e) => onFilterChange("order_status", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="pending_payment">Pending Payment</option>
            <option value="paid">Paid</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Payment Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Status
          </label>
          <select
            value={filters.payment_status}
            onChange={(e) => onFilterChange("payment_status", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Payment</option>
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        {/* Date From */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date From
          </label>
          <input
            type="date"
            value={filters.date_from}
            onChange={(e) => onFilterChange("date_from", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Date To */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date To
          </label>
          <input
            type="date"
            value={filters.date_to}
            onChange={(e) => onFilterChange("date_to", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Reset Button */}
        <div className="flex items-end">
          <button
            onClick={onReset}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <X className="w-4 h-4" />
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderFilters;

import React, { useState } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TruckIcon,
  CreditCardIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";

/**
 * Order Status Badge Component
 * Menampilkan badge status order dengan warna yang sesuai
 */
export const OrderStatusBadge = ({ status }) => {
  const statusConfig = {
    checkout: {
      label: "Checkout",
      color: "bg-gray-100 text-gray-800",
      icon: ShoppingBagIcon,
    },
    paid: {
      label: "Paid",
      color: "bg-blue-100 text-blue-800",
      icon: CreditCardIcon,
    },
    processing: {
      label: "Processing",
      color: "bg-yellow-100 text-yellow-800",
      icon: ClockIcon,
    },
    out_for_delivery: {
      label: "Out for Delivery",
      color: "bg-purple-100 text-purple-800",
      icon: TruckIcon,
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

  const config = statusConfig[status] || statusConfig.checkout;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
    >
      <Icon className="w-4 h-4 mr-1.5" />
      {config.label}
    </span>
  );
};

/**
 * Order Status Selector Component
 * Dropdown untuk mengubah status order
 */
export const OrderStatusSelector = ({ currentStatus, onStatusChange, transactionType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Status flow untuk online transaction
  const onlineStatusFlow = [
    { value: "checkout", label: "Checkout", next: ["paid", "cancelled"] },
    { value: "paid", label: "Paid", next: ["processing", "cancelled"] },
    { value: "processing", label: "Processing", next: ["out_for_delivery", "cancelled"] },
    { value: "out_for_delivery", label: "Out for Delivery", next: ["completed", "cancelled"] },
    { value: "completed", label: "Completed", next: [] },
    { value: "cancelled", label: "Cancelled", next: [] },
  ];

  // Status flow untuk offline transaction
  const offlineStatusFlow = [
    { value: "checkout", label: "Checkout", next: ["paid", "cancelled"] },
    { value: "paid", label: "Paid", next: ["completed", "cancelled"] },
    { value: "completed", label: "Completed", next: [] },
    { value: "cancelled", label: "Cancelled", next: [] },
  ];

  const statusFlow = transactionType === "offline" ? offlineStatusFlow : onlineStatusFlow;

  // Find current status in flow
  const currentStatusObj = statusFlow.find((s) => s.value === currentStatus);
  const availableStatuses = currentStatusObj?.next || [];

  const handleStatusChange = async (newStatus) => {
    setIsLoading(true);
    try {
      await onStatusChange(newStatus);
      setIsOpen(false);
    } catch (error) {
      console.error("Error changing status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      checkout: "text-gray-700 bg-gray-100 hover:bg-gray-200",
      paid: "text-blue-700 bg-blue-100 hover:bg-blue-200",
      processing: "text-yellow-700 bg-yellow-100 hover:bg-yellow-200",
      out_for_delivery: "text-purple-700 bg-purple-100 hover:bg-purple-200",
      completed: "text-green-700 bg-green-100 hover:bg-green-200",
      cancelled: "text-red-700 bg-red-100 hover:bg-red-200",
    };
    return colors[status] || colors.checkout;
  };

  if (availableStatuses.length === 0) {
    return <OrderStatusBadge status={currentStatus} />;
  }

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className="inline-flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          <OrderStatusBadge status={currentStatus} />
          <svg
            className="-mr-1 ml-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b">
              Change Status To:
            </div>
            {availableStatuses.map((status) => {
              const statusObj = statusFlow.find((s) => s.value === status);
              return (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={isLoading}
                  className={`w-full text-left px-4 py-2 text-sm ${getStatusColor(
                    status
                  )} disabled:opacity-50 transition-colors`}
                >
                  {statusObj?.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Order Status Timeline Component
 * Menampilkan timeline/progress status order
 */
export const OrderStatusTimeline = ({ currentStatus, transactionType }) => {
  const onlineStatuses = [
    { value: "checkout", label: "Checkout" },
    { value: "paid", label: "Paid" },
    { value: "processing", label: "Processing" },
    { value: "out_for_delivery", label: "Out for Delivery" },
    { value: "completed", label: "Completed" },
  ];

  const offlineStatuses = [
    { value: "checkout", label: "Checkout" },
    { value: "paid", label: "Paid" },
    { value: "completed", label: "Completed" },
  ];

  const statuses = transactionType === "offline" ? offlineStatuses : onlineStatuses;
  const currentIndex = statuses.findIndex((s) => s.value === currentStatus);

  if (currentStatus === "cancelled") {
    return (
      <div className="flex items-center justify-center p-4 bg-red-50 rounded-lg">
        <XCircleIcon className="w-6 h-6 text-red-600 mr-2" />
        <span className="text-red-800 font-medium">Order Cancelled</span>
      </div>
    );
  }

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between">
        {statuses.map((status, index) => (
          <div key={status.value} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index <= currentIndex
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {index < currentIndex ? (
                  <CheckCircleIcon className="w-6 h-6" />
                ) : (
                  <span className="font-semibold">{index + 1}</span>
                )}
              </div>
              <span
                className={`mt-2 text-xs font-medium ${
                  index <= currentIndex ? "text-green-600" : "text-gray-500"
                }`}
              >
                {status.label}
              </span>
            </div>
            {index < statuses.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  index < currentIndex ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default {
  OrderStatusBadge,
  OrderStatusSelector,
  OrderStatusTimeline,
};

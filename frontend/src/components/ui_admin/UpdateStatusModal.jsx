/**
 * Update Status Modal Component
 * Modal untuk update order status
 */

import { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import orderService from "../../services/services_admin/orderService";

const UpdateStatusModal = ({ order, useDummyData, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    order_status: order.order_status,
    payment_status: order.payment_status,
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // Auto-sync payment_status dengan order_status
  useEffect(() => {
    let newPaymentStatus = formData.payment_status;
    
    switch (formData.order_status) {
      case 'pending_payment':
        newPaymentStatus = 'pending';
        break;
      case 'paid':
      case 'processing':
      case 'ready_for_pickup':
      case 'out_for_delivery':
      case 'completed':
        newPaymentStatus = 'paid';
        break;
      case 'cancelled':
        newPaymentStatus = 'refunded';
        break;
      default:
        break;
    }
    
    if (newPaymentStatus !== formData.payment_status) {
      setFormData(prev => ({ ...prev, payment_status: newPaymentStatus }));
    }
  }, [formData.order_status]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (useDummyData) {
        // Simulasi API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("Update status (dummy):", formData);
      } else {
        await orderService.updateOrderStatus(order.id, formData);
      }

      onSuccess();
    } catch (err) {
      console.error("Error updating status:", err);
      setError(err.response?.data?.message || "Gagal update status");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      setError("Alasan pembatalan harus diisi");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (useDummyData) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("Cancel order (dummy):", cancelReason);
      } else {
        await orderService.cancelOrder(order.id, cancelReason);
      }

      onSuccess();
    } catch (err) {
      console.error("Error cancelling order:", err);
      setError(err.response?.data?.message || "Gagal cancel order");
    } finally {
      setLoading(false);
    }
  };

  const orderStatusOptions = [
    { value: "pending_payment", label: "Pending Payment" },
    { value: "paid", label: "Paid" },
    { value: "processing", label: "Processing" },
    { value: "ready_for_pickup", label: "Ready for Pickup" },
    { value: "out_for_delivery", label: "Out for Delivery" },
    { value: "completed", label: "Completed" },
  ];

  const paymentStatusOptions = [
    { value: "pending", label: "Pending" },
    { value: "paid", label: "Paid" },
    { value: "failed", label: "Failed" },
    { value: "refunded", label: "Refunded" },
  ];

  if (showCancelConfirm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Cancel Order</h3>
          </div>

          <p className="text-gray-600 mb-4">
            Apakah Anda yakin ingin membatalkan order <strong>{order.order_number}</strong>?
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alasan Pembatalan <span className="text-red-500">*</span>
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Jelaskan alasan pembatalan order..."
              required
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowCancelConfirm(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Processing..." : "Ya, Cancel Order"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Update Order Status</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Order Info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">Order Number</p>
            <p className="font-semibold text-gray-900">{order.order_number}</p>
            <p className="text-sm text-gray-600 mt-1">Customer: {order.customer_name}</p>
          </div>

          {/* Order Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Status
            </label>
            <select
              value={formData.order_status}
              onChange={(e) =>
                setFormData({ ...formData, order_status: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              {orderStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Payment status akan otomatis disesuaikan
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tambahkan catatan untuk perubahan status..."
              disabled={loading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Status"}
            </button>
          </div>

          {/* Cancel Order Button */}
          {order.order_status !== "cancelled" && (
            <div className="pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(true)}
                className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium"
                disabled={loading}
              >
                Cancel Order
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UpdateStatusModal;

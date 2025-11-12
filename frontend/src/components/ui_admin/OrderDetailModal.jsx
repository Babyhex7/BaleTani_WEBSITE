/**
 * Order Detail Modal Component
 * Modal untuk menampilkan detail lengkap order
 */

import { useState, useEffect } from "react";
import { X, Package, User, MapPin, CreditCard, Clock, FileText } from "lucide-react";
import orderService from "../../services/services_admin/orderService";
import { dummyOrderDetail } from "../../data/dummyOrders";

const OrderDetailModal = ({ orderId, useDummyData, onClose, onUpdateStatus }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    setError(null);

    try {
      if (useDummyData) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setOrder(dummyOrderDetail);
      } else {
        const response = await orderService.getOrderById(orderId);
        setOrder(response.data);
      }
    } catch (err) {
      console.error("Error fetching order detail:", err);
      setError(err.response?.data?.message || "Gagal memuat detail order");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending_payment: { label: "Pending Payment", color: "bg-yellow-100 text-yellow-800" },
      paid: { label: "Paid", color: "bg-blue-100 text-blue-800" },
      processing: { label: "Processing", color: "bg-purple-100 text-purple-800" },
      ready_for_pickup: { label: "Ready for Pickup", color: "bg-cyan-100 text-cyan-800" },
      out_for_delivery: { label: "Out for Delivery", color: "bg-indigo-100 text-indigo-800" },
      completed: { label: "Completed", color: "bg-green-100 text-green-800" },
      cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
    };

    const config = statusConfig[status] || statusConfig.pending_payment;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{order.order_number}</h2>
            <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status & Type */}
          <div className="flex gap-4">
            <div>
              <span className="text-sm text-gray-600">Order Status: </span>
              {getStatusBadge(order.order_status)}
            </div>
            <div>
              <span className="text-sm text-gray-600">Payment: </span>
              {getStatusBadge(order.payment_status)}
            </div>
            <div>
              <span className="text-sm text-gray-600">Type: </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                order.order_type === "online" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
              }`}>
                {order.order_type === "online" ? "Online" : "Offline"}
              </span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Customer Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{order.customer_phone}</p>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          {order.delivery_method === "delivery" && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Delivery Information</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium">
                    {order.delivery_address || order.customer?.address || "-"}
                  </p>
                </div>
                {(order.delivery_notes || order.customer_notes) && (
                  <div>
                    <p className="text-sm text-gray-600">Notes</p>
                    <p className="font-medium">{order.delivery_notes || order.customer_notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Payment Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Method</p>
                <p className="font-medium capitalize">{order.payment_method}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-medium capitalize">{order.payment_status}</p>
              </div>
              
              {/* Payment Detail (VA) - TAMBAHAN */}
              {order.payment_detail && (
                <>
                  {order.payment_detail.bank && (
                    <div>
                      <p className="text-sm text-gray-600">Bank</p>
                      <p className="font-semibold text-blue-600">{order.payment_detail.bank}</p>
                    </div>
                  )}
                  {order.payment_detail.virtual_account && (
                    <div>
                      <p className="text-sm text-gray-600">Virtual Account</p>
                      <p className="font-mono font-semibold">{order.payment_detail.virtual_account}</p>
                    </div>
                  )}
                  {order.payment_detail.account_name && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Account Name</p>
                      <p className="font-medium">{order.payment_detail.account_name}</p>
                    </div>
                  )}
                  {order.payment_detail.paid_at && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Paid At</p>
                      <p className="font-medium">{formatDate(order.payment_detail.paid_at)}</p>
                    </div>
                  )}
                </>
              )}

              {order.payment_proof_url && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 mb-2">Payment Proof</p>
                  <img
                    src={order.payment_proof_url}
                    alt="Payment Proof"
                    className="max-w-xs rounded-lg border"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Order Items</h3>
            </div>
            <div className="space-y-2">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div className="flex-1">
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantity} × {formatCurrency(item.final_price)}
                      {item.discount_price > 0 && (
                        <span className="ml-2 text-xs text-red-600">
                          (Disc: {formatCurrency(item.discount_price)})
                        </span>
                      )}
                    </p>
                  </div>
                  <p className="font-semibold">{formatCurrency(item.subtotal)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Items Subtotal</span>
                <span className="font-medium">{formatCurrency(order.item_subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-medium">{formatCurrency(order.delivery_fee)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount</span>
                  <span className="font-medium">- {formatCurrency(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          {order.admin_notes && (
            <div className="border rounded-lg p-4 bg-yellow-50">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold text-gray-900">Admin Notes</h3>
              </div>
              <p className="text-gray-700">{order.admin_notes}</p>
            </div>
          )}

          {/* Status History */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Status History</h3>
              </div>
              <div className="space-y-3">
                {order.statusHistory.map((history) => (
                  <div key={history.id} className="flex gap-3 pb-3 border-b last:border-0">
                    <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-600"></div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {history.old_status || "New"} → {history.new_status}
                      </p>
                      {history.notes && (
                        <p className="text-sm text-gray-600">{history.notes}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(history.changed_at)}
                        {history.admin && ` by ${history.admin.full_name}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t px-6 py-4 flex gap-3 justify-end sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={onUpdateStatus}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Update Status
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;

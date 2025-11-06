import React from 'react';
import { ShoppingBag, Calendar, ExternalLink, ShoppingCart, MessageCircle, Eye } from 'lucide-react';
import { formatOrderStatus, getStatusColor, formatPaymentMethod } from '../../services/services_customer/orderHistoryService';

/**
 * OrderCard Component
 * Menampilkan card untuk single order
 */
const OrderCard = ({ order, onViewDetail, onReorder }) => {
  const {
    id,
    order_number,
    order_date,
    status,
    payment_status,
    total_amount,
    items = [],
    payment
  } = order;

  // Format tanggal
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Limit items to show
  const displayItems = items.slice(0, 3);
  const remainingItems = items.length - 3;

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-green-600" />
            <div>
              <h3 className="font-semibold text-gray-900">{order_number}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(order_date)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
              {formatOrderStatus(status)}
            </span>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="p-4 space-y-3">
        {displayItems.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            {/* Product Image */}
            <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
              {item.product_image ? (
                <img
                  src={item.product_image}
                  alt={item.product_name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/64?text=No+Image';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 truncate">{item.product_name}</h4>
              <p className="text-sm text-gray-600">
                {item.quantity} {item.unit} × {formatCurrency(item.price)}
              </p>
            </div>

            {/* Subtotal */}
            <div className="text-right">
              <p className="font-semibold text-gray-900">{formatCurrency(item.subtotal)}</p>
            </div>
          </div>
        ))}

        {/* More items indicator */}
        {remainingItems > 0 && (
          <div className="text-center py-2 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              + {remainingItems} produk lainnya
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Pembayaran:</span>{' '}
            {payment ? formatPaymentMethod(payment.method) : '-'}
            {payment?.bank && ` (${payment.bank})`}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Belanja</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(total_amount)}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetail(order)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span className="font-medium">Lihat Detail</span>
          </button>
          <button
            onClick={() => onReorder(order)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="font-medium">Beli Lagi</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;

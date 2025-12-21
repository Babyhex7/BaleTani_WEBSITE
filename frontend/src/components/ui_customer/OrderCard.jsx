import React, { useState, useEffect } from 'react';
import { ShoppingBag, Calendar, ExternalLink, ShoppingCart, MessageCircle, Eye, Clock, AlertCircle } from 'lucide-react';
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
    payment_expired_at,
    cancelled_reason,
    total_amount,
    items = [],
    payment
  } = order;

  // State untuk countdown timer
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  // Countdown timer untuk pending_payment orders
  useEffect(() => {
    if (status !== 'pending_payment' || !payment_expired_at) {
      return;
    }

    console.log(`[COUNTDOWN] Order ${order_number} - Starting countdown`);

    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const expiry = new Date(payment_expired_at).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeRemaining(null);
        console.log(`[COUNTDOWN] Order ${order_number} - EXPIRED!`);
        return null;
      }

      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return { minutes, seconds, total: diff };
    };

    // Hitung pertama kali
    const initial = calculateTimeRemaining();
    setTimeRemaining(initial);

    // Update setiap 1 detik
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      if (!remaining) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [status, payment_expired_at, order_number]);

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
    <div data-cy="order-card" className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-green-600" />
            <div>
              <h3 data-cy="order-number" className="font-semibold text-gray-900">{order_number}</h3>
              <div data-cy="order-date" className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(order_date)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span data-cy="order-status" className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
              {formatOrderStatus(status)}
            </span>
          </div>
        </div>

        {/* Countdown Timer untuk pending_payment */}
        {status === 'pending_payment' && timeRemaining && (
          <div className={`mt-3 p-3 rounded-lg flex items-center gap-2 ${
            timeRemaining.total < 120000 // < 2 menit
              ? 'bg-red-50 border border-red-200'
              : 'bg-blue-50 border border-blue-200'
          }`}>
            <Clock className={`w-4 h-4 ${timeRemaining.total < 120000 ? 'text-red-600' : 'text-blue-600'}`} />
            <span className={`text-sm font-semibold ${timeRemaining.total < 120000 ? 'text-red-700' : 'text-blue-700'}`}>
              Bayar dalam: {String(timeRemaining.minutes).padStart(2, '0')}:{String(timeRemaining.seconds).padStart(2, '0')}
            </span>
          </div>
        )}

        {/* Expired Notice */}
        {status === 'pending_payment' && isExpired && (
          <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-semibold text-red-700">
              Waktu pembayaran habis - Order akan dibatalkan otomatis
            </span>
          </div>
        )}

        {/* Cancelled Reason */}
        {status === 'cancelled' && cancelled_reason && (
          <div className="mt-3 p-3 rounded-lg bg-gray-100 border border-gray-300">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Alasan: </span>
              {cancelled_reason}
            </p>
          </div>
        )}
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
          <div data-cy="payment-status" className="text-sm text-gray-600">
            <span className="font-medium">Pembayaran:</span>{' '}
            {payment ? formatPaymentMethod(payment.method) : '-'}
            {payment?.bank && ` (${payment.bank})`}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Belanja</p>
            <p data-cy="order-total" className="text-xl font-bold text-green-600">{formatCurrency(total_amount)}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            data-cy="view-detail-btn"
            onClick={() => onViewDetail(order)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span className="font-medium">Lihat Detail</span>
          </button>
          <button
            data-cy="reorder-btn"
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

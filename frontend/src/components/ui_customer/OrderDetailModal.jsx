import React from 'react';
import { X, Package, MapPin, CreditCard, Clock, MessageCircle, ShoppingCart, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { formatOrderStatus, getStatusColor, formatPaymentMethod, getWhatsAppLink } from '../../services/services_customer/orderHistoryService';

/**
 * OrderDetailModal Component
 * Modal detail lengkap untuk order dengan timeline
 */
const OrderDetailModal = ({ order, onClose, onReorder, onCancel }) => {
  if (!order) return null;

  const {
    order_number,
    order_date,
    status,
    customer,
    delivery,
    items = [],
    payment,
    timeline = [],
    customer_notes,
    cancelled_reason
  } = order;

  // Format functions
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Status timeline mapping dengan Lucide icons
  const getStatusIcon = (status) => {
    const iconMap = {
      'pending_payment': { Component: Clock, color: 'text-orange-500', bg: 'bg-orange-100' },
      'paid': { Component: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' },
      'processing': { Component: Package, color: 'text-blue-500', bg: 'bg-blue-100' },
      'ready_for_pickup': { Component: Package, color: 'text-purple-500', bg: 'bg-purple-100' },
      'out_for_delivery': { Component: MapPin, color: 'text-indigo-500', bg: 'bg-indigo-100' },
      'completed': { Component: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
      'cancelled': { Component: AlertCircle, color: 'text-red-500', bg: 'bg-red-100' },
    };
    return iconMap[status] || { Component: Clock, color: 'text-gray-500', bg: 'bg-gray-100' };
  };

  const canCancel = ['pending_payment', 'paid'].includes(status);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Detail Pesanan</h2>
            <p className="text-gray-600 mt-1">{order_number}</p>
            <p className="text-sm text-gray-500">{formatDate(order_date)}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-lg text-sm font-medium border ${getStatusColor(status)}`}>
              {formatOrderStatus(status)}
            </span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Timeline Status */}
          {timeline && timeline.length > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-5 border border-green-200">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                <Clock className="w-5 h-5 text-green-600" />
                Riwayat Status Pesanan
              </h3>
              <div className="space-y-3">
                {timeline
                  .filter(item => !item.status.startsWith('payment:'))
                  .map((item, index) => {
                    const iconData = getStatusIcon(item.status);
                    const IconComponent = iconData.Component;
                    return (
                      <div key={index} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            index === 0 ? iconData.bg + ' ring-2 ring-green-400' : iconData.bg
                          }`}>
                            <IconComponent className={`w-5 h-5 ${
                              index === 0 ? 'text-green-700' : iconData.color
                            }`} />
                          </div>
                          {index < timeline.filter(t => !t.status.startsWith('payment:')).length - 1 && (
                            <div className="w-0.5 h-8 bg-gray-300 my-1"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-3">
                          <p className="font-semibold text-gray-900">{formatOrderStatus(item.status)}</p>
                          <p className="text-sm text-gray-600">{formatDate(item.timestamp)}</p>
                          {item.notes && (
                            <p className="text-sm text-gray-700 mt-1 bg-white/50 px-3 py-2 rounded">{item.notes}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Cancelled Reason */}
          {cancelled_reason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">Alasan Pembatalan:</p>
                  <p className="text-red-700">{cancelled_reason}</p>
                </div>
              </div>
            </div>
          )}

          {/* Info Pengiriman */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
              <MapPin className="w-5 h-5 text-green-600" />
              Informasi Pengiriman
            </h3>
            <div className="space-y-2 text-gray-700">
              <div className="flex gap-2">
                <span className="font-medium w-32">Penerima:</span>
                <span>{customer?.name || '-'}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium w-32">No. Telepon:</span>
                <span>{customer?.phone || '-'}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium w-32">Alamat:</span>
                <span className="flex-1">{customer?.address || delivery?.address || '-'}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium w-32">Metode:</span>
                <span className="flex items-center gap-2">
                  {delivery?.method === 'delivery' ? (
                    <><MapPin className="w-4 h-4 text-blue-600" /> <span>Delivery</span></>
                  ) : (
                    <><Package className="w-4 h-4 text-green-600" /> <span>Pick Up</span></>
                  )}
                  {delivery?.fee > 0 && <span className="text-gray-600">({formatCurrency(delivery.fee)})</span>}
                </span>
              </div>
              {customer_notes && (
                <div className="flex gap-2">
                  <span className="font-medium w-32">Catatan:</span>
                  <span className="flex-1 italic">"{customer_notes}"</span>
                </div>
              )}
            </div>
          </div>

          {/* Produk yang Dibeli */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
              <Package className="w-5 h-5 text-green-600" />
              Produk yang Dibeli ({items.length} item)
            </h3>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-20 h-20 flex-shrink-0 bg-white rounded-lg overflow-hidden border border-gray-200">
                    {item.product_image ? (
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{item.product_name}</h4>
                    <p className="text-sm text-gray-600">
                      {item.quantity} {item.unit} × {formatCurrency(item.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(item.subtotal)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rincian Pembayaran */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-5">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
              <CreditCard className="w-5 h-5 text-green-600" />
              Rincian Pembayaran
            </h3>
            
            {/* Payment Details - VA Info */}
            {payment?.method === 'bank_transfer' && payment?.virtual_account && (
              <div className="mb-4 p-4 bg-white rounded-lg border-2 border-green-300">
                <p className="text-sm text-gray-600 mb-2">Virtual Account</p>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs text-gray-500">Bank {payment.bank}</p>
                    <p className="text-xl font-mono font-bold text-gray-900">{payment.virtual_account}</p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(payment.virtual_account);
                      alert('Nomor VA disalin!');
                    }}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Salin
                  </button>
                </div>
                <p className="text-xs text-gray-500">a.n. {payment.account_name}</p>
                {payment.expired_at && (
                  <p className="text-xs text-red-600 mt-2">
                    Berlaku hingga: {formatDate(payment.expired_at)}
                  </p>
                )}
              </div>
            )}

            {/* Payment Summary */}
            <div className="space-y-2 text-gray-700">
              <div className="flex justify-between">
                <span>Subtotal Produk ({items.length} item)</span>
                <span className="font-medium">{formatCurrency(payment?.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Ongkos Kirim</span>
                <span className="font-medium">{formatCurrency(payment?.shipping_cost || 0)}</span>
              </div>
              {payment?.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Diskon</span>
                  <span className="font-medium">-{formatCurrency(payment.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Biaya Layanan</span>
                <span className="font-medium">{formatCurrency(payment?.service_fee || 0)}</span>
              </div>
              <div className="border-t-2 border-gray-300 pt-2 mt-2 flex justify-between items-center">
                <span className="text-lg font-semibold">TOTAL PEMBAYARAN</span>
                <span className="text-2xl font-bold text-green-600">{formatCurrency(payment?.total || 0)}</span>
              </div>
            </div>

            {/* Payment Method & Status */}
            <div className="mt-4 pt-4 border-t border-green-200 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Metode Pembayaran:</span>
                <span className="font-semibold">{formatPaymentMethod(payment?.method)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status Pembayaran:</span>
                <span className={`font-semibold flex items-center gap-1 ${
                  payment?.status === 'paid' ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {payment?.status === 'paid' ? (
                    <><CheckCircle className="w-4 h-4" /> <span>Lunas</span></>
                  ) : (
                    <><Clock className="w-4 h-4" /> <span>Menunggu Pembayaran</span></>
                  )}
                </span>
              </div>
              {payment?.paid_at && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Dibayar pada:</span>
                  <span className="font-medium">{formatDate(payment.paid_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <a
              href={getWhatsAppLink(order_number)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <MessageCircle className="w-5 h-5" />
              Hubungi Penjual
            </a>
            <button
              onClick={() => onReorder(order)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <ShoppingCart className="w-5 h-5" />
              Beli Lagi
            </button>
            {canCancel && onCancel && (
              <button
                onClick={() => onCancel(order)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <X className="w-5 h-5" />
                Batalkan Pesanan
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;

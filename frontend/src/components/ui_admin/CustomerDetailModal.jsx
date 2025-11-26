import React from 'react';
import { XMarkIcon, UserIcon, PhoneIcon, MapPinIcon, CalendarIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

/**
 * Modal detail customer dengan order history
 */
const CustomerDetailModal = ({ customer, onClose }) => {
  if (!customer) return null;

  /**
   * Format currency ke Rupiah
   */
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  /**
   * Format tanggal
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Badge status order
   */
  const getOrderStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
      processing: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Diproses' },
      shipped: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Dikirim' },
      delivered: { bg: 'bg-green-100', text: 'text-green-700', label: 'Selesai' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Dibatalkan' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 text-xs font-medium ${config.bg} ${config.text} rounded-full`}>
        {config.label}
      </span>
    );
  };

  /**
   * Badge payment status
   */
  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      paid: { bg: 'bg-green-100', text: 'text-green-700', label: 'Lunas' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
      failed: { bg: 'bg-red-100', text: 'text-red-700', label: 'Gagal' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 text-xs font-medium ${config.bg} ${config.text} rounded-full`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Detail Customer</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Customer Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Informasi Personal</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <UserIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Nama Lengkap</p>
                      <p className="text-sm font-medium text-gray-900">{customer.full_name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <PhoneIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Nomor HP</p>
                      <p className="text-sm font-medium text-gray-900">{customer.phone_number}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Alamat</p>
                      <p className="text-sm font-medium text-gray-900">{customer.address || '-'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Bergabung</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(customer.created_at)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 flex items-center justify-center">
                      {customer.is_active ? (
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      ) : (
                        <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <p className={`text-sm font-medium ${customer.is_active ? 'text-green-600' : 'text-gray-600'}`}>
                        {customer.is_active ? 'Aktif' : 'Nonaktif'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Statistics */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <ShoppingBagIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Statistik Order</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Total Order</p>
                    <p className="text-2xl font-bold text-blue-600">{customer.total_orders || 0}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Total Belanja</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(customer.total_spending || 0)}
                    </p>
                  </div>
                </div>
              </div>

              {customer.recent_orders && customer.recent_orders.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500">Order Terakhir</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {formatDate(customer.recent_orders[0].created_at)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Order #{customer.recent_orders[0].order_number}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order History */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">History Order (10 Terakhir)</h3>
            
            {!customer.recent_orders || customer.recent_orders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBagIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Belum ada order</p>
              </div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        No. Order
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tanggal
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tipe
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status Order
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status Bayar
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Total
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Items
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customer.recent_orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {order.order_number}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            order.transaction_type === 'online' 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {order.transaction_type === 'online' ? 'Online' : 'Offline'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {getOrderStatusBadge(order.order_status)}
                        </td>
                        <td className="px-4 py-3">
                          {getPaymentStatusBadge(order.payment_status)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {formatCurrency(order.total_amount)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {order.orderItems?.length || 0} item
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailModal;

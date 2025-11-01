import React, { useState } from 'react';
import { 
  XMarkIcon,
  TagIcon,
  CubeIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TrashIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import inventoryService from '../../services/services_admin/inventoryService';

/**
 * Modal untuk melihat detail diskon (Read-only + Manage Products)
 */
const DiscountDetailModal = ({ 
  isOpen, 
  onClose, 
  discount,
  onRefresh 
}) => {
  const [confirmDelete, setConfirmDelete] = useState(null);

  if (!isOpen || !discount) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  const formatValue = (type, value) => {
    if (type === 'percentage') {
      return `${value}%`;
    }
    return formatCurrency(value);
  };

  const handleRemoveProduct = async (productId) => {
    try {
      const discountId = discount.id || discount.discount_id;
      await inventoryService.removeProductFromDiscount(discountId, productId);
      toast.success('Produk berhasil dihapus dari diskon!');
      setConfirmDelete(null);
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      console.error('Error removing product:', err);
      toast.error(err.message || 'Gagal menghapus produk');
    }
  };

  const productCount = discount.products?.length || 0;
  const products = discount.products || [];

  // Get status
  const getStatus = () => {
    if (!discount.is_active) return 'inactive';
    return discount.status || 'active';
  };

  const status = getStatus();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TagIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Detail Diskon
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Nama & Status */}
            <div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {discount.discount_name}
                  </h2>
                  <div className="flex items-center gap-2">
                    {status === 'active' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full">
                        <CheckCircleIcon className="w-4 h-4" />
                        Aktif
                      </span>
                    ) : status === 'expired' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-full">
                        <XCircleIcon className="w-4 h-4" />
                        Expired
                      </span>
                    ) : status === 'upcoming' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full">
                        <ClockIcon className="w-4 h-4" />
                        Upcoming
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-full">
                        <XCircleIcon className="w-4 h-4" />
                        Nonaktif
                      </span>
                    )}

                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      discount.discount_type === 'percentage' 
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {discount.discount_type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                    </span>
                  </div>
                </div>

                {/* Value Badge */}
                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-1">
                    <TagIcon className="w-8 h-8 text-yellow-600" />
                  </div>
                  <p className="text-xl font-bold text-yellow-600">
                    {formatValue(discount.discount_type, discount.value)}
                  </p>
                  <p className="text-xs text-gray-500">Nilai Diskon</p>
                  {discount.discount_type === 'percentage' && discount.max_discount && (
                    <p className="text-xs text-gray-600 mt-1">
                      Max: {formatCurrency(discount.max_discount)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Tanggal Mulai</p>
                  <p className="text-sm text-gray-900">
                    {formatDate(discount.start_date)}
                  </p>
                </div>
              </div>

              {/* End Date */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Tanggal Selesai</p>
                  <p className="text-sm text-gray-900">
                    {formatDate(discount.end_date)}
                  </p>
                </div>
              </div>

              {/* Product Count */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <CubeIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Jumlah Produk</p>
                  <p className="text-sm text-gray-900">
                    {productCount} produk mendapat diskon
                  </p>
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <CheckCircleIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status Aktif</p>
                  <p className="text-sm text-gray-900">
                    {discount.is_active ? 'Aktif' : 'Nonaktif'}
                  </p>
                </div>
              </div>
            </div>

            {/* Products List */}
            {productCount > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <CubeIcon className="w-5 h-5" />
                  Produk yang Mendapat Diskon ({productCount})
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {products.map((product) => (
                    <div 
                      key={product.id || product.product_id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-green-100 rounded">
                          <CubeIcon className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {product.name || product.product_name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {/* Harga Asli (coret) */}
                            {product.ProductDiscount?.original_price && (
                              <span className="text-xs text-gray-400 line-through">
                                {formatCurrency(product.ProductDiscount.original_price)}
                              </span>
                            )}
                            {/* Harga Diskon */}
                            {product.ProductDiscount?.discounted_price && (
                              <>
                                <span className="text-xs text-gray-400">→</span>
                                <span className="text-xs font-semibold text-green-600">
                                  {formatCurrency(product.ProductDiscount.discounted_price)}
                                </span>
                              </>
                            )}
                            {/* Fallback ke selling_price jika tidak ada ProductDiscount */}
                            {!product.ProductDiscount?.original_price && (
                              <span className="text-xs text-gray-500">
                                {formatCurrency(product.selling_price || product.price || 0)}
                              </span>
                            )}
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">
                              Stok: {product.total_stock || 0} {product.unit || 'unit'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setConfirmDelete(product.id || product.product_id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus dari diskon"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {productCount === 0 && (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <CubeIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 text-sm">
                  Belum ada produk yang mendapat diskon ini
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Konfirmasi Hapus</h3>
            <p className="text-gray-600 mb-6">Hapus produk dari diskon ini?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={() => handleRemoveProduct(confirmDelete)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountDetailModal;

import React from 'react';
import { 
  XMarkIcon,
  TagIcon,
  CubeIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

/**
 * Modal untuk melihat detail kategori (Read-only)
 */
const CategoryDetailModal = ({ 
  isOpen, 
  onClose, 
  category 
}) => {
  if (!isOpen || !category) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const productCount = category.product_count || category.products?.length || 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TagIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Detail Kategori
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
                    {category.category_name}
                  </h2>
                  <div className="flex items-center gap-2">
                    {category.is_active ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full">
                        <CheckCircleIcon className="w-4 h-4" />
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-full">
                        <XCircleIcon className="w-4 h-4" />
                        Nonaktif
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Count Badge */}
                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-1">
                    <CubeIcon className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{productCount}</p>
                  <p className="text-xs text-gray-500">Produk</p>
                </div>
              </div>
            </div>

            {/* Deskripsi */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Deskripsi</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {category.description || 'Tidak ada deskripsi'}
              </p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ID */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <TagIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">ID Kategori</p>
                  <p className="text-sm font-mono text-gray-900 break-all">
                    {category.id || category.category_id || '-'}
                  </p>
                </div>
              </div>

              {/* Created At */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Dibuat Pada</p>
                  <p className="text-sm text-gray-900">
                    {formatDate(category.created_at)}
                  </p>
                </div>
              </div>

              {/* Updated At */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <ClockIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Terakhir Diupdate</p>
                  <p className="text-sm text-gray-900">
                    {formatDate(category.updated_at)}
                  </p>
                </div>
              </div>

              {/* Product Count Detail */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <CubeIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Jumlah Produk</p>
                  <p className="text-sm text-gray-900">
                    {productCount} produk terdaftar
                  </p>
                </div>
              </div>
            </div>

            {/* Products List (if available) */}
            {category.products && category.products.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Produk dalam Kategori Ini
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {category.products.map((product, index) => (
                    <div 
                      key={product.id || index} 
                      className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                    >
                      <CubeIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">
                        {product.name || product.product_name}
                      </span>
                      {product.is_active === false && (
                        <span className="ml-auto text-xs text-gray-500">(Nonaktif)</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailModal;

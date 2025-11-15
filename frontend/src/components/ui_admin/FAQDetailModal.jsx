import React from 'react';
import { XMarkIcon, PencilIcon } from '@heroicons/react/24/outline';

const FAQDetailModal = ({ faq, onClose, onEdit }) => {
  const categoryLabels = {
    umum: 'Umum',
    pembayaran: 'Pembayaran',
    pengiriman: 'Pengiriman',
    produk: 'Produk'
  };

  const categoryColors = {
    umum: 'bg-blue-100 text-blue-700',
    pembayaran: 'bg-purple-100 text-purple-700',
    pengiriman: 'bg-orange-100 text-orange-700',
    produk: 'bg-green-100 text-green-700'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Detail FAQ</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Category & Status */}
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${categoryColors[faq.category] || 'bg-gray-100 text-gray-700'}`}>
              {categoryLabels[faq.category] || faq.category}
            </span>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              faq.is_active 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {faq.is_active ? 'Aktif' : 'Nonaktif'}
            </span>
            {faq.display_order && (
              <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded-full">
                Urutan: {faq.display_order}
              </span>
            )}
          </div>

          {/* Question */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pertanyaan</label>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-gray-900 font-medium text-lg">{faq.question}</p>
            </div>
          </div>

          {/* Answer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Jawaban</label>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{faq.answer}</p>
            </div>
          </div>

          {/* Timestamps */}
          {(faq.created_at || faq.updated_at) && (
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                {faq.created_at && (
                  <div>
                    <span className="font-medium">Dibuat:</span> {new Date(faq.created_at).toLocaleString('id-ID')}
                  </div>
                )}
                {faq.updated_at && (
                  <div>
                    <span className="font-medium">Diperbarui:</span> {new Date(faq.updated_at).toLocaleString('id-ID')}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
            Edit FAQ
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default FAQDetailModal;

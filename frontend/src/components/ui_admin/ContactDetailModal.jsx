import React from 'react';
import { XMarkIcon, EnvelopeIcon, PhoneIcon, UserIcon, CalendarIcon } from '@heroicons/react/24/outline';

const ContactDetailModal = ({ message, onClose, onUpdateStatus }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      
      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return '-';
    }
  };

  const handleWhatsAppReply = () => {
    const name = message.name || message.full_name || 'Customer';
    const subject = message.subject || 'pesan Anda';
    const text = `Halo ${name}, terima kasih telah menghubungi BaleTani mengenai: "${subject}"`;
    const phoneNumber = message.phone || message.whatsapp_number || '';
    const phone = phoneNumber.replace(/\D/g, '');
    
    if (!phone) {
      alert('Nomor WhatsApp tidak tersedia');
      return;
    }
    
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const statusOptions = [
    { 
      value: 'pending', 
      label: 'Pending', 
      bgActive: 'bg-yellow-600',
      bgInactive: 'bg-yellow-100 hover:bg-yellow-200',
      textActive: 'text-white',
      textInactive: 'text-yellow-700'
    },
    { 
      value: 'read', 
      label: 'Dibaca', 
      bgActive: 'bg-blue-600',
      bgInactive: 'bg-blue-100 hover:bg-blue-200',
      textActive: 'text-white',
      textInactive: 'text-blue-700'
    },
    { 
      value: 'replied', 
      label: 'Dibalas', 
      bgActive: 'bg-purple-600',
      bgInactive: 'bg-purple-100 hover:bg-purple-200',
      textActive: 'text-white',
      textInactive: 'text-purple-700'
    },
    { 
      value: 'resolved', 
      label: 'Selesai', 
      bgActive: 'bg-green-600',
      bgInactive: 'bg-green-100 hover:bg-green-200',
      textActive: 'text-white',
      textInactive: 'text-green-700'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Detail Pesan Kontak</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Sender Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <UserIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Nama</p>
                <p className="text-sm font-medium text-gray-900">{message.name || message.full_name || '-'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <EnvelopeIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">{message.email || '-'}</p>
              </div>
            </div>

            {(message.phone || message.whatsapp_number) && (
              <div className="flex items-center gap-3">
                <PhoneIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">WhatsApp</p>
                  <p className="text-sm font-medium text-gray-900">{message.phone || message.whatsapp_number || '-'}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <CalendarIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Tanggal</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(message.created_at)}</p>
              </div>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subjek</label>
            <p className="text-gray-900">{message.subject || '-'}</p>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pesan</label>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-900 whitespace-pre-wrap">{message.message || '-'}</p>
            </div>
          </div>

          {/* Status Update */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {statusOptions.map((status) => (
                <button
                  key={status.value}
                  onClick={() => onUpdateStatus(message.id, status.value)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    message.status === status.value
                      ? `${status.bgActive} ${status.textActive}`
                      : `${status.bgInactive} ${status.textInactive}`
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          {message.phone && (
            <button
              onClick={handleWhatsAppReply}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              Balas via WhatsApp
            </button>
          )}
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

export default ContactDetailModal;

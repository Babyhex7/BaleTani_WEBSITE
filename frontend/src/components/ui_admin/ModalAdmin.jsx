import React from 'react';

/**
 * Komponen Modal reusable untuk admin
 * Mendukung ukuran yang berbeda dan konfirmasi
 */
const ModalAdmin = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = "md",
  showCloseButton = true,
  className = ""
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl", 
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-full mx-4"
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full ${sizeClasses[size]} ${className}`}>
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {title}
              </h3>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <span className="sr-only">Tutup</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Komponen ConfirmModal untuk konfirmasi aksi
 */
export const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Konfirmasi", 
  message = "Apakah Anda yakin?",
  confirmText = "Ya",
  cancelText = "Batal",
  type = "warning" // warning, danger, info
}) => {
  const typeStyles = {
    warning: {
      icon: "⚠️",
      confirmBtn: "bg-yellow-600 hover:bg-yellow-700 text-white"
    },
    danger: {
      icon: "🗑️", 
      confirmBtn: "bg-red-600 hover:bg-red-700 text-white"
    },
    info: {
      icon: "ℹ️",
      confirmBtn: "bg-blue-600 hover:bg-blue-700 text-white"
    }
  };

  const currentType = typeStyles[type] || typeStyles.warning;

  return (
    <ModalAdmin isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="text-center">
        <div className="text-4xl mb-4">{currentType.icon}</div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-center space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${currentType.confirmBtn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </ModalAdmin>
  );
};

export default ModalAdmin;
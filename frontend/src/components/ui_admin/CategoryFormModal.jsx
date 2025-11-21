import React, { useState, useEffect } from 'react';
import { XMarkIcon, Squares2X2Icon } from '@heroicons/react/24/outline';

/**
 * Modal untuk Create/Edit Kategori
 * Reusable component dengan mode 'create' atau 'edit'
 */
const CategoryFormModal = ({
  isOpen,
  onClose,
  mode = 'create',
  category = null,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    category_name: '',
    description: '',
    is_active: true
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Load data saat edit mode
  useEffect(() => {
    if (category && mode === 'edit') {
      setFormData({
        category_name: category.category_name || '',
        description: category.description || '',
        is_active: category.is_active ?? true
      });
    } else if (mode === 'create') {
      resetForm();
    }
  }, [category, mode, isOpen]);

  const resetForm = () => {
    setFormData({
      category_name: '',
      description: '',
      is_active: true
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error saat user mulai mengetik
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.category_name.trim()) {
      newErrors.category_name = 'Nama kategori wajib diisi';
    } else if (formData.category_name.trim().length < 3) {
      newErrors.category_name = 'Nama kategori minimal 3 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
      resetForm();
      onClose();
    } catch (err) {
      // Error dari parent component
      if (err.message.includes('sudah ada') || err.message.includes('duplicate')) {
        setErrors({ category_name: 'Nama kategori sudah digunakan' });
      } else {
        setErrors({ submit: err.message || 'Terjadi kesalahan' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full">
          {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Squares2X2Icon className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-gray-900">
                  {mode === 'create' ? 'Tambah Kategori Baru' : 'Edit Kategori'}
                </h3>
              </div>

              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              {/* Nama Kategori */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Kategori <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="category_name"
                  value={formData.category_name}
                  onChange={handleChange}
                  placeholder="Contoh: Sayuran, Buah-buahan, dll"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.category_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.category_name && (
                  <p className="mt-1 text-sm text-red-500">{errors.category_name}</p>
                )}
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Deskripsi kategori (opsional)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Status Aktif */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Kategori Aktif
                </label>
              </div>
              <p className="text-xs text-gray-500 ml-7">
                Kategori yang tidak aktif tidak akan muncul di daftar
              </p>

              {/* Submit Error */}
              {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Menyimpan...
                  </span>
                ) : (
                  mode === 'create' ? 'Simpan' : 'Update'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CategoryFormModal;

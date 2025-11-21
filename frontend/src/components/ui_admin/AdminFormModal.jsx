import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

/**
 * Modal untuk create/edit admin user
 */
const AdminFormModal = ({ isOpen, admin, roles = [], isEditMode = false, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    role_id: '',
    password: '',
    password_confirmation: '',
    is_active: true
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // Populate form saat edit mode
  useEffect(() => {
    if (isEditMode && admin) {
      setFormData({
        full_name: admin.full_name || '',
        phone_number: admin.phone_number || '',
        role_id: admin.role?.id || '',
        password: '',
        password_confirmation: '',
        is_active: admin.is_active ?? true
      });
    } else if (!isEditMode) {
      // Reset form saat create mode
      setFormData({
        full_name: '',
        phone_number: '',
        role_id: '',
        password: '',
        password_confirmation: '',
        is_active: true
      });
      setErrors({});
    }
  }, [admin, isEditMode, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error saat user mengetik
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validasi nama
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Nama lengkap wajib diisi';
    } else if (formData.full_name.trim().length < 3) {
      newErrors.full_name = 'Nama lengkap minimal 3 karakter';
    }

    // Validasi nomor telepon
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Nomor telepon wajib diisi';
    } else {
      // Remove non-digit characters for validation
      const cleanPhone = formData.phone_number.replace(/\D/g, '');
      if (cleanPhone.length < 10 || cleanPhone.length > 15) {
        newErrors.phone_number = 'Nomor telepon harus 10-15 digit';
      }
    }

    // Validasi role
    if (!formData.role_id) {
      newErrors.role_id = 'Role wajib dipilih';
    }

    // Validasi password (wajib untuk create, opsional untuk edit)
    if (!isEditMode) {
      if (!formData.password) {
        newErrors.password = 'Password wajib diisi';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password minimal 6 karakter';
      }

      if (!formData.password_confirmation) {
        newErrors.password_confirmation = 'Konfirmasi password wajib diisi';
      } else if (formData.password !== formData.password_confirmation) {
        newErrors.password_confirmation = 'Password tidak cocok';
      }
    } else {
      // Untuk edit mode, hanya validasi jika password diisi
      if (formData.password) {
        if (formData.password.length < 6) {
          newErrors.password = 'Password minimal 6 karakter';
        }
        if (formData.password !== formData.password_confirmation) {
          newErrors.password_confirmation = 'Password tidak cocok';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare data untuk submit
      const submitData = {
        full_name: formData.full_name.trim(),
        phone_number: formData.phone_number.trim(),
        role_id: formData.role_id,
        is_active: formData.is_active
      };

      // Tambahkan password hanya jika diisi
      if (formData.password) {
        submitData.password = formData.password;
        submitData.password_confirmation = formData.password_confirmation;
      }

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      // Error handling sudah di parent component
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (roleName) => {
    const names = {
      super_admin: 'Super Admin',
      super_inventory_admin: 'Super Admin Inventory',
      super_whatsapp_admin: 'Super Admin WhatsApp',
      super_cashier: 'Super Kasir',
      finance_admin: 'Admin Finance',
      inventory_admin: 'Admin Inventory',
      whatsapp_admin: 'Admin WhatsApp',
      cashier: 'Kasir',
    };
    return names[roleName] || roleName;
  };

  // Jangan render jika modal tidak open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div 
          className="inline-block w-full max-w-2xl overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle relative z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <UserIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {isEditMode ? 'Edit Admin' : 'Tambah Admin Baru'}
                </h3>
                <p className="text-sm text-gray-600">
                  {isEditMode 
                    ? 'Perbarui informasi admin' 
                    : 'Lengkapi form untuk menambahkan admin baru'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-6">
            <div className="space-y-4">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.full_name ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                {errors.full_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
                )}
              </div>

              {/* Nomor Telepon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Telepon <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.phone_number ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                    placeholder="081234567890"
                    disabled={isEditMode} // Phone number tidak bisa diubah saat edit
                  />
                </div>
                {errors.phone_number && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>
                )}
                {isEditMode && (
                  <p className="mt-1 text-xs text-gray-500">
                    Nomor telepon tidak dapat diubah
                  </p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="role_id"
                    value={formData.role_id}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.role_id ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                  >
                    <option value="">Pilih Role</option>
                    {(roles || []).map(role => (
                      <option key={role.id} value={role.id}>
                        {getRoleDisplayName(role.role_name)}
                        {role.description && ` - ${role.description}`}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.role_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.role_id}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password {!isEditMode && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full pr-10 py-2 border ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                    placeholder={isEditMode ? 'Kosongkan jika tidak ingin mengubah' : 'Minimal 6 karakter'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
                {isEditMode && !formData.password && (
                  <p className="mt-1 text-xs text-gray-500">
                    Kosongkan jika tidak ingin mengubah password
                  </p>
                )}
              </div>

              {/* Konfirmasi Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konfirmasi Password {!isEditMode && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPasswordConfirm ? 'text' : 'password'}
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    className={`block w-full pr-10 py-2 border ${
                      errors.password_confirmation ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                    placeholder="Ulangi password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPasswordConfirm ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password_confirmation && (
                  <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>
                )}
              </div>

              {/* Status Aktif */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                  Aktif
                </label>
              </div>

              {/* Info Box */}
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Informasi Penting:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Password minimal 6 karakter</li>
                      <li>Nomor telepon akan digunakan untuk login</li>
                      <li>Pilih role sesuai dengan tanggung jawab admin</li>
                      {isEditMode && (
                        <li>Kosongkan password jika tidak ingin mengubahnya</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    {isEditMode ? 'Update Admin' : 'Tambah Admin'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminFormModal;

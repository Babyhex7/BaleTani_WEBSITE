import React from 'react';
import {
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  ShieldCheckIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import RolePermissionCard from '../admin/RolePermissionCard';

/**
 * Modal untuk menampilkan detail admin user
 */
const AdminDetailModal = ({ isOpen, admin, onClose }) => {
  if (!isOpen || !admin) return null;

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

  const getRoleBadgeColor = (roleName) => {
    const colors = {
      super_admin: 'bg-purple-100 text-purple-800 border-purple-200',
      super_inventory_admin: 'bg-blue-100 text-blue-800 border-blue-200',
      super_whatsapp_admin: 'bg-green-100 text-green-800 border-green-200',
      super_cashier: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      finance_admin: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      inventory_admin: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      whatsapp_admin: 'bg-teal-100 text-teal-800 border-teal-200',
      cashier: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[roleName] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

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
          className="inline-block w-full max-w-4xl overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle relative z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-accent-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <ShieldCheckIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Detail Admin
                </h3>
                <p className="text-sm text-gray-600">
                  Informasi lengkap pengguna admin
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

          {/* Content */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Admin Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Profile Card */}
                <div className="bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg p-6 text-white">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-3xl font-bold backdrop-blur-sm">
                        {admin.full_name?.charAt(0).toUpperCase() || 'A'}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold mb-1">
                        {admin.full_name}
                      </h4>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30`}>
                        {getRoleDisplayName(admin.role?.role_name)}
                      </div>
                    </div>
                    <div>
                      {admin.is_active ? (
                        <div className="flex items-center gap-2 px-3 py-2 bg-green-500 bg-opacity-20 backdrop-blur-sm rounded-lg border border-green-300 border-opacity-30">
                          <CheckCircleIcon className="w-5 h-5" />
                          <span className="text-sm font-medium">Aktif</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-2 bg-red-500 bg-opacity-20 backdrop-blur-sm rounded-lg border border-red-300 border-opacity-30">
                          <XCircleIcon className="w-5 h-5" />
                          <span className="text-sm font-medium">Nonaktif</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Information Grid */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h5 className="text-lg font-semibold text-gray-900 mb-4">
                    Informasi Akun
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* ID */}
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-white rounded-lg">
                        <UserIcon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-1">ID Admin</p>
                        <p className="text-sm font-mono text-gray-900 truncate">
                          {admin.id}
                        </p>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-white rounded-lg">
                        <PhoneIcon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">Nomor Telepon</p>
                        <p className="text-sm font-medium text-gray-900">
                          {admin.phone_number}
                        </p>
                      </div>
                    </div>

                    {/* Created At */}
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-white rounded-lg">
                        <CalendarIcon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">Bergabung</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(admin.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Updated At */}
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-white rounded-lg">
                        <ClockIcon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">Terakhir Update</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(admin.updated_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Role Description */}
                {admin.role?.description && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <ShieldCheckIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h6 className="text-sm font-semibold text-blue-900 mb-1">
                          Deskripsi Role
                        </h6>
                        <p className="text-sm text-blue-800">
                          {admin.role.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Permissions */}
              <div className="lg:col-span-1">
                {/* Pass admin data with permissions to RolePermissionCard */}
                <div className="sticky top-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h5 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <ShieldCheckIcon className="w-5 h-5 text-primary-600" />
                      Role & Permissions
                    </h5>
                    
                    {/* Role Badge */}
                    <div className="mb-4">
                      <div className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium border ${getRoleBadgeColor(admin.role?.role_name)}`}>
                        {getRoleDisplayName(admin.role?.role_name)}
                      </div>
                    </div>

                    {/* Permissions Count */}
                    {admin.permissions && admin.permissions.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">
                            Total Permissions
                          </span>
                          <span className="text-lg font-bold text-primary-600">
                            {admin.permissions.length}
                          </span>
                        </div>

                        {/* Permissions List */}
                        <div className="max-h-96 overflow-y-auto space-y-2 mt-4">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Daftar Permissions
                          </p>
                          {admin.permissions.map((perm, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-xs">
                              <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <span className="text-gray-700">
                                <span className="font-medium">{perm.module}</span>
                                <span className="text-gray-500"> • </span>
                                <span className="text-gray-600">{perm.action}</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {admin.role?.role_name === 'super_admin' && (
                      <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircleIcon className="w-5 h-5 text-purple-600" />
                          <p className="text-sm font-medium text-purple-900">
                            Akses Penuh
                          </p>
                        </div>
                        <p className="text-xs text-purple-700 mt-1">
                          Super Admin memiliki akses ke semua fitur
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
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

export default AdminDetailModal;

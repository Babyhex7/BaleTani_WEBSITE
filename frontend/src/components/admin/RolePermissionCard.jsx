import { Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import useAdminStore from '../../store/store_admin/useAdminStore';

/**
 * RolePermissionCard Component
 * Menampilkan informasi role dan permissions admin yang sedang login
 */
const RolePermissionCard = () => {
  const admin = useAdminStore((state) => state.admin);
  const permissions = useAdminStore((state) => state.permissions);

  // Group permissions by module
  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) {
      acc[perm.module] = [];
    }
    acc[perm.module].push(perm.action);
    return acc;
  }, {});

  // Role display names (Indonesia)
  const roleNames = {
    super_admin: 'Super Admin',
    super_inventory_admin: 'Super Admin Inventory',
    super_whatsapp_admin: 'Super Admin WhatsApp',
    super_cashier: 'Super Kasir',
    inventory_admin: 'Admin Inventory',
    finance_admin: 'Admin Finance',
    whatsapp_admin: 'Admin WhatsApp',
    cashier: 'Kasir',
  };

  // Module display names (Indonesia)
  const moduleNames = {
    products: 'Produk',
    procurement: 'Pengadaan',
    online_orders: 'Order Online',
    offline_orders: 'Transaksi Offline',
    b2b_transactions: 'Transaksi B2B',
    customers: 'Pelanggan',
    reports: 'Laporan',
    users: 'User Management',
  };

  // Action display names (Indonesia)
  const actionNames = {
    view: 'Lihat',
    create: 'Tambah',
    update: 'Edit',
    delete: 'Hapus',
    approve: 'Approve',
  };

  // Role color
  const getRoleColor = (role) => {
    if (role === 'super_admin') return 'bg-gradient-to-r from-purple-500 to-pink-500';
    if (role?.includes('super_')) return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    if (role === 'finance_admin') return 'bg-gradient-to-r from-green-500 to-emerald-500';
    return 'bg-gradient-to-r from-primary-500 to-accent-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-3 rounded-lg ${getRoleColor(admin?.role)}`}>
          <Shield className="text-white" size={24} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {roleNames[admin?.role] || admin?.role || 'Admin'}
          </h3>
          <p className="text-sm text-gray-500">
            {admin?.full_name || 'Administrator'}
          </p>
        </div>
      </div>

      {/* Super Admin Badge */}
      {admin?.role === 'super_admin' && (
        <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-purple-600" size={20} />
            <p className="text-sm font-medium text-purple-900">
              Akses Penuh ke Semua Modul
            </p>
          </div>
          <p className="text-xs text-purple-700 mt-1">
            Super Admin memiliki hak akses penuh tanpa batasan
          </p>
        </div>
      )}

      {/* Permissions List */}
      {admin?.role !== 'super_admin' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-700">
              Hak Akses ({permissions.length})
            </h4>
            {permissions.length === 0 && (
              <AlertCircle className="text-amber-500" size={16} />
            )}
          </div>

          {permissions.length === 0 ? (
            <div className="text-center py-6 px-4 bg-amber-50 rounded-lg border border-amber-200">
              <AlertCircle className="mx-auto text-amber-500 mb-2" size={32} />
              <p className="text-sm text-amber-800 font-medium">
                Tidak ada hak akses
              </p>
              <p className="text-xs text-amber-600 mt-1">
                Hubungi Super Admin untuk mendapatkan hak akses
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {Object.entries(groupedPermissions).map(([module, actions]) => (
                <div
                  key={module}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="font-medium text-sm text-gray-900 mb-2">
                    {moduleNames[module] || module}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {actions.map((action) => (
                      <span
                        key={action}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded text-xs font-medium text-gray-700 border border-gray-300"
                      >
                        <CheckCircle2 size={12} className="text-green-600" />
                        {actionNames[action] || action}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Role-Based Access Control (RBAC) Active
        </p>
      </div>
    </div>
  );
};

export default RolePermissionCard;

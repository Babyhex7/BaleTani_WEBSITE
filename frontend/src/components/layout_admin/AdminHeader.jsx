import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAdminStore from '../../store/store_admin/useAdminStore';
import { 
  BellIcon, 
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';
import { getRoleDisplayName } from '../../utils/rolePermissions';

/**
 * Header/Navbar Admin yang menampilkan breadcrumb dan info user
 * Responsive dengan tombol toggle sidebar untuk mobile
 */
const AdminHeader = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const admin = useAdminStore((state) => state.admin);
  const logout = useAdminStore((state) => state.logout);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Get user info from admin object
  const user = admin ? {
    fullName: admin.full_name,
    email: admin.email,
    role: admin.role?.role_name
  } : null;

  // Mapping path ke breadcrumb
  const getBreadcrumb = () => {
    const pathMap = {
      '/admin/dashboard': { title: 'Dashboard', subtitle: 'Ringkasan dan Statistik Toko', icon: '📊' },
      '/admin/inventory': { title: 'Inventory Management', subtitle: 'Kelola Produk dan Stok', icon: '📦' },
      '/admin/products': { title: 'Product Management', subtitle: 'Kelola Produk', icon: '🏪' },
      '/admin/users': { title: 'User Management', subtitle: 'Kelola Data Pengguna', icon: '👥' },
      '/admin/orders': { title: 'Order Management', subtitle: 'Kelola Pesanan Pelanggan', icon: '🛒' },
      '/admin/orders-new': { title: 'Order Management', subtitle: 'Kelola Pesanan dengan Update Status', icon: '🛍️' },
      '/admin/customers': { title: 'Customer Management', subtitle: 'Kelola Data Pelanggan', icon: '👤' },
      '/admin/procurement': { title: 'Procurement', subtitle: 'Pengadaan Barang', icon: '📋' },
      '/admin/procurement-new': { title: 'Procurement Management', subtitle: 'Kelola Pengadaan Barang', icon: '📦' },
      '/admin/accounting': { title: 'Akuntansi', subtitle: 'Laporan Keuangan', icon: '💰' },
      '/admin/reports': { title: 'Reports', subtitle: 'Laporan dan Analitik', icon: '📈' }
    };

    return pathMap[location.pathname] || { title: 'Admin Panel', subtitle: 'Sistem Manajemen BaleTani', icon: '🏠' };
  };

  const breadcrumb = getBreadcrumb();

  const getRoleBadgeColor = (role) => {
    const colors = {
      super_admin: 'bg-purple-100 text-purple-800 border-purple-300',
      super_whatsapp_admin: 'bg-green-100 text-green-800 border-green-300',
      super_cashier: 'bg-blue-100 text-blue-800 border-blue-300',
      whatsapp_admin: 'bg-teal-100 text-teal-800 border-teal-300',
      cashier: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      finance_admin: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      inventory_admin: 'bg-orange-100 text-orange-800 border-orange-300',
      super_inventory_admin: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[role] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left side - Mobile menu button + Breadcrumb */}
        <div className="flex items-center flex-1">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors lg:hidden"
            aria-label="Toggle sidebar"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="ml-4 lg:ml-0">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{breadcrumb.icon}</span>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">{breadcrumb.title}</h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">{breadcrumb.subtitle}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - User info & actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Current date - Hidden on mobile */}
          <div className="hidden lg:flex flex-col items-end">
            <p className="text-xs text-gray-500">
              {new Date().toLocaleDateString('id-ID', { 
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </p>
            <p className="text-xs text-gray-400">
              {new Date().toLocaleTimeString('id-ID', { 
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <BellIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 sm:gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-md ring-2 ring-white">
                <span className="text-white font-bold text-sm sm:text-base">
                  {user?.fullName?.charAt(0)?.toUpperCase() || user?.full_name?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-gray-900 truncate max-w-[150px]">
                  {user?.fullName || user?.full_name || 'Admin'}
                </p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getRoleBadgeColor(user?.role)}`}>
                  {getRoleDisplayName(user?.role)}
                </span>
              </div>
              <svg
                className={`hidden sm:block h-4 w-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.fullName || user?.full_name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                  <span className={`inline-flex items-center px-2 py-1 rounded mt-1 text-xs font-medium border ${getRoleBadgeColor(user?.role)}`}>
                    {getRoleDisplayName(user?.role)}
                  </span>
                </div>
                
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/admin/profile');
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <UserCircleIcon className="h-4 w-4" />
                  My Profile
                </button>
                
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/admin/settings');
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Cog6ToothIcon className="h-4 w-4" />
                  Settings
                </button>

                <div className="border-t border-gray-100 mt-1"></div>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
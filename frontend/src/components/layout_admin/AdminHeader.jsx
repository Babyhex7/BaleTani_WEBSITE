import React from 'react';
import { useLocation } from 'react-router-dom';
import useAuthStore from '../../store/store_customer/useAuthStore';

/**
 * Header/Navbar Admin yang menampilkan breadcrumb dan info user
 * Responsive dengan tombol toggle sidebar untuk mobile
 */
const AdminHeader = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const { user } = useAuthStore();

  // Mapping path ke breadcrumb
  const getBreadcrumb = () => {
    const pathMap = {
      '/admin/dashboard': { title: 'Dashboard', subtitle: 'Ringkasan dan Statistik Toko' },
      '/admin/inventory': { title: 'Inventory Management', subtitle: 'Kelola Produk dan Stok' },
      '/admin/users': { title: 'User Management', subtitle: 'Kelola Data Pengguna' },
      '/admin/orders': { title: 'Order Management', subtitle: 'Kelola Pesanan Pelanggan' },
      '/admin/accounting': { title: 'Akuntansi', subtitle: 'Laporan Keuangan' },
      '/admin/reports': { title: 'Reports', subtitle: 'Laporan dan Analitik' }
    };

    return pathMap[location.pathname] || { title: 'Admin Panel', subtitle: 'Sistem Manajemen BaleTani' };
  };

  const breadcrumb = getBreadcrumb();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left side - Mobile menu button + Breadcrumb */}
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500 lg:hidden"
          >
            <span className="sr-only">Buka sidebar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="ml-4 lg:ml-0">
            <h1 className="text-xl font-semibold text-gray-900">{breadcrumb.title}</h1>
            <p className="text-sm text-gray-500 hidden sm:block">{breadcrumb.subtitle}</p>
          </div>
        </div>

        {/* Right side - User info & actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md relative">
            <span className="sr-only">Notifikasi</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-4.03-4.03C16.83 11.37 17 9.74 17 8c0-4.42-3.58-8-8-8s-8 3.58-8 8c0 1.74.17 3.37 1.03 4.97L7 17h5m3 0v1a3 3 0 01-6 0v-1m6 0H9" />
            </svg>
            {/* Badge notifikasi */}
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
          </button>

          {/* Current time/date */}
          <div className="hidden md:block text-sm text-gray-500">
            {new Date().toLocaleDateString('id-ID', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long', 
              day: 'numeric'
            })}
          </div>

          {/* User avatar */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-semibold text-sm">
                {user?.full_name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="ml-2 hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.full_name || 'Admin'}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role || 'admin'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
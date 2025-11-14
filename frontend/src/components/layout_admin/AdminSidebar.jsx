import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Tag, Gift, Users, ShoppingCart, DollarSign, FileText, LogOut, Leaf } from 'lucide-react';
import useAdminStore from '../../store/store_admin/useAdminStore';

/**
 * Sidebar Admin dengan navigasi menu yang responsive
 * Terintegrasi dengan RBAC untuk mengecek role user
 */
const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAdminStore();

  // Menu navigasi admin
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin/dashboard',
      description: 'Ringkasan dan statistik'
    },
    {
      id: 'products',
      label: 'Products',
      icon: Package,
      path: '/admin/products',
      description: 'Manajemen Produk'
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: Tag,
      path: '/admin/categories',
      description: 'Manajemen Kategori'
    },
    {
      id: 'discounts',
      label: 'Discount Management',
      icon: Gift,
      path: '/admin/discounts',
      description: 'Kelola Diskon & Promo'
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      path: '/admin/users',
      description: 'Kelola Pengguna'
    },
    {
      id: 'orders',
      label: 'Order Management',
      icon: ShoppingCart,
      path: '/admin/orders',
      description: 'Kelola Pesanan',
      comingSoon: true
    },
    {
      id: 'accounting',
      label: 'Akuntansi',
      icon: DollarSign,
      path: '/admin/accounting',
      description: 'Laporan Keuangan',
      comingSoon: true
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
      path: '/admin/reports',
      description: 'Laporan & Analitik',
      comingSoon: true
    }
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 bg-green-600 text-white">
            <div className="flex items-center gap-2">
              <Leaf className="w-6 h-6" />
              <span className="text-xl font-bold">BaleTani</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-white hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User info */}
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold">
                  {admin?.full_name?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{admin?.full_name || 'Admin'}</p>
                <p className="text-xs text-gray-500 capitalize">
                  {typeof admin?.role === 'string' ? admin?.role : admin?.role?.role_name || 'admin'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <div key={item.id}>
                {item.comingSoon ? (
                  <div className="flex items-center px-4 py-3 text-sm text-gray-400 rounded-lg cursor-not-allowed">
                    <item.icon className="mr-3 w-5 h-5" />
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs">Coming Soon</div>
                    </div>
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-green-100 text-green-700 border-r-2 border-green-500'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className={`mr-3 w-5 h-5 ${
                      isActive(item.path) ? 'text-green-700' : 'text-gray-600'
                    }`} />
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <LogOut className="mr-3 w-5 h-5 text-red-600" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  CubeIcon,
  ShoppingCartIcon,
  UsersIcon,
  TagIcon,
  ReceiptPercentIcon,
  TruckIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import useAdminStore from '../../store/store_admin/useAdminStore';

const AdminSidebarNew = () => {
  const location = useLocation();
  const { admin, logout } = useAdminStore();
  const [expandedMenus, setExpandedMenus] = useState(['products']);

  const toggleMenu = (menuName) => {
    setExpandedMenus(prev => 
      prev.includes(menuName) 
        ? prev.filter(m => m !== menuName)
        : [...prev, menuName]
    );
  };

  const menuItems = [
    { 
      name: 'Dashboard', 
      path: '/admin/dashboard', 
      icon: HomeIcon 
    },
    {
      name: 'Products & Inventory',
      icon: CubeIcon,
      key: 'products',
      submenu: [
        { name: 'Product List', path: '/admin/products' },
        { name: 'Stock Overview', path: '/admin/stock-overview' },
        { name: 'Discount Management', path: '/admin/discounts' },
        { name: 'Category Management', path: '/admin/categories' },
      ]
    },
    {
      name: 'Procurement',
      icon: TruckIcon,
      key: 'procurement',
      submenu: [
        { name: 'Procurement List', path: '/admin/procurement' },
      ]
    },
    {
      name: 'Sales & Transactions',
      icon: ShoppingCartIcon,
      key: 'sales',
      submenu: [
        { name: 'Orders', path: '/admin/orders' },
        { name: 'Transactions', path: '/admin/transactions' },
      ]
    },
    {
      name: 'Customers',
      path: '/admin/customers',
      icon: UsersIcon
    },
    {
      name: 'Reports & Insights',
      icon: ChartBarIcon,
      key: 'reports',
      submenu: [
        { name: 'Sales Report', path: '/admin/reports/sales' },
        { name: 'Inventory Report', path: '/admin/reports/inventory' },
      ]
    },
  ];

  const handleLogout = () => {
    logout();
  };

  const isActive = (path) => location.pathname === path;
  const isMenuExpanded = (key) => expandedMenus.includes(key);

  return (
    <div className="bg-green-700 text-white w-64 min-h-screen flex flex-col shadow-lg">
      {/* Logo & Brand */}
      <div className="p-6 border-b border-green-600">
        <h1 className="text-2xl font-bold text-white">BaleTani</h1>
        <p className="text-sm text-green-200">Admin Panel</p>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-green-600">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-lg">
            {admin?.full_name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {admin?.full_name || 'Super Admin'}
            </p>
            <p className="text-xs text-green-200 capitalize">
              {admin?.role?.role_name?.replace(/_/g, ' ') || 'Demo Account'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {menuItems.map((item) => (
          <div key={item.key || item.path} className="mb-1">
            {item.submenu ? (
              // Menu dengan submenu
              <div>
                <button
                  onClick={() => toggleMenu(item.key)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-green-100 hover:bg-green-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  {isMenuExpanded(item.key) ? (
                    <ChevronDownIcon className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4 flex-shrink-0" />
                  )}
                </button>
                
                {/* Submenu Items */}
                {isMenuExpanded(item.key) && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                          isActive(subItem.path)
                            ? 'bg-green-800 text-white font-medium'
                            : 'text-green-100 hover:bg-green-600'
                        }`}
                      >
                        <span className="text-xs">→</span>
                        <span>{subItem.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Menu tanpa submenu
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-green-800 text-white font-medium shadow-md'
                    : 'text-green-100 hover:bg-green-600'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-green-600">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-200 hover:bg-red-600 hover:text-white transition-colors"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebarNew;

import React, { useState, useEffect  } from 'react';
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
  ArrowRightOnRectangleIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import useAdminStore from '../../store/store_admin/useAdminStore';

const AdminSidebarNew = () => {
  const location = useLocation();
  const { admin, logout } = useAdminStore();
  const [expandedMenus, setExpandedMenus] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      name: 'Inventory',
      icon: CubeIcon,
      key: 'products',
      submenu: [
        { name: 'Product List', path: '/admin/products' },
        { name: 'Discount Management', path: '/admin/discounts' },
        { name: 'Category Management', path: '/admin/categories' },
      ]
    },
    {
      name: 'Procurement',
      icon: TruckIcon,
      key: 'procurement',
      submenu: [
        { name: 'Procurement List', path: '/admin/procurements' },
      ]
    },
    {
      name: 'Orders',
      path: '/admin/orders',
      icon: ShoppingCartIcon
    },
    {
      name: 'User Management',
      icon: UsersIcon,
      key: 'users',
      submenu: [
        { name: 'Customer Management', path: '/admin/customers' },
        { name: 'Admin Management', path: '/admin/admins' },
      ]
    },
    {
      name: 'Customer Support',
      icon: ChatBubbleLeftRightIcon,
      key: 'support',
      submenu: [
        { name: 'FAQ Management', path: '/admin/faqs' },
        { name: 'Contact Messages', path: '/admin/contacts' },
      ]
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

  useEffect(() => {
    menuItems.forEach(item => {
      if (item.submenu) {
        item.submenu.forEach(sub => {
          if (location.pathname.startsWith(sub.path)) {
            if (!expandedMenus.includes(item.key)) {
              setExpandedMenus(prev => [...prev, item.key]);
            }
          }
        });
      }
    });
  }, [location.pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Mobile Menu Button - Fixed at top */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-colors"
        aria-label="Open menu"
      >
        <Bars3Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        bg-white text-gray-800 w-64 sm:w-72 lg:w-64 h-screen flex flex-col shadow-xl border-r border-gray-200
        fixed lg:sticky top-0 z-50 lg:z-auto
        transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo & Brand */}
        <div className="p-4 sm:p-5 lg:p-6 border-b border-gray-200 bg-gradient-to-r from-green-600 to-green-700 relative">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-white truncate">BaleTani</h1>
              <p className="text-xs sm:text-sm text-green-100">Admin Panel</p>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1 text-white hover:bg-green-700 rounded transition-colors flex-shrink-0 ml-2"
              aria-label="Close menu"
            >
              <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-md flex-shrink-0">
              {admin?.full_name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
                {admin?.full_name || 'Super Admin'}
              </p>
              <p className="text-xs text-gray-500 capitalize truncate">
                {admin?.role?.role_name?.replace(/_/g, ' ') || 'Demo Account'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 sm:p-4 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item) => (
            <div key={item.key || item.path} className="mb-1">
              {item.submenu ? (
                // Menu dengan submenu
                <div>
                  <button
                    onClick={() => toggleMenu(item.key)}
                    className="w-full flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-700 transition-all duration-200"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <item.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium truncate">{item.name}</span>
                    </div>
                    {isMenuExpanded(item.key) ? (
                      <ChevronDownIcon className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <ChevronRightIcon className="w-4 h-4 flex-shrink-0" />
                    )}
                  </button>
                  
                  {/* Submenu Items */}
                  {isMenuExpanded(item.key) && (
                    <div className="ml-3 sm:ml-4 mt-1 space-y-1">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm transition-all duration-200 ${
                            isActive(subItem.path)
                              ? 'bg-green-600 text-white font-medium shadow-md'
                              : 'text-gray-600 hover:bg-green-50 hover:text-green-700'
                          }`}
                        >
                          <span className="text-xs flex-shrink-0">→</span>
                          <span className="truncate">{subItem.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Menu tanpa submenu
                <Link
                  to={item.path}
                  className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-green-600 text-white font-medium shadow-md'
                      : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                  }`}
                >
                  <item.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium truncate">{item.name}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-3 sm:p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 font-medium"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="text-xs sm:text-sm">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebarNew;

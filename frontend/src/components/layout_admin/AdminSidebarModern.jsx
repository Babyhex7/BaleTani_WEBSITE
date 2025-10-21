import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  CubeIcon,
  ShoppingCartIcon,
  TruckIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  UserCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  TagIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ShoppingBagIcon,
  ComputerDesktopIcon,
  BuildingStorefrontIcon,
  DocumentTextIcon,
  BanknotesIcon,
  UserGroupIcon,
  DocumentChartBarIcon,
  FolderIcon,
  KeyIcon,
  ArrowRightOnRectangleIcon,
  PlusCircleIcon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';

const AdminSidebarModern = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState({
    'Products & Inventory': true, // Open by default
  });

  const toggleMenu = (menuName) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const handleLogout = () => {
    navigate('/login');
  };

  // Menu structure with permissions
  const menuItems = [
    {
      name: 'Dashboard',
      icon: HomeIcon,
      path: '/admin/dashboard',
      permission: null, // Available for all
    },
    {
      name: 'Products & Inventory',
      icon: CubeIcon,
      permission: 'products',
      submenu: [
        { name: 'Product List', path: '/admin/products', icon: ListBulletIcon },
        { name: 'Add Product', path: '/admin/products/new', icon: PlusCircleIcon },
        { name: 'Stock Overview', path: '/admin/inventory', icon: ClipboardDocumentListIcon },
        { name: 'Discount Management', path: '/admin/discounts', icon: TagIcon },
        { name: 'Category Management', path: '/admin/categories', icon: FolderIcon },
      ],
    },
    {
      name: 'Procurement',
      icon: TruckIcon,
      permission: 'procurement',
      submenu: [
        { name: 'Procurement List', path: '/admin/procurement', icon: ListBulletIcon },
        { name: 'Create Procurement', path: '/admin/procurement/new', icon: PlusCircleIcon },
        { name: 'Approval Status', path: '/admin/procurement/approvals', icon: CheckCircleIcon },
      ],
    },
    {
      name: 'Sales & Transactions',
      icon: ShoppingCartIcon,
      permission: 'orders',
      submenu: [
        { name: 'All Orders', path: '/admin/orders', icon: ShoppingBagIcon },
        { name: 'Online Orders', path: '/admin/orders/online', icon: ComputerDesktopIcon },
        { name: 'Offline Orders', path: '/admin/orders/offline', icon: BuildingStorefrontIcon },
        { name: 'B2B Orders', path: '/admin/orders/b2b', icon: DocumentTextIcon },
      ],
    },
    {
      name: 'Customers',
      icon: UsersIcon,
      permission: 'customers',
      submenu: [
        { name: 'Customer List', path: '/admin/customers', icon: UserGroupIcon },
      ],
    },
    {
      name: 'Reports & Insights',
      icon: ChartBarIcon,
      permission: 'reports',
      submenu: [
        { name: 'Sales Report', path: '/admin/reports/sales', icon: DocumentChartBarIcon },
        { name: 'Procurement Report', path: '/admin/reports/procurement', icon: DocumentTextIcon },
        { name: 'Inventory Report', path: '/admin/reports/inventory', icon: ClipboardDocumentListIcon },
        { name: 'Finance Summary', path: '/admin/reports/finance', icon: BanknotesIcon },
      ],
    },
    {
      name: 'System Settings',
      icon: CogIcon,
      permission: 'super_admin',
      submenu: [
        { name: 'Users & Roles', path: '/admin/users', icon: UserGroupIcon },
        { name: 'Logs & Soft Delete', path: '/admin/system-logs', icon: DocumentTextIcon },
        { name: 'Preferences', path: '/admin/settings', icon: CogIcon },
      ],
    },
    {
      name: 'Profile',
      icon: UserCircleIcon,
      permission: null,
      submenu: [
        { name: 'My Profile', path: '/admin/profile', icon: UserCircleIcon },
        { name: 'Change Password', path: '/admin/profile/change-password', icon: KeyIcon },
      ],
    },
  ];

  // No permission filtering for dummy UI branch - show all menus
  const filteredMenu = menuItems;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 h-screen bg-white border-r border-gray-200 shadow-lg transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static w-64 flex-shrink-0`}
      >
        <div className="h-full flex flex-col overflow-hidden">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-600 to-green-700">
            <h1 className="text-2xl font-bold text-white">BaléTani</h1>
            <p className="text-sm text-green-100 mt-1">Admin Panel</p>
          </div>

          {/* Admin Info */}
          <div className="p-4 bg-gradient-to-br from-green-50 to-white border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  Super Admin
                </p>
                <p className="text-xs text-gray-500 truncate">
                  Demo Account
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {filteredMenu.map((item) => (
              <div key={item.name}>
                {item.submenu ? (
                  // Menu with submenu
                  <>
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 text-gray-600" />
                        <span>{item.name}</span>
                      </div>
                      <div className="transition-transform duration-200">
                        {openMenus[item.name] ? (
                          <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        openMenus[item.name] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                        {item.submenu.map((subItem) => (
                          <NavLink
                            key={subItem.path}
                            to={subItem.path}
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                                isActive
                                  ? 'bg-green-50 text-green-700 font-medium border-l-2 border-green-600 -ml-2'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              }`
                            }
                          >
                            <subItem.icon className="w-4 h-4" />
                            <span>{subItem.name}</span>
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  // Single menu item
                  <NavLink
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </NavLink>
                )}
              </div>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200 border border-red-200 hover:border-red-300"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebarModern;

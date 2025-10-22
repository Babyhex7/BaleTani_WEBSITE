import React, { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/store_customer/useAuthStore";
import {
  HomeIcon,
  ShoppingCartIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  UserGroupIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import {
  hasPermission,
  PERMISSIONS,
  getRoleDisplayName,
  canManageOnlineOrders,
  canManageOfflineOrders,
  canApproveProcurement,
} from "../../utils/rolePermissions";

/**
 * AdminSidebarNew - Sidebar dengan role-based menu
 */
const AdminSidebarNew = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  // Define all menu items with permissions
  const allMenuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: HomeIcon,
      path: "/admin/dashboard",
      description: "Ringkasan dan statistik",
      permission: null, // Available for all admin roles
    },
    {
      id: "products",
      label: "Products",
      icon: CubeIcon,
      path: "/admin/products",
      description: "Manajemen Produk",
      permission: PERMISSIONS.VIEW_PRODUCTS,
    },
    {
      id: "orders",
      label: "Orders",
      icon: ShoppingCartIcon,
      path: "/admin/orders-new",
      description: "Manajemen Pesanan",
      permission: PERMISSIONS.VIEW_ORDERS,
      badge: () => {
        if (canManageOnlineOrders(user?.role) && !canManageOfflineOrders(user?.role)) {
          return "Online";
        } else if (!canManageOnlineOrders(user?.role) && canManageOfflineOrders(user?.role)) {
          return "Offline";
        }
        return null;
      },
    },
    {
      id: "customers",
      label: "Customers",
      icon: UserGroupIcon,
      path: "/admin/customers",
      description: "Data Pelanggan",
      permission: PERMISSIONS.VIEW_USERS,
    },
    {
      id: "procurement",
      label: "Procurement",
      icon: ClipboardDocumentListIcon,
      path: "/admin/procurement-new",
      description: "Pengadaan Barang",
      permission: PERMISSIONS.VIEW_PROCUREMENT,
      badge: () => (canApproveProcurement(user?.role) ? "Approval" : null),
    },
    {
      id: "reports",
      label: "Reports",
      icon: ChartBarIcon,
      path: "/admin/reports",
      description: "Laporan & Analitik",
      permission: PERMISSIONS.VIEW_REPORTS,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Cog6ToothIcon,
      path: "/admin/settings",
      description: "Pengaturan Sistem",
      permission: null, // Available for all
    },
  ];

  // Filter menu items based on user permissions
  const menuItems = useMemo(() => {
    if (!user?.role) return [];

    return allMenuItems.filter((item) => {
      // If no permission required, show to all admin roles
      if (!item.permission) return true;

      // Check if user has permission
      return hasPermission(user.role, item.permission);
    });
  }, [user?.role]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login");
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
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-green-600 to-green-700 text-white">
            <div className="flex items-center space-x-3">
              <img
                src="/BaleTani_Logo.png"
                alt="BaleTani"
                className="w-8 h-8 object-contain rounded-lg bg-white p-1"
              />
              <span className="text-xl font-bold">BaleTani</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-white hover:text-gray-200 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* User info */}
          <div className="px-6 py-4 bg-gradient-to-b from-gray-50 to-white border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">
                  {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
                </span>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.fullName || "Admin"}
                </p>
                <p className="text-xs text-gray-500 font-medium">
                  {getRoleDisplayName(user?.role)}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const badge = typeof item.badge === "function" ? item.badge() : null;

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`group flex items-center px-3 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? "bg-green-50 text-green-700 shadow-sm"
                      : "text-gray-700 hover:bg-gray-50 hover:text-green-600"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 transition-colors ${
                      isActive(item.path)
                        ? "text-green-600"
                        : "text-gray-400 group-hover:text-green-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">{item.label}</span>
                      {badge && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                          {badge}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {item.description}
                    </div>
                  </div>
                  {isActive(item.path) && (
                    <div className="w-1 h-8 bg-green-600 rounded-l-lg absolute right-0"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebarNew;

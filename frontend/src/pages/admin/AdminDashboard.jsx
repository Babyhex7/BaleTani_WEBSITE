import React, { useState, useEffect } from 'react';
import {
  CubeIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusCircleIcon,
  TruckIcon,
  CalendarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout_admin/AdminLayout';
import { Badge } from '../../components/ui_admin/CommonComponents';
import { formatCurrency, formatDateTime, mockProducts, mockProcurements } from '../../utils/mockProductData';
import useAdminStore from '../../store/store_admin/useAdminStore';
import { hasPermission, getRoleDisplayName } from '../../utils/rolePermissions';

/**
 * AdminDashboard - Halaman dashboard utama admin
 * Menampilkan statistik, grafik, notifikasi, dan akses cepat sesuai role
 */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const admin = useAdminStore((state) => state.admin);
  const userRole = admin?.role?.role_name;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate stats from mock data
  const stats = {
    totalProducts: mockProducts.filter(p => p.is_active).length,
    totalTransactionsToday: 23,
    totalSalesToday: 15750000,
    lowStockProducts: mockProducts.filter(p => p.total_stock > 0 && p.total_stock <= 10).length,
    outOfStockProducts: mockProducts.filter(p => p.total_stock === 0).length,
    pendingProcurements: mockProcurements.filter(p => p.status === 'pending').length,
    approvedProcurementsToday: mockProcurements.filter(p => p.status === 'approved').length,
    newOrdersToday: 12,
    onlineOrdersToday: 8,
    offlineOrdersToday: 4,
    pendingOrders: 5,
    totalRevenue: 45000000,
    monthlyRevenue: 450000000,
  };

  // Role-specific stat cards
  const getStatCards = () => {
    const allCards = [
      {
        id: 'products',
        title: 'Total Produk Aktif',
        value: stats.totalProducts,
        change: '+12% dari bulan lalu',
        icon: CubeIcon,
        gradient: 'from-blue-100 to-blue-200',
        iconColor: 'text-blue-600',
        roles: ['super_admin', 'super_inventory_admin', 'inventory_admin'],
      },
      {
        id: 'transactions',
        title: 'Transaksi Hari Ini',
        value: stats.totalTransactionsToday,
        change: '+8% dari kemarin',
        icon: ShoppingCartIcon,
        gradient: 'from-purple-100 to-purple-200',
        iconColor: 'text-purple-600',
        roles: ['super_admin', 'super_whatsapp_admin', 'super_cashier', 'whatsapp_admin', 'cashier', 'finance_admin'],
      },
      {
        id: 'sales',
        title: 'Nilai Penjualan Hari Ini',
        value: formatCurrency(stats.totalSalesToday),
        change: '+15% dari kemarin',
        icon: CurrencyDollarIcon,
        gradient: 'from-green-100 to-green-200',
        iconColor: 'text-green-600',
        valueSize: 'text-2xl',
        roles: ['super_admin', 'super_whatsapp_admin', 'super_cashier', 'finance_admin'],
      },
      {
        id: 'lowstock',
        title: 'Stok Menipis',
        value: stats.lowStockProducts,
        change: 'Perlu perhatian',
        icon: ExclamationTriangleIcon,
        gradient: 'from-yellow-100 to-yellow-200',
        iconColor: 'text-yellow-600',
        changeColor: 'text-yellow-600',
        roles: ['super_admin', 'super_inventory_admin', 'inventory_admin'],
      },
      {
        id: 'online_orders',
        title: 'Pesanan Online Hari Ini',
        value: stats.onlineOrdersToday,
        change: '+3 dari kemarin',
        icon: ShoppingCartIcon,
        gradient: 'from-indigo-100 to-indigo-200',
        iconColor: 'text-indigo-600',
        roles: ['super_whatsapp_admin', 'whatsapp_admin'],
      },
      {
        id: 'offline_orders',
        title: 'Pesanan Offline Hari Ini',
        value: stats.offlineOrdersToday,
        change: '+1 dari kemarin',
        icon: ShoppingCartIcon,
        gradient: 'from-amber-100 to-amber-200',
        iconColor: 'text-amber-600',
        roles: ['super_cashier', 'cashier'],
      },
      {
        id: 'pending_procurements',
        title: 'Procurement Pending',
        value: stats.pendingProcurements,
        change: 'Menunggu approval',
        icon: TruckIcon,
        gradient: 'from-rose-100 to-rose-200',
        iconColor: 'text-rose-600',
        changeColor: 'text-rose-600',
        roles: ['super_admin', 'super_inventory_admin'],
      },
      {
        id: 'monthly_revenue',
        title: 'Revenue Bulan Ini',
        value: formatCurrency(stats.monthlyRevenue),
        change: '+18% dari bulan lalu',
        icon: ChartBarIcon,
        gradient: 'from-emerald-100 to-emerald-200',
        iconColor: 'text-emerald-600',
        valueSize: 'text-2xl',
        roles: ['finance_admin'],
      },
    ];

    // Filter cards based on user role
    if (!userRole) return allCards.slice(0, 4);
    
    return allCards.filter(card => 
      userRole === 'super_admin' || card.roles.includes(userRole)
    );
  };

  const visibleStatCards = getStatCards();

  // Recent activities / notifications
  const notifications = [
    {
      id: 1,
      type: 'procurement',
      icon: TruckIcon,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      title: 'Procurement Pending Approval',
      description: `${stats.pendingProcurements} procurement menunggu persetujuan`,
      time: '5 menit yang lalu',
      action: () => navigate('/admin/procurement'),
    },
    {
      id: 2,
      type: 'stock',
      icon: ExclamationTriangleIcon,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-100',
      title: 'Stok Menipis',
      description: `${stats.lowStockProducts} produk dengan stok menipis`,
      time: '15 menit yang lalu',
      action: () => navigate('/admin/inventory'),
    },
    {
      id: 3,
      type: 'order',
      icon: ShoppingCartIcon,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
      title: 'Pesanan Baru',
      description: '3 pesanan baru menunggu konfirmasi',
      time: '30 menit yang lalu',
      action: () => navigate('/admin/orders'),
    },
    {
      id: 4,
      type: 'out_of_stock',
      icon: XCircleIcon,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-100',
      title: 'Stok Habis',
      description: `${stats.outOfStockProducts} produk kehabisan stok`,
      time: '1 jam yang lalu',
      action: () => navigate('/admin/products'),
    },
  ];

  // Quick actions - filtered by role
  const getAllQuickActions = () => {
    return [
      {
        name: 'Tambah Produk',
        icon: PlusCircleIcon,
        color: 'bg-gradient-to-br from-green-600 to-green-700',
        action: () => navigate('/admin/products'),
        permission: 'manage_products',
      },
      {
        name: 'Buat Procurement',
        icon: TruckIcon,
        color: 'bg-gradient-to-br from-blue-600 to-blue-700',
        action: () => navigate('/admin/procurement-new'),
        permission: 'create_procurement',
      },
      {
        name: 'Lihat Pesanan',
        icon: ShoppingCartIcon,
        color: 'bg-gradient-to-br from-purple-600 to-purple-700',
        action: () => navigate('/admin/orders-new'),
        permission: 'view_orders',
      },
      {
        name: 'Laporan Keuangan',
        icon: CurrencyDollarIcon,
        color: 'bg-gradient-to-br from-yellow-600 to-yellow-700',
        action: () => navigate('/admin/reports/finance'),
        permission: 'view_finance_reports',
      },
      {
        name: 'Kelola Inventory',
        icon: CubeIcon,
        color: 'bg-gradient-to-br from-rose-600 to-rose-700',
        action: () => navigate('/admin/inventory'),
        permission: 'manage_inventory',
      },
      {
        name: 'Data Pelanggan',
        icon: UserGroupIcon,
        color: 'bg-gradient-to-br from-indigo-600 to-indigo-700',
        action: () => navigate('/admin/customers'),
        permission: 'view_customers',
      },
    ];
  };

  const quickActions = getAllQuickActions().filter(action => 
    hasPermission(userRole, action.permission)
  );

  // Recent low stock products
  const lowStockItems = mockProducts
    .filter(p => p.total_stock > 0 && p.total_stock <= 10)
    .slice(0, 5);

  // Recent pending procurements
  const pendingProcurements = mockProcurements
    .filter(p => p.status === 'pending')
    .slice(0, 5);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Selamat datang kembali, <span className="font-semibold">{getRoleDisplayName(userRole)}</span>!
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-gray-600">
              <CalendarIcon className="w-5 h-5" />
              <span className="text-sm">
                {currentDate.toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 mt-1">
              <ClockIcon className="w-4 h-4" />
              <span className="text-sm">
                {currentDate.toLocaleTimeString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards - Dynamic based on role */}
        <div className={`grid grid-cols-1 md:grid-cols-2 ${visibleStatCards.length > 2 ? 'lg:grid-cols-4' : 'lg:grid-cols-2'} gap-6`}>
          {visibleStatCards.map((card) => (
            <div key={card.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className={`${card.valueSize || 'text-3xl'} font-bold text-gray-900 mt-2`}>
                    {card.value}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowTrendingUpIcon className={`w-4 h-4 ${card.changeColor || 'text-green-600'}`} />
                    <span className={`text-xs ${card.changeColor || 'text-green-600'} font-medium`}>
                      {card.change}
                    </span>
                  </div>
                </div>
                <div className={`p-4 bg-gradient-to-br ${card.gradient} rounded-xl`}>
                  <card.icon className={`w-8 h-8 ${card.iconColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions - Role-based */}
        {quickActions.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Akses Cepat</h2>
            <div className={`grid grid-cols-2 ${quickActions.length > 3 ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-4`}>
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`p-4 ${action.color} hover:scale-105 transition-transform rounded-xl shadow-sm hover:shadow-md text-white`}
                >
                  <action.icon className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-medium text-center">{action.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notifications - Show only if user has relevant permissions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Notifikasi & Aktivitas</h2>
              <Badge variant="warning" size="sm">
                {notifications.filter(n => {
                  if (n.type === 'procurement') return hasPermission(userRole, 'approve_procurement');
                  if (n.type === 'stock' || n.type === 'out_of_stock') return hasPermission(userRole, 'manage_inventory');
                  if (n.type === 'order') return hasPermission(userRole, 'view_orders');
                  return true;
                }).length} Baru
              </Badge>
            </div>
            <div className="space-y-3">
              {notifications
                .filter(n => {
                  if (n.type === 'procurement') return hasPermission(userRole, 'approve_procurement');
                  if (n.type === 'stock' || n.type === 'out_of_stock') return hasPermission(userRole, 'manage_inventory');
                  if (n.type === 'order') return hasPermission(userRole, 'view_orders');
                  return userRole === 'super_admin';
                })
                .map((notif) => (
                  <div
                    key={notif.id}
                    onClick={notif.action}
                    className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-gray-100"
                  >
                    <div className={`p-2 ${notif.bgColor} rounded-lg`}>
                      <notif.icon className={`w-5 h-5 ${notif.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{notif.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{notif.description}</p>
                      <p className="text-xs text-gray-400 mt-2">{notif.time}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Low Stock Products - Only for inventory roles */}
          {hasPermission(userRole, 'manage_inventory') && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Stok Menipis</h2>
                <button
                  onClick={() => navigate('/admin/inventory')}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  Lihat Semua →
                </button>
              </div>
              <div className="space-y-3">
                {lowStockItems.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images[0]?.image_url || 'https://via.placeholder.com/50'}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.category_name}</p>
                      </div>
                    </div>
                    <Badge variant={product.total_stock === 0 ? 'danger' : 'warning'} size="sm">
                      {product.total_stock} {product.unit}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pending Procurements - Only for super_inventory_admin */}
        {hasPermission(userRole, 'approve_procurement') && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Procurement Menunggu Approval</h2>
              <button
                onClick={() => navigate('/admin/procurement-new')}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Lihat Semua →
              </button>
            </div>
            {pendingProcurements.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Kode Procurement
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Supplier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Total Nilai
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingProcurements.map((proc) => (
                      <tr key={proc.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {proc.procurement_code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {proc.supplier_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {formatCurrency(proc.total_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="warning" size="sm">
                            <ClockIcon className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => navigate(`/admin/procurement-new`)}
                            className="text-green-600 hover:text-green-700 font-medium"
                          >
                            Review →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircleIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>Tidak ada procurement yang menunggu approval</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
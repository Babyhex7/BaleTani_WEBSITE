import React, { useEffect, useState } from 'react';
import {
  CubeIcon,
  ShoppingCartIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  EnvelopeIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlusIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import AdminSidebarNew from '../../components/layout_admin/AdminSidebarNew';
import AdminHeaderNew from '../../components/layout_admin/AdminHeaderNew';
import StatCardNew from '../../components/ui_admin/StatCardNew';
import dashboardService from '../../services/services_admin/dashboardService';
import useAdminStore from '../../store/store_admin/useAdminStore';

const AdminDashboardNew = () => {
  const { admin } = useAdminStore();
  
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockItems: 0,
    totalCustomers: 0,
    activeProducts: 0,
    pendingProcurements: 0,
    unreadMessages: 0,
    monthlyGrowth: {
      orders: 0,
      revenue: 0
    }
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingStock, setLoadingStock] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setLoadingOrders(true);
      setLoadingStock(true);

      // Fetch all data in parallel
      const [statsResponse, ordersResponse, stockResponse] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentOrders(5),
        dashboardService.getLowStockProducts(5)
      ]);
      
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (ordersResponse.success) {
        setRecentOrders(ordersResponse.data);
      }

      if (stockResponse.success) {
        setLowStockProducts(stockResponse.data);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Gagal memuat data dashboard');
    } finally {
      setLoading(false);
      setLoadingOrders(false);
      setLoadingStock(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: { color: 'bg-green-100 text-green-700', label: 'Lunas' },
      pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
      failed: { color: 'bg-red-100 text-red-700', label: 'Gagal' },
      completed: { color: 'bg-blue-100 text-blue-700', label: 'Selesai' },
      processing: { color: 'bg-purple-100 text-purple-700', label: 'Diproses' },
      cancelled: { color: 'bg-gray-100 text-gray-700', label: 'Dibatalkan' }
    };
    
    return statusConfig[status] || statusConfig.pending;
  };

  const getStockStatus = (stock) => {
    if (stock <= 5) return { color: 'text-red-600 bg-red-50', label: 'Kritis', icon: ExclamationTriangleIcon };
    if (stock <= 10) return { color: 'text-yellow-600 bg-yellow-50', label: 'Rendah', icon: ClockIcon };
    return { color: 'text-green-600 bg-green-50', label: 'Aman', icon: CheckCircleIcon };
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <AdminSidebarNew />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <AdminHeaderNew 
          title="Dashboard" 
          subtitle="Ringkasan dan Statistik Toko"
        />

        {/* Content */}
        <div className="flex-1 p-4 md:p-6 bg-gray-50">

          {/* Stats Cards - 8 KPIs */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 md:mb-6">
              <p className="text-red-600 text-sm">{error}</p>
              <button 
                onClick={fetchDashboardData}
                className="mt-2 text-sm text-red-700 hover:text-red-800 font-medium"
              >
                Coba Lagi
              </button>
            </div>
          ) : (
            <>
              {/* Row 1: Primary Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-6">
                <StatCardNew
                  title="Pendapatan Hari Ini"
                  value={formatCurrency(stats.totalRevenue)}
                  trend={`${stats.monthlyGrowth?.revenue > 0 ? '+' : ''}${stats.monthlyGrowth?.revenue || 0}%`}
                  trendDirection={stats.monthlyGrowth?.revenue >= 0 ? "up" : "down"}
                  description="dari bulan lalu"
                  icon={BanknotesIcon}
                  iconBgColor="bg-green-100"
                  iconColor="text-green-600"
                />

                <StatCardNew
                  title="Transaksi Hari Ini"
                  value={stats.totalOrders || 0}
                  trend={`${stats.monthlyGrowth?.orders > 0 ? '+' : ''}${stats.monthlyGrowth?.orders || 0}%`}
                  trendDirection={stats.monthlyGrowth?.orders >= 0 ? "up" : "down"}
                  description="dari bulan lalu"
                  icon={ShoppingCartIcon}
                  iconBgColor="bg-purple-100"
                  iconColor="text-purple-600"
                />

                <StatCardNew
                  title="Total Pelanggan"
                  value={stats.totalCustomers || 0}
                  trend="Customer base"
                  trendDirection="up"
                  description="terdaftar"
                  icon={UsersIcon}
                  iconBgColor="bg-blue-100"
                  iconColor="text-blue-600"
                />

                <StatCardNew
                  title="Produk Aktif"
                  value={stats.activeProducts || 0}
                  trend="Ready to sell"
                  trendDirection="up"
                  description="siap dijual"
                  icon={CubeIcon}
                  iconBgColor="bg-indigo-100"
                  iconColor="text-indigo-600"
                />
              </div>

              {/* Row 2: Action Required Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
                <StatCardNew
                  title="Pengadaan Pending"
                  value={stats.pendingProcurements || 0}
                  trend="Perlu approval"
                  trendDirection={stats.pendingProcurements > 0 ? "down" : "up"}
                  icon={ClipboardDocumentListIcon}
                  iconBgColor="bg-teal-100"
                  iconColor="text-teal-600"
                />

                <StatCardNew
                  title="Pembayaran Pending"
                  value={stats.pendingOrders || 0}
                  trend="Menunggu konfirmasi"
                  trendDirection={stats.pendingOrders > 0 ? "down" : "up"}
                  icon={ClockIcon}
                  iconBgColor="bg-orange-100"
                  iconColor="text-orange-600"
                />
              </div>
            </>
          )}

          {/* Recent Orders & Low Stock - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 md:mb-6">
            {/* Recent Orders Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 md:px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <ShoppingCartIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-base md:text-lg font-semibold text-gray-800">
                      Pesanan Terbaru
                    </h3>
                  </div>
                  <Link to="/admin/orders">
                    <button className="text-xs md:text-sm text-green-600 hover:text-green-700 font-medium">
                      Lihat Semua →
                    </button>
                  </Link>
                </div>
              </div>
              <div className="overflow-x-auto">
                {loadingOrders ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-t-transparent mx-auto"></div>
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <ShoppingCartIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">Belum ada pesanan hari ini</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pelanggan
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                          Total
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentOrders.map((order) => {
                        const statusBadge = getStatusBadge(order.payment_status);
                        return (
                          <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                #{order.id}
                              </div>
                              <div className="text-xs text-gray-500 md:hidden">
                                {formatCurrency(order.total_amount)}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-900 truncate max-w-[120px] md:max-w-[200px]">
                                {order.customer_name || 'Guest'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatDate(order.created_at).split(',')[0]}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                              <div className="text-sm font-semibold text-gray-900">
                                {formatCurrency(order.total_amount)}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
                                {statusBadge.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Low Stock Products Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 md:px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                    </div>
                    <h3 className="text-base md:text-lg font-semibold text-gray-800">
                      Stok Menipis
                    </h3>
                  </div>
                  <Link to="/admin/products">
                    <button className="text-xs md:text-sm text-green-600 hover:text-green-700 font-medium">
                      Kelola Stok →
                    </button>
                  </Link>
                </div>
              </div>
              <div className="overflow-x-auto">
                {loadingStock ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-t-transparent mx-auto"></div>
                  </div>
                ) : lowStockProducts.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <CheckCircleIcon className="w-12 h-12 mx-auto mb-3 text-green-300" />
                    <p className="text-sm">Semua produk stoknya aman</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Produk
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                          Kategori
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stok
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {lowStockProducts.map((product) => {
                        const stockStatus = getStockStatus(product.total_stock);
                        const StatusIcon = stockStatus.icon;
                        return (
                          <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-gray-900 truncate max-w-[120px] md:max-w-[200px]">
                                {product.name}
                              </div>
                              <div className="text-xs text-gray-500 md:hidden">
                                {product.category}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                              <div className="text-sm text-gray-600">
                                {product.category}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900">
                                {product.total_stock} unit
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                                <StatusIcon className="w-3 h-3" />
                                {stockStatus.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <PlusIcon className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-gray-800">
                Aksi Cepat
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link to="/admin/products">
                <button className="w-full p-3 md:p-4 bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-lg transition-all duration-200 hover:shadow-sm group">
                  <CubeIcon className="w-6 h-6 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs md:text-sm font-medium text-gray-700">Product List</p>
                </button>
              </Link>
              <Link to="/admin/orders">
                <button className="w-full p-3 md:p-4 bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-lg transition-all duration-200 hover:shadow-sm group">
                  <ShoppingCartIcon className="w-6 h-6 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs md:text-sm font-medium text-gray-700">Orders</p>
                </button>
              </Link>
              <Link to="/admin/procurements">
                <button className="w-full p-3 md:p-4 bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-lg transition-all duration-200 hover:shadow-sm group">
                  <ClipboardDocumentListIcon className="w-6 h-6 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs md:text-sm font-medium text-gray-700">Procurement</p>
                </button>
              </Link>
              <Link to="/admin/reports/sales">
                <button className="w-full p-3 md:p-4 bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-lg transition-all duration-200 hover:shadow-sm group">
                  <ArrowTrendingUpIcon className="w-6 h-6 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs md:text-sm font-medium text-gray-700">Sales Report</p>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardNew;

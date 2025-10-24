import React, { useEffect, useState } from 'react';
import {
  CubeIcon,
  ShoppingCartIcon,
  BanknotesIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import AdminSidebarNew from '../../components/layout_admin/AdminSidebarNew';
import AdminHeaderNew from '../../components/layout_admin/AdminHeaderNew';
import StatCardNew from '../../components/ui_admin/StatCardNew';
import dashboardService from '../../services/services_admin/dashboardService';

const AdminDashboardNew = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockItems: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getStats();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.message || 'Gagal memuat statistik');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
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
        <div className="flex-1 p-6">
          {/* Welcome Message */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-lg p-6 mb-6 text-white">
            <h2 className="text-2xl font-bold mb-2">Selamat datang kembali, !</h2>
            <p className="text-green-100">
              Berikut adalah ringkasan aktivitas toko hari ini
            </p>
          </div>

          {/* Stats Cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <StatCardNew
                title="Transaksi Hari Ini"
                value={stats.totalOrders || 0}
                trend="+8%"
                trendDirection="up"
                description="dari kemarin"
                icon={ShoppingCartIcon}
                iconBgColor="bg-purple-100"
                iconColor="text-purple-600"
              />

              <StatCardNew
                title="Nilai Penjualan Hari Ini"
                value={formatCurrency(stats.totalRevenue)}
                trend="+15%"
                trendDirection="up"
                description="dari kemarin"
                icon={BanknotesIcon}
                iconBgColor="bg-green-100"
                iconColor="text-green-600"
              />

              <StatCardNew
                title="Stok Menipis"
                value={stats.lowStockItems || 0}
                trend="Perlu perhatian"
                trendDirection="down"
                icon={ExclamationTriangleIcon}
                iconBgColor="bg-yellow-100"
                iconColor="text-yellow-600"
              />

              <StatCardNew
                title="Total Produk Aktif"
                value="9"
                trend="+12%"
                trendDirection="up"
                description="dari bulan lalu"
                icon={CubeIcon}
                iconBgColor="bg-blue-100"
                iconColor="text-blue-600"
              />
            </div>
          )}

          {/* Notifikasi & Aktivitas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notifikasi */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Notifikasi & Aktivitas
                  </h3>
                  <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
                    0 Baru
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">Tidak ada notifikasi baru</p>
                </div>
              </div>
            </div>

            {/* Produk Stok Menipis */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Produk Stok Menipis
                </h3>
              </div>
              <div className="p-6">
                {stats.lowStockItems === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">Semua produk stoknya aman</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Ada {stats.lowStockItems} produk yang perlu direstock
                    </p>
                    <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                      Lihat Detail →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardNew;

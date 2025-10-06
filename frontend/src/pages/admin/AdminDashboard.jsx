import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout_admin/AdminLayout';
import StatCard from '../../components/ui_admin/StatCard';
import Table from '../../components/ui_admin/Table';
import { LoadingSpinner, Alert, Badge } from '../../components/ui_admin/CommonComponents';
import { getDashboardStats, getRecentOrders, getLowStockProducts } from '../../services/services_admin/dashboardService';

/**
 * Halaman Dashboard Admin - Ringkasan dan Statistik
 * Menampilkan overview performa toko dan data penting
 */
const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data untuk development (akan diganti dengan API call)
  const mockStats = {
    totalOrders: 156,
    totalRevenue: 12500000,
    pendingOrders: 23,
    lowStockItems: 8,
    totalCustomers: 89,
    monthlyGrowth: {
      orders: 15,
      revenue: 22,
      customers: 8
    }
  };

  const mockRecentOrders = [
    {
      id: 1,
      customer_name: 'Budi Santoso',
      total_price: 150000,
      status: 'pending',
      created_at: '2025-01-05 14:30:00',
      items_count: 3
    },
    {
      id: 2,
      customer_name: 'Siti Aminah',
      total_price: 250000,
      status: 'paid',
      created_at: '2025-01-05 13:15:00',
      items_count: 5
    },
    {
      id: 3,
      customer_name: 'Ahmad Rahman',
      total_price: 75000,
      status: 'cancelled',
      created_at: '2025-01-05 12:00:00',
      items_count: 2
    }
  ];

  const mockLowStockProducts = [
    {
      id: 1,
      name: 'Benih Padi Unggul',
      stock: 5,
      category: 'Benih',
      min_stock: 20
    },
    {
      id: 2,
      name: 'Pupuk NPK 16-16-16',
      stock: 3,
      category: 'Pupuk',
      min_stock: 15
    },
    {
      id: 3,
      name: 'Pestisida Organik',
      stock: 8,
      category: 'Pestisida',
      min_stock: 25
    }
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load data in parallel for better performance
      const [statsResponse, ordersResponse, lowStockResponse] = await Promise.all([
        getDashboardStats(),
        getRecentOrders(5),
        getLowStockProducts(10)
      ]);

      // Set real data from API
      setStats(statsResponse.data);
      setRecentOrders(ordersResponse.data.orders || []);
      setLowStockProducts(lowStockResponse.data.products || []);

      /* 
      // Implementasi sesungguhnya ketika backend sudah ready:
      const [statsData, ordersData, stockData] = await Promise.all([
        getDashboardStats(),
        getRecentOrders(5),
        getLowStockProducts(10)
      ]);
      
      setStats(statsData);
      setRecentOrders(ordersData);
      setLowStockProducts(stockData);
      */

    } catch (err) {
      setError(err.message || 'Gagal memuat data dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  // Kolom untuk tabel recent orders
  const orderColumns = [
    {
      key: 'customer_name',
      label: 'Pelanggan',
      sortable: true
    },
    {
      key: 'total_price',
      label: 'Total',
      render: (value) => `Rp ${value.toLocaleString('id-ID')}`
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusMap = {
          pending: { variant: 'warning', text: 'Pending' },
          paid: { variant: 'success', text: 'Dibayar' },
          cancelled: { variant: 'danger', text: 'Dibatalkan' }
        };
        const status = statusMap[value] || { variant: 'default', text: value };
        return <Badge variant={status.variant}>{status.text}</Badge>;
      }
    },
    {
      key: 'created_at',
      label: 'Waktu',
      render: (value) => new Date(value).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  ];

  // Kolom untuk tabel low stock products
  const stockColumns = [
    {
      key: 'name',
      label: 'Produk',
      sortable: true
    },
    {
      key: 'category',
      label: 'Kategori'
    },
    {
      key: 'stock',
      label: 'Stok Saat Ini',
      render: (value, row) => (
        <span className={`font-medium ${value <= 5 ? 'text-red-600' : 'text-yellow-600'}`}>
          {value} unit
        </span>
      )
    },
    {
      key: 'min_stock',
      label: 'Min. Stok',
      render: (value) => `${value} unit`
    }
  ];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="xl" />
          <span className="ml-3 text-gray-600">Memuat dashboard...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Error Alert */}
        {error && (
          <Alert 
            type="error" 
            title="Gagal Memuat Data"
            message={error}
            onClose={() => setError(null)}
          />
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Pesanan Hari Ini"
            value={stats?.totalOrders || 0}
            icon="🛒"
            trend="up"
            trendValue={`+${stats?.monthlyGrowth?.orders || 0}%`}
            color="blue"
          />
          <StatCard
            title="Total Penjualan"
            value={`Rp ${(stats?.totalRevenue || 0).toLocaleString('id-ID')}`}
            icon="💰"
            trend="up"
            trendValue={`+${stats?.monthlyGrowth?.revenue || 0}%`}
            color="green"
          />
          <StatCard
            title="Pesanan Pending"
            value={stats?.pendingOrders || 0}
            icon="⏳"
            color="yellow"
          />
          <StatCard
            title="Stok Menipis"
            value={stats?.lowStockItems || 0}
            icon="⚠️"
            color="red"
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Pesanan Terbaru</h3>
              <p className="text-sm text-gray-500">5 pesanan terakhir yang masuk</p>
            </div>
            <div className="p-6">
              <Table
                columns={orderColumns}
                data={recentOrders}
                emptyMessage="Belum ada pesanan hari ini"
              />
              <div className="mt-4 text-center">
                <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                  Lihat Semua Pesanan →
                </button>
              </div>
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Peringatan Stok</h3>
              <p className="text-sm text-gray-500">Produk dengan stok menipis</p>
            </div>
            <div className="p-6">
              <Table
                columns={stockColumns}
                data={lowStockProducts}
                emptyMessage="Semua produk memiliki stok yang cukup"
              />
              <div className="mt-4 text-center">
                <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                  Kelola Inventory →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Aksi Cepat</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-center">
                <div className="text-2xl mb-2">📦</div>
                <div className="text-sm font-medium text-gray-900">Tambah Produk</div>
              </div>
            </button>
            <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-center">
                <div className="text-2xl mb-2">👥</div>
                <div className="text-sm font-medium text-gray-900">Kelola User</div>
              </div>
            </button>
            <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="text-sm font-medium text-gray-900">Lihat Laporan</div>
              </div>
            </button>
            <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-center">
                <div className="text-2xl mb-2">⚙️</div>
                <div className="text-sm font-medium text-gray-900">Pengaturan</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
import React, { useState } from 'react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '../../components/layout_admin/AdminLayout';
import { Badge } from '../../components/ui_admin/CommonComponents';
import { formatCurrency, formatDate } from '../../utils/mockProductData';

/**
 * SalesReport - Laporan penjualan harian/bulanan
 * Untuk Finance Admin & Super Admin
 */
const SalesReport = () => {
  const [dateFrom, setDateFrom] = useState('2025-01-01');
  const [dateTo, setDateTo] = useState('2025-01-31');
  const [reportType, setReportType] = useState('daily');

  // Mock sales data
  const salesData = {
    summary: {
      totalRevenue: 45750000,
      totalOrders: 127,
      avgOrderValue: 360236,
      totalProducts: 458,
      topProduct: 'Pupuk Urea 50kg',
      topProductSales: 12500000,
    },
    dailySales: [
      { date: '2025-01-01', orders: 8, revenue: 2750000, products: 24 },
      { date: '2025-01-02', orders: 12, revenue: 3890000, products: 36 },
      { date: '2025-01-03', orders: 6, revenue: 1950000, products: 18 },
      { date: '2025-01-04', orders: 15, revenue: 4560000, products: 42 },
      { date: '2025-01-05', orders: 10, revenue: 3120000, products: 30 },
    ],
    topProducts: [
      { name: 'Pupuk Urea 50kg', qty: 45, revenue: 12500000 },
      { name: 'Benih Padi Hibrida', qty: 120, revenue: 9600000 },
      { name: 'Pestisida Organik 1L', qty: 67, revenue: 8375000 },
      { name: 'Pupuk NPK 25kg', qty: 38, revenue: 6840000 },
      { name: 'Herbisida Rumput 500ml', qty: 52, revenue: 4680000 },
    ],
    salesByCategory: [
      { category: 'Pupuk', orders: 48, revenue: 18500000, percentage: 40.4 },
      { category: 'Benih', orders: 35, revenue: 13200000, percentage: 28.8 },
      { category: 'Pestisida', orders: 28, revenue: 9800000, percentage: 21.4 },
      { category: 'Alat Pertanian', orders: 16, revenue: 4250000, percentage: 9.3 },
    ],
  };

  const handleExport = () => {
    alert('Export to CSV/Excel - Feature coming soon!');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sales Report</h1>
            <p className="text-gray-600 mt-1">Laporan penjualan dan analisis produk terlaris</p>
          </div>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Export Report
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dari Tanggal</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sampai Tanggal</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Report</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="daily">Harian</option>
                <option value="weekly">Mingguan</option>
                <option value="monthly">Bulanan</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => alert('Filter applied!')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Tampilkan Report
              </button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(salesData.summary.totalRevenue)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">+15% vs last month</span>
                </div>
              </div>
              <div className="p-4 bg-green-100 rounded-xl">
                <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{salesData.summary.totalOrders}</p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-blue-600 font-medium">+8% vs last month</span>
                </div>
              </div>
              <div className="p-4 bg-blue-100 rounded-xl">
                <ShoppingCartIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(salesData.summary.avgOrderValue)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-purple-600" />
                  <span className="text-xs text-purple-600 font-medium">+5% vs last month</span>
                </div>
              </div>
              <div className="p-4 bg-purple-100 rounded-xl">
                <ChartBarIcon className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Products Sold</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{salesData.summary.totalProducts}</p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-yellow-600" />
                  <span className="text-xs text-yellow-600 font-medium">+12% vs last month</span>
                </div>
              </div>
              <div className="p-4 bg-yellow-100 rounded-xl">
                <CalendarIcon className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Daily Sales Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Penjualan Harian</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {salesData.dailySales.map((day, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatDate(day.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{day.orders} orders</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{day.products} items</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      {formatCurrency(day.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Produk Terlaris</h2>
            <div className="space-y-3">
              {salesData.topProducts.map((product, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">Terjual: {product.qty} unit</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-green-600">{formatCurrency(product.revenue)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sales by Category */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Penjualan per Kategori</h2>
            <div className="space-y-4">
              {salesData.salesByCategory.map((cat, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{cat.category}</p>
                      <p className="text-xs text-gray-500">{cat.orders} orders</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(cat.revenue)}</p>
                      <p className="text-xs text-gray-500">{cat.percentage}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SalesReport;

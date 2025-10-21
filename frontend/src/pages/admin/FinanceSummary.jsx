import React, { useState } from 'react';
import {
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '../../components/layout_admin/AdminLayout';
import { formatCurrency } from '../../utils/mockProductData';

/**
 * FinanceSummary - Ringkasan keuangan (pembelian vs penjualan, laba kotor)
 */
const FinanceSummary = () => {
  const [period, setPeriod] = useState('monthly');
  const [year, setYear] = useState('2025');

  const financialData = {
    summary: {
      totalRevenue: 125750000,
      totalCost: 87500000,
      grossProfit: 38250000,
      profitMargin: 30.4,
      netProfit: 32150000,
    },
    monthlyData: [
      { month: 'Jan', revenue: 45750000, cost: 32100000, profit: 13650000 },
      { month: 'Feb', revenue: 52300000, cost: 36800000, profit: 15500000 },
      { month: 'Mar', revenue: 48900000, cost: 34200000, profit: 14700000 },
      { month: 'Apr', revenue: 55600000, cost: 38900000, profit: 16700000 },
      { month: 'May', revenue: 51200000, cost: 35700000, profit: 15500000 },
      { month: 'Jun', revenue: 58400000, cost: 40800000, profit: 17600000 },
    ],
    breakdown: {
      revenue: {
        online: 62875000,
        offline: 45750000,
        b2b: 17125000,
      },
      costs: {
        procurement: 72500000,
        operational: 10000000,
        marketing: 3000000,
        other: 2000000,
      },
    },
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Finance Summary</h1>
            <p className="text-gray-600 mt-1">Ringkasan keuangan & analisis laba rugi</p>
          </div>
          <button
            onClick={() => alert('Export to PDF/Excel')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Export Report
          </button>
        </div>

        {/* Period Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex gap-4">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="daily">Harian</option>
              <option value="weekly">Mingguan</option>
              <option value="monthly">Bulanan</option>
              <option value="yearly">Tahunan</option>
            </select>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(financialData.summary.totalRevenue)}</p>
            <div className="flex items-center gap-1 mt-2">
              <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-600 font-medium">+15% vs last period</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total Cost</p>
              <ArrowTrendingDownIcon className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(financialData.summary.totalCost)}</p>
            <div className="flex items-center gap-1 mt-2">
              <ArrowTrendingUpIcon className="w-4 h-4 text-red-600" />
              <span className="text-xs text-red-600 font-medium">+8% vs last period</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Gross Profit</p>
              <ChartBarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(financialData.summary.grossProfit)}</p>
            <div className="flex items-center gap-1 mt-2">
              <ArrowTrendingUpIcon className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-blue-600 font-medium">+22% vs last period</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Profit Margin</p>
              <CalendarIcon className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-purple-600">{financialData.summary.profitMargin}%</p>
            <div className="flex items-center gap-1 mt-2">
              <ArrowTrendingUpIcon className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-purple-600 font-medium">+2.3% vs last period</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Net Profit</p>
              <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(financialData.summary.netProfit)}</p>
            <div className="flex items-center gap-1 mt-2">
              <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-600 font-medium">+18% vs last period</span>
            </div>
          </div>
        </div>

        {/* Monthly Profit Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Laba Kotor Bulanan</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bulan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {financialData.monthlyData.map((data, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{data.month}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                      {formatCurrency(data.revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                      {formatCurrency(data.cost)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-bold">
                      {formatCurrency(data.profit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {((data.profit / data.revenue) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Revenue Breakdown</h2>
            <div className="space-y-4">
              {Object.entries(financialData.breakdown.revenue).map(([key, value]) => {
                const total = Object.values(financialData.breakdown.revenue).reduce((a, b) => a + b, 0);
                const percentage = (value / total * 100).toFixed(1);
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 capitalize">{key}</span>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{formatCurrency(value)}</p>
                        <p className="text-xs text-gray-500">{percentage}%</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Cost Breakdown</h2>
            <div className="space-y-4">
              {Object.entries(financialData.breakdown.costs).map(([key, value]) => {
                const total = Object.values(financialData.breakdown.costs).reduce((a, b) => a + b, 0);
                const percentage = (value / total * 100).toFixed(1);
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 capitalize">{key}</span>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{formatCurrency(value)}</p>
                        <p className="text-xs text-gray-500">{percentage}%</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default FinanceSummary;

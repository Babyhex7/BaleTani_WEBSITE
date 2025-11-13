import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import adminApiClient from '../../services/services_admin/adminApiClient';
import {
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

const FinanceReport = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  // Filters
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 12);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = {
        startDate,
        endDate
      };
      
      const response = await adminApiClient.get('/admin/reports/finance', { params });
      
      if (response.data.success) {
        setReportData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching finance report:', error);
      toast.error('Gagal memuat laporan keuangan');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    fetchReport();
  };

  const handleExport = () => {
    toast.success('Export fitur akan segera tersedia');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatMonth = (monthString) => {
    const [year, month] = monthString.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('id-ID', {
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading && !reportData) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Filters */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Akhir
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={handleApplyFilter}
              disabled={loading}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <MagnifyingGlassIcon className="w-4 h-4" />
              Terapkan
            </button>
            <button
              onClick={handleExport}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {reportData && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Pendapatan</p>
                  <p className="text-2xl font-bold text-blue-900 mt-2">
                    {formatCurrency(reportData.summary.totalRevenue)}
                  </p>
                </div>
                <CurrencyDollarIcon className="w-12 h-12 text-blue-400" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Total Biaya</p>
                  <p className="text-2xl font-bold text-orange-900 mt-2">
                    {formatCurrency(reportData.summary.totalCost)}
                  </p>
                </div>
                <ArrowTrendingDownIcon className="w-12 h-12 text-orange-400" />
              </div>
            </div>

            <div className={`p-6 rounded-lg border ${
              reportData.summary.totalProfit >= 0
                ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
                : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${
                    reportData.summary.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    Laba Kotor
                  </p>
                  <p className={`text-2xl font-bold mt-2 ${
                    reportData.summary.totalProfit >= 0 ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {formatCurrency(reportData.summary.totalProfit)}
                  </p>
                </div>
                {reportData.summary.totalProfit >= 0 ? (
                  <ArrowTrendingUpIcon className="w-12 h-12 text-green-400" />
                ) : (
                  <ArrowTrendingDownIcon className="w-12 h-12 text-red-400" />
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Profit Margin</p>
                  <p className="text-3xl font-bold text-purple-900 mt-2">
                    {reportData.summary.profitMargin}%
                  </p>
                </div>
                <ChartBarIcon className="w-12 h-12 text-purple-400" />
              </div>
            </div>
          </div>

          {/* Monthly Comparison Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-indigo-600" />
              Perbandingan Pendapatan vs Biaya (Bulanan)
            </h3>
            
            {reportData.monthlyData.length > 0 ? (
              <div className="space-y-6">
                {reportData.monthlyData.map((item, index) => {
                  const maxValue = Math.max(
                    ...reportData.monthlyData.map(d => Math.max(d.revenue, d.cost))
                  );
                  const revenuePercentage = (item.revenue / maxValue) * 100;
                  const costPercentage = (item.cost / maxValue) * 100;
                  
                  return (
                    <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">
                          {formatMonth(item.month)}
                        </span>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-600">
                            {item.orderCount} order | {item.procurementCount} pengadaan
                          </span>
                        </div>
                      </div>
                      
                      {/* Revenue Bar */}
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-blue-600 font-medium">Pendapatan</span>
                          <span className="font-semibold text-blue-900">
                            {formatCurrency(item.revenue)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${revenuePercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Cost Bar */}
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-orange-600 font-medium">Biaya</span>
                          <span className="font-semibold text-orange-900">
                            {formatCurrency(item.cost)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${costPercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Profit Summary */}
                      <div className={`mt-3 p-3 rounded-lg ${
                        item.grossProfit >= 0 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-red-50 border border-red-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {item.grossProfit >= 0 ? (
                              <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
                            ) : (
                              <ArrowTrendingDownIcon className="w-5 h-5 text-red-600" />
                            )}
                            <span className={`font-semibold ${
                              item.grossProfit >= 0 ? 'text-green-900' : 'text-red-900'
                            }`}>
                              Laba Kotor
                            </span>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold text-lg ${
                              item.grossProfit >= 0 ? 'text-green-900' : 'text-red-900'
                            }`}>
                              {formatCurrency(item.grossProfit)}
                            </p>
                            <p className={`text-sm ${
                              item.grossProfit >= 0 ? 'text-green-700' : 'text-red-700'
                            }`}>
                              Margin: {item.profitMargin}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Tidak ada data untuk periode ini</p>
            )}
          </div>

          {/* Monthly Table */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Detail Bulanan
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bulan
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pendapatan
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Biaya
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Laba Kotor
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Margin
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData.monthlyData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {formatMonth(item.month)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-blue-600">
                        {formatCurrency(item.revenue)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-orange-600">
                        {formatCurrency(item.cost)}
                      </td>
                      <td className={`px-4 py-3 text-right font-bold ${
                        item.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(item.grossProfit)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          item.profitMargin >= 20 
                            ? 'bg-green-100 text-green-800'
                            : item.profitMargin >= 10
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.profitMargin}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">
                        <div>{item.orderCount} order</div>
                        <div className="text-xs text-gray-500">{item.procurementCount} pengadaan</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                  <tr>
                    <td className="px-4 py-3 font-bold text-gray-900">
                      TOTAL
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-blue-900">
                      {formatCurrency(reportData.summary.totalRevenue)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-orange-900">
                      {formatCurrency(reportData.summary.totalCost)}
                    </td>
                    <td className={`px-4 py-3 text-right font-bold text-lg ${
                      reportData.summary.totalProfit >= 0 ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {formatCurrency(reportData.summary.totalProfit)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-3 py-1 rounded-full text-sm font-bold bg-purple-100 text-purple-900">
                        {reportData.summary.profitMargin}%
                      </span>
                    </td>
                    <td className="px-4 py-3"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FinanceReport;

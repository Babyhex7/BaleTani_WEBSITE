import React, { useState } from 'react';
import {
  CubeIcon,
  ExclamationTriangleIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '../../components/layout_admin/AdminLayout';
import { formatCurrency } from '../../utils/mockProductData';

/**
 * InventoryReport - Laporan pergerakan stok
 */
const InventoryReport = () => {
  const [reportPeriod, setReportPeriod] = useState('monthly');

  const reportData = {
    summary: {
      totalProducts: 48,
      inStock: 35,
      lowStock: 8,
      outOfStock: 5,
      totalValue: 285750000,
    },
    movements: [
      { date: '2025-01-20', product: 'Pupuk Urea 50kg', type: 'in', qty: 50, from: 'PROC-2025-004', stockBefore: 25, stockAfter: 75 },
      { date: '2025-01-20', product: 'Benih Padi', type: 'out', qty: 30, from: 'ORD-2025-156', stockBefore: 120, stockAfter: 90 },
      { date: '2025-01-19', product: 'Pestisida Organik', type: 'in', qty: 40, from: 'PROC-2025-003', stockBefore: 15, stockAfter: 55 },
      { date: '2025-01-19', product: 'Herbisida', type: 'out', qty: 12, from: 'ORD-2025-155', stockBefore: 45, stockAfter: 33 },
      { date: '2025-01-18', product: 'Pupuk NPK', type: 'adjustment', qty: -5, from: 'Expired', stockBefore: 80, stockAfter: 75 },
    ],
    topMoving: [
      { product: 'Pupuk Urea 50kg', totalIn: 150, totalOut: 95, netChange: 55 },
      { product: 'Benih Padi Hibrida', totalIn: 200, totalOut: 180, netChange: 20 },
      { product: 'Pestisida Organik', totalIn: 120, totalOut: 75, netChange: 45 },
      { product: 'Pupuk NPK 25kg', totalIn: 100, totalOut: 85, netChange: 15 },
    ],
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventory Report</h1>
            <p className="text-gray-600 mt-1">Laporan pergerakan stok & stock movements</p>
          </div>
          <button
            onClick={() => alert('Export to CSV')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Export Report
          </button>
        </div>

        {/* Period Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex gap-2">
            {['daily', 'weekly', 'monthly', 'yearly'].map((period) => (
              <button
                key={period}
                onClick={() => setReportPeriod(period)}
                className={`px-4 py-2 rounded-lg font-medium text-sm ${
                  reportPeriod === period
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600">Total Products</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{reportData.summary.totalProducts}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600">In Stock</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{reportData.summary.inStock}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600">Low Stock</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{reportData.summary.lowStock}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600">Out of Stock</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{reportData.summary.outOfStock}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600">Total Value</p>
            <p className="text-xl font-bold text-gray-900 mt-2">{formatCurrency(reportData.summary.totalValue)}</p>
          </div>
        </div>

        {/* Stock Movements */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Stock Movements (Recent)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Before</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.movements.map((mov, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{mov.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{mov.product}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                        mov.type === 'in' ? 'bg-green-100 text-green-700' :
                        mov.type === 'out' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {mov.type === 'in' ? <ArrowTrendingUpIcon className="w-3 h-3" /> :
                         mov.type === 'out' ? <ArrowTrendingDownIcon className="w-3 h-3" /> :
                         <ExclamationTriangleIcon className="w-3 h-3" />}
                        {mov.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {mov.type === 'out' || mov.type === 'adjustment' ? '-' : '+'}{mov.qty}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{mov.from}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{mov.stockBefore}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{mov.stockAfter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Moving Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Produk dengan Pergerakan Tertinggi</h2>
          <div className="space-y-3">
            {reportData.topMoving.map((item, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-900">{item.product}</p>
                  <p className={`font-bold ${item.netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Net: {item.netChange >= 0 ? '+' : ''}{item.netChange}
                  </p>
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="text-green-600">In: +{item.totalIn}</span>
                  <span className="text-blue-600">Out: -{item.totalOut}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default InventoryReport;

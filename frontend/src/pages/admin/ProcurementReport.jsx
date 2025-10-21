import React, { useState } from 'react';
import {
  TruckIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '../../components/layout_admin/AdminLayout';
import { formatCurrency, formatDate } from '../../utils/mockProductData';

/**
 * ProcurementReport - Laporan procurement & pembelian
 */
const ProcurementReport = () => {
  const [dateFrom, setDateFrom] = useState('2025-01-01');
  const [dateTo, setDateTo] = useState('2025-01-31');

  const reportData = {
    summary: {
      totalProcurement: 15,
      totalSpending: 125750000,
      avgProcurementValue: 8383333,
      totalSuppliers: 8,
    },
    procurements: [
      { date: '2025-01-05', code: 'PROC-2025-001', supplier: 'PT Pupuk Indonesia', items: 5, total: 12500000, status: 'approved' },
      { date: '2025-01-08', code: 'PROC-2025-002', supplier: 'CV Benih Unggul', items: 8, total: 9600000, status: 'approved' },
      { date: '2025-01-12', code: 'PROC-2025-003', supplier: 'PT Agro Kimia', items: 4, total: 8375000, status: 'approved' },
      { date: '2025-01-15', code: 'PROC-2025-004', supplier: 'PT Pupuk Indonesia', items: 6, total: 14200000, status: 'pending' },
      { date: '2025-01-18', code: 'PROC-2025-005', supplier: 'CV Alat Tani Jaya', items: 3, total: 6840000, status: 'approved' },
    ],
    topSuppliers: [
      { name: 'PT Pupuk Indonesia', procurements: 5, spending: 45500000 },
      { name: 'CV Benih Unggul', procurements: 3, spending: 28900000 },
      { name: 'PT Agro Kimia', procurements: 4, spending: 31200000 },
      { name: 'CV Alat Tani Jaya', procurements: 2, spending: 15800000 },
    ],
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Procurement Report</h1>
            <p className="text-gray-600 mt-1">Laporan pembelian dan supplier</p>
          </div>
          <button
            onClick={() => alert('Export to CSV')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Export Report
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dari Tanggal</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sampai Tanggal</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex items-end">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
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
                <p className="text-sm font-medium text-gray-600">Total Procurement</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{reportData.summary.totalProcurement}</p>
              </div>
              <div className="p-4 bg-blue-100 rounded-xl">
                <TruckIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spending</p>
                <p className="text-2xl font-bold text-red-600 mt-2">
                  {formatCurrency(reportData.summary.totalSpending)}
                </p>
              </div>
              <div className="p-4 bg-red-100 rounded-xl">
                <CurrencyDollarIcon className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Procurement</p>
                <p className="text-xl font-bold text-gray-900 mt-2">
                  {formatCurrency(reportData.summary.avgProcurementValue)}
                </p>
              </div>
              <div className="p-4 bg-purple-100 rounded-xl">
                <CalendarIcon className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Suppliers</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{reportData.summary.totalSuppliers}</p>
              </div>
              <div className="p-4 bg-green-100 rounded-xl">
                <BuildingOfficeIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Procurement Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Daftar Procurement</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.procurements.map((proc, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(proc.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{proc.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{proc.supplier}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{proc.items} items</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(proc.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        proc.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {proc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Suppliers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Top Suppliers</h2>
          <div className="space-y-3">
            {reportData.topSuppliers.map((supplier, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{supplier.name}</p>
                    <p className="text-xs text-gray-500">{supplier.procurements} procurements</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-gray-900">{formatCurrency(supplier.spending)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ProcurementReport;

import React, { useState } from 'react';
import {
  DocumentTextIcon,
  ArrowPathIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '../../components/layout_admin/AdminLayout';
import { Badge } from '../../components/ui_admin/CommonComponents';
import Pagination from '../../components/ui_admin/Pagination';
import { formatDateTime } from '../../utils/mockProductData';

/**
 * SystemLogsPage - View soft delete logs & restore data
 */
const SystemLogsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tableFilter, setTableFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [logs, setLogs] = useState([
    { id: 1, table_name: 'products', record_id: 15, record_name: 'Pupuk Organik 10kg', deleted_by: 'John Doe', deleted_at: '2025-01-20 10:30:00', can_restore: true },
    { id: 2, table_name: 'customers', record_id: 42, record_name: 'PT Agro Sejahtera', deleted_by: 'Jane Smith', deleted_at: '2025-01-19 14:15:00', can_restore: true },
    { id: 3, table_name: 'procurements', record_id: 8, record_name: 'PROC-2025-008', deleted_by: 'Mike Johnson', deleted_at: '2025-01-18 09:45:00', can_restore: false },
    { id: 4, table_name: 'discounts', record_id: 5, record_name: 'Promo Akhir Tahun', deleted_by: 'John Doe', deleted_at: '2025-01-17 16:20:00', can_restore: true },
    { id: 5, table_name: 'categories', record_id: 3, record_name: 'Alat Pertanian Manual', deleted_by: 'Sarah Williams', deleted_at: '2025-01-15 11:00:00', can_restore: true },
  ]);

  // Filter
  const filteredLogs = logs.filter(log => {
    const matchSearch = 
      log.record_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.table_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTable = tableFilter === 'all' || log.table_name === tableFilter;
    return matchSearch && matchTable;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleRestore = (logId) => {
    const log = logs.find(l => l.id === logId);
    if (confirm(`Restore "${log.record_name}" dari table ${log.table_name}?`)) {
      setLogs(logs.filter(l => l.id !== logId));
      alert('Data restored successfully!');
    }
  };

  const handlePermanentDelete = (logId) => {
    const log = logs.find(l => l.id === logId);
    if (confirm(`PERMANENT DELETE "${log.record_name}"? This cannot be undone!`)) {
      setLogs(logs.filter(l => l.id !== logId));
      alert('Data permanently deleted!');
    }
  };

  const tables = ['all', 'products', 'customers', 'procurements', 'discounts', 'categories', 'orders'];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Logs & Soft Delete</h1>
            <p className="text-gray-600 mt-1">View deleted records & restore data</p>
          </div>
          <button
            onClick={() => alert('Export logs to CSV')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Export Logs
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600">Total Deleted</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{logs.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600">Can Restore</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{logs.filter(l => l.can_restore).length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600">Cannot Restore</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{logs.filter(l => !l.can_restore).length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600">Tables Affected</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {new Set(logs.map(l => l.table_name)).size}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari record name atau table..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <select
              value={tableFilter}
              onChange={(e) => {
                setTableFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              {tables.map(table => (
                <option key={table} value={table}>
                  {table === 'all' ? 'All Tables' : table.charAt(0).toUpperCase() + table.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Table</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Record Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deleted By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deleted At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                        {log.table_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {log.record_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{log.deleted_by}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDateTime(log.deleted_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={log.can_restore ? 'success' : 'danger'} size="sm">
                        {log.can_restore ? 'Can Restore' : 'Cannot Restore'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {log.can_restore && (
                        <button
                          onClick={() => handleRestore(log.id)}
                          className="text-green-600 hover:text-green-700 inline-flex items-center gap-1"
                        >
                          <ArrowPathIcon className="w-5 h-5" />
                          Restore
                        </button>
                      )}
                      <button
                        onClick={() => handlePermanentDelete(log.id)}
                        className="text-red-600 hover:text-red-700 inline-flex items-center gap-1"
                      >
                        <TrashIcon className="w-5 h-5" />
                        Permanent Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <DocumentTextIcon className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Tentang Soft Delete</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Data yang dihapus akan masuk ke soft delete log</li>
                <li>Data dapat di-restore jika statusnya "Can Restore"</li>
                <li>Data yang "Cannot Restore" sudah terhubung dengan transaksi lain</li>
                <li>Permanent delete akan menghapus data selamanya dari database</li>
                <li>Hanya Super Admin yang dapat restore/permanent delete</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SystemLogsPage;

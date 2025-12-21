import React from 'react';
import { Search, Filter, X, Clock, CreditCard, Package, MapPin, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * OrderFilters Component
 * Filters untuk order history: search, status, date range, sort
 */
const OrderFilters = ({
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  dateRange,
  setDateRange,
  sortBy,
  setSortBy,
  onReset
}) => {
  const statusOptions = [
    { value: '', label: 'Semua Status', Icon: null },
    { value: 'pending_payment', label: 'Menunggu Pembayaran', Icon: Clock },
    { value: 'paid', label: 'Dibayar', Icon: CreditCard },
    { value: 'processing', label: 'Diproses', Icon: Package },
    { value: 'out_for_delivery', label: 'Dalam Pengiriman', Icon: MapPin },
    { value: 'completed', label: 'Selesai', Icon: CheckCircle },
    { value: 'cancelled', label: 'Dibatalkan', Icon: AlertCircle }
  ];

  const dateRangeOptions = [
    { value: '', label: 'Semua Waktu' },
    { value: '7', label: '7 Hari Terakhir' },
    { value: '30', label: '30 Hari Terakhir' },
    { value: '90', label: '3 Bulan Terakhir' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Terbaru' },
    { value: 'oldest', label: 'Terlama' },
    { value: 'highest', label: 'Harga Tertinggi' },
    { value: 'lowest', label: 'Harga Terendah' }
  ];

  const hasActiveFilters = searchQuery || filterStatus || dateRange || sortBy !== 'newest';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Filter & Pencarian</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium"
          >
            <X className="w-4 h-4" />
            Reset Filter
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cari Pesanan
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              data-cy="order-search"
              type="text"
              placeholder="No. pesanan atau produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status Pesanan
          </label>
          <div className="relative">
            <select
              data-cy="order-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {filterStatus && statusOptions.find(opt => opt.value === filterStatus)?.Icon && (
              <div className="absolute right-10 top-1/2 transform -translate-y-1/2 pointer-events-none">
                {React.createElement(statusOptions.find(opt => opt.value === filterStatus).Icon, {
                  className: "w-4 h-4 text-gray-500"
                })}
              </div>
            )}
          </div>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Periode Waktu
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {dateRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Urutkan
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                Pencarian: "{searchQuery}"
                <button
                  onClick={() => setSearchQuery('')}
                  className="hover:bg-green-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filterStatus && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                Status: {statusOptions.find(o => o.value === filterStatus)?.label}
                <button
                  onClick={() => setFilterStatus('')}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {dateRange && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                Periode: {dateRangeOptions.find(o => o.value === dateRange)?.label}
                <button
                  onClick={() => setDateRange('')}
                  className="hover:bg-purple-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderFilters;

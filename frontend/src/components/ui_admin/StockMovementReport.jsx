import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import adminApiClient from '../../services/services_admin/adminApiClient';
import inventoryService from '../../services/services_admin/inventoryService';
import { getImageUrl } from '../../utils/imageUtils';
import {
  ArrowsRightLeftIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CubeIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const StockMovementReport = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [products, setProducts] = useState([]);

  // Filters
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [productId, setProductId] = useState('');
  const [movementType, setMovementType] = useState('');
  const [limit, setLimit] = useState(100);

  useEffect(() => {
    fetchProducts();
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await inventoryService.getProducts({ limit: 1000 });
      if (data && data.success) {
        const list = data.data?.products || data.data || [];
        setProducts(Array.isArray(list) ? list : []);
      }
    } catch (err) {
      console.warn('Failed to fetch products', err);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = {
        startDate,
        endDate,
        limit
      };
      
      if (productId) {
        params.productId = productId;
      }
      if (movementType) {
        params.movementType = movementType;
      }
      
      const response = await adminApiClient.get('/admin/reports/stock-movement', { params });
      
      if (response.data.success) {
        setReportData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stock movement report:', error);
      toast.error('Gagal memuat laporan pergerakan stok');
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMovementTypeBadge = (type) => {
    const typeConfig = {
      procurement_in: { 
        label: 'Pengadaan', 
        class: 'bg-green-100 text-green-800',
        icon: ArrowUpIcon
      },
      sale_out: { 
        label: 'Penjualan', 
        class: 'bg-red-100 text-red-800',
        icon: ArrowDownIcon
      },
      expired: { 
        label: 'Kadaluarsa', 
        class: 'bg-orange-100 text-orange-800',
        icon: ArrowDownIcon
      },
      adjustment: { 
        label: 'Penyesuaian', 
        class: 'bg-blue-100 text-blue-800',
        icon: ArrowsRightLeftIcon
      }
    };
    const config = typeConfig[type] || { 
      label: type, 
      class: 'bg-gray-100 text-gray-800',
      icon: ArrowsRightLeftIcon
    };
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.class}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getReferenceTypeBadge = (type) => {
    const typeConfig = {
      procurement: { label: 'Pengadaan', class: 'bg-purple-100 text-purple-800' },
      order: { label: 'Order', class: 'bg-blue-100 text-blue-800' },
      adjustment: { label: 'Penyesuaian', class: 'bg-gray-100 text-gray-800' }
    };
    const config = typeConfig[type] || { label: type, class: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.class}`}>
        {config.label}
      </span>
    );
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
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Produk
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Semua Produk</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.product_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipe Pergerakan
            </label>
            <select
              value={movementType}
              onChange={(e) => setMovementType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Semua Tipe</option>
              <option value="procurement_in">Pengadaan (Masuk)</option>
              <option value="sale_out">Penjualan (Keluar)</option>
              <option value="expired">Kadaluarsa (Keluar)</option>
              <option value="adjustment">Penyesuaian</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Limit
            </label>
            <select
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              <option value="50">50 Data</option>
              <option value="100">100 Data</option>
              <option value="200">200 Data</option>
              <option value="500">500 Data</option>
            </select>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {reportData.summary.map((item, index) => {
              const isIn = item.type === 'in';
              const isOut = item.type === 'out';
              const isAdjustment = item.type === 'adjustment';
              
              return (
                <div 
                  key={index} 
                  className={`p-6 rounded-lg border ${
                    isIn ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' :
                    isOut ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200' :
                    'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${
                        isIn ? 'text-green-600' :
                        isOut ? 'text-red-600' :
                        'text-blue-600'
                      }`}>
                        {item.type === 'in' ? 'Stok Masuk' : 
                         item.type === 'out' ? 'Stok Keluar' : 
                         'Penyesuaian'}
                      </p>
                      <p className={`text-3xl font-bold mt-2 ${
                        isIn ? 'text-green-900' :
                        isOut ? 'text-red-900' :
                        'text-blue-900'
                      }`}>
                        {item.count}
                      </p>
                      <p className={`text-sm mt-1 ${
                        isIn ? 'text-green-700' :
                        isOut ? 'text-red-700' :
                        'text-blue-700'
                      }`}>
                        Total: {item.totalQuantity} unit
                      </p>
                    </div>
                    {isIn ? (
                      <ArrowUpIcon className="w-12 h-12 text-green-400" />
                    ) : isOut ? (
                      <ArrowDownIcon className="w-12 h-12 text-red-400" />
                    ) : (
                      <ArrowsRightLeftIcon className="w-12 h-12 text-blue-400" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Product Summary (if no specific product filter) */}
          {reportData.productSummary && reportData.productSummary.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CubeIcon className="w-5 h-5 text-indigo-600" />
                Ringkasan per Produk (Top 20)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produk
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stok Masuk
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stok Keluar
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Net Change
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Pergerakan
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reportData.productSummary.map((product, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {product.imageUrl ? (
                              <img
                                src={getImageUrl(product.imageUrl, 'thumbnail')}
                                alt={product.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                <CubeIcon className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{product.productName}</p>
                              <p className="text-sm text-gray-500">#{index + 1}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-green-600 font-medium">
                          +{product.totalIn}
                        </td>
                        <td className="px-4 py-3 text-right text-red-600 font-medium">
                          -{product.totalOut}
                        </td>
                        <td className={`px-4 py-3 text-right font-semibold ${
                          product.netChange >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {product.netChange >= 0 ? '+' : ''}{product.netChange}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {product.movementCount} kali
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Movement Details */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ArrowsRightLeftIcon className="w-5 h-5 text-gray-600" />
              Detail Pergerakan Stok
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produk
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipe
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stok Awal
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stok Akhir
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Referensi
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Catatan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData.movements.map((movement) => (
                    <tr key={movement.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {formatDate(movement.date)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {movement.imageUrl ? (
                            <img
                              src={getImageUrl(movement.imageUrl, 'thumbnail')}
                              alt={movement.productName}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                              <CubeIcon className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{movement.productName}</p>
                            <p className="text-xs text-gray-500">{movement.unit}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getMovementTypeBadge(movement.movementType)}
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold ${
                        movement.quantity >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {movement.quantity >= 0 ? '+' : ''}{movement.quantity}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {movement.stockBefore}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        {movement.stockAfter}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getReferenceTypeBadge(movement.referenceType)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                        {movement.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StockMovementReport;

import React, { useState } from 'react';
import {
  CubeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '../../components/layout_admin/AdminLayout';
import { Badge } from '../../components/ui_admin/CommonComponents';
import Pagination from '../../components/ui_admin/Pagination';
import { formatCurrency, mockProducts } from '../../utils/mockProductData';

/**
 * StockOverview - Halaman overview stok produk
 * Monitor stock levels, movements, dan expiry dates
 */
const StockOverview = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock stock movements
  const [stockMovements] = useState([
    {
      id: 1,
      product_id: 1,
      product_name: 'Benih Padi Unggul',
      movement_type: 'procurement_in',
      quantity_change: 50,
      stock_before: 20,
      stock_after: 70,
      reference_type: 'procurement',
      reference_code: 'PROC-2025-001',
      created_at: '2025-01-20 10:00:00',
      created_by: 'Inventory Admin',
    },
    {
      id: 2,
      product_id: 2,
      product_name: 'Pupuk Organik',
      movement_type: 'sale_out',
      quantity_change: -5,
      stock_before: 35,
      stock_after: 30,
      reference_type: 'order',
      reference_code: 'ORD-2025-001',
      created_at: '2025-01-20 14:30:00',
      created_by: 'Cashier 1',
    },
    {
      id: 3,
      product_id: 3,
      product_name: 'Pestisida Organik',
      movement_type: 'expired',
      quantity_change: -3,
      stock_before: 18,
      stock_after: 15,
      reference_type: 'adjustment',
      reference_code: 'ADJ-2025-001',
      created_at: '2025-01-19 16:00:00',
      created_by: 'Super Inventory Admin',
    },
  ]);

  // Calculate stats from mockProducts
  const stats = {
    totalProducts: mockProducts.length,
    inStock: mockProducts.filter(p => p.total_stock > 10).length,
    lowStock: mockProducts.filter(p => p.total_stock > 0 && p.total_stock <= 10).length,
    outOfStock: mockProducts.filter(p => p.total_stock === 0).length,
    totalValue: mockProducts.reduce((sum, p) => sum + (p.selling_price * p.total_stock), 0),
  };

  // Get stock status
  const getStockStatus = (stock) => {
    if (stock === 0) return 'out';
    if (stock <= 10) return 'low';
    return 'good';
  };

  // Filter products
  const filteredProducts = mockProducts.filter(product => {
    const matchSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const stockStatus = getStockStatus(product.total_stock);
    const matchStock = 
      stockFilter === 'all' ||
      (stockFilter === 'good' && stockStatus === 'good') ||
      (stockFilter === 'low' && stockStatus === 'low') ||
      (stockFilter === 'out' && stockStatus === 'out');
    const matchCategory = 
      categoryFilter === 'all' || product.category_name === categoryFilter;
    
    return matchSearch && matchStock && matchCategory;
  });

  // Get unique categories
  const categories = [...new Set(mockProducts.map(p => p.category_name))];

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStockBadge = (stock) => {
    if (stock === 0) {
      return <Badge variant="danger" size="sm"><XCircleIcon className="w-3 h-3 mr-1" />Out of Stock</Badge>;
    } else if (stock <= 10) {
      return <Badge variant="warning" size="sm"><ExclamationTriangleIcon className="w-3 h-3 mr-1" />Low Stock</Badge>;
    }
    return <Badge variant="success" size="sm"><CheckCircleIcon className="w-3 h-3 mr-1" />In Stock</Badge>;
  };

  const getMovementBadge = (type) => {
    const types = {
      procurement_in: { variant: 'success', label: 'Procurement In', icon: ArrowTrendingUpIcon },
      sale_out: { variant: 'info', label: 'Sale Out', icon: ArrowTrendingDownIcon },
      expired: { variant: 'danger', label: 'Expired', icon: XCircleIcon },
      adjustment: { variant: 'warning', label: 'Adjustment', icon: ExclamationTriangleIcon },
    };
    const config = types[type] || types.adjustment;
    return (
      <Badge variant={config.variant} size="sm">
        <config.icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stock Overview</h1>
          <p className="text-gray-600 mt-1">Monitor stock levels dan pergerakan inventory</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalProducts}</p>
              </div>
              <CubeIcon className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Stock</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.inStock}</p>
              </div>
              <CheckCircleIcon className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.lowStock}</p>
              </div>
              <ExclamationTriangleIcon className="w-10 h-10 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.outOfStock}</p>
              </div>
              <XCircleIcon className="w-10 h-10 text-red-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-lg font-bold text-green-600 mt-1">
                  {formatCurrency(stats.totalValue)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama produk..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            <div>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">Semua Stock</option>
                <option value="good">In Stock</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stock Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Current Stock Levels</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images[0]?.image_url || 'https://via.placeholder.com/50'}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <span className="text-sm font-medium text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {product.category_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-bold ${
                        product.total_stock === 0 ? 'text-red-600' :
                        product.total_stock <= 10 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {product.total_stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {product.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(product.selling_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      {formatCurrency(product.selling_price * product.total_stock)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStockBadge(product.total_stock)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>

        {/* Recent Stock Movements */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Recent Stock Movements</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Movement Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty Change</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Before</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock After</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stockMovements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {movement.product_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getMovementBadge(movement.movement_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-bold ${
                        movement.quantity_change > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {movement.quantity_change > 0 ? '+' : ''}{movement.quantity_change}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {movement.stock_before}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {movement.stock_after}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-blue-600 font-medium">
                        {movement.reference_code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {movement.created_by}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(movement.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default StockOverview;

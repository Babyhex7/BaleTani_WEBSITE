import React, { useState } from 'react';
import {
  TagIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '../../components/layout_admin/AdminLayout';
import { Badge } from '../../components/ui_admin/CommonComponents';
import Pagination from '../../components/ui_admin/Pagination';
import { formatCurrency, formatDate, mockProducts } from '../../utils/mockProductData';

/**
 * DiscountManagement - Halaman manajemen diskon produk
 * CRUD discount campaigns dengan periode aktif
 */
const DiscountManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const itemsPerPage = 10;

  const [discounts, setDiscounts] = useState([
    {
      id: 1,
      discount_name: 'Diskon Akhir Tahun 2024',
      discount_type: 'percentage',
      value: 15,
      start_date: '2024-12-20',
      end_date: '2025-01-05',
      is_active: true,
      products_count: 8,
      created_at: '2024-12-01 10:00:00',
    },
    {
      id: 2,
      discount_name: 'Flash Sale Pupuk',
      discount_type: 'fixed_amount',
      value: 50000,
      start_date: '2025-01-15',
      end_date: '2025-01-20',
      is_active: true,
      products_count: 5,
      created_at: '2025-01-10 14:30:00',
    },
    {
      id: 3,
      discount_name: 'Promo Benih Unggul',
      discount_type: 'percentage',
      value: 20,
      start_date: '2024-11-01',
      end_date: '2024-11-30',
      is_active: false,
      products_count: 12,
      created_at: '2024-10-25 09:00:00',
    },
  ]);

  const [formData, setFormData] = useState({
    discount_name: '',
    discount_type: 'percentage',
    value: 0,
    start_date: '',
    end_date: '',
    is_active: true,
    products: [], // Array of selected product IDs
  });

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productSearchTerm, setProductSearchTerm] = useState('');

  // Calculate stats
  const stats = {
    total: discounts.length,
    active: discounts.filter(d => d.is_active).length,
    inactive: discounts.filter(d => !d.is_active).length,
    percentage: discounts.filter(d => d.discount_type === 'percentage').length,
    fixed: discounts.filter(d => d.discount_type === 'fixed_amount').length,
  };

  // Filter discounts
  const filteredDiscounts = discounts.filter(discount => {
    const matchSearch = discount.discount_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && discount.is_active) ||
      (statusFilter === 'inactive' && !discount.is_active);
    return matchSearch && matchStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredDiscounts.length / itemsPerPage);
  const paginatedDiscounts = filteredDiscounts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAdd = () => {
    setModalMode('add');
    setFormData({
      discount_name: '',
      discount_type: 'percentage',
      value: 0,
      start_date: '',
      end_date: '',
      is_active: true,
      products: [],
    });
    setSelectedProducts([]);
    setProductSearchTerm('');
    setShowModal(true);
  };

  const handleEdit = (discount) => {
    setModalMode('edit');
    setSelectedDiscount(discount);
    setFormData({
      discount_name: discount.discount_name,
      discount_type: discount.discount_type,
      value: discount.value,
      start_date: discount.start_date,
      end_date: discount.end_date,
      is_active: discount.is_active,
      products: discount.products || [],
    });
    setSelectedProducts(discount.products || []);
    setProductSearchTerm('');
    setShowModal(true);
  };

  const handleDelete = (discount) => {
    if (window.confirm(`Yakin ingin menghapus diskon "${discount.discount_name}"?`)) {
      setDiscounts(discounts.filter(d => d.id !== discount.id));
    }
  };

  const handleToggleStatus = (discount) => {
    setDiscounts(discounts.map(d =>
      d.id === discount.id ? { ...d, is_active: !d.is_active } : d
    ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const discountData = {
      ...formData,
      products: selectedProducts,
      products_count: selectedProducts.length,
    };

    if (modalMode === 'add') {
      const newDiscount = {
        id: discounts.length + 1,
        ...discountData,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };
      setDiscounts([...discounts, newDiscount]);
    } else if (modalMode === 'edit') {
      setDiscounts(discounts.map(d =>
        d.id === selectedDiscount.id ? { ...d, ...discountData } : d
      ));
    }
    
    setShowModal(false);
  };

  // Product selector handlers
  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const selectAllProducts = () => {
    const activeProductIds = mockProducts
      .filter(p => p.status === 'active')
      .map(p => p.product_id);
    setSelectedProducts(activeProductIds);
  };

  const clearAllProducts = () => {
    setSelectedProducts([]);
  };

  // Filter products for selector
  const filteredProducts = mockProducts
    .filter(p => p.status === 'active')
    .filter(p => p.product_name.toLowerCase().includes(productSearchTerm.toLowerCase()));

  const getTypeBadge = (type) => {
    return type === 'percentage'
      ? <Badge variant="info" size="sm">Persentase</Badge>
      : <Badge variant="primary" size="sm">Fixed Amount</Badge>;
  };

  const getStatusBadge = (isActive) => {
    return isActive
      ? <Badge variant="success" size="sm">Active</Badge>
      : <Badge variant="danger" size="sm">Inactive</Badge>;
  };

  const formatValue = (type, value) => {
    return type === 'percentage' ? `${value}%` : formatCurrency(value);
  };

  const isExpired = (endDate) => {
    return new Date(endDate) < new Date();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Discount Management</h1>
            <p className="text-gray-600 mt-1">Kelola campaign diskon produk</p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Tambah Diskon
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Total Discounts</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Inactive</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{stats.inactive}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Percentage</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.percentage}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Fixed Amount</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{stats.fixed}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama diskon..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">Semua Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Diskon</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nilai</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Periode</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedDiscounts.map((discount) => (
                  <tr key={discount.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <TagIcon className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-gray-900">{discount.discount_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTypeBadge(discount.discount_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-green-600">
                        {formatValue(discount.discount_type, discount.value)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{formatDate(discount.start_date)}</span>
                        <span>→</span>
                        <span className={isExpired(discount.end_date) ? 'text-red-600 font-semibold' : ''}>
                          {formatDate(discount.end_date)}
                        </span>
                      </div>
                      {isExpired(discount.end_date) && (
                        <Badge variant="danger" size="sm" className="mt-1">Expired</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{discount.products_count} produk</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(discount)}
                        className="focus:outline-none"
                      >
                        {getStatusBadge(discount.is_active)}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(discount)}
                          className="text-green-600 hover:text-green-700"
                          title="Edit"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(discount)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
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

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowModal(false)} />

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-6 pt-5 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      {modalMode === 'add' ? 'Tambah Diskon' : 'Edit Diskon'}
                    </h3>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Diskon *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.discount_name}
                        onChange={(e) => setFormData({ ...formData, discount_name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="e.g. Flash Sale Pupuk"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipe Diskon *
                      </label>
                      <select
                        value={formData.discount_type}
                        onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="percentage">Persentase (%)</option>
                        <option value="fixed_amount">Fixed Amount (Rp)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nilai Diskon *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          required
                          min="0"
                          step={formData.discount_type === 'percentage' ? '0.01' : '1000'}
                          max={formData.discount_type === 'percentage' ? '100' : undefined}
                          value={formData.value}
                          onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder={formData.discount_type === 'percentage' ? '0-100' : '0'}
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          {formData.discount_type === 'percentage' ? '%' : 'Rp'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tanggal Mulai *
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.start_date}
                          onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tanggal Selesai *
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.end_date}
                          onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                          min={formData.start_date}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    </div>

                    {/* Product Selector */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Pilih Produk ({selectedProducts.length} dipilih)
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={selectAllProducts}
                            className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                          >
                            <CheckCircleIcon className="w-4 h-4 inline mr-1" />
                            Pilih Semua
                          </button>
                          <button
                            type="button"
                            onClick={clearAllProducts}
                            className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            <XCircleIcon className="w-4 h-4 inline mr-1" />
                            Hapus Semua
                          </button>
                        </div>
                      </div>

                      {/* Product Search */}
                      <div className="relative mb-2">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Cari produk..."
                          value={productSearchTerm}
                          onChange={(e) => setProductSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      {/* Product List */}
                      <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
                        {filteredProducts.length === 0 ? (
                          <div className="p-4 text-center text-sm text-gray-500">
                            Tidak ada produk ditemukan
                          </div>
                        ) : (
                          filteredProducts.map((product) => (
                            <label
                              key={product.product_id}
                              className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <input
                                type="checkbox"
                                checked={selectedProducts.includes(product.product_id)}
                                onChange={() => toggleProductSelection(product.product_id)}
                                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                              />
                              <img
                                src={product.product_image}
                                alt={product.product_name}
                                className="w-10 h-10 object-cover rounded"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{product.product_name}</p>
                                <p className="text-xs text-gray-500">
                                  {formatCurrency(product.price)} • Stok: {product.stock_quantity}
                                </p>
                              </div>
                            </label>
                          ))
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Pilih produk yang akan mendapatkan diskon ini
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                        Status Active
                      </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        {modalMode === 'add' ? 'Tambah' : 'Simpan'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default DiscountManagement;

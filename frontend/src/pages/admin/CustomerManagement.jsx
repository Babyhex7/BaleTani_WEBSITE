import React, { useState } from 'react';
import {
  UsersIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon,
  UserCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '../../components/layout_admin/AdminLayout';
import { Badge } from '../../components/ui_admin/CommonComponents';
import Pagination from '../../components/ui_admin/Pagination';
import { formatDateTime } from '../../utils/mockProductData';

/**
 * CustomerManagement - Halaman manajemen customer
 * CRUD customer dengan filter dan detail
 */
const CustomerManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // add, edit, detail
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const itemsPerPage = 10;

  // Mock customer data
  const [customers, setCustomers] = useState([
    {
      id: 1,
      full_name: 'Budi Santoso',
      email: 'budi.santoso@email.com',
      phone_number: '081234567890',
      address: 'Jl. Raya Tani No. 123, Jakarta Selatan',
      customer_type: 'retail',
      is_active: true,
      total_orders: 12,
      total_spent: 5500000,
      last_order: '2025-01-20 14:30:00',
      created_at: '2024-06-15 10:00:00',
    },
    {
      id: 2,
      full_name: 'Siti Aminah',
      email: 'siti.aminah@email.com',
      phone_number: '082345678901',
      address: 'Jl. Pertanian No. 45, Bandung',
      customer_type: 'b2b',
      is_active: true,
      total_orders: 28,
      total_spent: 15000000,
      last_order: '2025-01-19 16:00:00',
      created_at: '2024-03-20 14:00:00',
    },
    {
      id: 3,
      full_name: 'Ahmad Rahman',
      email: 'ahmad.rahman@email.com',
      phone_number: '083456789012',
      address: 'Jl. Sawah No. 78, Bogor',
      customer_type: 'retail',
      is_active: true,
      total_orders: 5,
      total_spent: 2300000,
      last_order: '2025-01-18 10:00:00',
      created_at: '2024-11-05 09:30:00',
    },
    {
      id: 4,
      full_name: 'Dewi Lestari',
      email: 'dewi.lestari@email.com',
      phone_number: '084567890123',
      address: 'Jl. Kebun No. 90, Surabaya',
      customer_type: 'retail',
      is_active: false,
      total_orders: 3,
      total_spent: 900000,
      last_order: '2024-12-10 15:20:00',
      created_at: '2024-09-12 11:00:00',
    },
    {
      id: 5,
      full_name: 'Joko Susilo',
      email: 'joko.susilo@email.com',
      phone_number: '085678901234',
      address: 'Jl. Ladang No. 12, Yogyakarta',
      customer_type: 'b2b',
      is_active: true,
      total_orders: 45,
      total_spent: 30000000,
      last_order: '2025-01-21 08:00:00',
      created_at: '2024-01-10 08:00:00',
    },
  ]);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    address: '',
    customer_type: 'retail',
    is_active: true,
  });

  // Calculate stats
  const stats = {
    total: customers.length,
    active: customers.filter(c => c.is_active).length,
    inactive: customers.filter(c => !c.is_active).length,
    retail: customers.filter(c => c.customer_type === 'retail').length,
    b2b: customers.filter(c => c.customer_type === 'b2b').length,
  };

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const matchSearch = 
      customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone_number.includes(searchTerm);
    
    const matchStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && customer.is_active) ||
      (statusFilter === 'inactive' && !customer.is_active);
    
    return matchSearch && matchStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAdd = () => {
    setModalMode('add');
    setFormData({
      full_name: '',
      email: '',
      phone_number: '',
      address: '',
      customer_type: 'retail',
      is_active: true,
    });
    setShowModal(true);
  };

  const handleEdit = (customer) => {
    setModalMode('edit');
    setSelectedCustomer(customer);
    setFormData({
      full_name: customer.full_name,
      email: customer.email,
      phone_number: customer.phone_number,
      address: customer.address,
      customer_type: customer.customer_type,
      is_active: customer.is_active,
    });
    setShowModal(true);
  };

  const handleDetail = (customer) => {
    setModalMode('detail');
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  const handleDelete = (customer) => {
    if (window.confirm(`Yakin ingin menghapus customer ${customer.full_name}?`)) {
      setCustomers(customers.filter(c => c.id !== customer.id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (modalMode === 'add') {
      const newCustomer = {
        id: customers.length + 1,
        ...formData,
        total_orders: 0,
        total_spent: 0,
        last_order: null,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };
      setCustomers([...customers, newCustomer]);
    } else if (modalMode === 'edit') {
      setCustomers(customers.map(c => 
        c.id === selectedCustomer.id 
          ? { ...c, ...formData }
          : c
      ));
    }
    
    setShowModal(false);
  };

  const getTypeBadge = (type) => {
    return type === 'b2b' 
      ? <Badge variant="primary" size="sm">B2B</Badge>
      : <Badge variant="default" size="sm">Retail</Badge>;
  };

  const getStatusBadge = (isActive) => {
    return isActive
      ? <Badge variant="success" size="sm">Active</Badge>
      : <Badge variant="danger" size="sm">Inactive</Badge>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
            <p className="text-gray-600 mt-1">Kelola data pelanggan</p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Tambah Customer
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Total Customers</p>
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
            <p className="text-sm text-gray-600">Retail</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.retail}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">B2B</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{stats.b2b}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama, email, atau no telepon..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            {/* Status Filter */}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center text-white font-bold">
                          {customer.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{customer.full_name}</p>
                          <p className="text-xs text-gray-500">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{customer.phone_number}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTypeBadge(customer.customer_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">{customer.total_orders}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-green-600">
                        {formatCurrency(customer.total_spent)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(customer.is_active)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDetail(customer)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Detail"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(customer)}
                          className="text-green-600 hover:text-green-700"
                          title="Edit"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(customer)}
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

          {/* Pagination */}
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
                      {modalMode === 'add' ? 'Tambah Customer' : modalMode === 'edit' ? 'Edit Customer' : 'Detail Customer'}
                    </h3>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>

                  {modalMode === 'detail' ? (
                    // Detail View
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                          {selectedCustomer.full_name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">{selectedCustomer.full_name}</h4>
                          <p className="text-sm text-gray-600">{getTypeBadge(selectedCustomer.customer_type)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <p className="text-sm text-gray-600 mb-1">Email</p>
                          <div className="flex items-center gap-2 text-gray-900">
                            <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                            <span>{selectedCustomer.email}</span>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-gray-600 mb-1">Phone</p>
                          <div className="flex items-center gap-2 text-gray-900">
                            <PhoneIcon className="w-5 h-5 text-gray-400" />
                            <span>{selectedCustomer.phone_number}</span>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-gray-600 mb-1">Address</p>
                          <div className="flex items-start gap-2 text-gray-900">
                            <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                            <span>{selectedCustomer.address}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Orders</p>
                          <p className="text-2xl font-bold text-gray-900">{selectedCustomer.total_orders}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Spent</p>
                          <p className="text-xl font-bold text-green-600">{formatCurrency(selectedCustomer.total_spent)}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-gray-600">Status</p>
                          <div className="mt-1">{getStatusBadge(selectedCustomer.is_active)}</div>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-gray-600">Member Since</p>
                          <p className="text-sm text-gray-900">{formatDateTime(selectedCustomer.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Form View
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nama Lengkap *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          No. Telepon *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone_number}
                          onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Alamat *
                        </label>
                        <textarea
                          required
                          rows="3"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipe Customer *
                        </label>
                        <select
                          value={formData.customer_type}
                          onChange={(e) => setFormData({ ...formData, customer_type: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="retail">Retail</option>
                          <option value="b2b">B2B</option>
                        </select>
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
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CustomerManagement;

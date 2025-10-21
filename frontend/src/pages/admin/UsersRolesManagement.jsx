import React, { useState } from 'react';
import {
  UserGroupIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  KeyIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '../../components/layout_admin/AdminLayout';
import { Badge } from '../../components/ui_admin/CommonComponents';
import Pagination from '../../components/ui_admin/Pagination';
import { formatDateTime } from '../../utils/mockProductData';

/**
 * UsersRolesManagement - Kelola users & roles (Super Admin only)
 */
const UsersRolesManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    email: '',
    phone: '',
    role: 'cashier',
    password: '',
    is_active: true,
  });
  const itemsPerPage = 10;

  const roles = [
    { value: 'super_admin', label: 'Super Admin', color: 'bg-purple-100 text-purple-700' },
    { value: 'super_inventory_admin', label: 'Super Inventory Admin', color: 'bg-blue-100 text-blue-700' },
    { value: 'inventory_admin', label: 'Inventory Admin', color: 'bg-cyan-100 text-cyan-700' },
    { value: 'super_whatsapp_admin', label: 'Super WhatsApp Admin', color: 'bg-green-100 text-green-700' },
    { value: 'whatsapp_admin', label: 'WhatsApp Admin', color: 'bg-emerald-100 text-emerald-700' },
    { value: 'super_cashier', label: 'Super Cashier', color: 'bg-orange-100 text-orange-700' },
    { value: 'cashier', label: 'Cashier', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'finance_admin', label: 'Finance Admin', color: 'bg-pink-100 text-pink-700' },
  ];

  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@baletani.com', phone: '081234567890', role: 'super_admin', is_active: true, created_at: '2024-01-15 10:00:00' },
    { id: 2, name: 'Jane Smith', email: 'jane@baletani.com', phone: '081234567891', role: 'inventory_admin', is_active: true, created_at: '2024-02-20 14:30:00' },
    { id: 3, name: 'Mike Johnson', email: 'mike@baletani.com', phone: '081234567892', role: 'cashier', is_active: true, created_at: '2024-03-10 09:15:00' },
    { id: 4, name: 'Sarah Williams', email: 'sarah@baletani.com', phone: '081234567893', role: 'whatsapp_admin', is_active: false, created_at: '2024-04-05 11:45:00' },
  ]);

  // Filter
  const filteredUsers = users.filter(user => {
    const matchSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'all' || user.role === roleFilter;
    return matchSearch && matchRole;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAdd = () => {
    setFormData({
      id: null,
      name: '',
      email: '',
      phone: '',
      role: 'cashier',
      password: '',
      is_active: true,
    });
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setFormData({ ...user, password: '' });
    setShowModal(true);
  };

  const handleSave = () => {
    if (formData.name && formData.email && formData.phone && formData.role) {
      if (formData.id) {
        setUsers(users.map(u => u.id === formData.id ? { ...formData, password: undefined } : u));
        alert('User updated!');
      } else {
        if (!formData.password) {
          alert('Password required for new user!');
          return;
        }
        const newUser = { ...formData, id: Date.now().toString(), created_at: new Date().toISOString(), password: undefined };
        setUsers([newUser, ...users]);
        alert('User created!');
      }
      setShowModal(false);
    } else {
      alert('Please fill all required fields!');
    }
  };

  const handleDelete = (userId) => {
    if (confirm('Delete this user?')) {
      setUsers(users.filter(u => u.id !== userId));
      alert('User deleted!');
    }
  };

  const getRoleBadge = (roleValue) => {
    const role = roles.find(r => r.value === roleValue);
    return role ? (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${role.color}`}>
        {role.label}
      </span>
    ) : roleValue;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users & Roles Management</h1>
            <p className="text-gray-600 mt-1">Kelola akun admin & assign roles</p>
          </div>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Add User
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600">Total Users</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{users.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600">Active Users</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{users.filter(u => u.is_active).length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600">Inactive Users</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{users.filter(u => !u.is_active).length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600">Total Roles</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{roles.length}</p>
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
                  placeholder="Cari nama atau email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Roles</option>
              {roles.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={user.is_active ? 'success' : 'danger'} size="sm">
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDateTime(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <PencilIcon className="w-5 h-5 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="w-5 h-5 inline" />
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

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  {formData.id ? 'Edit User' : 'Add New User'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    {roles.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password {!formData.id && '*'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={formData.id ? 'Leave blank to keep current password' : 'Enter password'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Active Status</label>
                    <p className="text-xs text-gray-500">Enable or disable user</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.is_active ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.is_active ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  {formData.id ? 'Update User' : 'Create User'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default UsersRolesManagement;

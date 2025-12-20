import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout_admin/AdminLayout';
import Table from '../../components/ui_admin/Table';
import SearchFilter from '../../components/ui_admin/SearchFilter';
import Pagination from '../../components/ui_admin/Pagination';
import ModalAdmin, { ConfirmModal } from '../../components/ui_admin/ModalAdmin';
import { LoadingSpinner, Alert, Badge } from '../../components/ui_admin/CommonComponents';
import { getUsers, createUser, updateUser, deleteUser, updateUserRole } from '../../services/services_admin/userService';
import useDebounce from '../../hooks/useDebounce';

/**
 * Halaman User Management - Kelola Data Pengguna
 * CRUD users dengan role management (RBAC)
 */
const UserManagement = () => {
  // State untuk data
  const [users, setUsers] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk pagination dan filter
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchValue, setSearchValue] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [sortField, setSortField] = useState('full_name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Debounce search value
  const debouncedSearch = useDebounce(searchValue, 500);

  // State untuk modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEdit, setIsEdit] = useState(false);

  // Mock data untuk development
  const mockUsers = [
    {
      id: 1,
      full_name: 'Ahmad Bagas',
      email: 'admin@baletani.com',
      role: 'admin',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-05T10:30:00Z',
      last_login: '2025-01-05T14:30:00Z'
    },
    {
      id: 2,
      full_name: 'Siti Aminah',
      email: 'siti@customer.com',
      role: 'customer',
      created_at: '2025-01-02T08:15:00Z',
      updated_at: '2025-01-05T09:20:00Z',
      last_login: '2025-01-05T13:45:00Z'
    },
    {
      id: 3,
      full_name: 'Budi Santoso',
      email: 'budi@customer.com',
      role: 'customer',
      created_at: '2025-01-03T10:30:00Z',
      updated_at: '2025-01-04T16:15:00Z',
      last_login: '2025-01-04T16:15:00Z'
    },
    {
      id: 4,
      full_name: 'Rina Staff',
      email: 'rina@staff.com',
      role: 'staff',
      created_at: '2025-01-03T14:20:00Z',
      updated_at: '2025-01-05T11:10:00Z',
      last_login: '2025-01-05T11:10:00Z'
    },
    {
      id: 5,
      full_name: 'Joko Farmer',
      email: 'joko@customer.com',
      role: 'customer',
      created_at: '2025-01-04T16:45:00Z',
      updated_at: '2025-01-05T08:30:00Z',
      last_login: '2025-01-05T08:30:00Z'
    }
  ];

  useEffect(() => {
    loadData();
  }, [currentPage, itemsPerPage, debouncedSearch, selectedRole, sortField, sortDirection]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulasi loading
      await new Promise(resolve => setTimeout(resolve, 500));

      // Filter dan search logic untuk mock data (with debounced search)
      let filteredUsers = [...mockUsers];

      if (debouncedSearch) {
        filteredUsers = filteredUsers.filter(user =>
          user.full_name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          user.email.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
      }

      if (selectedRole) {
        filteredUsers = filteredUsers.filter(user => user.role === selectedRole);
      }

      // Sorting
      filteredUsers.sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];
        
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (sortDirection === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });

      // Pagination
      const startIndex = (currentPage - 1) * itemsPerPage;
      const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

      setUsers(paginatedUsers);
      setTotalItems(filteredUsers.length);

    } catch (err) {
      setError(err.message || 'Gagal memuat data pengguna');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler functions
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (key, value) => {
    if (key === 'role') setSelectedRole(value);
    setCurrentPage(1);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsEdit(false);
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsEdit(true);
    setShowUserModal(true);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleChangeRole = (user) => {
    setSelectedUser(user);
    setShowRoleModal(true);
  };

  const confirmDelete = async () => {
    try {
      // await deleteUser(selectedUser.id);
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      setTotalItems(prev => prev - 1);
      setShowDeleteModal(false);
      // Optional: Show success message
      console.log(`User ${selectedUser.full_name} berhasil dihapus`);
    } catch (err) {
      setError('Gagal menghapus pengguna');
    }
  };

  const handleRoleChange = async (newRole) => {
    try {
      // await updateUserRole(selectedUser.id, newRole);
      setUsers(prev => prev.map(u => 
        u.id === selectedUser.id ? { ...u, role: newRole } : u
      ));
      setShowRoleModal(false);
    } catch (err) {
      setError('Gagal mengubah role pengguna');
    }
  };

  // Definisi kolom tabel
  const userColumns = [
    {
      key: 'full_name',
      label: 'Nama Lengkap',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.email}</div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (value) => {
        const roleConfig = {
          admin: { variant: 'purple', text: 'Admin' },
          staff: { variant: 'info', text: 'Staff' },
          customer: { variant: 'success', text: 'Customer' }
        };
        const config = roleConfig[value] || { variant: 'default', text: value };
        return <Badge variant={config.variant}>{config.text}</Badge>;
      }
    },
    {
      key: 'created_at',
      label: 'Tanggal Daftar',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    },
    {
      key: 'last_login',
      label: 'Login Terakhir',
      render: (value) => value ? new Date(value).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }) : 'Belum pernah'
    }
  ];

  // Actions untuk tabel
  const tableActions = [
    {
      label: 'Edit',
      icon: '✏️',
      onClick: handleEditUser,
      className: 'text-blue-600 hover:text-blue-900'
    },
    {
      label: 'Role',
      icon: '👤',
      onClick: handleChangeRole,
      className: 'text-purple-600 hover:text-purple-900'
    },
    {
      label: 'Hapus',
      icon: '🗑️',
      onClick: handleDeleteUser,
      className: 'text-red-600 hover:text-red-900'
    }
  ];

  // Filter options
  const filterOptions = [
    {
      key: 'role',
      label: 'Role',
      value: selectedRole,
      placeholder: 'Semua Role',
      options: [
        { value: 'admin', label: 'Admin' },
        { value: 'staff', label: 'Staff' },
        { value: 'customer', label: 'Customer' }
      ]
    }
  ];

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-600 mt-1">Kelola data pengguna dan role akses</p>
          </div>
          <button
            onClick={handleAddUser}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <span className="mr-2">👤</span>
            Tambah User
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert 
            type="error" 
            title="Terjadi Kesalahan"
            message={error}
            onClose={() => setError(null)}
          />
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                    <span className="text-xl text-purple-600">👑</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Admin</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {mockUsers.filter(u => u.role === 'admin').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <span className="text-xl text-blue-600">👥</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Staff</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {mockUsers.filter(u => u.role === 'staff').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <span className="text-xl text-green-600">🌾</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Customer</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {mockUsers.filter(u => u.role === 'customer').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <SearchFilter
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            placeholder="Cari pengguna berdasarkan nama atau email..."
            filters={filterOptions}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Daftar Pengguna ({totalItems})
              </h3>
              <div className="text-sm text-gray-500">
                Halaman {currentPage} dari {totalPages}
              </div>
            </div>
          </div>

          <Table
            columns={userColumns}
            data={users}
            actions={tableActions}
            onSort={handleSort}
            sortField={sortField}
            sortDirection={sortDirection}
            isLoading={isLoading}
            emptyMessage="Belum ada pengguna yang terdaftar"
          />

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          )}
        </div>

        {/* User Modal */}
        <UserModal
          isOpen={showUserModal}
          onClose={() => setShowUserModal(false)}
          user={selectedUser}
          isEdit={isEdit}
          onSave={(userData) => {
            console.log('Saving user:', userData);
            setShowUserModal(false);
            loadData();
          }}
        />

        {/* Role Change Modal */}
        <RoleChangeModal
          isOpen={showRoleModal}
          onClose={() => setShowRoleModal(false)}
          user={selectedUser}
          onRoleChange={handleRoleChange}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="Hapus Akun Admin"
          message={`Apakah Anda yakin ingin menghapus akun admin "${selectedUser?.full_name}"? Akun akan dihapus dan tidak bisa dipulihkan. Tindakan ini tidak dapat dibatalkan.`}
          confirmText="Hapus"
          type="danger"
        />
      </div>
    </AdminLayout>
  );
};

/**
 * Modal untuk form tambah/edit user
 */
const UserModal = ({ isOpen, onClose, user, isEdit, onSave }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'customer'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && isEdit) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        password: '',
        role: user.role || 'customer'
      });
    } else {
      setFormData({
        full_name: '',
        email: '',
        password: '',
        role: 'customer'
      });
    }
  }, [user, isEdit, isOpen]);

  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setValidationError('');

    try {
      // Validasi field wajib
      if (!formData.full_name || !formData.email || (!isEdit && !formData.password)) {
        throw new Error('Semua field wajib diisi');
      }

      // Validasi nama - hanya huruf, angka, spasi, titik, underscore
      const nameRegex = /^[\p{L}\d\s._]+$/u;
      if (!nameRegex.test(formData.full_name.trim())) {
        throw new Error('Nama hanya boleh berisi huruf, angka, spasi, titik, dan underscore. Karakter spesial tidak diperbolehkan');
      }

      // Validasi panjang nama
      if (formData.full_name.trim().length < 3) {
        throw new Error('Nama minimal 3 karakter');
      }

      if (formData.full_name.trim().length > 50) {
        throw new Error('Nama maksimal 50 karakter');
      }

      // Validasi spasi di awal/akhir
      if (formData.full_name !== formData.full_name.trim()) {
        throw new Error('Nama tidak boleh dimulai atau diakhiri dengan spasi');
      }

      // Validasi password (jika ada)
      if (formData.password) {
        if (formData.password.length < 8) {
          throw new Error('Password minimal 8 karakter');
        }

        if (formData.password.length > 100) {
          throw new Error('Password maksimal 100 karakter');
        }
      }

      await onSave(formData);
    } catch (err) {
      console.error('Error saving user:', err);
      setValidationError(err.message || 'Terjadi kesalahan saat menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <ModalAdmin
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Validation Error Alert */}
        {validationError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p className="text-sm">{validationError}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
            placeholder="Masukkan nama lengkap (min 3 karakter)"
            required
            minLength={3}
            maxLength={50}
          />
          <p className="text-xs text-gray-500 mt-1">
            Hanya huruf, angka, spasi, titik (.), dan underscore (_)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
            placeholder="masukkan@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isEdit ? 'Password Baru (kosongkan jika tidak ingin mengubah)' : 'Password'} 
            {!isEdit && <span className="text-red-500"> *</span>}
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
            placeholder="Masukkan password (min 8 karakter)"
            required={!isEdit}
            minLength={8}
            maxLength={100}
          />
          <p className="text-xs text-gray-500 mt-1">
            Password minimal 8 karakter
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role <span className="text-red-500">*</span>
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
            required
          >
            <option value="customer">Customer</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <LoadingSpinner size="sm" className="mr-2" />
                {isEdit ? 'Mengupdate...' : 'Menyimpan...'}
              </div>
            ) : (
              isEdit ? 'Update User' : 'Tambah User'
            )}
          </button>
        </div>
      </form>
    </ModalAdmin>
  );
};

/**
 * Modal untuk mengubah role user
 */
const RoleChangeModal = ({ isOpen, onClose, user, onRoleChange }) => {
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user]);

  const handleConfirm = () => {
    if (selectedRole !== user?.role) {
      onRoleChange(selectedRole);
    } else {
      onClose();
    }
  };

  return (
    <ModalAdmin
      isOpen={isOpen}
      onClose={onClose}
      title="Ubah Role Pengguna"
      size="sm"
    >
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-gray-600">
            Ubah role untuk <strong>{user?.full_name}</strong>
          </p>
          <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pilih Role Baru
          </label>
          <div className="space-y-2">
            {['customer', 'staff', 'admin'].map((role) => (
              <label key={role} className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value={role}
                  checked={selectedRole === role}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-900 capitalize">{role}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 border border-transparent rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Ubah Role
          </button>
        </div>
      </div>
    </ModalAdmin>
  );
};

export default UserManagement;
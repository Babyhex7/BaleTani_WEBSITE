import React, { useEffect, useState } from 'react';
import {
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  UserIcon,
  ShieldCheckIcon,
  CheckCircleIcon as CheckCircleOutline,
  XCircleIcon as XCircleOutline
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import AdminSidebarNew from '../../components/layout_admin/AdminSidebarNew';
import AdminHeaderNew from '../../components/layout_admin/AdminHeaderNew';
import AdminDetailModal from '../../components/ui_admin/AdminDetailModal';
import AdminFormModal from '../../components/ui_admin/AdminFormModal';
import DeleteConfirmModal from '../../components/ui_admin/DeleteConfirmModal';
import Pagination from '../../components/ui_admin/Pagination';
import useDebounce from '../../hooks/useDebounce';
import adminUserService from '../../services/services_admin/userService';

const AdminManagement = () => {
  // State management
  const [admins, setAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalRoles: 0
  });

  // Modals
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' or 'edit'

  // Fetch data
  useEffect(() => {
    fetchAdmins();
    fetchRoles();
  }, [debouncedSearch, filterRole, filterStatus, currentPage, itemsPerPage]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: itemsPerPage
      };

      if (debouncedSearch) params.search = debouncedSearch;
      if (filterRole) params.role_id = filterRole;
      if (filterStatus) params.is_active = filterStatus;

      const response = await adminUserService.getAllAdmins(params);
      
      if (response.success) {
        setAdmins(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        setTotalItems(response.data.pagination.totalItems);
        setCurrentPage(response.data.pagination.currentPage);
        
        // Update stats
        setStats({
          total: response.data.stats.total,
          active: response.data.stats.active,
          inactive: response.data.stats.inactive,
          totalRoles: response.data.stats.totalRoles
        });
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat data admin');
      toast.error('Gagal memuat data admin');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await adminUserService.getAllRoles();
      if (response.success) {
        setRoles(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  // Handler functions
  const handleView = (admin) => {
    setSelectedAdmin(admin);
    setIsDetailModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedAdmin(null);
    setFormMode('create');
    setIsFormModalOpen(true);
  };

  const handleEdit = (admin) => {
    setSelectedAdmin(admin);
    setFormMode('edit');
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (admin) => {
    setSelectedAdmin(admin);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAdmin) return;

    try {
      const response = await adminUserService.deleteAdmin(selectedAdmin.id);
      if (response.success) {
        toast.success('Admin berhasil dihapus');
        fetchAdmins();
        setIsDeleteModalOpen(false);
        setSelectedAdmin(null);
      }
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus admin');
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (formMode === 'create') {
        const response = await adminUserService.createAdmin(formData);
        if (response.success) {
          toast.success('Admin berhasil ditambahkan');
          fetchAdmins();
          setIsFormModalOpen(false);
        }
      } else {
        const response = await adminUserService.updateAdmin(selectedAdmin.id, formData);
        if (response.success) {
          toast.success('Admin berhasil diperbarui');
          fetchAdmins();
          setIsFormModalOpen(false);
        }
      }
    } catch (err) {
      toast.error(err.message || `Gagal ${formMode === 'create' ? 'menambahkan' : 'memperbarui'} admin`);
      throw err;
    }
  };

  // Helper functions
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (isActive) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          Aktif
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
        Nonaktif
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebarNew />
      <div className="flex-1">
        <AdminHeaderNew
          title="Manajemen Admin"
          subtitle="Kelola data admin dan hak akses"
        />

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Admin</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <UserIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Admin Aktif</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Admin Nonaktif</p>
                  <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <XCircleIcon className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Roles</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalRoles}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <ShieldCheckIcon className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Daftar Admin</h2>
                <button
                  onClick={handleAddNew}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <PlusIcon className="w-5 h-5" />
                  Tambah Admin
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari nama atau nomor HP..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Role Filter */}
                <select
                  value={filterRole}
                  onChange={(e) => {
                    setFilterRole(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua Role</option>
                  {roles && roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.role_name}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua Status</option>
                  <option value="true">Aktif</option>
                  <option value="false">Nonaktif</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center p-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat data...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center p-12">
                  <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                      onClick={fetchAdmins}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Coba Lagi
                    </button>
                  </div>
                </div>
              ) : admins.length === 0 ? (
                <div className="flex items-center justify-center p-12">
                  <div className="text-center">
                    <UserIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Tidak ada data admin</p>
                    <button
                      onClick={handleAddNew}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Tambah Admin Pertama
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nama Lengkap
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nomor HP
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dibuat
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {admins.map((admin) => (
                        <tr key={admin.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <UserIcon className="w-6 h-6 text-blue-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {admin.full_name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{admin.phone_number}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <ShieldCheckIcon className="w-4 h-4" />
                              {admin.role?.role_name || '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(admin.is_active)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(admin.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleView(admin)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Lihat Detail"
                              >
                                <EyeIcon className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleEdit(admin)}
                                className="text-green-600 hover:text-green-900"
                                title="Edit"
                              >
                                <PencilIcon className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(admin)}
                                className="text-red-600 hover:text-red-900"
                                title="Hapus"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={(value) => {
                          setItemsPerPage(value);
                          setCurrentPage(1);
                        }}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AdminDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedAdmin(null);
        }}
        admin={selectedAdmin}
      />

      <AdminFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedAdmin(null);
        }}
        onSubmit={handleFormSubmit}
        admin={selectedAdmin}
        isEditMode={formMode === 'edit'}
        roles={roles || []}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedAdmin(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Hapus Admin"
        message={`Apakah Anda yakin ingin menghapus admin "${selectedAdmin?.full_name}"? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
};

export default AdminManagement;

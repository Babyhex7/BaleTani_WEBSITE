import { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  TagIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CubeIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import toast from 'react-hot-toast';
import AdminSidebarNew from "../../components/layout_admin/AdminSidebarNew";
import AdminHeaderNew from "../../components/layout_admin/AdminHeaderNew";
import DiscountFormModal from "../../components/ui_admin/DiscountFormModal";
import DiscountDetailModal from "../../components/ui_admin/DiscountDetailModal";
import AssignProductModal from "../../components/ui_admin/AssignProductModal";
import DeleteConfirmModal from "../../components/ui_admin/DeleteConfirmModal";
import Pagination from "../../components/ui_admin/Pagination";
import inventoryService from "../../services/services_admin/inventoryService";

const DiscountManagement = () => {
  // State management
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState(""); // active, expired, upcoming
  const [filterType, setFilterType] = useState(""); // percentage, fixed_amount
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    percentage: 0,
    fixedAmount: 0,
  });

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch data on mount and filter change
  useEffect(() => {
    fetchDiscounts();
  }, [currentPage, searchQuery, filterStatus, filterType, itemsPerPage]);

  // API Calls
  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        status: filterStatus,
        discount_type: filterType,
      };

      const data = await inventoryService.getDiscounts(params);

      if (data.success) {
        const discountsList = data.data.discounts || [];
        
        console.log('📊 Discount Pagination Data:', data.data.pagination);
        console.log('📊 Total Pages:', data.data.pagination?.total_pages);
        console.log('📊 Total Items:', data.data.pagination?.total_items);

        setDiscounts(discountsList);
        setTotalPages(data.data.pagination?.total_pages || 1);
        setTotalItems(data.data.pagination?.total_items || 0);

        // Calculate stats
        const total = discountsList.length;
        const active = discountsList.filter(
          (d) => d.status === "active" && d.is_active
        ).length;
        const inactive = discountsList.filter((d) => !d.is_active).length;
        const percentage = discountsList.filter(
          (d) => d.discount_type === "percentage"
        ).length;
        const fixedAmount = discountsList.filter(
          (d) => d.discount_type === "fixed_amount"
        ).length;

        setStats({ total, active, inactive, percentage, fixedAmount });

        setError(null);
      }
    } catch (err) {
      console.error("Error fetching discounts:", err);
      setError(err.message || "Gagal memuat diskon");
    } finally {
      setLoading(false);
    }
  };

  // CRUD Handlers
  const handleCreate = () => {
    setModalMode("create");
    setSelectedDiscount(null);
    setShowFormModal(true);
  };

  const handleView = async (discount) => {
    try {
      const discountId = discount.id || discount.discount_id;

      if (!discountId) {
        toast.error("ID diskon tidak valid");
        return;
      }

      const data = await inventoryService.getDiscountById(discountId);
      if (data.success) {
        setSelectedDiscount(data.data);
        setShowDetailModal(true);
      }
    } catch (err) {
      console.error("Error viewing discount:", err);
      toast.error(err.message || "Gagal memuat detail diskon");
    }
  };

  const handleEdit = async (discount) => {
    try {
      const discountId = discount.id || discount.discount_id;

      if (!discountId) {
        toast.error("ID diskon tidak valid");
        return;
      }

      const data = await inventoryService.getDiscountById(discountId);
      if (data.success) {
        setSelectedDiscount(data.data);
        setModalMode("edit");
        setShowFormModal(true);
      }
    } catch (err) {
      console.error("Error editing discount:", err);
      toast.error(err.message || "Gagal memuat data diskon");
    }
  };

  const handleDelete = (discount) => {
    setSelectedDiscount(discount);
    setShowDeleteModal(true);
  };

  const handleSubmitDiscount = async (formData) => {
    try {
      if (modalMode === "create") {
        await inventoryService.createDiscount(formData);
        toast.success("Diskon berhasil ditambahkan!");
      } else {
        const discountId = selectedDiscount.id || selectedDiscount.discount_id;
        await inventoryService.updateDiscount(discountId, formData);
        toast.success("Diskon berhasil diperbarui!");
      }

      await fetchDiscounts();
      setShowFormModal(false);
      setSelectedDiscount(null);
    } catch (err) {
      console.error("Error submitting discount:", err);
      toast.error(err.message || "Gagal menyimpan diskon");
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleteLoading(true);

      const discountId = selectedDiscount.id || selectedDiscount.discount_id;

      if (!discountId) {
        toast.error("ID diskon tidak valid");
        setDeleteLoading(false);
        return;
      }

      await inventoryService.deleteDiscount(discountId);

      toast.success("Diskon berhasil dihapus!");

      await fetchDiscounts();
      setShowDeleteModal(false);
      setSelectedDiscount(null);
    } catch (err) {
      console.error("Error deleting discount:", err);
      toast.error(err.message || "Gagal menghapus diskon");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleStatus = async (discount) => {
    try {
      const discountId = discount.id || discount.discount_id;
      const response = await inventoryService.toggleDiscountStatus(discountId);

      if (response.success) {
        toast.success("Status diskon berhasil diubah!");
        fetchDiscounts();
      }
    } catch (err) {
      console.error("Error toggling status:", err);
      toast.error(err.message || "Gagal mengubah status diskon");
    }
  };

  const handleAssignProducts = (discount) => {
    setSelectedDiscount(discount);
    setShowAssignModal(true);
  };

  // Get status badge
  const getStatusBadge = (discount) => {
    const status = discount.status;
    const isActive = discount.is_active;

    if (!isActive) {
      return (
        <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full flex items-center gap-1 w-fit">
          <XCircleIcon className="w-3 h-3" />
          Nonaktif
        </span>
      );
    }

    if (status === "active") {
      return (
        <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full flex items-center gap-1 w-fit">
          <CheckCircleIcon className="w-3 h-3" />
          Aktif
        </span>
      );
    } else if (status === "expired") {
      return (
        <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full flex items-center gap-1 w-fit">
          <XCircleIcon className="w-3 h-3" />
          Expired
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full flex items-center gap-1 w-fit">
          <ClockIcon className="w-3 h-3" />
          Upcoming
        </span>
      );
    }
  };

  // Format value
  const formatValue = (type, value) => {
    if (type === "percentage") {
      return `${value}%`;
    }
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebarNew />

      <div className="flex-1">
        <AdminHeaderNew
          title="Discount Management"
          subtitle="Kelola campaign diskon produk"
        />

        <div className="p-6">
          {/* Toast Notification dipindah global di main.jsx */}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Diskon</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TagIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Diskon Aktif</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.active}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Diskon Nonaktif</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {stats.inactive}
                  </p>
                </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <XCircleIcon className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Percentage</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.percentage}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TagIcon className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Fixed Amount</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.fixedAmount}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <TagIcon className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Daftar Diskon
                </h2>

                <button
                  onClick={handleCreate}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <PlusIcon className="w-5 h-5" />
                  Tambah Diskon
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari nama diskon..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Semua Status</option>
                    <option value="active">Aktif</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>

                <div>
                  <select
                    value={filterType}
                    onChange={(e) => {
                      setFilterType(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Semua Tipe</option>
                    <option value="percentage">Percentage</option>
                    <option value="fixed_amount">Fixed Amount</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <ArrowPathIcon className="w-8 h-8 text-green-600 animate-spin" />
                  <span className="ml-3 text-gray-600">Memuat data...</span>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <XCircleIcon className="w-12 h-12 text-red-500 mb-3" />
                  <p className="text-red-600 font-medium">{error}</p>
                  <button
                    onClick={fetchDiscounts}
                    className="mt-4 px-4 py-2 text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Coba Lagi
                  </button>
                </div>
              ) : discounts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <TagIcon className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-gray-600 font-medium">Tidak ada diskon</p>
                  <button
                    onClick={handleCreate}
                    className="mt-4 px-4 py-2 text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    + Tambah Diskon Pertama
                  </button>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Nama Diskon
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tipe
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Nilai
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Periode
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Produk
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {discounts.map((discount) => {
                      const discountId = discount.id || discount.discount_id;
                      const productCount = discount.product_count || 0;

                      return (
                        <tr key={discountId} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-green-100 rounded-lg">
                                <TagIcon className="w-5 h-5 text-green-600" />
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {discount.discount_name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded ${
                                discount.discount_type === "percentage"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {discount.discount_type === "percentage"
                                ? "Percentage"
                                : "Fixed Amount"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-gray-900">
                              {formatValue(
                                discount.discount_type,
                                discount.value
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600">
                              <div>{formatDate(discount.start_date)}</div>
                              <div className="text-xs text-gray-500">
                                s/d {formatDate(discount.end_date)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleAssignProducts(discount)}
                              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              <CubeIcon className="w-4 h-4" />
                              {productCount} produk
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {getStatusBadge(discount)}
                              <button
                                onClick={() => handleToggleStatus(discount)}
                                className={`text-xs px-2 py-1 rounded ${
                                  discount.is_active
                                    ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    : "bg-green-100 text-green-600 hover:bg-green-200"
                                }`}
                                title={
                                  discount.is_active ? "Nonaktifkan" : "Aktifkan"
                                }
                              >
                                {discount.is_active ? "Off" : "On"}
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleView(discount)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                title="View"
                              >
                                <EyeIcon className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleEdit(discount)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                title="Edit"
                              >
                                <PencilIcon className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(discount)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                title="Delete"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {!loading && !error && discounts.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(newLimit) => {
                  setItemsPerPage(newLimit);
                  setCurrentPage(1);
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <DiscountFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setSelectedDiscount(null);
        }}
        isEditMode={modalMode === "edit"}
        discount={selectedDiscount}
        onSuccess={handleSubmitDiscount}
      />

      <DiscountDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedDiscount(null);
        }}
        discount={selectedDiscount}
        onRefresh={fetchDiscounts}
      />

      <AssignProductModal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedDiscount(null);
        }}
        discount={selectedDiscount}
        onSuccess={() => {
          fetchDiscounts();
        }}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedDiscount(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Hapus Diskon"
        message="Apakah Anda yakin ingin menghapus diskon ini? Diskon akan di-soft delete dan tidak akan muncul di daftar."
        itemName={selectedDiscount?.discount_name}
        loading={deleteLoading}
      />
    </div>
  );
};

export default DiscountManagement;

import React, { useState, useEffect } from "react";
import {
  ClipboardDocumentListIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import AdminLayout from "../../components/layout_admin/AdminLayout";
import Pagination from "../../components/ui_admin/Pagination";
import ModalAdmin from "../../components/ui_admin/ModalAdmin";
import { formatCurrency, formatDateTime, mockProducts } from "../../utils/mockProductData";
import procurementService from "../../services/services_admin/procurementService";
import { toast } from "react-hot-toast";
import useAdminStore from "../../store/store_admin/useAdminStore";
import { hasPermission } from "../../utils/rolePermissions";

/**
 * ProcurementManagementNew - Halaman manajemen pengadaan barang
 * Dengan fitur approval untuk Super Inventory Admin
 */
const ProcurementManagementNew = () => {
  const admin = useAdminStore((state) => state.admin);
  const userRole = admin?.role?.role_name;
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProcurement, setSelectedProcurement] = useState(null);
  const [procurements, setProcurements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Create procurement form state
  const [newProcurement, setNewProcurement] = useState({
    items: [],
  });
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");

  // Fetch procurements
  const fetchProcurements = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter,
      };

      const response = await procurementService.getAllProcurements(params);
      setProcurements(response.data.procurements);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching procurements:", error);
      toast.error("Failed to fetch procurements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcurements();
  }, [currentPage, searchTerm, statusFilter]);

  // View procurement detail
  const viewProcurementDetail = async (procurement) => {
    try {
      const response = await procurementService.getProcurementById(procurement.id);
      setSelectedProcurement(response.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error("Error fetching procurement detail:", error);
      toast.error("Failed to fetch procurement details");
    }
  };

  // Approve procurement
  const handleApproveProcurement = async (procurementId) => {
    if (!confirm("Are you sure you want to approve this procurement?")) {
      return;
    }

    try {
      await procurementService.approveProcurement(procurementId);
      toast.success("Procurement approved successfully. Stock has been updated.");
      fetchProcurements();
      setShowDetailModal(false);
    } catch (error) {
      console.error("Error approving procurement:", error);
      toast.error(error.message || "Failed to approve procurement");
    }
  };

  // Reject procurement
  const handleRejectProcurement = async (procurementId) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (!reason) return;

    try {
      await procurementService.rejectProcurement(procurementId, {
        rejection_reason: reason,
      });
      toast.success("Procurement rejected");
      fetchProcurements();
      setShowDetailModal(false);
    } catch (error) {
      console.error("Error rejecting procurement:", error);
      toast.error("Failed to reject procurement");
    }
  };

  // Add item to procurement
  const handleAddItem = () => {
    if (!selectedProduct || !quantity || !unitPrice) {
      toast.error("Please fill all fields");
      return;
    }

    const product = mockProducts.find(p => p.id === parseInt(selectedProduct));
    if (!product) {
      toast.error("Product not found");
      return;
    }

    const qtyNum = parseFloat(quantity);
    const priceNum = parseFloat(unitPrice);

    if (qtyNum <= 0 || priceNum <= 0) {
      toast.error("Quantity and price must be positive");
      return;
    }

    const newItem = {
      product_id: product.id,
      product_name: product.name,
      quantity: qtyNum,
      unit: product.unit,
      unit_price: priceNum,
      total_price: qtyNum * priceNum,
    };

    setNewProcurement({
      ...newProcurement,
      items: [...newProcurement.items, newItem],
    });

    // Reset form
    setSelectedProduct("");
    setQuantity("");
    setUnitPrice("");
  };

  // Remove item from procurement
  const handleRemoveItem = (index) => {
    const updatedItems = newProcurement.items.filter((_, i) => i !== index);
    setNewProcurement({
      ...newProcurement,
      items: updatedItems,
    });
  };

  // Submit procurement
  const handleSubmitProcurement = async () => {
    if (newProcurement.items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    try {
      const procurementData = {
        items: newProcurement.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      };

      await procurementService.createProcurement(procurementData);
      toast.success("Procurement created successfully");
      setShowCreateModal(false);
      setNewProcurement({ items: [] });
      fetchProcurements();
    } catch (error) {
      console.error("Error creating procurement:", error);
      toast.error(error.message || "Failed to create procurement");
    }
  };

  // Calculate total
  const calculateTotal = () => {
    return newProcurement.items.reduce((sum, item) => sum + item.total_price, 0);
  };

  const getStatusBadge = (status) => {
    const statuses = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };

    const icons = {
      pending: "⏳",
      approved: "✓",
      rejected: "✗",
    };

    return (
      <span
        className={`px-3 py-1 text-xs font-semibold rounded-full ${
          statuses[status] || statuses.pending
        }`}
      >
        {icons[status]} {status?.toUpperCase()}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <ClipboardDocumentListIcon className="w-8 h-8 text-green-600" />
              Procurement Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage product procurement and stock replenishment
            </p>
          </div>
          {hasPermission(userRole, 'create_procurement') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm hover:shadow-md"
            >
              <PlusIcon className="w-5 h-5" />
              New Procurement
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by procurement number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Procurements Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Procurement #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : procurements.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No procurements found
                    </td>
                  </tr>
                ) : (
                  procurements.map((procurement) => (
                    <tr key={procurement.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {procurement.procurement_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {procurement.creator?.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(procurement.total_cost)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(procurement.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(procurement.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => viewProcurementDetail(procurement)}
                          className="text-green-600 hover:text-green-900 flex items-center gap-1"
                        >
                          <EyeIcon className="w-5 h-5" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && procurements.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>

        {/* Procurement Detail Modal */}
        {showDetailModal && selectedProcurement && (
          <ModalAdmin
            isOpen={showDetailModal}
            onClose={() => setShowDetailModal(false)}
            title={`Procurement Details - ${selectedProcurement.procurement_number}`}
            size="lg"
          >
            <div className="space-y-6">
              {/* Status */}
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-sm text-gray-600">Status:</span>
                {getStatusBadge(selectedProcurement.status)}
              </div>

              {/* Creator Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Created By
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-900">
                    {selectedProcurement.creator?.fullName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDateTime(selectedProcurement.created_at)}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Items</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                          Product
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                          Quantity
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                          Unit Price
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedProcurement.items?.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {item.product?.name}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {formatCurrency(item.unit_price)}
                          </td>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">
                            {formatCurrency(item.total_price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan="3" className="px-4 py-2 text-sm font-semibold text-gray-900">
                          Total Cost:
                        </td>
                        <td className="px-4 py-2 text-sm font-bold text-gray-900">
                          {formatCurrency(selectedProcurement.total_cost)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Approval/Rejection Info */}
              {selectedProcurement.status === "approved" && (
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    <strong>Approved by:</strong> {selectedProcurement.approver?.fullName}
                  </p>
                  <p className="text-xs text-green-600">
                    {formatDateTime(selectedProcurement.approved_at)}
                  </p>
                </div>
              )}

              {selectedProcurement.status === "rejected" && (
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm text-red-800">
                    <strong>Rejected by:</strong> {selectedProcurement.rejecter?.fullName}
                  </p>
                  <p className="text-xs text-red-600">
                    {formatDateTime(selectedProcurement.rejected_at)}
                  </p>
                  <p className="text-sm text-red-800 mt-2">
                    <strong>Reason:</strong> {selectedProcurement.rejection_reason}
                  </p>
                </div>
              )}

              {/* Actions for Pending */}
              {selectedProcurement.status === "pending" && hasPermission(userRole, 'approve_procurement') && (
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button
                    onClick={() => handleRejectProcurement(selectedProcurement.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <XCircleIcon className="w-5 h-5" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApproveProcurement(selectedProcurement.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                    Approve
                  </button>
                </div>
              )}
            </div>
          </ModalAdmin>
        )}

        {/* Create Procurement Modal */}
        {showCreateModal && (
          <ModalAdmin
            isOpen={showCreateModal}
            onClose={() => {
              setShowCreateModal(false);
              setNewProcurement({ items: [] });
              setSelectedProduct("");
              setQuantity("");
              setUnitPrice("");
            }}
            title="Create New Procurement"
            size="xl"
          >
            <div className="space-y-6">
              {/* Add Item Form */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">
                  Add Product to Procurement
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Product
                    </label>
                    <select
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">-- Select Product --</option>
                      {mockProducts.filter(p => p.is_active).map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.unit})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Price (Rp)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={handleAddItem}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Add Item
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Items ({newProcurement.items.length})
                </h3>
                {newProcurement.items.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    No items added yet. Add products to continue.
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                            Product
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                            Quantity
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                            Unit Price
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                            Total
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {newProcurement.items.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {item.product_name}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {item.quantity} {item.unit}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {formatCurrency(item.unit_price)}
                            </td>
                            <td className="px-4 py-2 text-sm font-medium text-gray-900">
                              {formatCurrency(item.total_price)}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <button
                                onClick={() => handleRemoveItem(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan="3" className="px-4 py-3 text-sm font-semibold text-gray-900">
                            Total Cost:
                          </td>
                          <td colSpan="2" className="px-4 py-3 text-sm font-bold text-green-600">
                            {formatCurrency(calculateTotal())}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewProcurement({ items: [] });
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitProcurement}
                  disabled={newProcurement.items.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircleIcon className="w-5 h-5" />
                  Submit Procurement
                </button>
              </div>
            </div>
          </ModalAdmin>
        )}
      </div>
    </AdminLayout>
  );
};

export default ProcurementManagementNew;

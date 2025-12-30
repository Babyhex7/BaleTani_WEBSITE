import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FiX, FiPlus, FiTrash2, FiChevronDown } from "react-icons/fi";
import procurementService from "../../services/services_admin/procurementService";
import { getProducts } from "../../services/services_admin/inventoryService";
import useAdminStore from "../../store/store_admin/useAdminStore";

const ProcurementFormModal = ({ procurement, onClose, onSuccess }) => {
  const isEdit = !!procurement;
  const isPending = procurement?.status === "pending";
  const { admin } = useAdminStore();
  
  // Check if user has permission to approve/reject
  const adminRole = typeof admin?.role === "string" ? admin.role : admin?.role?.role_name;
  const canApproveReject = adminRole === "super_admin" || adminRole === "super_inventory_admin";
  
  const [showActionDropdown, setShowActionDropdown] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const [formData, setFormData] = useState({
    procurement_date: procurement?.procurement_date?.slice(0, 10) || "",
    procurement_type: procurement?.procurement_type || "online",
    supplier_name: procurement?.supplier_name || "",
    notes: procurement?.notes || "",
    items: procurement?.items?.map((item) => ({
      product_id: item.product_id,
      product_name: item.product?.name || "",
      quantity: item.quantity,
      unit_price: item.purchase_price_per_unit,
      expiry_date: item.expiry_date?.slice(0, 10) || "",
    })) || [
      {
        product_id: "",
        product_name: "",
        quantity: 1,
        unit_price: 0,
        expiry_date: "",
      },
    ],
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showActionDropdown && !event.target.closest('.relative')) {
        setShowActionDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showActionDropdown]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts({ limit: 1000 });
      if (response.success) {
        setProducts(response.data.items || response.data.products || []);
      }
    } catch (error) {
      toast.error("Gagal memuat data produk");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;

    if (field === "product_id") {
      const product = products.find((p) => p.id === value);
      if (product) {
        newItems[index].product_name = product.name;
      }
    }

    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          product_id: "",
          product_name: "",
          quantity: 1,
          unit_price: 0,
          expiry_date: "",
        },
      ],
    });
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) {
      toast.error("Minimal harus ada 1 item");
      return;
    }
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    return formData.items.reduce(
      (sum, item) => sum + parseFloat(item.quantity) * parseFloat(item.unit_price || 0),
      0
    );
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const validateForm = () => {
    if (!formData.procurement_date) {
      toast.error("Tanggal pengadaan harus diisi");
      return false;
    }

    if (!formData.supplier_name.trim()) {
      toast.error("Nama supplier harus diisi");
      return false;
    }

    for (let i = 0; i < formData.items.length; i++) {
      const item = formData.items[i];
      if (!item.product_id) {
        toast.error(`Produk pada item ${i + 1} harus dipilih`);
        return false;
      }
      if (!item.quantity || item.quantity <= 0) {
        toast.error(`Jumlah pada item ${i + 1} harus lebih dari 0`);
        return false;
      }
      if (!item.unit_price || item.unit_price <= 0) {
        toast.error(`Harga satuan pada item ${i + 1} harus lebih dari 0`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const payload = {
        procurement_date: formData.procurement_date,
        procurement_type: formData.procurement_type,
        supplier_name: formData.supplier_name.trim(),
        notes: formData.notes.trim() || null,
        items: formData.items.map((item) => ({
          product_id: item.product_id,
          quantity: parseFloat(item.quantity),
          unit_price: parseFloat(item.unit_price),
          expiry_date: item.expiry_date || null,
        })),
      };

      let response;
      if (isEdit) {
        response = await procurementService.updateProcurement(
          procurement.id,
          payload
        );
      } else {
        response = await procurementService.createProcurement(payload);
      }

      if (response.success) {
        toast.success(
          isEdit
            ? "Pengadaan berhasil diperbarui"
            : "Pengadaan berhasil dibuat"
        );
        onSuccess();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          `Gagal ${isEdit ? "memperbarui" : "membuat"} pengadaan`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async () => {
    try {
      setSubmitting(true);
      const response = await procurementService.approveProcurement(procurement.id);
      if (response.success) {
        toast.success("Pengadaan berhasil disetujui");
        setShowApprovalModal(false);
        onSuccess();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menyetujui pengadaan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Alasan penolakan harus diisi");
      return;
    }

    try {
      setSubmitting(true);
      const response = await procurementService.rejectProcurement(procurement.id, {
        rejection_reason: rejectionReason,
      });
      if (response.success) {
        toast.success("Pengadaan berhasil ditolak");
        setShowRejectionModal(false);
        setRejectionReason("");
        onSuccess();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menolak pengadaan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-full sm:max-w-3xl lg:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 truncate">
                {isEdit ? "Edit Pengadaan" : "Buat Pengadaan Baru"}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Tambah pengadaan barang baru</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 ml-2"
          >
            <FiX size={18} className="text-gray-500 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
          <div className="space-y-4 sm:space-y-5">
            {/* Basic Info - Responsive Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
                  Tanggal Pengadaan <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="procurement_date"
                  value={formData.procurement_date}
                  onChange={handleInputChange}
                  className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
                  Tipe Pengadaan <span className="text-red-500">*</span>
                </label>
                <select
                  name="procurement_type"
                  value={formData.procurement_type}
                  onChange={handleInputChange}
                  className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
                  Supplier (Opsional)
                </label>
                <input
                  type="text"
                  name="supplier_name"
                  value={formData.supplier_name}
                  onChange={handleInputChange}
                  placeholder="Nama supplier..."
                  className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Items Section */}
            <div>
              <div className="flex justify-between items-center mb-2 sm:mb-3">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                  Daftar Item
                </h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="text-green-600 hover:text-green-700 text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-1.5"
                >
                  <FiPlus size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Tambah Baris</span>
                  <span className="sm:hidden">Tambah</span>
                </button>
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-3 mb-2 px-3 text-xs font-medium text-gray-600">
                  <div className="col-span-4">Produk <span className="text-red-500">*</span></div>
                  <div className="col-span-2">Jumlah <span className="text-red-500">*</span></div>
                  <div className="col-span-2">Harga/Unit <span className="text-red-500">*</span></div>
                  <div className="col-span-2">Subtotal</div>
                  <div className="col-span-2">Expiry (Opsional)</div>
                </div>

                {/* Items List */}
                <div className="space-y-2">
                  {formData.items.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-3 items-center bg-gray-50 p-3 rounded-lg border border-gray-200"
                    >
                      <div className="col-span-4">
                        <select
                          value={item.product_id}
                          onChange={(e) =>
                            handleItemChange(index, "product_id", e.target.value)
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">-- Pilih produk --</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, "quantity", e.target.value)
                          }
                          min="1"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) =>
                            handleItemChange(index, "unit_price", e.target.value)
                          }
                          min="0"
                          placeholder="0"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <div className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md font-medium text-gray-900">
                          {formatCurrency(
                            parseFloat(item.quantity) *
                              parseFloat(item.unit_price || 0)
                          )}
                        </div>
                      </div>

                      <div className="col-span-2">
                        <input
                          type="date"
                          value={item.expiry_date}
                          onChange={(e) =>
                            handleItemChange(index, "expiry_date", e.target.value)
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="col-span-1 flex justify-end">
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:bg-red-50 p-2 rounded-md transition-colors"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden space-y-3">
                {formData.items.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200 space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-700">Item {index + 1}</span>
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Produk <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={item.product_id}
                        onChange={(e) =>
                          handleItemChange(index, "product_id", e.target.value)
                        }
                        className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">-- Pilih produk --</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Jumlah <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, "quantity", e.target.value)
                          }
                          min="1"
                          className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Harga/Unit <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) =>
                            handleItemChange(index, "unit_price", e.target.value)
                          }
                          min="0"
                          placeholder="0"
                          className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Expiry Date (Opsional)
                      </label>
                      <input
                        type="date"
                        value={item.expiry_date}
                        onChange={(e) =>
                          handleItemChange(index, "expiry_date", e.target.value)
                        }
                        className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-700">Subtotal</span>
                        <span className="text-sm sm:text-base font-bold text-gray-900">
                          {formatCurrency(
                            parseFloat(item.quantity) *
                              parseFloat(item.unit_price || 0)
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 sm:mt-5">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
                Catatan (Opsional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Tulis catatan tambahan terkait pengadaan..."
                className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 h-20 sm:h-24 resize-none"/>
            </div>

            {/* Total */}
            <div className="bg-green-50 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-green-200">
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-base font-semibold text-gray-900">
                  Total Pengadaan
                </span>
                <span className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="bg-white px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex flex-col-reverse sm:flex-row justify-between gap-2 sm:gap-3 border-t">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 sm:px-5 py-2 text-xs sm:text-sm border border-gray-300 hover:bg-gray-50 rounded-md font-medium transition-colors"
            disabled={submitting}
          >
            Batal
          </button>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {/* Action Dropdown - only show for pending status when editing and user has permission */}
            {isEdit && isPending && canApproveReject && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowActionDropdown(!showActionDropdown)}
                  disabled={submitting}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-5 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Aksi
                  <FiChevronDown className={`w-4 h-4 transition-transform ${showActionDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown Menu */}
                {showActionDropdown && (
                  <div className="absolute right-0 bottom-full mb-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <button
                      type="button"
                      onClick={() => {
                        setShowActionDropdown(false);
                        setShowApprovalModal(true);
                      }}
                      disabled={submitting}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-green-50 text-green-700 font-medium flex items-center gap-2 border-b disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Setujui Pengadaan
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setShowActionDropdown(false);
                        setShowRejectionModal(true);
                      }}
                      disabled={submitting}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-700 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Tolak Pengadaan
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Save/Update button - only show for pending or when creating new */}
            {(!isEdit || isPending) && (
              <button
                onClick={handleSubmit}
                disabled={submitting || loading}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 sm:px-5 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menyimpan...
                  </span>
                ) : (
                  isEdit ? "Perbarui Pengadaan" : "Buat Pengadaan"
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Approval Confirmation Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-fadeIn">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">
                Setujui Pengadaan
              </h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                Apakah Anda yakin ingin menyetujui pengadaan ini? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowApprovalModal(false)}
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Memproses...
                    </>
                  ) : (
                    'Ya, Setujui'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-fadeIn">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">
                Tolak Pengadaan
              </h3>
              <p className="text-sm text-gray-600 text-center mb-4">
                Silakan masukkan alasan penolakan pengadaan ini:
              </p>
              
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Contoh: Harga terlalu tinggi, stok tidak sesuai..."
                rows="4"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none mb-4"
                disabled={submitting}
              />
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectionModal(false);
                    setRejectionReason("");
                  }}
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={submitting || !rejectionReason.trim()}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Memproses...
                    </>
                  ) : (
                    'Tolak Pengadaan'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcurementFormModal;
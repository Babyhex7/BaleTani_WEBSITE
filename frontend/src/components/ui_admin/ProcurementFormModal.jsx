import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FiX, FiPlus, FiTrash2 } from "react-icons/fi";
import procurementService from "../../services/services_admin/procurementService";
import { getProducts } from "../../services/services_admin/inventoryService";

const ProcurementFormModal = ({ procurement, onClose, onSuccess }) => {
  const isEdit = !!procurement;

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isEdit ? "Edit Pengadaan" : "Buat Pengadaan Baru"}
              </h2>
              <p className="text-sm text-gray-500">Tambah pengadaan barang baru</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-5">
            {/* Basic Info - Horizontal Layout */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tanggal Pengadaan <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="procurement_date"
                  value={formData.procurement_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tipe Pengadaan <span className="text-red-500">*</span>
                </label>
                <select
                  name="procurement_type"
                  value={formData.procurement_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Supplier (Opsional)
                </label>
                <input
                  type="text"
                  name="supplier_name"
                  value={formData.supplier_name}
                  onChange={handleInputChange}
                  placeholder="Nama supplier..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Items Section */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-semibold text-gray-900">
                  Daftar Item
                </h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1.5"
                >
                  <FiPlus size={16} />
                  Tambah Baris
                </button>
              </div>

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

            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Catatan (Opsional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Tulis catatan tambahan terkait pengadaan..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 h-24 resize-none"/>
            </div>

            {/* Total */}
            <div className="bg-green-50 px-4 py-3 rounded-lg border border-green-200">
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-gray-900">
                  Total Pengadaan
                </span>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="bg-white px-6 py-4 flex justify-between border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm border border-gray-300 hover:bg-gray-50 rounded-md font-medium transition-colors"
            disabled={submitting}
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || loading}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Menyimpan...
              </>
            ) : (
              isEdit ? "Perbarui Pengadaan" : "Buat Pengadaan"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProcurementFormModal;
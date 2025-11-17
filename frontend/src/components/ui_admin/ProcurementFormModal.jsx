import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FiX, FiPlus, FiTrash2, FiSave } from "react-icons/fi";
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

    // Update product name when product selected
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {isEdit ? "Edit Pengadaan" : "Tambah Pengadaan Baru"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Pengadaan <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="procurement_date"
                  value={formData.procurement_date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipe Pengadaan
                </label>
                <select
                  name="procurement_type"
                  value={formData.procurement_type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Supplier <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="supplier_name"
                value={formData.supplier_name}
                onChange={handleInputChange}
                placeholder="Masukkan nama supplier"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catatan
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Catatan tambahan (opsional)"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Items */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Daftar Produk
                </h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
                >
                  <FiPlus />
                  Tambah Item
                </button>
              </div>

              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-gray-900">
                        Item #{index + 1}
                      </h4>
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors duration-200"
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Produk <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={item.product_id}
                          onChange={(e) =>
                            handleItemChange(index, "product_id", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value="">Pilih Produk</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name} (Stok: {product.total_stock})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Jumlah <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, "quantity", e.target.value)
                          }
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Harga Satuan <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "unit_price",
                              e.target.value
                            )
                          }
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tanggal Kadaluarsa
                        </label>
                        <input
                          type="date"
                          value={item.expiry_date}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "expiry_date",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subtotal
                        </label>
                        <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg font-semibold text-gray-900">
                          {formatCurrency(
                            parseFloat(item.quantity) *
                              parseFloat(item.unit_price || 0)
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">
                    Total Keseluruhan:
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 hover:bg-gray-100 rounded-lg font-medium transition-colors duration-200"
            disabled={submitting}
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Menyimpan...
              </>
            ) : (
              <>
                <FiSave />
                {isEdit ? "Perbarui" : "Simpan"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProcurementFormModal;

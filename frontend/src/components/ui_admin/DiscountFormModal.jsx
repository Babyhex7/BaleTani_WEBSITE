import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import toast from 'react-hot-toast';
import {
  createDiscount,
  updateDiscount,
} from "../../services/services_admin/inventoryService";

const DiscountFormModal = ({
  isOpen,
  onClose,
  discount = null,
  isEditMode = false,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    discount_name: "",
    discount_type: "percentage",
    value: "",
    max_discount: "", // Max potongan untuk percentage
    start_date: "",
    end_date: "",
    is_active: true,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Load discount data if edit mode
  useEffect(() => {
    if (isEditMode && discount) {
      setFormData({
        discount_name: discount.discount_name || "",
        discount_type: discount.discount_type || "percentage",
        value: discount.value || "",
        max_discount: discount.max_discount || "",
        start_date: discount.start_date || "",
        end_date: discount.end_date || "",
        is_active: discount.is_active ?? true,
      });
    } else {
      // Set default start_date to today
      const today = new Date().toISOString().split("T")[0];
      setFormData((prev) => ({ ...prev, start_date: today }));
    }
  }, [isEditMode, discount]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.discount_name.trim()) {
      newErrors.discount_name = "Nama diskon wajib diisi";
    }

    if (!formData.discount_type) {
      newErrors.discount_type = "Tipe diskon wajib dipilih";
    }

    if (!formData.value || formData.value <= 0) {
      newErrors.value = "Nilai diskon harus lebih dari 0";
    }

    if (
      formData.discount_type === "percentage" &&
      (formData.value < 0 || formData.value > 100)
    ) {
      newErrors.value = "Nilai persentase harus antara 0-100";
    }

    // Validasi max_discount untuk percentage > 50%
    if (
      formData.discount_type === "percentage" &&
      parseFloat(formData.value) > 50 &&
      (!formData.max_discount || parseFloat(formData.max_discount) <= 0)
    ) {
      newErrors.max_discount = "Max. potongan wajib diisi untuk diskon > 50% (untuk menghindari kerugian)";
    }

    if (!formData.start_date) {
      newErrors.start_date = "Tanggal mulai wajib diisi";
    }

    if (!formData.end_date) {
      newErrors.end_date = "Tanggal berakhir wajib diisi";
    }

    if (
      formData.start_date &&
      formData.end_date &&
      new Date(formData.start_date) > new Date(formData.end_date)
    ) {
      newErrors.end_date =
        "Tanggal berakhir tidak boleh lebih awal dari tanggal mulai";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Mohon lengkapi semua field yang diperlukan");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        discount_name: formData.discount_name.trim(),
        discount_type: formData.discount_type,
        value: parseFloat(formData.value),
        max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_active: formData.is_active,
      };

      // Call onSuccess with the payload - parent will handle the API call
      if (onSuccess && typeof onSuccess === 'function') {
        await onSuccess(payload);
        // Close modal and reset form
        onClose();
        setFormData({
          discount_name: "",
          discount_type: "percentage",
          value: "",
          max_discount: "",
          start_date: "",
          end_date: "",
          is_active: true,
        });
      }
    } catch (err) {
      console.error("Error saving discount:", err);
      toast.error(err.message || "Gagal menyimpan diskon");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal - Diperbesar ke max-w-2xl */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-green-600 px-6 py-5 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">
              {isEditMode ? "Edit Diskon" : "Tambah Diskon"}
            </h3>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Nama Diskon - Full width */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nama Diskon <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="discount_name"
                  value={formData.discount_name}
                  onChange={handleChange}
                  placeholder="e.g. Flash Sale Pupuk"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base ${
                    errors.discount_name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.discount_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.discount_name}
                  </p>
                )}
              </div>

              {/* Tipe Diskon */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipe Diskon <span className="text-red-500">*</span>
                </label>
                <select
                  name="discount_type"
                  value={formData.discount_type}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base ${
                    errors.discount_type ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="percentage">Persentase (%)</option>
                  <option value="fixed_amount">Fixed Amount (Rp)</option>
                </select>
                {errors.discount_type && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.discount_type}
                  </p>
                )}
              </div>

              {/* Nilai Diskon */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nilai Diskon <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="value"
                    value={formData.value}
                    onChange={handleChange}
                    placeholder={
                      formData.discount_type === "percentage" ? "0" : "50000"
                    }
                    min="0"
                    max={
                      formData.discount_type === "percentage" ? "100" : undefined
                    }
                    step={formData.discount_type === "percentage" ? "0.01" : "1"}
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base ${
                      errors.value ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    {formData.discount_type === "percentage" ? "%" : "Rp"}
                  </span>
                </div>
                {errors.value && (
                  <p className="text-red-500 text-sm mt-1">{errors.value}</p>
                )}
              </div>

              {/* Max Potongan - Hanya untuk Percentage */}
              {formData.discount_type === "percentage" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Max. Potongan 
                    {parseFloat(formData.value) > 50 ? (
                      <span className="text-red-500"> *</span>
                    ) : (
                      <span className="text-gray-400"> (Opsional)</span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="max_discount"
                      value={formData.max_discount}
                      onChange={handleChange}
                      placeholder="20000"
                      min="0"
                      step="1000"
                      className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base ${
                        errors.max_discount ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                      Rp
                    </span>
                  </div>
                  {errors.max_discount ? (
                    <p className="text-red-500 text-sm mt-1">{errors.max_discount}</p>
                  ) : parseFloat(formData.value) > 50 ? (
                    <p className="text-orange-600 text-xs mt-1 font-medium">
                      ⚠️ Wajib diisi untuk diskon &gt; 50% (mencegah kerugian besar)
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">
                      Batasan maksimal potongan harga (contoh: Rp 20.000 = maksimal hemat Rp 20rb per produk)
                    </p>
                  )}
                </div>
              )}

              {/* Tanggal Mulai */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tanggal Mulai <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base ${
                    errors.start_date ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.start_date && (
                  <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>
                )}
              </div>

              {/* Tanggal Selesai */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tanggal Selesai <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base ${
                    errors.end_date ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.end_date && (
                  <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>
                )}
              </div>

              {/* Status Aktif - Full width */}
              <div className="md:col-span-2 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="is_active"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="mt-1 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="is_active"
                      className="text-sm font-medium text-gray-900 cursor-pointer"
                    >
                      Status Active
                    </label>
                    <p className="text-xs text-gray-600 mt-1">
                      {formData.is_active
                        ? "✅ Diskon akan langsung aktif setelah dibuat"
                        : "⚠️ Diskon tidak akan aktif, Anda perlu mengaktifkannya manual"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Box - Full width */}
              <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <div className="text-blue-600 text-2xl">💡</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Informasi Penting
                    </p>
                    <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                      <li>
                        Setelah diskon dibuat, Anda perlu{" "}
                        <strong>pilih produk</strong> yang akan mendapat diskon
                      </li>
                      <li>
                        Produk yang sudah dipilih akan muncul di halaman discount
                        management
                      </li>
                      <li>
                        Status diskon akan otomatis berubah berdasarkan tanggal
                        (Upcoming/Active/Expired)
                      </li>
                      {formData.discount_type === "percentage" && formData.value && formData.max_discount && (
                        <li className="font-semibold text-green-700">
                          📊 Contoh: Diskon {formData.value}% dengan max Rp {parseFloat(formData.max_discount).toLocaleString('id-ID')}
                          <br />
                          <span className="ml-4">• Produk Rp 200.000 → Hemat Rp {Math.min(200000 * parseFloat(formData.value) / 100, parseFloat(formData.max_discount)).toLocaleString('id-ID')} ({Math.round(Math.min(200000 * parseFloat(formData.value) / 100, parseFloat(formData.max_discount)) / 200000 * 100)}%)</span>
                          <br />
                          <span className="ml-4">• Produk Rp 50.000 → Hemat Rp {Math.min(50000 * parseFloat(formData.value) / 100, parseFloat(formData.max_discount)).toLocaleString('id-ID')} ({Math.round(Math.min(50000 * parseFloat(formData.value) / 100, parseFloat(formData.max_discount)) / 50000 * 100)}%)</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium min-w-[120px]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Menyimpan...
                  </span>
                ) : isEditMode ? (
                  "Update"
                ) : (
                  "Tambah"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DiscountFormModal;

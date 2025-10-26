import { useEffect, useState } from "react";
import {
  XMarkIcon,
  TagIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CubeIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  getDiscountById,
  removeProductFromDiscount,
} from "../../services/services_admin/inventoryService";

const DiscountDetailModal = ({ isOpen, onClose, discount, onRefresh }) => {
  const [discountDetail, setDiscountDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch detail when modal opens
  useEffect(() => {
    if (isOpen && discount) {
      fetchDiscountDetail();
    }
  }, [isOpen, discount]);

  const fetchDiscountDetail = async () => {
    try {
      setLoading(true);
      const response = await getDiscountById(discount.id);
      if (response.success) {
        setDiscountDetail(response.data);
      }
    } catch (err) {
      console.error("Error fetching discount detail:", err);
      alert(err.message || "Gagal mengambil detail diskon");
    } finally {
      setLoading(false);
    }
  };

  // Remove product from discount
  const handleRemoveProduct = async (productId) => {
    const confirm = window.confirm(
      "Apakah Anda yakin ingin menghapus produk ini dari diskon?"
    );
    if (!confirm) return;

    try {
      const response = await removeProductFromDiscount(discount.id, productId);
      if (response.success) {
        // Refresh detail
        fetchDiscountDetail();
        // Refresh parent list
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error("Error removing product:", err);
      alert(err.message || "Gagal menghapus produk dari diskon");
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      active: (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-green-100 text-green-800">
          <CheckCircleIcon className="w-5 h-5" />
          Active
        </span>
      ),
      expired: (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-red-100 text-red-800">
          <XCircleIcon className="w-5 h-5" />
          Expired
        </span>
      ),
      upcoming: (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
          <ClockIcon className="w-5 h-5" />
          Upcoming
        </span>
      ),
    };
    return badges[status] || null;
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
      month: "long",
      year: "numeric",
    });
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
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

        {/* Modal - Diperbesar ke max-w-4xl */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-green-600 px-6 py-5 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <TagIcon className="w-7 h-7" />
              Detail Diskon
            </h3>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : discountDetail ? (
              <div className="space-y-6">
                {/* Discount Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-2 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-5 border border-green-200">
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Nama Diskon
                    </label>
                    <p className="text-2xl font-bold text-gray-900">
                      {discountDetail.discount_name}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-5 border-2 border-gray-200">
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Status Periode
                    </label>
                    <div className="mt-1">
                      {getStatusBadge(discountDetail.status)}
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-5 border border-purple-200">
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Tipe Diskon
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {discountDetail.discount_type === "percentage"
                        ? "📊 Persentase (%)"
                        : "💰 Fixed Amount (Rp)"}
                    </p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-5 border border-yellow-200">
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Nilai Diskon
                    </label>
                    <p className="text-2xl font-bold text-yellow-700">
                      {formatValue(discountDetail.discount_type, discountDetail.value)}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Status Aktif
                    </label>
                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${
                        discountDetail.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {discountDetail.is_active ? "✅ Aktif" : "⏸️ Non-aktif"}
                    </span>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-5 border border-orange-200">
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      <CalendarIcon className="w-4 h-4 inline mr-1" />
                      Tanggal Mulai
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate(discountDetail.start_date)}
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-5 border border-red-200">
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      <CalendarIcon className="w-4 h-4 inline mr-1" />
                      Tanggal Berakhir
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate(discountDetail.end_date)}
                    </p>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-5 border border-indigo-200">
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      <CubeIcon className="w-4 h-4 inline mr-1" />
                      Total Produk
                    </label>
                    <p className="text-3xl font-bold text-indigo-600">
                      {discountDetail.product_count || 0}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t-2 border-gray-200"></div>

                {/* Assigned Products */}
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CubeIcon className="w-6 h-6 text-green-600" />
                    Produk yang Mendapat Diskon ({discountDetail.product_count || 0})
                  </h4>

                  {discountDetail.products && discountDetail.products.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                      {discountDetail.products.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-lg border-2 border-gray-200 hover:border-green-400 transition-all"
                        >
                          <div className="flex-1">
                            <p className="font-bold text-gray-900 text-lg mb-2">
                              {product.name}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-700">
                              <span className="bg-white px-3 py-1 rounded-full border border-gray-300">
                                💰 Harga: <strong>{formatPrice(product.selling_price)}</strong>
                              </span>
                              <span className="bg-white px-3 py-1 rounded-full border border-gray-300">
                                📦 Stok: <strong>{product.total_stock || 0}</strong>
                              </span>
                              <span
                                className={`px-3 py-1 rounded-full font-semibold ${
                                  product.is_active
                                    ? "bg-green-100 text-green-700 border border-green-300"
                                    : "bg-red-100 text-red-700 border border-red-300"
                                }`}
                              >
                                {product.is_active ? "✅ Aktif" : "❌ Nonaktif"}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveProduct(product.id)}
                            className="ml-4 p-2 text-red-600 hover:text-white hover:bg-red-600 border-2 border-red-600 rounded-lg transition-all"
                            title="Hapus dari diskon"
                          >
                            <TrashIcon className="w-6 h-6" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <CubeIcon className="w-16 h-16 mx-auto mb-3 text-gray-400" />
                      <p className="text-gray-600 font-medium">
                        Belum ada produk yang mendapat diskon ini
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        💡 Gunakan tombol "Pilih Produk" untuk menambahkan produk
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Data diskon tidak ditemukan</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscountDetailModal;

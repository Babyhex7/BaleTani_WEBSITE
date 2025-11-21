import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FiX, FiPackage, FiClock, FiUser, FiCheck, FiAlertCircle, FiFileText, FiCheckCircle } from "react-icons/fi";
import procurementService from "../../services/services_admin/procurementService";

const ProcurementDetailModal = ({ procurementId, onClose }) => {
  const [procurement, setProcurement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProcurementDetail();
  }, [procurementId]);

  const fetchProcurementDetail = async () => {
    try {
      setLoading(true);
      const response = await procurementService.getProcurementById(procurementId);
      if (response.success) {
        setProcurement(response.data);
      }
    } catch (error) {
      toast.error("Gagal memuat detail pengadaan");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeBadge = (type) => {
    const badges = {
      online: "bg-blue-100 text-blue-800",
      offline: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${badges[type]}`}
      >
        {type === "online" ? "Online" : "Offline"}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };

    const labels = {
      pending: "Menunggu",
      approved: "Disetujui",
      rejected: "Ditolak",
    };

    return (
      <div className="inline-flex items-center gap-2">
        {status === "pending" && (
          <FiClock size={16} className="text-yellow-600" />
        )}

        {status === "approved" && (
          <FiCheckCircle size={16} className="text-green-600" />
        )}

        <span
          className={`px-3 py-1 rounded text-xs font-medium ${badges[status]}`}
        >
          {labels[status]}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Memuat detail...</p>
        </div>
      </div>
    );
  }

  if (!procurement) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="bg-white px-6 py-4 flex justify-between items-start border-b">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <FiPackage size={24} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Detail Pengadaan</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {procurement.procurement_number}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <FiX size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-6">

            {/* Left Column */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FiClock size={18} className="text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Tanggal Pengadaan</p>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(procurement.procurement_date)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FiPackage size={18} className="text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Jenis</p>
                  <p className="text-sm font-medium text-gray-900">
                    {getTypeBadge(procurement.procurement_type)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FiUser size={18} className="text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Supplier</p>
                  <p className="text-sm font-semibold text-gray-900">{procurement.supplier_name}</p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FiFileText size={18} className="text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Status</p>
                  <div className="mt-1">{getStatusBadge(procurement.status)}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FiUser size={18} className="text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Dibuat oleh</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {procurement.creator?.full_name || "-"}
                  </p>
                  <p className="text-xs text-gray-500">{formatDateTime(procurement.created_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {procurement.notes && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Catatan</p>
              <p className="text-sm text-gray-900">{procurement.notes}</p>
            </div>
          )}

          {/* Items Table */}
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-3">
              Daftar Item
            </h3>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Produk</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 uppercase">Jumlah</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Harga/Unit</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Subtotal</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 uppercase">Expiry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {procurement.items?.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.product?.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-semibold text-gray-900">{item.quantity} unit</span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900">
                        {formatCurrency(item.purchase_price_per_unit)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                        {formatCurrency(item.subtotal)}
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-gray-600">
                        {item.expiry_date ? formatDate(item.expiry_date) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t border-gray-300">
                  <tr>
                    <td colSpan="3" className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                      Total
                    </td>
                    <td className="px-4 py-3 text-right text-base font-bold text-gray-900">
                      {formatCurrency(procurement.total_amount)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white px-6 py-4 flex justify-end items-center border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProcurementDetailModal;

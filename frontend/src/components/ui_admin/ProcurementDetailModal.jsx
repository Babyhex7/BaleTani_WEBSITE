import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FiX, FiPackage, FiClock, FiUser, FiCheck, FiAlertCircle } from "react-icons/fi";
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
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800 border border-yellow-300",
      approved: "bg-green-100 text-green-800 border border-green-300",
      rejected: "bg-red-100 text-red-800 border border-red-300",
    };

    return (
      <span className={`px-4 py-2 rounded-full text-sm font-bold ${badges[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Detail Pengadaan</h2>
            <p className="text-blue-100 mt-1 font-mono">
              {procurement.procurement_number}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status & Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
              <h3 className="text-sm font-medium text-gray-600 mb-4">Informasi Pengadaan</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <div className="mt-1">{getStatusBadge(procurement.status)}</div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tanggal Pengadaan</p>
                  <p className="font-semibold text-gray-900">{formatDate(procurement.procurement_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tipe</p>
                  <p className="font-semibold text-gray-900 capitalize">{procurement.procurement_type}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Supplier</p>
                  <p className="font-semibold text-gray-900">{procurement.supplier_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Nilai</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(procurement.total_amount)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Creator */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <FiUser className="text-blue-600 text-2xl" />
                  <div>
                    <p className="text-xs text-gray-500">Dibuat oleh</p>
                    <p className="font-semibold text-gray-900">
                      {procurement.creator?.full_name || "-"}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(procurement.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Approver */}
              {procurement.approved_by && (
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3">
                    <FiCheck className="text-green-600 text-2xl" />
                    <div>
                      <p className="text-xs text-gray-500">Disetujui oleh</p>
                      <p className="font-semibold text-gray-900">
                        {procurement.approver?.full_name || "-"}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(procurement.approved_at)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Rejector */}
              {procurement.rejected_by && (
                <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                  <div className="flex items-center gap-3">
                    <FiAlertCircle className="text-red-600 text-2xl" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Ditolak oleh</p>
                      <p className="font-semibold text-gray-900">
                        {procurement.rejector?.full_name || "-"}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(procurement.rejected_at)}</p>
                      {procurement.rejection_reason && (
                        <p className="text-sm text-red-700 mt-2 italic">
                          "{procurement.rejection_reason}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {procurement.notes && (
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Catatan:</p>
              <p className="text-gray-800">{procurement.notes}</p>
            </div>
          )}

          {/* Items */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiPackage />
              Daftar Produk ({procurement.items?.length || 0} item)
            </h3>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">#</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Produk</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Jumlah</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Harga Satuan</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Subtotal</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Kadaluarsa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {procurement.items?.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-gray-900">{item.product?.name}</p>
                          <p className="text-xs text-gray-500">{item.product?.unit}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        {formatCurrency(item.purchase_price_per_unit)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-blue-600">
                        {formatCurrency(item.subtotal)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.expiry_date ? formatDate(item.expiry_date) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                  <tr>
                    <td colSpan="4" className="px-4 py-4 text-right font-bold text-gray-900">
                      TOTAL:
                    </td>
                    <td className="px-4 py-4 text-right text-xl font-bold text-blue-600">
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
        <div className="bg-gray-50 px-6 py-4 flex justify-end border-t">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProcurementDetailModal;

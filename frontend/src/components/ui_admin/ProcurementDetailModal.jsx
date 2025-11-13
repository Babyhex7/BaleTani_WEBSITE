import React from 'react';
import {
  XMarkIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarIcon,
  UserIcon,
  CubeIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

const ProcurementDetailModal = ({ procurement, onClose, onApprove, onReject, onEdit, onDelete, onRestore, userRole }) => {
  if (!procurement) return null;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
  };

  const getStatusBadge = (status) => {
    if (!status) return <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">-</span>;
    if (status === 'approved') {
      return (
        <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full flex items-center gap-1">
          <CheckCircleIcon className="w-4 h-4" />
          Disetujui
        </span>
      );
    }
    if (status === 'rejected') {
      return (
        <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full flex items-center gap-1">
          <XCircleIcon className="w-4 h-4" />
          Ditolak
        </span>
      );
    }
    return (
      <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full flex items-center gap-1">
        <ClockIcon className="w-4 h-4" />
        Menunggu
      </span>
    );
  };

  const getTypeBadge = (type) => {
    if (type === 'online') {
      return <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">Online</span>;
    }
    return <span className="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">Offline</span>;
  };

  const isDeleted = !!procurement.deleted_at;
  const isPending = procurement.status === 'pending' && !isDeleted;
  const canApprove = userRole === 'super_inventory_admin' || userRole === 'super_admin';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TruckIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Detail Pengadaan</h3>
              <p className="text-sm text-gray-600">{procurement.procurement_number}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Deleted Warning */}
        {isDeleted && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <XCircleIcon className="w-5 h-5" />
              <span className="font-semibold">Pengadaan ini telah dihapus</span>
            </div>
            {procurement.soft_delete_info && (
              <div className="mt-2 text-sm text-red-700">
                <p>Dihapus oleh: {procurement.soft_delete_info.deleter?.full_name || '-'}</p>
                <p>Tanggal: {formatDate(procurement.soft_delete_info.deleted_at)}</p>
                {procurement.soft_delete_info.deleted_reason && (
                  <p>Alasan: {procurement.soft_delete_info.deleted_reason}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* General Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CalendarIcon className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Tanggal Pengadaan</p>
                  <p className="font-medium text-gray-900">{formatDate(procurement.procurement_date)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CubeIcon className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Jenis</p>
                  <div className="mt-1">{getTypeBadge(procurement.procurement_type)}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <UserIcon className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Supplier</p>
                  <p className="font-medium text-gray-900">{procurement.supplier_name || '-'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <DocumentTextIcon className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <div className="mt-1">{getStatusBadge(procurement.status)}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <UserIcon className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Dibuat oleh</p>
                  <p className="font-medium text-gray-900">{procurement.creator?.full_name || '-'}</p>
                  <p className="text-xs text-gray-500">{formatDate(procurement.created_at)}</p>
                </div>
              </div>

              {procurement.approved_at && procurement.approver && (
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Disetujui oleh</p>
                    <p className="font-medium text-gray-900">{procurement.approver.full_name}</p>
                    <p className="text-xs text-gray-500">{formatDate(procurement.approved_at)}</p>
                  </div>
                </div>
              )}

              {procurement.rejected_at && procurement.rejector && (
                <div className="flex items-start gap-3">
                  <XCircleIcon className="w-5 h-5 text-red-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Ditolak oleh</p>
                    <p className="font-medium text-gray-900">{procurement.rejector.full_name}</p>
                    <p className="text-xs text-gray-500">{formatDate(procurement.rejected_at)}</p>
                    {procurement.rejection_reason && (
                      <p className="text-sm text-red-700 mt-1">Alasan: {procurement.rejection_reason}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {procurement.notes && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Catatan</p>
              <p className="text-gray-900">{procurement.notes}</p>
            </div>
          )}

          {/* Items Table */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Daftar Item</h4>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Harga/Unit</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {procurement.items && procurement.items.length > 0 ? (
                    procurement.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.product_name}
                          {item.product_type && (
                            <span className="ml-2 text-xs text-gray-500">({item.product_type})</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          {item.quantity} {item.quantity_info || 'unit'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          {formatCurrency(item.purchase_price_per_unit)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                          {formatCurrency(item.subtotal)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatDate(item.expiry_date)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-4 py-6 text-center text-sm text-gray-500">
                        Tidak ada item
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="3" className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                      Total
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                      {formatCurrency(procurement.total_amount)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Tutup
          </button>

          <div className="flex items-center gap-2">
            {isDeleted ? (
              <button
                onClick={() => onRestore(procurement.id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Pulihkan
              </button>
            ) : (
              <>
                {isPending && (
                  <>
                    <button
                      onClick={() => onEdit(procurement)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Edit
                    </button>
                    {canApprove && (
                      <>
                        <button
                          onClick={() => onReject(procurement.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Tolak
                        </button>
                        <button
                          onClick={() => onApprove(procurement.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Setujui
                        </button>
                      </>
                    )}
                  </>
                )}
                {isPending && (
                  <button
                    onClick={() => onDelete(procurement.id)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Hapus
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcurementDetailModal;

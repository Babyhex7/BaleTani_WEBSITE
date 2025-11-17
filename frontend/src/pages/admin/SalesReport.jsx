import { useState } from "react";
import { toast } from "react-hot-toast";
import { 
  ChartBarIcon,
  BanknotesIcon,
  ShoppingCartIcon,
  CubeIcon,
  CalendarIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import AdminSidebarNew from "../../components/layout_admin/AdminSidebarNew";
import AdminHeaderNew from "../../components/layout_admin/AdminHeaderNew";
import reportService from "../../services/services_admin/reportService";

const SalesReport = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  const [filters, setFilters] = useState({
    date_from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0, 10),
    date_to: new Date().toISOString().slice(0, 10),
    group_by: "day",
    payment_type: "",
    order_type: "",
  });

  const fetchReport = async () => {
    if (!filters.date_from || !filters.date_to) {
      toast.error("Tanggal awal dan akhir harus diisi");
      return;
    }

    try {
      setLoading(true);
      const response = await reportService.getSalesReport(filters);
      if (response.success) {
        setReportData(response.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal memuat laporan");
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebarNew />
      
      <div className="flex-1">
        <AdminHeaderNew 
          title="Sales Report" 
          subtitle="Analisis dan statistik penjualan"
        />
        
        <div className="p-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Filter Laporan</h2>
            </div>
            
            <div className="p-6 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Awal
                  </label>
                  <input
                    type="date"
                    value={filters.date_from}
                    onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Akhir
                  </label>
                  <input
                    type="date"
                    value={filters.date_to}
                    onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grup By
                  </label>
                  <select
                    value={filters.group_by}
                    onChange={(e) => setFilters({ ...filters, group_by: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="day">Harian</option>
                    <option value="week">Mingguan</option>
                    <option value="month">Bulanan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Metode Bayar
                  </label>
                  <select
                    value={filters.payment_type}
                    onChange={(e) => setFilters({ ...filters, payment_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Semua</option>
                    <option value="midtrans">Midtrans</option>
                    <option value="cod">COD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipe Order
                  </label>
                  <select
                    value={filters.order_type}
                    onChange={(e) => setFilters({ ...filters, order_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Semua</option>
                    <option value="pickup">Pickup</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={fetchReport}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                      Memuat...
                    </>
                  ) : (
                    <>
                      <ChartBarIcon className="w-5 h-5" />
                      Tampilkan Laporan
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          {reportData && (
            <div className="space-y-6">
              {/* Summary Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Order</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {reportData.summary.totalOrders}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <ShoppingCartIcon className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Pendapatan</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(reportData.summary.totalRevenue)}
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <BanknotesIcon className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Rata-rata Order</p>
                      <p className="text-xl font-bold text-purple-600">
                        {formatCurrency(reportData.summary.averageOrderValue)}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <CalendarIcon className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Item Terjual</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {reportData.summary.totalItems}
                      </p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <CubeIcon className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">Breakdown Metode Pembayaran</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      {Object.entries(reportData.paymentBreakdown).map(([type, data]) => (
                        <div key={type} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-semibold text-gray-900 capitalize">{type}</p>
                            <p className="text-sm text-gray-600">{data.count} order</p>
                          </div>
                          <p className="font-bold text-green-600">{formatCurrency(data.revenue)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">Breakdown Tipe Order</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      {Object.entries(reportData.orderTypeBreakdown).map(([type, data]) => (
                        <div key={type} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-semibold text-gray-900 capitalize">{type}</p>
                            <p className="text-sm text-gray-600">{data.count} order</p>
                          </div>
                          <p className="font-bold text-blue-600">{formatCurrency(data.revenue)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">Top 10 Produk Terlaris</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Terjual</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Pendapatan</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Order</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.topProducts.map((product, index) => (
                        <tr key={product.product_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-semibold text-sm text-gray-900">{index + 1}</td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-sm text-gray-900">{product.product_name}</div>
                            <div className="text-xs text-gray-500">{product.product_unit}</div>
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-sm text-gray-900">
                            {product.total_quantity}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-sm text-green-600">
                            {formatCurrency(product.total_revenue)}
                          </td>
                          <td className="px-6 py-4 text-right text-sm text-gray-600">
                            {product.order_count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesReport;

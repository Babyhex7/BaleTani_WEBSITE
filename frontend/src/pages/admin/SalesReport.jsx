import { useState } from "react";
import { toast } from "react-hot-toast";
import { 
  ChartBarIcon,
  BanknotesIcon,
  ShoppingCartIcon,
  CubeIcon,
  CalendarIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  UserIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import AdminSidebarNew from "../../components/layout_admin/AdminSidebarNew";
import AdminHeaderNew from "../../components/layout_admin/AdminHeaderNew";
import reportService from "../../services/services_admin/reportService";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      cash: "Cash (COD)",
      transfer: "Transfer Bank",
      ewallet: "E-Wallet",
    };
    return labels[method] || method;
  };

  const getDeliveryMethodLabel = (method) => {
    const labels = {
      self_pickup: "Pickup",
      delivery: "Delivery",
    };
    return labels[method] || method;
  };

  const getOrderStatusBadge = (status) => {
    const badges = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
      completed: { bg: "bg-green-100", text: "text-green-800", label: "Completed" },
      out_for_delivery: { bg: "bg-blue-100", text: "text-blue-800", label: "Delivery" },
      cancelled: { bg: "bg-red-100", text: "text-red-800", label: "Cancelled" },
    };

    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const exportToPDF = () => {
    if (!reportData || !reportData.detailedSales) {
      toast.error("Tidak ada data untuk di-export");
      return;
    }

    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text("Laporan Penjualan", 14, 22);
    
    // Filters Info
    doc.setFontSize(10);
    doc.text(`Periode: ${filters.date_from} s/d ${filters.date_to}`, 14, 30);
    
    // Summary
    doc.setFontSize(12);
    doc.text("Ringkasan", 14, 40);
    doc.setFontSize(10);
    doc.text(`Total Order: ${reportData.summary.totalOrders}`, 14, 47);
    doc.text(`Total Pendapatan: ${formatCurrency(reportData.summary.totalRevenue)}`, 14, 54);
    doc.text(`Rata-rata Order: ${formatCurrency(reportData.summary.averageOrderValue)}`, 14, 61);
    
    // Detailed Sales Table
    const tableData = reportData.detailedSales.map((sale, index) => [
      index + 1,
      sale.order_number,
      formatDate(sale.order_date),
      sale.customer_name,
      sale.customer_phone,
      getPaymentMethodLabel(sale.payment_method),
      getDeliveryMethodLabel(sale.delivery_method),
      formatCurrency(sale.total_amount),
    ]);

    autoTable(doc, {
      head: [["#", "No. Order", "Tanggal", "Pelanggan", "Telepon", "Pembayaran", "Pengiriman", "Total"]],
      body: tableData,
      startY: 70,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [34, 197, 94] },
    });

    doc.save(`Laporan_Penjualan_${filters.date_from}_${filters.date_to}.pdf`);
    toast.success("PDF berhasil di-download");
  };

  return (
    <div className="flex min-h-screen bg-white">
      <AdminSidebarNew />
      
      <div className="flex-1 flex flex-col">
        <AdminHeaderNew 
          title="Sales Report" 
          subtitle="Analisis dan statistik penjualan"
        />
        
        <div className="admin-container">
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
                <div>
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

              {/* Detailed Sales List */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Daftar Penjualan Detail</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Total: {reportData.detailedSales?.length || 0} transaksi
                    </p>
                  </div>
                  <button
                    onClick={exportToPDF}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <DocumentArrowDownIcon className="w-5 h-5" />
                    Export PDF
                  </button>
                </div>
                <div>
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Order</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pelanggan</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kontak</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pembayaran</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pengiriman</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Item</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.detailedSales && reportData.detailedSales.length > 0 ? (
                        reportData.detailedSales.map((sale, index) => (
                          <tr key={sale.order_id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-semibold text-sm text-gray-900">{index + 1}</td>
                            <td className="px-6 py-4">
                              <div className="font-semibold text-sm text-blue-600">{sale.order_number}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{formatDate(sale.order_date)}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <UserIcon className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="font-medium text-sm text-gray-900">{sale.customer_name}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <PhoneIcon className="w-4 h-4" />
                                {sale.customer_phone}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                {getPaymentMethodLabel(sale.payment_method)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                {getDeliveryMethodLabel(sale.delivery_method)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {getOrderStatusBadge(sale.order_status)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="font-bold text-sm text-green-600">
                                {formatCurrency(sale.total_amount)}
                              </div>
                              {sale.shipping_cost > 0 && (
                                <div className="text-xs text-gray-500">
                                  + {formatCurrency(sale.shipping_cost)} ongkir
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="text-sm font-semibold text-gray-900">
                                {sale.items.length} item
                              </div>
                              <div className="text-xs text-gray-500">
                                {sale.items.reduce((sum, item) => sum + item.quantity, 0)} qty
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="10" className="px-6 py-8 text-center text-gray-500">
                            Tidak ada data penjualan
                          </td>
                        </tr>
                      )}
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

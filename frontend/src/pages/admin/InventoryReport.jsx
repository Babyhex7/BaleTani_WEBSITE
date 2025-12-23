import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  ChartBarIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import {
  BanknotesIcon,
  ShoppingBagIcon,
  ArchiveBoxXMarkIcon,
} from "@heroicons/react/24/solid";
import AdminSidebarNew from "../../components/layout_admin/AdminSidebarNew";
import AdminHeaderNew from "../../components/layout_admin/AdminHeaderNew";
import reportService from "../../services/services_admin/reportService";
import inventoryService from "../../services/services_admin/inventoryService";
import { getImageUrl } from "../../utils/imageUtils";

const InventoryReport = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [categories, setCategories] = useState([]);

  const [filters, setFilters] = useState({
    date_from: "",
    date_to: "",
    category_id: "",
    product_type: "",
    stock_status: "",
  });

  useEffect(() => {
    fetchCategories();
    // Auto-load report without date filter on mount
    fetchReport();
  }, []); // Only run once on mount

  const fetchCategories = async () => {
    try {
      const response = await inventoryService.getCategories();
      if (response.success) {
        const categoriesList = response.data.categories || response.data || [];
        setCategories(Array.isArray(categoriesList) ? categoriesList : []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      // Build query params, only include non-empty filters
      const queryParams = {};
      if (filters.date_from) queryParams.date_from = filters.date_from;
      if (filters.date_to) queryParams.date_to = filters.date_to;
      if (filters.category_id) queryParams.category_id = filters.category_id;
      if (filters.product_type) queryParams.product_type = filters.product_type;
      if (filters.stock_status) queryParams.stock_status = filters.stock_status;

      const response = await reportService.getInventoryReport(queryParams);
      if (response.success) {
        setReportData(response.data);
        toast.success("Laporan berhasil dimuat");
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

  const getStockBadge = (status) => {
    const badges = {
      out: { bg: "bg-red-100", text: "text-red-800", label: "Habis" },
      low: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Rendah" },
      normal: { bg: "bg-green-100", text: "text-green-800", label: "Normal" },
    };

    const badge = badges[status] || badges.normal;

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}
      >
        {badge.label}
      </span>
    );
  };

  const getMovementTypeBadge = (type) => {
    const badges = {
      procurement_in: { bg: "bg-blue-100", text: "text-blue-800", label: "Masuk (Pengadaan)" },
      adjustment: { bg: "bg-purple-100", text: "text-purple-800", label: "Penyesuaian" },
      sale_out: { bg: "bg-green-100", text: "text-green-800", label: "Keluar (Penjualan)" },
      expired: { bg: "bg-red-100", text: "text-red-800", label: "Kadaluarsa" },
    };

    const badge = badges[type] || { bg: "bg-gray-100", text: "text-gray-800", label: type };

    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${badge.bg} ${badge.text}`}
      >
        {badge.label}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-white">
      <AdminSidebarNew />

      <div className="flex-1 flex flex-col">
        <AdminHeaderNew
          title="Inventory Report"
          subtitle="Laporan stok dan pergerakan inventory"
        />

        <div className="admin-container px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Filter Laporan</h2>
              </div>
            </div>

            <div className="px-4 sm:px-6 py-4 bg-gray-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Tanggal Awal
                  </label>
                  <input
                    type="date"
                    value={filters.date_from}
                    onChange={(e) =>
                      setFilters({ ...filters, date_from: e.target.value })
                    }
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Untuk stock movements
                  </p>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Tanggal Akhir
                  </label>
                  <input
                    type="date"
                    value={filters.date_to}
                    onChange={(e) =>
                      setFilters({ ...filters, date_to: e.target.value })
                    }
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Kategori
                  </label>
                  <select
                    value={filters.category_id}
                    onChange={(e) =>
                      setFilters({ ...filters, category_id: e.target.value })
                    }
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Semua Kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.category_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Tipe Produk
                  </label>
                  <select
                    value={filters.product_type}
                    onChange={(e) =>
                      setFilters({ ...filters, product_type: e.target.value })
                    }
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Semua Tipe</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Status Stok
                  </label>
                  <select
                    value={filters.stock_status}
                    onChange={(e) =>
                      setFilters({ ...filters, stock_status: e.target.value })
                    }
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Semua Status</option>
                    <option value="normal">Normal</option>
                    <option value="low">Rendah</option>
                    <option value="out">Habis</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={fetchReport}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Produk</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">
                        {reportData.summary.totalProducts}
                      </p>
                    </div>
                    <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                      <CubeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">Nilai Stok</p>
                      <p className="text-lg sm:text-xl font-bold text-green-600 truncate">
                        {formatCurrency(reportData.summary.totalStockValue)}
                      </p>
                    </div>
                    <div className="p-2 sm:p-3 bg-green-100 rounded-lg flex-shrink-0 ml-2">
                      <BanknotesIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">Stok Normal</p>
                      <p className="text-xl sm:text-2xl font-bold text-green-600">
                        {reportData.summary.normalStock}
                      </p>
                    </div>
                    <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                      <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">Stok Rendah</p>
                      <p className="text-xl sm:text-2xl font-bold text-yellow-600">
                        {reportData.summary.lowStock}
                      </p>
                    </div>
                    <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
                      <ExclamationTriangleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">Stok Habis</p>
                      <p className="text-xl sm:text-2xl font-bold text-red-600">
                        {reportData.summary.outOfStock}
                      </p>
                    </div>
                    <div className="p-2 sm:p-3 bg-red-100 rounded-lg">
                      <ArchiveBoxXMarkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Breakdown Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Category Breakdown */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">
                      Breakdown per Kategori
                    </h3>
                  </div>
                  <div className="p-4 sm:p-6">
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {reportData.categoryBreakdown.map((cat) => (
                        <div
                          key={cat.category_id}
                          className="flex justify-between items-center p-3 sm:p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                              {cat.category_name}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {cat.total_products} produk • {cat.total_stock} stok
                            </p>
                          </div>
                          <p className="font-bold text-sm sm:text-base text-green-600 ml-2 truncate">
                            {formatCurrency(cat.total_value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Type Breakdown */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">
                      Breakdown per Tipe Produk
                    </h3>
                  </div>
                  <div className="p-4 sm:p-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm sm:text-base text-gray-900">Online</p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {reportData.typeBreakdown.online.count} produk •{" "}
                            {reportData.typeBreakdown.online.stock} stok
                          </p>
                        </div>
                        <p className="font-bold text-sm sm:text-base text-blue-600 ml-2 truncate">
                          {formatCurrency(reportData.typeBreakdown.online.value)}
                        </p>
                      </div>

                      <div className="flex justify-between items-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm sm:text-base text-gray-900">Offline</p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {reportData.typeBreakdown.offline.count} produk •{" "}
                            {reportData.typeBreakdown.offline.stock} stok
                          </p>
                        </div>
                        <p className="font-bold text-sm sm:text-base text-purple-600 ml-2 truncate">
                          {formatCurrency(reportData.typeBreakdown.offline.value)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stock Movements Summary */}
              {reportData.movementSummary && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">
                      Ringkasan Pergerakan Stok
                    </h3>
                  </div>
                  <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs sm:text-sm text-blue-600 font-medium mb-1">
                          Masuk (Pengadaan)
                        </p>
                        <p className="text-xl sm:text-2xl font-bold text-blue-700">
                          {reportData.movementSummary.procurement_in.quantity}
                        </p>
                        <p className="text-xs text-blue-600">
                          {reportData.movementSummary.procurement_in.count} transaksi
                        </p>
                      </div>

                      <div className="p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-xs sm:text-sm text-green-600 font-medium mb-1">
                          Keluar (Penjualan)
                        </p>
                        <p className="text-xl sm:text-2xl font-bold text-green-700">
                          {reportData.movementSummary.sale_out.quantity}
                        </p>
                        <p className="text-xs text-green-600">
                          {reportData.movementSummary.sale_out.count} transaksi
                        </p>
                      </div>

                      <div className="p-3 sm:p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-xs sm:text-sm text-purple-600 font-medium mb-1">
                          Penyesuaian
                        </p>
                        <p className="text-xl sm:text-2xl font-bold text-purple-700">
                          {reportData.movementSummary.adjustment.quantity}
                        </p>
                        <p className="text-xs text-purple-600">
                          {reportData.movementSummary.adjustment.count} transaksi
                        </p>
                      </div>

                      <div className="p-3 sm:p-4 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-xs sm:text-sm text-red-600 font-medium mb-1">
                          Kadaluarsa
                        </p>
                        <p className="text-xl sm:text-2xl font-bold text-red-700">
                          {reportData.movementSummary.expired.quantity}
                        </p>
                        <p className="text-xs text-red-600">
                          {reportData.movementSummary.expired.count} transaksi
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Products List */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    Daftar Produk ({reportData.products.length})
                  </h3>
                </div>
                
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Produk
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Kategori
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Tipe
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Harga
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Stok
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Nilai Stok
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {product.image_url ? (
                                <img
                                src={getImageUrl(product.image_url)}
                                  alt={product.name}
                                  className="w-10 h-10 rounded-lg object-cover border"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                  <CubeIcon className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <div className="font-semibold text-sm text-gray-900">
                                  {product.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {product.sku}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {product.category_name}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                product.product_type === "online"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {product.product_type === "online"
                                ? "Online"
                                : "Offline"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                            {formatCurrency(product.price)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-semibold text-sm text-gray-900">
                              {product.total_stock}
                            </span>
                            <span className="text-xs text-gray-500 ml-1">
                              {product.unit}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-sm text-green-600">
                            {formatCurrency(product.stock_value)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {getStockBadge(product.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile/Tablet Card View */}
                <div className="lg:hidden divide-y divide-gray-200">
                  {reportData.products.map((product) => (
                    <div key={product.id} className="p-4 hover:bg-gray-50 transition-colors">
                      {/* Product Header with Image */}
                      <div className="flex items-start gap-3 mb-3">
                        {product.image_url ? (
                          <img
                            src={getImageUrl(product.image_url)}
                            alt={product.name}
                            className="w-16 h-16 rounded-lg object-cover border flex-shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <CubeIcon className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-gray-900 mb-1">{product.name}</h4>
                          <p className="text-xs text-gray-500 mb-1">{product.sku}</p>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                product.product_type === "online"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {product.product_type === "online" ? "Online" : "Offline"}
                            </span>
                            {getStockBadge(product.status)}
                          </div>
                        </div>
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Kategori</div>
                          <div className="text-sm text-gray-900">{product.category_name}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Harga</div>
                          <div className="text-sm font-semibold text-gray-900 truncate">{formatCurrency(product.price)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Stok</div>
                          <div className="text-sm font-semibold text-gray-900">
                            {product.total_stock} {product.unit}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Nilai Stok</div>
                          <div className="text-sm font-bold text-green-600 truncate">{formatCurrency(product.stock_value)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Stock Movements */}
              {reportData.recentMovements && reportData.recentMovements.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">
                      Pergerakan Stok Terkini (50 Terakhir)
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Tanggal
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Produk
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Tipe
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Qty
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Dibuat Oleh
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Catatan
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {reportData.recentMovements.map((movement) => (
                          <tr key={movement.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {new Date(movement.movement_date).toLocaleDateString(
                                "id-ID",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-semibold text-sm text-gray-900">
                                {movement.product_name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {movement.product_unit}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {getMovementTypeBadge(movement.movement_type)}
                            </td>
                            <td className="px-6 py-4 text-right font-semibold text-sm text-gray-900">
                              {movement.quantity}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {movement.creator_name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {movement.notes}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryReport;

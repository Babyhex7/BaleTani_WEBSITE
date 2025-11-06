import React, { useState, useEffect } from 'react';
import { ShoppingBag, Loader, PackageX } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import OrderStats from '../../components/ui_customer/OrderStats';
import OrderFilters from '../../components/ui_customer/OrderFilters';
import OrderCard from '../../components/ui_customer/OrderCard';
import OrderDetailModal from '../../components/ui_customer/OrderDetailModal';
import Pagination from '../../components/ui/Pagination';
import Toast from '../../components/ui/Toast';
import { getOrders, getOrderDetail, reorderItems, cancelOrder } from '../../services/services_customer/orderHistoryService';

/**
 * PurchaseHistory Page
 * Halaman riwayat pembelian customer
 */
const PurchaseHistory = () => {
  // State management
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);

  // Modals
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  // Fetch orders
  useEffect(() => {
    fetchOrders();
  }, [currentPage, searchQuery, filterStatus, dateRange, sortBy]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        search: searchQuery,
        status: filterStatus,
        date_range: dateRange,
        sort: sortBy,
        page: currentPage,
        limit: itemsPerPage
      };

      const response = await getOrders(params);
      
      if (response.success) {
        setOrders(response.data.orders);
        setStats(response.data.stats);
        setTotalPages(response.data.pagination.total_pages);
        setTotalItems(response.data.pagination.total_items);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Gagal memuat riwayat pesanan');
      showToast('error', 'Gagal memuat data pesanan');
    } finally {
      setLoading(false);
    }
  };

  // View detail handler
  const handleViewDetail = async (order) => {
    try {
      setDetailLoading(true);
      setShowDetailModal(true);

      const response = await getOrderDetail(order.id);
      
      if (response.success) {
        setSelectedOrder(response.data);
      }
    } catch (err) {
      console.error('Error fetching order detail:', err);
      showToast('error', 'Gagal memuat detail pesanan');
      setShowDetailModal(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // Reorder handler
  const handleReorder = async (order) => {
    const confirmed = window.confirm(
      `Tambahkan ${order.items?.length || 0} produk dari pesanan ini ke keranjang?`
    );

    if (!confirmed) return;

    try {
      const response = await reorderItems(order.id);
      
      if (response.success) {
        showToast('success', response.message);
        
        // Show out of stock items if any
        if (response.data.out_of_stock?.length > 0) {
          setTimeout(() => {
            showToast('warning', `Beberapa produk tidak tersedia: ${response.data.out_of_stock.join(', ')}`);
          }, 2000);
        }
      }
    } catch (err) {
      console.error('Error reordering:', err);
      showToast('error', err.message || 'Gagal menambahkan produk ke keranjang');
    }
  };

  // Cancel order handler
  const handleCancelOrder = async (order) => {
    const reason = prompt('Alasan pembatalan pesanan:');
    if (!reason) return;

    try {
      const response = await cancelOrder(order.id, reason);
      
      if (response.success) {
        showToast('success', 'Pesanan berhasil dibatalkan');
        setShowDetailModal(false);
        fetchOrders(); // Refresh list
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
      showToast('error', err.message || 'Gagal membatalkan pesanan');
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterStatus('');
    setDateRange('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  // Show toast notification
  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast({ show: false, type: '', message: '' });
    }, 3000);
  };

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingBag className="w-8 h-8 text-green-600" />
              <h1 className="text-3xl font-bold text-gray-900">Riwayat Pesanan</h1>
            </div>
            <p className="text-gray-600">Kelola dan lacak semua pesanan Anda di sini</p>
          </div>

        {/* Statistics Cards */}
        <OrderStats stats={stats} />

        {/* Filters */}
        <OrderFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          dateRange={dateRange}
          setDateRange={setDateRange}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onReset={handleResetFilters}
        />

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-8 h-8 animate-spin text-green-600" />
            <span className="ml-3 text-gray-600">Memuat data pesanan...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchOrders}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && orders.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <PackageX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Belum Ada Pesanan
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterStatus || dateRange
                ? 'Tidak ada pesanan yang sesuai dengan filter Anda'
                : 'Anda belum memiliki riwayat pesanan'}
            </p>
            {(searchQuery || filterStatus || dateRange) && (
              <button
                onClick={handleResetFilters}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Reset Filter
              </button>
            )}
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && orders.length > 0 && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onViewDetail={handleViewDetail}
                  onReorder={handleReorder}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}

            {/* Results Info */}
            <div className="text-center mt-4 text-sm text-gray-600">
              Menampilkan {orders.length} dari {totalItems} pesanan
            </div>
          </>
        )}

        {/* Order Detail Modal */}
        {showDetailModal && (
          <>
            {detailLoading ? (
              <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-8">
                  <Loader className="w-8 h-8 animate-spin text-green-600 mx-auto" />
                  <p className="mt-4 text-gray-600">Memuat detail pesanan...</p>
                </div>
              </div>
            ) : (
              <OrderDetailModal
                order={selectedOrder}
                onClose={() => {
                  setShowDetailModal(false);
                  setSelectedOrder(null);
                }}
                onReorder={handleReorder}
                onCancel={handleCancelOrder}
              />
            )}
          </>
        )}

        {/* Toast Notification */}
        {toast.show && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast({ show: false, type: '', message: '' })}
          />
        )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default PurchaseHistory;

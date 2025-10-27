/**
 * CART PAGE
 * Shopping cart management page
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Trash2 } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import CartItem from '../../components/layout/CartItem';
import OrderSummary from '../../components/layout/OrderSummary';
import useAuthStore from '../../store/store_customer/useAuthStore';
import useCartStore from '../../store/store_customer/useCartStore';

const CartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { items, updateQuantity, removeItem, clearCart, totalItems, totalPrice } = useCartStore();
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?returnUrl=/cart');
    }
  }, [isAuthenticated, navigate]);

  // Show toast notification
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'info' });
    }, 3000);
  };

  // Handle quantity update
  const handleUpdateQuantity = (itemId, newQuantity) => {
    try {
      updateQuantity(itemId, newQuantity);
      showToast('Jumlah berhasil diperbarui', 'success');
    } catch (error) {
      showToast('Gagal memperbarui jumlah', 'error');
    }
  };

  // Handle remove item
  const handleRemoveItem = (itemId) => {
    try {
      removeItem(itemId);
      showToast('Produk berhasil dihapus dari keranjang', 'success');
    } catch (error) {
      showToast('Gagal menghapus produk', 'error');
    }
  };

  // Handle clear cart
  const handleClearCart = () => {
    if (window.confirm('Apakah Anda yakin ingin mengosongkan keranjang?')) {
      try {
        clearCart();
        showToast('Keranjang berhasil dikosongkan', 'success');
      } catch (error) {
        showToast('Gagal mengosongkan keranjang', 'error');
      }
    }
  };

  // Handle checkout
  const handleCheckout = () => {
    if (items.length === 0) {
      showToast('Keranjang Anda kosong', 'error');
      return;
    }
    navigate('/checkout');
  };

  // Empty cart state
  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-green-600 mb-4 transition-colors"
              >
                <ArrowLeft size={20} className="mr-2" />
                Kembali
              </button>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <ShoppingCart size={32} />
                Keranjang Belanja
              </h1>
            </div>

            {/* Empty State */}
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart size={48} className="text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Keranjang Anda Kosong
              </h2>
              <p className="text-gray-600 mb-8">
                Belum ada produk di keranjang. Yuk, mulai belanja sekarang!
              </p>
              <button
                onClick={() => navigate('/products')}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
              >
                Lanjut Belanja
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-green-600 mb-4 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Kembali
            </button>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <ShoppingCart size={32} />
                Keranjang Belanja
              </h1>
              <button
                onClick={handleClearCart}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
                <span className="font-medium">Kosongkan Keranjang</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Produk ({items.length})
                </h2>
                <div className="space-y-4">
                  {items.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemove={handleRemoveItem}
                      disabled={loading}
                    />
                  ))}
                </div>
              </div>

              {/* Continue Shopping Button */}
              <button
                onClick={() => navigate('/products')}
                className="flex items-center gap-2 px-6 py-3 text-green-600 hover:bg-green-50 border border-green-600 rounded-lg transition-colors font-medium"
              >
                <ArrowLeft size={18} />
                Lanjut Belanja
              </button>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-1">
              <OrderSummary
                totalItems={totalItems}
                subtotal={totalPrice}
                shippingCost={0}
                total={totalPrice}
                onCheckout={handleCheckout}
                checkoutText="Lanjut ke Checkout"
                showInfoCards={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
          <div className={`flex items-center gap-3 p-4 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            toast.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default CartPage;

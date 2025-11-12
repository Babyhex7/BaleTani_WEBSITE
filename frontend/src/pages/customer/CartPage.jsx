/**
 * CART PAGE
 * Shopping cart management page
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Trash2, AlertCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import CartItem from '../../components/layout/CartItem';
import OrderSummary from '../../components/layout/OrderSummary';
import useAuthStore from '../../store/store_customer/useAuthStore';
import useCartStore from '../../store/store_customer/useCartStore';

/*************  ✨ Windsurf Command 🌟  *************/
/**
 * CART PAGE
 * Shopping cart management page
 * 
 * @returns {React.Component} Cart page component
 */
const CartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { items, updateQuantity, removeItem, clearCart, getTotalItems, getTotalPrice } = useCartStore();
  
  const [loading, setLoading] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  // Calculate totals
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  /**
   * Redirect to login page if not authenticated
   */
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?returnUrl=/cart');
    }
  }, [isAuthenticated, navigate]);

  /**
   * Handle quantity update
   * @param {number} itemId - Product ID
   * @param {number} newQuantity - New quantity
   */
  // Handle quantity update
  const handleUpdateQuantity = (itemId, newQuantity) => {
    try {
      updateQuantity(itemId, newQuantity);
      toast.success('Jumlah berhasil diperbarui');
    } catch (error) {
      toast.error('Gagal memperbarui jumlah');
    }
  };

  /**
   * Handle remove item
   * @param {number} itemId - Product ID
   */
  // Handle remove item
  const handleRemoveItem = (itemId) => {
    try {
      removeItem(itemId);
      toast.success('Produk berhasil dihapus dari keranjang');
    } catch (error) {
      toast.error('Gagal menghapus produk');
    }
  };

  /**
   * Handle clear cart
   */
  // Handle clear cart
  const handleClearCart = () => {
    try {
      clearCart();
      toast.success('Keranjang berhasil dikosongkan');
      setShowClearModal(false);
    } catch (error) {
      toast.error('Gagal mengosongkan keranjang');
    }
  };

  /**
   * Handle checkout
   */
  // Handle checkout
  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Keranjang Anda kosong');
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
                onClick={() => setShowClearModal(true)}
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

      {/* Clear Cart Confirmation Modal */}
      {showClearModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowClearModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon & Close Button */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
                <AlertCircle className="text-red-600" size={24} />
              </div>
              <button
                onClick={() => setShowClearModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Kosongkan Keranjang?
              </h3>
              <p className="text-gray-600">
                Semua produk di keranjang Anda akan dihapus. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleClearCart}
                className="flex-1 px-4 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Ya, Kosongkan
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};
/*******  67bf3df0-e737-485d-9064-4617f27f08a6  *******/

export default CartPage;

/**
 * CART PAGE
 * Shopping cart management page
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import CartItem from '../../components/layout/CartItem';
import OrderSummary from '../../components/layout/OrderSummary';
import useAuthStore from '../../store/store_customer/useAuthStore';
import useCartStore from '../../store/store_customer/useCartStore';

const CartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { items, updateQuantity, removeItem, clearCart, getTotalItems, getTotalPrice } = useCartStore();
  
  const [loading, setLoading] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  // Calculate totals
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?returnUrl=/cart');
    }
  }, [isAuthenticated, navigate]);

  // Handle quantity update
  const handleUpdateQuantity = (itemId, newQuantity) => {
    try {
      updateQuantity(itemId, newQuantity);
      toast.success('Jumlah berhasil diperbarui');
    } catch (error) {
      toast.error('Gagal memperbarui jumlah');
    }
  };

  // Handle remove item
  const handleRemoveItem = (itemId) => {
    try {
      removeItem(itemId);
      toast.success('Produk berhasil dihapus dari keranjang');
    } catch (error) {
      toast.error('Gagal menghapus produk');
    }
  };

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
        <div className="min-h-screen bg-gray-50 section-py">
          <div className="container-app">
            {/* Header - Responsive */}
            <div className="mb-6 sm:mb-8">
              <button
                onClick={() => navigate(-1)}
                className="btn-touch mb-3 sm:mb-4 px-0 text-gray-600 hover:text-green-600 transition-colors"
              >
                <ArrowLeft size={18} className="sm:w-5 sm:h-5 mr-2" />
                <span className="text-sm sm:text-base">Kembali</span>
              </button>
              <h1 className="heading-card sm:heading-section flex items-center gap-2 sm:gap-3">
                <ShoppingCart size={24} className="sm:w-7 sm:h-7 md:w-8 md:h-8" />
                Keranjang Belanja
              </h1>
            </div>

            {/* Empty State - Responsive */}
            <div className="card-responsive text-center py-12 sm:py-16">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <ShoppingCart size={40} className="sm:w-12 sm:h-12 text-gray-400" />
              </div>
              <h2 className="heading-sub sm:heading-card mb-2">
                Keranjang Anda Kosong
              </h2>
              <p className="text-body text-gray-600 mb-6 sm:mb-8">
                Belum ada produk di keranjang. Yuk, mulai belanja sekarang!
              </p>
              <button
                onClick={() => navigate('/products')}
                className="btn-touch px-6 sm:px-8 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold rounded-lg transition-colors"
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
      
      <div className="min-h-screen bg-gray-50 section-py pb-20 lg:pb-8">
        <div className="container-app">
          {/* Header - Responsive */}
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <button
              onClick={() => navigate(-1)}
              className="btn-touch mb-3 sm:mb-4 px-0 text-gray-600 hover:text-green-600 transition-colors"
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5 mr-2" />
              <span className="text-sm sm:text-base">Kembali</span>
            </button>
            <div className="flex items-center justify-between gap-2">
              <h1 className="heading-card sm:heading-section flex items-center gap-2 sm:gap-3">
                <ShoppingCart size={24} className="sm:w-7 sm:h-7 md:w-8 md:h-8" />
                <span className="hidden sm:inline">Keranjang Belanja</span>
                <span className="sm:hidden">Keranjang</span>
              </h1>
              <button
                onClick={() => setShowClearModal(true)}
                className="btn-touch px-3 sm:px-4 text-red-600 hover:bg-red-50 active:bg-red-100 rounded-lg transition-colors"
              >
                <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline ml-2 font-medium text-sm">Kosongkan</span>
              </button>
            </div>
          </div>

          {/* Main Content - Responsive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Left: Cart Items + Rincian (Mobile) */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              {/* Desktop: Wrapper Card untuk semua items */}
              <div className="lg:card-responsive lg:space-y-4">
                {/* Product Count Header */}
                <div className="card-responsive lg:p-0">
                  <h2 className="heading-sub sm:text-xl flex items-center gap-2">
                    <ShoppingCart size={20} className="text-green-600" />
                    Produk ({items.length})
                  </h2>
                </div>

                {/* Cart Items */}
                <div className="space-y-3 sm:space-y-4">
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

              {/* Order Summary - Show on mobile below products, hide on desktop */}
              <div className="lg:hidden">
                <OrderSummary
                  totalItems={totalItems}
                  subtotal={totalPrice}
                  shippingCost={0}
                  total={totalPrice}
                  onCheckout={handleCheckout}
                  checkoutText="Lanjut ke Checkout"
                  showInfoCards={false}
                />
              </div>

              {/* Continue Shopping Button - Desktop only */}
              <div className="hidden lg:block">
                <button
                  onClick={() => navigate('/products')}
                  className="btn-touch w-full lg:w-auto border-2 border-green-600 text-green-600 hover:bg-green-50 active:bg-green-100 rounded-lg transition-colors font-medium"
                >
                  <ArrowLeft size={18} />
                  <span>Lanjut Belanja</span>
                </button>
              </div>
            </div>

            {/* Right: Order Summary - Sticky on desktop only */}
            <div className="hidden lg:block lg:col-span-1">
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

      {/* Clear Cart Confirmation Modal - Responsive */}
      {showClearModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-overlay flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowClearModal(false)}
        >
          <div 
            className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-md w-full p-5 sm:p-6 animate-slide-up-modal sm:animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon & Close Button */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full">
                <AlertCircle className="text-red-600" size={20} />
              </div>
              <button
                onClick={() => setShowClearModal(false)}
                className="btn-touch p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="mb-5 sm:mb-6">
              <h3 className="heading-sub sm:text-xl mb-2">
                Kosongkan Keranjang?
              </h3>
              <p className="text-body text-gray-600">
                Semua produk di keranjang Anda akan dihapus. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            {/* Action Buttons - Stack on mobile */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowClearModal(false)}
                className="btn-touch flex-1 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleClearCart}
                className="btn-touch flex-1 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors"
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

export default CartPage;

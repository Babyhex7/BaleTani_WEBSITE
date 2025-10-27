/**
 * CHECKOUT PAGE
 * Order checkout with method selection
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Check, Package, CreditCard, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import useAuthStore from '../../store/store_customer/useAuthStore';
import useCartStore from '../../store/store_customer/useCartStore';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { items, clearCart, getTotalItems, getTotalPrice } = useCartStore();

  const [pickupMethod, setPickupMethod] = useState('ambil-sendiri');
  const [paymentMethod, setPaymentMethod] = useState('qris');
  const [shippingCost, setShippingCost] = useState(0);
  const [loading, setLoading] = useState(false);

  // Calculate totals
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  // Redirect if not authenticated or cart empty
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?returnUrl=/checkout');
    } else if (items.length === 0) {
      navigate('/cart');
    }
  }, [isAuthenticated, items, navigate]);

  // Update shipping cost based on pickup method
  useEffect(() => {
    setShippingCost(pickupMethod === 'pengantaran' ? 5000 : 0);
  }, [pickupMethod]);

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/100x100?text=No+Image';
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    const backendUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${backendUrl}${imagePath}`;
  };

  // Generate WhatsApp message
  const generateWhatsAppMessage = () => {
    let message = `*PESANAN BARU - BaleTani*\n\n`;
    message += `Nama: ${user?.name || 'Customer'}\n`;
    message += `HP: ${user?.phone || '-'}\n\n`;
    
    message += `*Produk:*\n`;
    items.forEach((item, index) => {
      const subtotal = item.finalPrice * item.quantity;
      message += `${index + 1}. ${item.name} (${item.quantity} ${item.unit}) - ${formatPrice(subtotal)}\n`;
    });
    
    message += `\n*Ringkasan:*\n`;
    message += `Subtotal: ${formatPrice(totalPrice)}\n`;
    message += `Biaya Kirim: ${shippingCost === 0 ? 'GRATIS' : formatPrice(shippingCost)}\n`;
    message += `Total: ${formatPrice(totalPrice + shippingCost)}\n\n`;
    
    message += `*Pengambilan:* ${pickupMethod === 'ambil-sendiri' ? 'Ambil Sendiri' : 'Pengantaran'}\n`;
    message += `*Pembayaran:* ${paymentMethod === 'qris' ? 'QRIS' : paymentMethod === 'transfer' ? 'Transfer Bank' : 'Tunai'}\n\n`;
    
    message += `Terima kasih! 🙏`;
    
    return message;
  };

  // Handle send order via WhatsApp
  const handleSendOrder = () => {
    if (items.length === 0) {
      toast.error('Keranjang Anda kosong');
      return;
    }

    setLoading(true);

    try {
      const message = generateWhatsAppMessage();
      const encodedMessage = encodeURIComponent(message);
      const phoneNumber = '6281234567890'; // Replace with actual admin WhatsApp number
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

      // Open WhatsApp in new tab
      window.open(whatsappUrl, '_blank');

      // Clear cart after successful order
      setTimeout(() => {
        clearCart();
        toast.success('Pesanan berhasil dikirim ke WhatsApp!');
        setTimeout(() => {
          navigate('/products');
        }, 2000);
      }, 1000);

    } catch (error) {
      console.error('Error sending order:', error);
      toast.error('Gagal mengirim pesanan');
    } finally {
      setLoading(false);
    }
  };

  const totalPayment = totalPrice + shippingCost;

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/cart')}
              className="flex items-center text-gray-600 hover:text-green-600 mb-4 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Kembali ke Keranjang
            </button>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <ShoppingCart size={32} />
              Checkout Pesanan
            </h1>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Products & Methods */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Products List */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ShoppingCart size={20} className="text-green-600" />
                  Produk yang Dibeli
                </h2>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                      {/* Image */}
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/64x64?text=No+Image';
                        }}
                      />
                      
                      {/* Info */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600">
                          {formatPrice(item.finalPrice)} / {item.unit}
                        </p>
                      </div>

                      {/* Quantity & Subtotal */}
                      <div className="text-right">
                        <p className="text-sm text-gray-600">x {item.quantity}</p>
                        <p className="font-semibold text-gray-900">
                          {formatPrice(item.finalPrice * item.quantity)}
                        </p>
                        {item.discount && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded">
                            Hemat
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pickup Method */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Truck size={20} className="text-green-600" />
                  Metode Pengambilan
                </h2>
                <div className="space-y-3">
                  {/* Ambil Sendiri */}
                  <label className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    pickupMethod === 'ambil-sendiri' 
                      ? 'border-green-600 bg-green-50' 
                      : 'border-gray-200 hover:border-green-300'
                  }`}>
                    <input
                      type="radio"
                      name="pickup"
                      value="ambil-sendiri"
                      checked={pickupMethod === 'ambil-sendiri'}
                      onChange={(e) => setPickupMethod(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Package size={18} className="text-green-600" />
                        <span className="font-semibold text-gray-900">Ambil Sendiri</span>
                        {pickupMethod === 'ambil-sendiri' && (
                          <Check size={16} className="text-green-600 ml-auto" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">Ambil di Toko BaleTani</p>
                      <p className="text-sm font-semibold text-green-600">GRATIS</p>
                    </div>
                  </label>

                  {/* Pengantaran */}
                  <label className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    pickupMethod === 'pengantaran' 
                      ? 'border-green-600 bg-green-50' 
                      : 'border-gray-200 hover:border-green-300'
                  }`}>
                    <input
                      type="radio"
                      name="pickup"
                      value="pengantaran"
                      checked={pickupMethod === 'pengantaran'}
                      onChange={(e) => setPickupMethod(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Truck size={18} className="text-blue-600" />
                        <span className="font-semibold text-gray-900">Pengantaran</span>
                        {pickupMethod === 'pengantaran' && (
                          <Check size={16} className="text-green-600 ml-auto" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">Dikirim ke alamat Anda</p>
                      <p className="text-sm font-semibold text-gray-900">Mulai Rp 5.000</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard size={20} className="text-green-600" />
                  Metode Pembayaran
                </h2>
                <div className="space-y-3">
                  {/* QRIS */}
                  <label className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    paymentMethod === 'qris' 
                      ? 'border-green-600 bg-green-50' 
                      : 'border-gray-200 hover:border-green-300'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="qris"
                      checked={paymentMethod === 'qris'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CreditCard size={18} className="text-purple-600" />
                        <span className="font-semibold text-gray-900">QRIS</span>
                        {paymentMethod === 'qris' && (
                          <Check size={16} className="text-green-600 ml-auto" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">Scan & bayar dengan e-wallet</p>
                    </div>
                  </label>

                  {/* Transfer Bank */}
                  <label className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    paymentMethod === 'transfer' 
                      ? 'border-green-600 bg-green-50' 
                      : 'border-gray-200 hover:border-green-300'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="transfer"
                      checked={paymentMethod === 'transfer'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CreditCard size={18} className="text-blue-600" />
                        <span className="font-semibold text-gray-900">Transfer Bank</span>
                        {paymentMethod === 'transfer' && (
                          <Check size={16} className="text-green-600 ml-auto" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">Pilih bank tujuan</p>
                    </div>
                  </label>

                  {/* Tunai */}
                  <label className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    paymentMethod === 'tunai' 
                      ? 'border-green-600 bg-green-50' 
                      : 'border-gray-200 hover:border-green-300'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="tunai"
                      checked={paymentMethod === 'tunai'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CreditCard size={18} className="text-green-600" />
                        <span className="font-semibold text-gray-900">Tunai</span>
                        {paymentMethod === 'tunai' && (
                          <Check size={16} className="text-green-600 ml-auto" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">Bayar di toko</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right: Payment Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
                {/* Header */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900">Ringkasan Pembayaran</h2>
                </div>

                {/* Summary */}
                <div className="p-6 space-y-4">
                  {/* Subtotal */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal Produk</span>
                    <span className="font-semibold text-gray-900">{formatPrice(totalPrice)}</span>
                  </div>

                  {/* Shipping */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Biaya Pengiriman</span>
                    <span className="font-semibold text-green-600">
                      {shippingCost === 0 ? 'GRATIS' : formatPrice(shippingCost)}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-lg font-semibold text-gray-900">Total Pembayaran</span>
                      <span className="text-2xl font-bold text-green-600">
                        {formatPrice(totalPayment)}
                      </span>
                    </div>

                    {/* Send Order Button */}
                    <button
                      onClick={handleSendOrder}
                      disabled={loading || items.length === 0}
                      className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart size={18} />
                      {loading ? 'Mengirim...' : 'Kirim Pesanan via WhatsApp'}
                    </button>

                    {/* Info */}
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-800">
                        <strong>Info:</strong> Pesanan akan dikirim ke WhatsApp BaleTani. Mohon konfirmasi pembayaran dalam 10 menit.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Selected Methods Info */}
                <div className="px-6 pb-6 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Package size={16} className="text-gray-500" />
                    <span className="text-gray-600">Pengambilan:</span>
                    <span className="font-semibold text-gray-900">
                      {pickupMethod === 'ambil-sendiri' ? 'Ambil Sendiri' : 'Pengantaran'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard size={16} className="text-gray-500" />
                    <span className="text-gray-600">Pembayaran:</span>
                    <span className="font-semibold text-gray-900">
                      {paymentMethod === 'qris' ? 'QRIS' : paymentMethod === 'transfer' ? 'Transfer Bank' : 'Tunai'}
                    </span>
                  </div>
                </div>
              </div>
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

export default CheckoutPage;

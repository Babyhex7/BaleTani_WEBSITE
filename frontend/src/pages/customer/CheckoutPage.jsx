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
import customerOrderService from '../../services/services_customer/customerOrderService';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { items, clearCart, getTotalItems, getTotalPrice } = useCartStore();

  const [pickupMethod, setPickupMethod] = useState('self_pickup');
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [selectedBank, setSelectedBank] = useState(''); // TAMBAHAN
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
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
    setShippingCost(pickupMethod === 'delivery' ? 10000 : 0);
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

  // Handle create order
  const handleCreateOrder = async () => {
    if (items.length === 0) {
      toast.error('Keranjang Anda kosong');
      return;
    }

    // Validation - gunakan full_name dan phone_number sesuai response backend
    if (!user?.full_name || !user?.phone_number) {
      toast.error('Data customer tidak lengkap. Silakan login ulang.');
      console.error('User data:', user);
      return;
    }

    if (pickupMethod === 'delivery' && !deliveryAddress.trim()) {
      toast.error('Alamat pengiriman wajib diisi untuk metode delivery');
      return;
    }

    // Validasi bank untuk transfer
    if (paymentMethod === 'transfer' && !selectedBank) {
      toast.error('Pilih bank terlebih dahulu (BRI/BCA/MANDIRI)');
      return;
    }

    setLoading(true);

    try {
      // Prepare order data - gunakan field yang benar
      const orderData = {
        customer_name: user.full_name,
        customer_phone: user.phone_number,
        delivery_method: pickupMethod,
        delivery_address: pickupMethod === 'delivery' ? deliveryAddress : null,
        delivery_notes: deliveryNotes || null,
        payment_method: paymentMethod,
        bank_name: paymentMethod === 'transfer' ? selectedBank : null, // TAMBAHAN
        items: items.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
      };

      // Create order via API
      const response = await customerOrderService.createOrder(orderData);

      if (response.success) {
        // Clear cart
        clearCart();
        
        // Show success message
        toast.success('Pesanan berhasil dibuat!');

        // Redirect to success page with order data
        navigate('/order-success', {
          state: { orderData: response.data },
        });
      } else {
        toast.error(response.message || 'Gagal membuat pesanan');
      }
    } catch (error) {
      console.error('Create order error:', error);
      toast.error(error.message || 'Gagal membuat pesanan');
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
                          {formatPrice(item.finalPrice)}
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
                    pickupMethod === 'self_pickup' 
                      ? 'border-green-600' 
                      : 'border-gray-200 hover:border-green-300'
                  }`}>
                    <input
                      type="radio"
                      name="pickup"
                      value="self_pickup"
                      checked={pickupMethod === 'self_pickup'}
                      onChange={(e) => setPickupMethod(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Package size={18} className="text-green-600" />
                        <span className="font-semibold text-gray-900">Ambil Sendiri</span>
                        {pickupMethod === 'self_pickup' && (
                          <Check size={16} className="text-green-600 ml-auto" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">Ambil di Toko BaleTani</p>
                      <p className="text-sm font-semibold text-green-600">GRATIS</p>
                    </div>
                  </label>

                  {/* Delivery */}
                  <label className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    pickupMethod === 'delivery' 
                      ? 'border-green-600' 
                      : 'border-gray-200 hover:border-green-300'
                  }`}>
                    <input
                      type="radio"
                      name="pickup"
                      value="delivery"
                      checked={pickupMethod === 'delivery'}
                      onChange={(e) => setPickupMethod(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Truck size={18} className="text-blue-600" />
                        <span className="font-semibold text-gray-900">Pengantaran</span>
                        {pickupMethod === 'delivery' && (
                          <Check size={16} className="text-green-600 ml-auto" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">Dikirim ke alamat Anda</p>
                      <p className="text-sm font-semibold text-gray-900">Rp 10.000</p>
                    </div>
                  </label>
                </div>

                {/* Delivery Address (show only if delivery selected) */}
                {pickupMethod === 'delivery' && (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alamat Pengiriman <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Jalan, No. Rumah, RT/RW, Kelurahan, Kecamatan, Kota"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Catatan Pengiriman (Opsional)
                      </label>
                      <textarea
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Catatan untuk kurir (misal: warna pagar, patokan)"
                      />
                    </div>
                  </div>
                )}
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
                      ? 'border-green-600' 
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
                  <div className={`rounded-lg border-2 transition-all ${
                    paymentMethod === 'transfer' 
                      ? 'border-green-600' 
                      : 'border-gray-200'
                  }`}>
                    <label className="flex items-start gap-4 p-4 cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value="transfer"
                        checked={paymentMethod === 'transfer'}
                        onChange={(e) => {
                          setPaymentMethod(e.target.value);
                          setSelectedBank(''); // Reset bank selection
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard size={18} className="text-blue-600" />
                          <span className="font-semibold text-gray-900">Transfer Bank (Virtual Account)</span>
                          {paymentMethod === 'transfer' && (
                            <Check size={16} className="text-green-600 ml-auto" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">Bayar via ATM/Mobile Banking</p>
                      </div>
                    </label>

                    {/* Bank Selection - tampil jika transfer dipilih */}
                    {paymentMethod === 'transfer' && (
                      <div className="px-4 pb-4 pt-2 border-t border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-3">Pilih Bank:</p>
                        <div className="grid grid-cols-3 gap-3">
                          {/* BRI */}
                          <label className={`flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition ${
                            selectedBank === 'BRI' 
                              ? 'border-blue-600 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}>
                            <input
                              type="radio"
                              name="bank"
                              value="BRI"
                              checked={selectedBank === 'BRI'}
                              onChange={(e) => setSelectedBank(e.target.value)}
                              className="sr-only"
                            />
                            <div className="text-center">
                              <p className="font-bold text-lg text-blue-600">BRI</p>
                              <p className="text-xs text-gray-600 mt-1">Bank BRI</p>
                            </div>
                          </label>

                          {/* BCA */}
                          <label className={`flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition ${
                            selectedBank === 'BCA' 
                              ? 'border-blue-600 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}>
                            <input
                              type="radio"
                              name="bank"
                              value="BCA"
                              checked={selectedBank === 'BCA'}
                              onChange={(e) => setSelectedBank(e.target.value)}
                              className="sr-only"
                            />
                            <div className="text-center">
                              <p className="font-bold text-lg text-blue-700">BCA</p>
                              <p className="text-xs text-gray-600 mt-1">Bank BCA</p>
                            </div>
                          </label>

                          {/* MANDIRI */}
                          <label className={`flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition ${
                            selectedBank === 'MANDIRI' 
                              ? 'border-blue-600 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}>
                            <input
                              type="radio"
                              name="bank"
                              value="MANDIRI"
                              checked={selectedBank === 'MANDIRI'}
                              onChange={(e) => setSelectedBank(e.target.value)}
                              className="sr-only"
                            />
                            <div className="text-center">
                              <p className="font-bold text-lg text-yellow-600">MANDIRI</p>
                              <p className="text-xs text-gray-600 mt-1">Bank Mandiri</p>
                            </div>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tunai */}
                  <label className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    paymentMethod === 'tunai' 
                      ? 'border-green-600' 
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

                    {/* Create Order Button */}
                    <button
                      onClick={handleCreateOrder}
                      disabled={loading || items.length === 0}
                      className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart size={18} />
                      {loading ? 'Membuat Pesanan...' : 'Buat Pesanan'}
                    </button>

                    {/* Info */}
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-800">
                        <strong>Info:</strong> Setelah pesanan dibuat, Anda akan diarahkan ke halaman konfirmasi untuk mengirim detail pesanan ke WhatsApp admin.
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
                      {pickupMethod === 'self_pickup' ? 'Ambil Sendiri' : 'Pengantaran'}
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

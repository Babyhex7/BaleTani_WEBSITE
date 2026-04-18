/**
 * ORDER SUCCESS PAGE
 * Success page after checkout with payment instructions
 */

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  CheckCircle, 
  Home, 
  ShoppingBag, 
  MessageCircle, 
  CreditCard, 
  Package, 
  Clock,
  Copy,
  Building2,
  AlertCircle
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import customerOrderService from '../../services/services_customer/customerOrderService';

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state?.orderData;

  // State untuk countdown timer
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  
  // State untuk order status (untuk polling)
  const [currentOrderStatus, setCurrentOrderStatus] = useState(orderData?.order_status);
  const [currentPaymentStatus, setCurrentPaymentStatus] = useState(orderData?.payment_status);

  useEffect(() => {
    // Redirect jika tidak ada order data
    if (!orderData) {
      navigate('/');
    }
  }, [orderData, navigate]);

  // Polling untuk check status order (setiap 10 detik)
  useEffect(() => {
    if (!orderData?.id) return;

    // Skip polling jika order sudah paid/completed/cancelled
    const skipStatuses = ['paid', 'completed', 'cancelled'];
    if (skipStatuses.includes(currentOrderStatus) || skipStatuses.includes(currentPaymentStatus)) {
      return;
    }

    const checkOrderStatus = async () => {
      try {
        const result = await customerOrderService.getOrderStatus(orderData.id);
        
        if (result.success && result.data) {
          const newOrderStatus = result.data.order_status;
          const newPaymentStatus = result.data.payment_status;
          
          // Update status jika berubah
          if (newOrderStatus !== currentOrderStatus) {
            setCurrentOrderStatus(newOrderStatus);
            console.log(`[ORDER STATUS UPDATED] ${currentOrderStatus} → ${newOrderStatus}`);
          }
          
          if (newPaymentStatus !== currentPaymentStatus) {
            setCurrentPaymentStatus(newPaymentStatus);
            console.log(`[PAYMENT STATUS UPDATED] ${currentPaymentStatus} → ${newPaymentStatus}`);
          }

          // Stop countdown jika sudah paid/completed
          if (newPaymentStatus === 'paid' || newOrderStatus === 'paid' || newOrderStatus === 'completed') {
            setTimeRemaining(null);
            setIsExpired(false);
          }
        }
      } catch (error) {
        console.error('[POLLING ERROR]', error);
        // Silent fail - polling akan retry di interval berikutnya
      }
    };

    // Check pertama kali setelah 5 detik
    const initialTimeout = setTimeout(checkOrderStatus, 5000);

    // Polling setiap 10 detik
    const pollingInterval = setInterval(checkOrderStatus, 10000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(pollingInterval);
    };
  }, [orderData, currentOrderStatus, currentPaymentStatus]);

  // Countdown timer untuk pending_payment orders
  useEffect(() => {
    // HANYA untuk order yang perlu pembayaran transfer/QRIS
    // TIDAK untuk cash/tunai (karena bayar di tempat)
    if (!orderData) {
      return;
    }

    // Stop countdown jika status sudah paid/completed
    if (currentPaymentStatus === 'paid' || currentOrderStatus === 'paid' || currentOrderStatus === 'completed') {
      setTimeRemaining(null);
      setIsExpired(false);
      return;
    }

    const paymentMethod = orderData.payment_method?.toLowerCase();
    const isCashPayment = paymentMethod === 'cash' || paymentMethod === 'tunai';

    // Skip countdown untuk cash payment
    if (isCashPayment) {
      return;
    }

    // Ambil payment_expired_at dari orderData
    const paymentExpiredAt = orderData.payment_expired_at || orderData.payment?.expired_at;
    
    if (!paymentExpiredAt) {
      return;
    }

    console.log(`[COUNTDOWN SUCCESS] Order ${orderData.order_number} - Starting countdown for ${paymentMethod}`);

    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const expiry = new Date(paymentExpiredAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeRemaining(null);
        
        triggerManualCancel();
        
        return null;
      }

      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return { minutes, seconds, total: diff };
    };

    // Hitung pertama kali
    const initial = calculateTimeRemaining();
    setTimeRemaining(initial);

    // Update setiap 1 detik
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      if (!remaining) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [orderData, currentOrderStatus, currentPaymentStatus]);

  // Trigger manual cancel ke backend saat countdown habis
  const triggerManualCancel = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/customer/orders/${orderData.id}/manual-cancel`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
    } catch (error) {
      console.error('Failed to cancel expired order:', error);
    }
  };

  if (!orderData) {
    return null;
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Payment instructions based on method
  const getPaymentInstructions = () => {
    switch (orderData.payment_method) {
      case 'transfer':
      case 'bank_transfer':
        // Jika ada payment detail dengan VA
        if (orderData.payment) {
          const expiredDate = new Date(orderData.payment_expired_at || orderData.payment.expired_at);
          const formattedExpiry = expiredDate.toLocaleString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          }).replace(/\./g, ':');
          
          // Pisahkan tanggal dan waktu
          const [datePart, timePart] = formattedExpiry.split(', ');
          
          return {
            title: `Transfer Bank - ${orderData.payment.bank}`,
            instructions: [
              `Bank: ${orderData.payment.bank}`,
              `Rekening Transfer: ${orderData.payment.virtual_account}`,
              `a/n: ${orderData.payment.account_name}`,
              `Nominal: ${formatCurrency(orderData.total_amount)}`,
              `Transfer sebelum: Tanggal ${datePart} dan pukul ${timePart} WIB`,
              'Setelah transfer, konfirmasi ke admin via WhatsApp',
            ],
          };
        }
        return {
          title: 'Transfer Bank',
          instructions: [
            'Informasi pembayaran akan dikirim segera',
            `Nominal: ${formatCurrency(orderData.total_amount)}`,
            'Setelah transfer, konfirmasi ke admin via WhatsApp',
          ],
        };
      case 'qris':
        return {
          title: 'QRIS',
          instructions: [
            'Tekan tombol "Kirim Pesanan via WhatsApp" di bawah',
            'Admin akan mengirimkan QR Code pembayaran',
            `Nominal: ${formatCurrency(orderData.total_amount)}`,
            'Scan QR Code yang dikirim admin',
            'Selesaikan pembayaran',
            'Kirim bukti dan konfirmasi setelah berhasil',
          ],
        };
      case 'tunai':
      case 'cash':
        return {
          title: 'Bayar di Tempat',
          instructions: [
            'Pembayaran dilakukan saat pengambilan/pengantaran barang',
            `Total yang harus dibayar: ${formatCurrency(orderData.total_amount)}`,
            'Siapkan uang pas untuk mempermudah transaksi',
          ],
        };
      default:
        return { title: '', instructions: [] };
    }
  };

  const paymentInfo = getPaymentInstructions();

  // Copy VA to clipboard
  const copyVA = () => {
    if (orderData.payment?.virtual_account) {
      navigator.clipboard.writeText(orderData.payment.virtual_account);
      // You can add toast notification here
      alert('Nomor Rekening Transfer berhasil disalin!');
    }
  };

  // WhatsApp message
  const sendWhatsApp = () => {
    // ========================================
    // GUNAKAN WA MESSAGE DARI BACKEND
    // ========================================
    if (orderData.whatsapp?.url) {
      window.open(orderData.whatsapp.url, '_blank');
    } else {
      // Fallback ke message lama jika backend tidak generate WhatsApp message
      const adminPhone = import.meta.env.VITE_WHATSAPP_NUMBER || '6287735517999'; // Nomor dari .env
      
      let message = `🛒 *KONFIRMASI PESANAN BALETANI*\n\n`;
      message += `📋 *Detail Pesanan*\n`;
      message += `Order Number: *${orderData.order_number}*\n`;
      message += `Nama: ${orderData.customer_name}\n`;
      message += `Telepon: ${orderData.customer_phone}\n\n`;
      
      message += `📦 *Produk yang Dipesan:*\n`;
      orderData.items.forEach((item, index) => {
        message += `${index + 1}. ${item.product_name}\n`;
        message += `   ${item.quantity} × ${formatCurrency(item.final_price)} = ${formatCurrency(item.subtotal)}\n`;
      });
      
      message += `\n💰 *Rincian Pembayaran:*\n`;
      message += `Subtotal: ${formatCurrency(orderData.item_subtotal)}\n`;
      message += `Ongkir: ${formatCurrency(orderData.delivery_fee)}\n`;
      message += `─────────────────\n`;
      message += `*TOTAL: ${formatCurrency(orderData.total_amount)}*\n\n`;
      
      message += `🚚 *Metode Pengiriman:*\n`;
      message += `${orderData.delivery_method === 'delivery' ? '🏠 Delivery/Antar' : orderData.delivery_method === 'self_pickup' ? '🏪 Ambil Sendiri (Self Pickup)' : '🛍️ Transaksi di Toko'}\n`;
      if (orderData.delivery_address) {
        message += `Alamat: ${orderData.delivery_address}\n`;
      }
      message += `\n`;
      
      message += `💳 *Metode Pembayaran:*\n`;
      
      // Bank Transfer
      if (orderData.payment_method === 'transfer' || orderData.payment_method === 'bank_transfer') {
        if (orderData.payment) {
          message += `🏦 Transfer Bank ${orderData.payment.bank}\n\n`;
          message += `*SILAKAN TRANSFER KE:*\n`;
          message += `Bank: ${orderData.payment.bank}\n`;
          message += `No. Rek: ${orderData.payment.virtual_account}\n`;
          message += `a/n: ${orderData.payment.account_name}\n`;
          message += `Jumlah: ${formatCurrency(orderData.total_amount)}\n\n`;
          
          if (orderData.payment_expired_at) {
            const expiredDate = new Date(orderData.payment_expired_at);
            const formattedExpiry = expiredDate.toLocaleString('id-ID', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'Asia/Jakarta'
            });
            message += `⏰ *Selesaikan pembayaran sebelum:*\n`;
            message += `${formattedExpiry}\n`;
            message += `_(10 menit dari sekarang)_\n\n`;
          }
          
          message += `📸 *Setelah transfer, mohon kirim bukti transfer ke nomor ini*\n\n`;
        }
      }
      // QRIS
      else if (orderData.payment_method === 'qris') {
        message += `📱 QRIS\n\n`;
        message += `*CARA PEMBAYARAN:*\n`;
        message += `1️⃣ Admin akan mengirimkan QR Code pembayaran ke nomor ini\n`;
        message += `2️⃣ Scan QR Code yang dikirim admin\n`;
        message += `3️⃣ Selesaikan pembayaran dengan nominal yang tertera\n`;
        message += `4️⃣ Kirim bukti pembayaran dan konfirmasi setelah berhasil\n\n`;
        message += `Jumlah: ${formatCurrency(orderData.total_amount)}\n\n`;
        
        if (orderData.payment_expired_at) {
          const expiredDate = new Date(orderData.payment_expired_at);
          const formattedExpiry = expiredDate.toLocaleString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Jakarta'
          });
          message += `⏰ *Selesaikan pembayaran sebelum:*\n`;
          message += `${formattedExpiry}\n`;
          message += `_(10 menit dari sekarang)_\n\n`;
        }
      }
      // Cash
      else if (orderData.payment_method === 'cash' || orderData.payment_method === 'tunai') {
        message += `💵 Cash (Bayar di Tempat)\n`;
        message += `Pembayaran dilakukan saat pengambilan/pengiriman barang\n`;
        message += `Jumlah: ${formatCurrency(orderData.total_amount)}\n`;
        message += `💡 Siapkan uang pas untuk mempermudah transaksi\n\n`;
      }
      
      message += `Terima kasih sudah berbelanja di *BaleTani Fresh Market*! 🌿✨\n`;
      message += `\n_Pesan otomatis dari sistem BaleTani_`;

      const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 section-py">
        <div className="container-app max-w-4xl">
          {/* Success Header - Mobile Responsive */}
          <div className="card-responsive mb-4 sm:mb-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-3 sm:mb-4">
                <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="heading-card sm:heading-section text-gray-900 mb-1 sm:mb-2">
                Pesanan Berhasil Dibuat
              </h1>
              <p className="text-body text-gray-600">
                Terima kasih telah berbelanja di BaleTani Fresh Market
              </p>
            </div>

            {/* Countdown Timer - HANYA untuk Transfer/QRIS (yang ada payment_expired_at) */}
            {/* TIDAK muncul untuk Cash/COD karena bayar di tempat */}
            {/* TIDAK muncul jika sudah paid/completed */}
            {currentPaymentStatus === 'paid' || currentOrderStatus === 'paid' || currentOrderStatus === 'completed' ? (
              <div className="mt-6">
                <div className="bg-green-600 rounded-lg shadow-lg p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-green-700 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white text-xl font-bold mb-2">Pembayaran Dikonfirmasi!</h3>
                      <p className="text-green-100">
                        Admin telah mengkonfirmasi pembayaran Anda. Pesanan sedang diproses.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : orderData.payment_expired_at && timeRemaining ? (
              <div className="mt-6">
                <div className="bg-red-600 rounded-lg shadow-lg p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Timer */}
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-red-700 rounded-lg flex items-center justify-center">
                        <Clock className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium mb-1">Selesaikan pembayaran dalam:</p>
                        <p className="text-white text-4xl font-bold">
                          {String(timeRemaining.minutes).padStart(2, '0')}:{String(timeRemaining.seconds).padStart(2, '0')}
                        </p>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="text-center sm:text-right">
                      <p className="text-white text-sm">
                        Pesanan akan dibatalkan otomatis<br />jika tidak dibayar
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Expired Notice - HANYA untuk order yang expired */}
            {orderData.payment_expired_at && isExpired && (
              <div className="mt-6">
                <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white text-xl font-bold mb-2">Waktu Pembayaran Habis</h3>
                      <p className="text-gray-300 mb-4">
                        Pesanan telah dibatalkan otomatis. Silakan pesan kembali jika masih ingin berbelanja.
                      </p>
                      <button
                        onClick={() => navigate('/products')}
                        className="px-5 py-2.5 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                      >
                        Belanja Lagi
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Order Number & Total - Mobile Responsive */}
            <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  <p className="text-caption sm:text-sm font-medium text-gray-600">Nomor Pesanan</p>
                </div>
                <p className="text-lg sm:text-xl font-bold text-green-600 break-all">
                  {orderData.order_number}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  <p className="text-caption sm:text-sm font-medium text-gray-600">Total Pembayaran</p>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {formatCurrency(orderData.total_amount)}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items Card - Mobile Responsive */}
          <div className="card-responsive mb-4 sm:mb-6">
            <h3 className="heading-sub sm:text-lg text-gray-900 mb-3 sm:mb-4">Detail Pesanan</h3>
            <div className="space-y-2 sm:space-y-3">
              {orderData.items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between gap-3 text-caption sm:text-sm bg-gray-50 p-3 sm:p-4 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{item.product_name}</p>
                    <p className="text-gray-500 text-xs sm:text-sm">
                      {item.quantity} {item.unit} × {formatCurrency(item.final_price)}
                    </p>
                  </div>
                  <p className="font-medium text-gray-900 flex-shrink-0">
                    {formatCurrency(item.subtotal)}
                  </p>
                </div>
              ))}
            </div>

            {/* Summary - Mobile Responsive */}
            <div className="border-t border-gray-200 pt-3 sm:pt-4 mt-3 sm:mt-4 space-y-2">
              <div className="flex justify-between text-caption sm:text-sm">
                <span className="text-gray-600">Subtotal Produk</span>
                <span className="font-medium">{formatCurrency(orderData.item_subtotal)}</span>
              </div>
              <div className="flex justify-between text-caption sm:text-sm">
                <span className="text-gray-600">Ongkos Kirim</span>
                <span className="font-medium">{formatCurrency(orderData.delivery_fee)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-semibold text-gray-900 text-sm sm:text-base">Total</span>
                <span className="font-bold text-lg sm:text-xl text-green-600">
                  {formatCurrency(orderData.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Instructions - Mobile Responsive */}
          {orderData.payment_method !== 'cash' && orderData.payment_method !== 'tunai' && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
              <h3 className="heading-sub sm:text-lg text-blue-900 mb-3 sm:mb-4 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                Informasi Pembayaran
              </h3>
              
              {/* Jika transfer bank dengan VA - Mobile Responsive */}
              {orderData.payment && orderData.payment.virtual_account && (
                <div className="bg-white rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 border border-blue-300">
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Bank</p>
                      <p className="text-base sm:text-lg font-bold text-blue-900">{orderData.payment.bank}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Rekening Transfer</p>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-gray-50 p-3 rounded border border-gray-300">
                        <p className="text-lg sm:text-xl font-mono font-bold text-blue-900 tracking-wider flex-1 break-all">
                          {orderData.payment.virtual_account}
                        </p>
                        <button
                          onClick={copyVA}
                          className="btn-touch px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 active:bg-blue-800 transition font-medium flex items-center justify-center gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          <span>Salin</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 mb-1">Atas Nama</p>
                      <p className="font-semibold text-gray-900">{orderData.payment.account_name}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 mb-1">Total Pembayaran</p>
                      <p className="text-xl sm:text-2xl font-bold text-green-600">
                        {formatCurrency(orderData.total_amount)}
                      </p>
                    </div>

                    {(orderData.payment_expired_at || orderData.payment.expired_at) && (
                      <div className="bg-yellow-50 border border-yellow-300 rounded p-3">
                        <div className="flex items-start gap-2">
                          <Clock className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-caption sm:text-sm text-yellow-800">
                              Selesaikan pembayaran sebelum:
                            </p>
                            <p className="font-semibold text-yellow-900 text-sm sm:text-base">
                              {new Date(orderData.payment_expired_at || orderData.payment.expired_at).toLocaleString('id-ID', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Instruksi umum - Mobile Responsive */}
              <div className="space-y-2">
                <p className="font-medium text-blue-900 mb-2 text-sm sm:text-base">Cara Pembayaran:</p>
                <ul className="space-y-2">
                  {paymentInfo.instructions.map((instruction, index) => (
                    <li key={index} className="text-caption sm:text-sm text-blue-800 flex items-start gap-2">
                      <span className="text-blue-600 font-bold mt-0.5">•</span>
                      <span className="flex-1">{instruction}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Action Buttons - Mobile Responsive */}
          <div className="space-y-3 sm:space-y-4">
            {/* WhatsApp Button */}
            <button
              onClick={sendWhatsApp}
              className="btn-touch w-full bg-green-600 text-white py-3 sm:py-4 rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors flex items-center justify-center gap-2 sm:gap-3 font-semibold text-base sm:text-lg"
            >
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              Kirim Pesanan via WhatsApp
            </button>

            <p className="text-center text-caption sm:text-sm text-gray-500">
              Klik tombol di atas untuk mengirim detail pesanan ke admin WhatsApp
            </p>

            {/* Other Actions - Mobile Responsive */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4">
              <button
                onClick={() => navigate('/home')}
                className="btn-touch py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-center gap-2 font-medium text-sm sm:text-base"
              >
                <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Ke Beranda</span>
                <span className="sm:hidden">Beranda</span>
              </button>
              <button
                onClick={() => navigate('/products')}
                className="btn-touch py-2.5 sm:py-3 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 active:bg-green-100 transition-colors flex items-center justify-center gap-2 font-medium text-sm sm:text-base"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Belanja Lagi</span>
                <span className="sm:hidden">Belanja</span>
              </button>
            </div>
          </div>

          {/* Info Box - Mobile Responsive */}
          <div className="mt-6 sm:mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
            <p className="text-caption sm:text-sm text-yellow-800">
              <strong>Penting:</strong> Pesanan Anda akan diproses setelah admin menerima
              konfirmasi melalui WhatsApp. Mohon segera hubungi admin untuk mempercepat
              proses pesanan Anda.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default OrderSuccessPage;

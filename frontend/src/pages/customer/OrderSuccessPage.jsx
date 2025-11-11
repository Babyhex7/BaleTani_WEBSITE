/**
 * ORDER SUCCESS PAGE
 * Success page after checkout with payment instructions
 */

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Home, ShoppingBag, MessageCircle } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state?.orderData;

  useEffect(() => {
    // Redirect jika tidak ada order data
    if (!orderData) {
      navigate('/');
    }
  }, [orderData, navigate]);

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
          return {
            title: `Transfer Bank - ${orderData.payment.bank}`,
            instructions: [
              `Bank: ${orderData.payment.bank}`,
              `Virtual Account: ${orderData.payment.virtual_account}`,
              `a/n: ${orderData.payment.account_name}`,
              `Nominal: ${formatCurrency(orderData.total_amount)}`,
              'Transfer sebelum: ' + new Date(orderData.payment.expired_at).toLocaleString('id-ID'),
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
            'Scan QR Code berikut untuk pembayaran',
            `Nominal: ${formatCurrency(orderData.total_amount)}`,
            'Setelah pembayaran, konfirmasi ke admin via WhatsApp',
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
      alert('Nomor Virtual Account berhasil disalin!');
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
      // Fallback ke message lama
      const adminPhone = '6285885725027'; // Nomor dari .env
      
      let message = `*KONFIRMASI PESANAN BALETANI*\n\n`;
      message += `Order Number: *${orderData.order_number}*\n`;
      message += `Nama: ${orderData.customer_name}\n`;
      message += `Telepon: ${orderData.customer_phone}\n\n`;
      
      message += `*Detail Pesanan:*\n`;
      orderData.items.forEach((item, index) => {
        message += `${index + 1}. ${item.product_name}\n`;
        message += `   ${item.quantity} x ${formatCurrency(item.final_price)} = ${formatCurrency(item.subtotal)}\n`;
      });
      
      message += `\n*Ringkasan:*\n`;
      message += `Subtotal: ${formatCurrency(orderData.item_subtotal)}\n`;
      message += `Ongkir: ${formatCurrency(orderData.delivery_fee)}\n`;
      message += `*TOTAL: ${formatCurrency(orderData.total_amount)}*\n\n`;
      
      message += `Metode Pengiriman: ${orderData.delivery_method === 'delivery' ? 'Delivery' : 'Ambil di Toko'}\n`;
      if (orderData.delivery_address) {
        message += `Alamat: ${orderData.delivery_address}\n`;
      }
      
      message += `Metode Pembayaran: ${paymentInfo.title}\n\n`;
      
      if (orderData.payment_method !== 'cash') {
        message += `Saya akan segera melakukan pembayaran.\n`;
      }
      
      message += `Terima kasih! 🌾`;

      const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex-grow container mx-auto px-4 py-12 max-w-3xl">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pesanan Berhasil Dibuat!
          </h1>
          <p className="text-gray-600">
            Terima kasih telah berbelanja di BaleTani
          </p>
        </div>

        {/* Order Info Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="border-b pb-4 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Order Number</p>
                <p className="text-xl font-bold text-green-600">
                  {orderData.order_number}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Pembayaran</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(orderData.total_amount)}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-3">Detail Pesanan</h3>
            <div className="space-y-2">
              {orderData.items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between text-sm bg-gray-50 p-3 rounded"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.product_name}</p>
                    <p className="text-gray-500">
                      {item.quantity} {item.unit} × {formatCurrency(item.final_price)}
                    </p>
                  </div>
                  <p className="font-medium text-gray-900">
                    {formatCurrency(item.subtotal)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal Produk</span>
              <span className="font-medium">{formatCurrency(orderData.item_subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Ongkos Kirim</span>
              <span className="font-medium">{formatCurrency(orderData.delivery_fee)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-bold text-lg text-green-600">
                {formatCurrency(orderData.total_amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Instructions */}
        {orderData.payment_method !== 'tunai' && orderData.payment_method !== 'cash' && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2 text-lg">
              <MessageCircle className="w-5 h-5" />
              Informasi Pembayaran
            </h3>
            
            {/* Jika transfer bank dengan VA */}
            {orderData.payment && orderData.payment.virtual_account && (
              <div className="bg-white rounded-lg p-4 mb-4 border border-blue-300">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Bank</p>
                    <p className="text-lg font-bold text-blue-900">{orderData.payment.bank}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Virtual Account</p>
                    <div className="flex items-center gap-2 bg-gray-50 p-3 rounded border border-gray-300">
                      <p className="text-xl font-mono font-bold text-blue-900 tracking-wider flex-1">
                        {orderData.payment.virtual_account}
                      </p>
                      <button
                        onClick={copyVA}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition font-medium"
                      >
                        Salin
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 mb-1">Atas Nama</p>
                    <p className="font-semibold text-gray-900">{orderData.payment.account_name}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total Pembayaran</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(orderData.total_amount)}
                    </p>
                  </div>

                  {orderData.payment.expired_at && (
                    <div className="bg-yellow-50 border border-yellow-300 rounded p-3 mt-3">
                      <p className="text-sm text-yellow-800">
                        ⏰ Selesaikan pembayaran sebelum:
                      </p>
                      <p className="font-semibold text-yellow-900">
                        {new Date(orderData.payment.expired_at).toLocaleString('id-ID', {
                          dateStyle: 'full',
                          timeStyle: 'short'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Instruksi umum */}
            <div className="space-y-2">
              <p className="font-medium text-blue-900 mb-2">Cara Pembayaran:</p>
              <ul className="space-y-2">
                {paymentInfo.instructions.map((instruction, index) => (
                  <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* WhatsApp Button */}
          <button
            onClick={sendWhatsApp}
            className="w-full bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-3 font-semibold text-lg"
          >
            <MessageCircle className="w-6 h-6" />
            Kirim Pesanan via WhatsApp
          </button>

          <p className="text-center text-sm text-gray-500">
            Klik tombol di atas untuk mengirim detail pesanan ke admin WhatsApp
          </p>

          {/* Other Actions */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <button
              onClick={() => navigate('/')}
              className="py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Home className="w-5 h-5" />
              Ke Beranda
            </button>
            <button
              onClick={() => navigate('/products')}
              className="py-3 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <ShoppingBag className="w-5 h-5" />
              Belanja Lagi
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Penting:</strong> Pesanan Anda akan diproses setelah admin menerima
            konfirmasi melalui WhatsApp. Mohon segera hubungi admin untuk mempercepat
            proses pesanan Anda.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OrderSuccessPage;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  MapPin,
  Store,
  Truck,
  Clock,
  CreditCard,
  Wallet,
  Banknote,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import useCartStore from '../../store/store_customer/useCartStore';
import useAuthStore from '../../store/store_customer/useAuthStore';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, updateQuantity, removeItem, getTotal } = useCartStore();

  // State untuk form
  const [pickupMethod, setPickupMethod] = useState('pickup'); // 'pickup' atau 'delivery'
  const [deliveryType, setDeliveryType] = useState('instant'); // 'instant', 'sameday', 'nextday'
  const [paymentMethod, setPaymentMethod] = useState('qris'); // 'qris', 'transfer', 'cash'
  const [selectedBank, setSelectedBank] = useState(''); // untuk pilihan bank saat transfer
  const [deliveryAddress, setDeliveryAddress] = useState('');

  if (!user) {
    navigate('/login');
    return null;
  }

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const getProductImage = (product) => {
    if (product.image && !product.image.includes('placeholder')) {
      return product.image;
    }
    const category = product.category?.toLowerCase() || 'vegetables';
    const queries = {
      sayuran: 'fresh-vegetables',
      buah: 'fresh-fruits',
      bumbu: 'spices-herbs',
      daging: 'fresh-meat',
      seafood: 'fresh-seafood',
    };
    const query = queries[category] || 'fresh-produce';
    return `https://source.unsplash.com/200x200/?${query}`;
  };

  const getDeliveryFee = () => {
    if (pickupMethod === 'pickup') return 0;
    
    switch (deliveryType) {
      case 'instant': return 15000;
      case 'sameday': return 10000;
      case 'nextday': return 5000;
      default: return 0;
    }
  };

  const getDeliveryTime = () => {
    switch (deliveryType) {
      case 'instant': return '~30 menit';
      case 'sameday': return '~4 jam';
      case 'nextday': return 'Besok';
      default: return '';
    }
  };

  const totalProduct = getTotal();
  const deliveryFee = getDeliveryFee();
  const grandTotal = totalProduct + deliveryFee;

  const handleCheckout = () => {
    // Validasi
    if (pickupMethod === 'delivery' && !deliveryAddress.trim()) {
      toast.error('Mohon isi alamat pengiriman');
      return;
    }

    // Generate pesan WhatsApp
    let message = `*PESANAN BARU - BALETANI*\n\n`;
    message += `👤 *Nama:* ${user.name}\n`;
    message += `📱 *No HP:* ${user.phone}\n\n`;
    message += `📦 *DETAIL PESANAN:*\n`;
    message += `${items
      .map((item, idx) => {
        const price = item.promoPrice || item.price;
        const subtotal = price * item.quantity;
        return `${idx + 1}. ${item.name}\n   ${item.quantity} ${item.unit} × Rp ${price.toLocaleString('id-ID')}\n   Subtotal: Rp ${subtotal.toLocaleString('id-ID')}`;
      })
      .join('\n\n')}\n\n`;
    
    message += `💰 *RINCIAN BIAYA:*\n`;
    message += `- Subtotal Produk: Rp ${totalProduct.toLocaleString('id-ID')}\n`;
    message += `- Biaya Pengiriman: Rp ${deliveryFee.toLocaleString('id-ID')}\n`;
    message += `- *TOTAL: Rp ${grandTotal.toLocaleString('id-ID')}*\n\n`;

    message += `🚚 *METODE PENGAMBILAN:*\n`;
    if (pickupMethod === 'pickup') {
      message += `✅ Ambil Sendiri di Toko BaleTani\n\n`;
    } else {
      message += `✅ Pengiriman - ${getDeliveryTime()}\n`;
      message += `📍 *Alamat:* ${deliveryAddress}\n\n`;
    }

    message += `💳 *METODE PEMBAYARAN:*\n`;
    if (paymentMethod === 'qris') {
      message += `✅ QRIS\n\n`;
      message += `Silakan scan QRIS berikut:\n`;
      message += `[Nomor QRIS akan dikirim]\n\n`;
    } else if (paymentMethod === 'transfer') {
      message += `✅ Transfer Bank\n\n`;
      message += `Silakan transfer ke:\n`;
      message += `🏦 *Bank BCA*\n`;
      message += `📝 No. Rek: 1234567890\n`;
      message += `👤 A.n: BaleTani\n\n`;
    } else {
      message += `✅ Tunai (${pickupMethod === 'pickup' ? 'Bayar di Toko' : 'COD'})\n\n`;
    }

    message += `⏰ *Mohon konfirmasi pembayaran dalam 10 menit*\n`;
    message += `Terima kasih telah berbelanja di BaleTani! 🌱`;

    const whatsappUrl = `https://wa.me/6282299374545?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast.success('Pesanan dikirim ke WhatsApp!');
    setTimeout(() => {
      navigate('/profile');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Kembali ke Keranjang</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ShoppingCart size={32} className="text-green-600" />
            Checkout Pesanan
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ringkasan Produk */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingCart size={24} className="text-green-600" />
                Produk yang Dibeli
              </h2>
              <div className="space-y-4">
                {items.map((item) => {
                  const displayPrice = item.promoPrice || item.price;
                  const subtotal = displayPrice * item.quantity;

                  return (
                    <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                      <img
                        src={getProductImage(item)}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.target.src = `https://via.placeholder.com/200x200/f3f4f6/6b7280?text=${encodeURIComponent(item.name)}`;
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600">
                          Rp {displayPrice.toLocaleString('id-ID')} / {item.unit}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center hover:border-green-600 hover:text-green-600 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center hover:border-green-600 hover:text-green-600 transition-colors disabled:opacity-50"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <div className="text-right min-w-[100px]">
                        <p className="font-bold text-gray-900">
                          Rp {subtotal.toLocaleString('id-ID')}
                        </p>
                        <button
                          onClick={() => {
                            removeItem(item.id);
                            toast.success('Produk dihapus');
                          }}
                          className="text-red-600 hover:text-red-700 text-sm mt-1"
                        >
                          <Trash2 size={14} className="inline" /> Hapus
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Metode Pengambilan */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Truck size={24} className="text-green-600" />
                Metode Pengambilan
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Ambil Sendiri */}
                <button
                  onClick={() => setPickupMethod('pickup')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    pickupMethod === 'pickup'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${pickupMethod === 'pickup' ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <Store size={24} className={pickupMethod === 'pickup' ? 'text-green-600' : 'text-gray-600'} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">Ambil Sendiri</h3>
                      <p className="text-sm text-gray-600">Ambil di Toko BaleTani</p>
                      <p className="text-xs text-green-600 font-semibold mt-2">GRATIS</p>
                    </div>
                    {pickupMethod === 'pickup' && (
                      <CheckCircle2 size={20} className="text-green-600 flex-shrink-0" />
                    )}
                  </div>
                </button>

                {/* Pengantaran */}
                <button
                  onClick={() => setPickupMethod('delivery')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    pickupMethod === 'delivery'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${pickupMethod === 'delivery' ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <Truck size={24} className={pickupMethod === 'delivery' ? 'text-green-600' : 'text-gray-600'} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">Pengantaran</h3>
                      <p className="text-sm text-gray-600">Dikirim ke alamat Anda</p>
                      <p className="text-xs text-gray-600 font-semibold mt-2">Mulai Rp 5.000</p>
                    </div>
                    {pickupMethod === 'delivery' && (
                      <CheckCircle2 size={20} className="text-green-600 flex-shrink-0" />
                    )}
                  </div>
                </button>
              </div>

              {/* Opsi Pengiriman (jika delivery) */}
              {pickupMethod === 'delivery' && (
                <div className="mt-6 space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Clock size={18} className="text-green-600" />
                    Pilih Jenis Pengiriman
                  </h3>
                  <div className="space-y-3">
                    {/* Pengiriman Instan */}
                    <button
                      onClick={() => setDeliveryType('instant')}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        deliveryType === 'instant'
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">Pengiriman Instan</h4>
                          <p className="text-sm text-gray-600">Estimasi ~30 menit setelah konfirmasi</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">Rp 15.000</p>
                          {deliveryType === 'instant' && (
                            <CheckCircle2 size={20} className="text-green-600 ml-auto mt-1" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Pengiriman Same Day */}
                    <button
                      onClick={() => setDeliveryType('sameday')}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        deliveryType === 'sameday'
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">Pengiriman Hari Ini</h4>
                          <p className="text-sm text-gray-600">Estimasi ~4 jam setelah konfirmasi</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">Rp 10.000</p>
                          {deliveryType === 'sameday' && (
                            <CheckCircle2 size={20} className="text-green-600 ml-auto mt-1" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Pengiriman Besok */}
                    <button
                      onClick={() => setDeliveryType('nextday')}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        deliveryType === 'nextday'
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">Pengiriman Besok</h4>
                          <p className="text-sm text-gray-600">Dikirim besok pagi</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">Rp 5.000</p>
                          {deliveryType === 'nextday' && (
                            <CheckCircle2 size={20} className="text-green-600 ml-auto mt-1" />
                          )}
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Form Alamat */}
                  <div className="mt-4">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                      <MapPin size={16} className="text-green-600" />
                      Alamat Lengkap Pengiriman
                    </label>
                    <textarea
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Masukkan alamat lengkap dengan patokan jelas..."
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-colors"
                    />
                    {pickupMethod === 'delivery' && !deliveryAddress.trim() && (
                      <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                        <AlertCircle size={14} />
                        Alamat pengiriman wajib diisi
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Metode Pembayaran */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard size={24} className="text-green-600" />
                Metode Pembayaran
              </h2>
              <div className="space-y-3">
                {/* QRIS */}
                <button
                  onClick={() => setPaymentMethod('qris')}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    paymentMethod === 'qris'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${paymentMethod === 'qris' ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <Wallet size={24} className={paymentMethod === 'qris' ? 'text-green-600' : 'text-gray-600'} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">QRIS</h3>
                        <p className="text-sm text-gray-600">Scan & bayar dengan e-wallet</p>
                      </div>
                    </div>
                    {paymentMethod === 'qris' && (
                      <CheckCircle2 size={20} className="text-green-600" />
                    )}
                  </div>
                </button>

                {/* Transfer Bank */}
                <button
                  onClick={() => setPaymentMethod('transfer')}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    paymentMethod === 'transfer'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${paymentMethod === 'transfer' ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <CreditCard size={24} className={paymentMethod === 'transfer' ? 'text-green-600' : 'text-gray-600'} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Transfer Bank</h3>
                        <p className="text-sm text-gray-600">Pilih bank tujuan</p>
                      </div>
                    </div>
                    {paymentMethod === 'transfer' && (
                      <CheckCircle2 size={20} className="text-green-600" />
                    )}
                  </div>
                  {paymentMethod === 'transfer' && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pilih Bank Tujuan Transfer
                      </label>
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">-- Pilih Bank --</option>
                        <option value="bca">BCA - Bank Central Asia</option>
                        <option value="bni">BNI - Bank Negara Indonesia</option>
                        <option value="mandiri">Bank Mandiri</option>
                        <option value="bri">BRI - Bank Rakyat Indonesia</option>
                        <option value="cimb">CIMB Niaga</option>
                        <option value="permata">Bank Permata</option>
                      </select>
                      {selectedBank && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-900">
                            {selectedBank === 'bca' && 'BCA - 1234567890 a.n. BaleTani'}
                            {selectedBank === 'bni' && 'BNI - 0987654321 a.n. BaleTani'}
                            {selectedBank === 'mandiri' && 'Mandiri - 1122334455 a.n. BaleTani'}
                            {selectedBank === 'bri' && 'BRI - 5544332211 a.n. BaleTani'}
                            {selectedBank === 'cimb' && 'CIMB Niaga - 6677889900 a.n. BaleTani'}
                            {selectedBank === 'permata' && 'Permata - 9988776655 a.n. BaleTani'}
                          </p>
                          <p className="text-xs text-blue-700 mt-1">Silakan transfer ke rekening di atas</p>
                        </div>
                      )}
                    </div>
                  )}
                </button>

                {/* Tunai */}
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    paymentMethod === 'cash'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${paymentMethod === 'cash' ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <Banknote size={24} className={paymentMethod === 'cash' ? 'text-green-600' : 'text-gray-600'} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Tunai</h3>
                        <p className="text-sm text-gray-600">
                          {pickupMethod === 'pickup' ? 'Bayar di toko' : 'Cash on Delivery (COD)'}
                        </p>
                      </div>
                    </div>
                    {paymentMethod === 'cash' && (
                      <CheckCircle2 size={20} className="text-green-600" />
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-20">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Ringkasan Pembayaran</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal Produk</span>
                  <span className="font-semibold">
                    Rp {totalProduct.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Biaya Pengiriman</span>
                  <span className="font-semibold text-green-600">
                    {deliveryFee === 0 ? 'GRATIS' : `Rp ${deliveryFee.toLocaleString('id-ID')}`}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total Pembayaran</span>
                    <span className="text-2xl font-bold text-green-600">
                      Rp {grandTotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-lg font-semibold transition-colors mb-3 flex items-center justify-center gap-2"
              >
                <ShoppingCart size={20} />
                Kirim Pesanan via WhatsApp
              </button>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-xs text-blue-800 flex items-start gap-2">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>
                    Pesanan akan dikirim ke WhatsApp BaleTani. Mohon konfirmasi pembayaran dalam <strong>10 menit</strong>.
                  </span>
                </p>
              </div>

              {/* Info Metode */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span>
                    <strong>Pengambilan:</strong>{' '}
                    {pickupMethod === 'pickup' ? 'Ambil Sendiri' : `Delivery (${getDeliveryTime()})`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span>
                    <strong>Pembayaran:</strong>{' '}
                    {paymentMethod === 'qris' ? 'QRIS' : paymentMethod === 'transfer' ? 'Transfer Bank' : 'Tunai'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

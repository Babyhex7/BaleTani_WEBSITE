import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  Package,
  AlertCircle,
  Truck,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import useCartStore from '../../store/store_customer/useCartStore';
import useAuthStore from '../../store/store_customer/useAuthStore';

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, updateQuantity, removeItem, clearCart, getTotal } = useCartStore();

  if (!user) {
    navigate('/login');
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

  const handleCheckout = () => {
    // Generate WhatsApp message
    const message = `Halo BaleTani! Saya ingin memesan:\n\n${items
      .map((item) => {
        const price = item.promoPrice || item.price;
        return `- ${item.name} x${item.quantity} (Rp ${price.toLocaleString('id-ID')}/${item.unit})`;
      })
      .join('\n')}\n\nTotal: Rp ${getTotal().toLocaleString('id-ID')}\n\nTerima kasih!`;
    
    const whatsappUrl = `https://wa.me/6285885725027?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleClearCart = () => {
    if (window.confirm('Apakah Anda yakin ingin mengosongkan keranjang?')) {
      clearCart();
      toast.success('Keranjang berhasil dikosongkan');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <ShoppingCart className="mx-auto text-gray-300 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Keranjang Anda Kosong
          </h2>
          <p className="text-gray-600 mb-6">
            Belum ada produk di keranjang. Yuk mulai belanja!
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <Package size={20} />
            Belanja Sekarang
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Kembali</span>
          </button>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <ShoppingCart size={32} className="text-green-600" />
              Keranjang Belanja
            </h1>
            <button
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2 transition-colors"
            >
              <Trash2 size={18} />
              Kosongkan Keranjang
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Cart Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700">
                  <div className="col-span-6">Produk</div>
                  <div className="col-span-2 text-center">Harga</div>
                  <div className="col-span-2 text-center">Jumlah</div>
                  <div className="col-span-2 text-right">Subtotal</div>
                </div>
              </div>

              {/* Cart Items List */}
              <div className="divide-y divide-gray-200">
                {items.map((item) => {
                  const displayPrice = item.promoPrice || item.price;
                  const subtotal = displayPrice * item.quantity;
                  const hasDiscount = item.promoPrice && item.promoPrice < item.price;

                  return (
                    <div key={item.id} className="p-6">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        {/* Product Info */}
                        <div className="col-span-6 flex items-start gap-4">
                          <img
                            src={getProductImage(item)}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                            onError={(e) => {
                              e.target.src = `https://via.placeholder.com/200x200/f3f4f6/6b7280?text=${encodeURIComponent(
                                item.name
                              )}`;
                            }}
                          />
                          <div className="flex-1">
                            <Link
                              to={`/products/${item.id}`}
                              className="font-semibold text-gray-900 hover:text-green-600 transition-colors"
                            >
                              {item.name}
                            </Link>
                            {item.category && (
                              <p className="text-sm text-gray-600 mt-1">
                                {item.category}
                              </p>
                            )}
                            {hasDiscount && (
                              <span className="inline-block mt-2 bg-red-100 text-red-700 text-xs px-2 py-1 rounded">
                                Promo aktif!
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="col-span-2 text-center">
                          <p className="font-semibold text-green-600">
                            Rp {displayPrice.toLocaleString('id-ID')}
                          </p>
                          {hasDiscount && (
                            <p className="text-xs text-gray-400 line-through mt-1">
                              Rp {item.price.toLocaleString('id-ID')}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">/{item.unit}</p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="col-span-2">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:border-green-600 hover:text-green-600 transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                if (val >= 1 && val <= item.stock) {
                                  updateQuantity(item.id, val);
                                }
                              }}
                              className="w-16 h-8 text-center border border-gray-300 rounded-lg font-semibold focus:border-green-600 focus:outline-none"
                            />
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                              className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:border-green-600 hover:text-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          {item.quantity >= item.stock && (
                            <p className="text-xs text-orange-600 mt-1 text-center flex items-center justify-center gap-1">
                              <AlertCircle size={12} />
                              Stok maksimal
                            </p>
                          )}
                        </div>

                        {/* Subtotal & Delete */}
                        <div className="col-span-2 text-right">
                          <p className="font-bold text-gray-900 mb-2">
                            Rp {subtotal.toLocaleString('id-ID')}
                          </p>
                          <button
                            onClick={() => {
                              removeItem(item.id);
                              toast.success('Produk dihapus dari keranjang');
                            }}
                            className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1 ml-auto transition-colors"
                          >
                            <Trash2 size={14} />
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Continue Shopping */}
            <Link
              to="/products"
              className="inline-flex items-center gap-2 mt-6 text-green-600 hover:text-green-700 font-medium transition-colors"
            >
              <ArrowLeft size={18} />
              Lanjut Belanja
            </Link>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-20">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Ringkasan Pesanan</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal ({items.length} produk)</span>
                  <span className="font-semibold">
                    Rp {getTotal().toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Biaya Pengiriman</span>
                  <span className="text-green-600 font-medium">Gratis</span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-green-600">
                      Rp {getTotal().toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors mb-3 flex items-center justify-center gap-2"
              >
                <ShoppingCart size={20} />
                Checkout via WhatsApp
              </button>

              <p className="text-xs text-gray-500 text-center">
                Pesanan akan dikirim via WhatsApp untuk konfirmasi
              </p>

              {/* Benefits */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <Package className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="font-medium text-gray-900">Produk Fresh</p>
                    <p className="text-xs">Langsung dari kebun organik</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <Truck className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="font-medium text-gray-900">Pengiriman Cepat</p>
                    <p className="text-xs">Same day delivery available</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <ShieldCheck className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="font-medium text-gray-900">Jaminan Kualitas</p>
                    <p className="text-xs">100% organik terpercaya</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

/**
 * ORDER SUMMARY COMPONENT
 * Displays order summary with totals
 */

import { ShoppingCart, Package, Truck, ShieldCheck } from 'lucide-react';

const OrderSummary = ({ 
  totalItems, 
  subtotal, 
  shippingCost = 0, 
  total, 
  onCheckout,
  checkoutText = "Lanjut ke Checkout",
  showInfoCards = true 
}) => {
  
  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <ShoppingCart size={20} className="text-green-600" />
          Ringkasan Pesanan
        </h2>
      </div>

      {/* Summary Details */}
      <div className="p-6 space-y-4">
        {/* Subtotal */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Subtotal ({totalItems} produk)</span>
          <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
        </div>

        {/* Shipping Cost */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Biaya Pengiriman</span>
          <span className="font-semibold text-green-600">
            {shippingCost === 0 ? 'GRATIS' : formatPrice(shippingCost)}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-green-600">
              {formatPrice(total)}
            </span>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={onCheckout}
          className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingCart size={18} />
          {checkoutText}
        </button>

        {/* Info Text */}
        <p className="text-xs text-center text-gray-500">
          Atur metode pengiriman dan pembayaran di halaman checkout
        </p>
      </div>

      {/* Info Cards */}
      {showInfoCards && (
        <div className="px-6 pb-6 space-y-3">
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
            <Package className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-semibold text-gray-900">Produk Fresh</p>
              <p className="text-xs text-gray-600">Langsung dari kebun organik</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <Truck className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-semibold text-gray-900">Pengiriman Cepat</p>
              <p className="text-xs text-gray-600">Same day delivery available</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
            <ShieldCheck className="text-purple-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-semibold text-gray-900">Jaminan Kualitas</p>
              <p className="text-xs text-gray-600">100% organik terpercaya</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderSummary;

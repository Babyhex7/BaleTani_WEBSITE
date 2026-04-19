/**
 * Order Receipt Modal Component
 * Modal untuk menampilkan struk order - Thermal Receipt Style
 */

import { X } from "lucide-react";
import OrderReceipt from "./OrderReceipt";

const OrderReceiptModal = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Receipt {order.order_number}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Centered Receipt Preview */}
        <div className="p-4 sm:p-6 flex justify-center overflow-y-auto">
          <OrderReceipt order={order} onClose={onClose} />
        </div>
      </div>
    </div>
  );
};

export default OrderReceiptModal;

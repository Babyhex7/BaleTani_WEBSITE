/**
 * Add Offline Order Modal
 * Modal untuk admin create order offline (manual input)
 */

import { useState, useEffect } from "react";
import { 
  XMarkIcon, 
  PlusIcon, 
  TrashIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ChatBubbleLeftIcon,
  CreditCardIcon,
  TruckIcon,
  ShoppingCartIcon,
  DocumentTextIcon,
  BanknotesIcon
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import orderService from "../../services/services_admin/orderService";
import adminApiClient from "../../services/services_admin/adminApiClient";

const AddOfflineOrderModal = ({ isOpen, onClose, onSuccess }) => {
  // Form states
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [deliveryMethod, setDeliveryMethod] = useState("self_pickup");
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [adminNotes, setAdminNotes] = useState("");

  // Items state
  const [items, setItems] = useState([
    { product_id: "", quantity: 1, price: 0, subtotal: 0, product_name: "" },
  ]);

  // Products list
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch products when modal opens
  useEffect(() => {
    if (isOpen) {
      // Fetch products when modal opens
      fetchProducts();
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    try {
      // Fetch active products with product_type = 'offline' only
      const response = await adminApiClient.get('/admin/products', {
        params: {
          is_active: 'true', // Backend expects string 'true'/'false'
          product_type: 'offline', // Only fetch offline products
          limit: 1000,
          page: 1
        }
      });
      
      
      if (response.data.success && response.data.data && response.data.data.products) {
        const list = response.data.data.products.filter(p => p.product_type === 'offline');
        setProducts(list);
        
        if (list.length === 0) {
          toast("Belum ada produk offline. Silakan tambah produk dengan tipe 'offline' terlebih dahulu.", {
            icon: 'ℹ️'
          });
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      console.error("Error response:", error.response);
      console.error("Error status:", error.response?.status);
      console.error("Error data:", error.response?.data);
      
      // Check if it's a permission error
      if (error.response?.status === 403) {
        toast.error("Akses ditolak. Anda tidak memiliki izin untuk melihat produk.");
      } else if (error.response?.status === 401) {
        toast.error("Sesi login habis. Silakan login kembali.");
      } else {
        toast.error("Gagal memuat daftar produk offline, menggunakan data dummy");
      }
      
      // Fallback to dummy data (offline products only)
      const dummyProducts = [
        { 
          id: 1, 
          name: "Tomat Organik Offline 1kg", 
          selling_price: 50000, 
          total_stock: 100,
          product_type: "offline"
        },
        { 
          id: 2, 
          name: "Sayur Segar Offline 500g", 
          selling_price: 30000, 
          total_stock: 50,
          product_type: "offline"
        },
        { 
          id: 3, 
          name: "Brokoli Premium Offline", 
          selling_price: 60000, 
          total_stock: 30,
          product_type: "offline"
        },
        { 
          id: 4, 
          name: "Wortel Organik Offline 1kg", 
          selling_price: 35000, 
          total_stock: 80,
          product_type: "offline"
        },
      ];
      setProducts(dummyProducts);
    }
  };

  // Add item row
  const addItem = () => {
    setItems([
      ...items,
      { product_id: "", quantity: 1, price: 0, subtotal: 0, product_name: "" },
    ]);
  };

  // Remove item row
  const removeItem = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  // Update item
  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    // Update price when product changes
    if (field === "product_id") {
      const product = products.find((p) => p.id === value);
      if (product) {
        const price = typeof product.selling_price === "number" ? product.selling_price : Number(product.selling_price) || 0;
        newItems[index].price = price;
        newItems[index].product_name = product.name;
        newItems[index].subtotal = price * newItems[index].quantity;
      }
    }

    // Update subtotal when quantity changes
    if (field === "quantity") {
      newItems[index].subtotal = newItems[index].price * value;
    }

    setItems(newItems);
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    const total =
      subtotal + parseFloat(deliveryFee || 0) - parseFloat(discountAmount || 0);
    return { subtotal, total };
  };

  const { subtotal, total } = calculateTotals();

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!customerName || !customerPhone) {
        toast.error("Nama dan nomor telepon customer harus diisi");
        setLoading(false);
        return;
      }

      const validItems = items.filter((item) => item.product_id);
      if (validItems.length === 0) {
        toast.error("Minimal harus ada 1 produk");
        setLoading(false);
        return;
      }

      const orderData = {
        customer_name: customerName,
        customer_phone: customerPhone,
        delivery_address: deliveryAddress,
        delivery_notes: deliveryNotes,
        payment_method: paymentMethod,
        delivery_method: deliveryMethod,
        delivery_fee: parseFloat(deliveryFee || 0),
        discount_amount: parseFloat(discountAmount || 0),
        admin_notes: adminNotes,
        items: validItems.map((item) => ({
          product_id: item.product_id, // UUID string, don't parse to int
          quantity: parseInt(item.quantity),
        })),
      };

      await orderService.createOfflineOrder(orderData);

      toast.success("Order offline berhasil dibuat!");
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1000);
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error(
        error.response?.data?.message || "Gagal membuat order offline"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle close
  const handleClose = () => {
    // Reset form
    setCustomerName("");
    setCustomerPhone("");
    setDeliveryAddress("");
    setDeliveryNotes("");
    setPaymentMethod("cash");
    setDeliveryMethod("self_pickup");
    setDeliveryFee(0);
    setDiscountAmount(0);
    setAdminNotes("");
    setItems([
      { product_id: "", quantity: 1, price: 0, subtotal: 0, product_name: "" },
    ]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ShoppingCartIcon className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Tambah Order Offline
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Customer & Order Info - 2 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Customer Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <UserIcon className="w-5 h-5 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-700 uppercase">
                    Informasi Customer
                  </h3>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <UserIcon className="w-4 h-4 text-gray-500" />
                    Nama Customer <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Masukkan nama customer"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <PhoneIcon className="w-4 h-4 text-gray-500" />
                    Nomor Telepon <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="08xx-xxxx-xxxx"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <MapPinIcon className="w-4 h-4 text-gray-500" />
                    Alamat (Opsional)
                  </label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder="Alamat lengkap customer"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <ChatBubbleLeftIcon className="w-4 h-4 text-gray-500" />
                    Catatan Pengiriman
                  </label>
                  <textarea
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder="Catatan khusus untuk pengiriman"
                  />
                </div>
              </div>

              {/* Right Column - Order Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <ShoppingCartIcon className="w-5 h-5 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-700 uppercase">
                    Detail Order
                  </h3>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <CreditCardIcon className="w-4 h-4 text-gray-500" />
                    Metode Pembayaran <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="cash">Cash (Tunai)</option>
                    <option value="transfer">Transfer</option>
                    <option value="qris">QRIS</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {paymentMethod === "cash"
                      ? "Order akan otomatis berstatus PAID"
                      : "Order akan berstatus PENDING PAYMENT"}
                  </p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <TruckIcon className="w-4 h-4 text-gray-500" />
                    Metode Pengiriman <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={deliveryMethod}
                    onChange={(e) => {
                      setDeliveryMethod(e.target.value);
                      // Auto set delivery fee
                      setDeliveryFee(e.target.value === "self_pickup" ? 0 : 10000);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="self_pickup">Ambil di Toko</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <BanknotesIcon className="w-4 h-4 text-gray-500" />
                    Biaya Pengiriman (Rp)
                  </label>
                  <input
                    type="number"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <BanknotesIcon className="w-4 h-4 text-gray-500" />
                    Diskon (Rp)
                  </label>
                  <input
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <DocumentTextIcon className="w-4 h-4 text-gray-500" />
                    Catatan Admin
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder="Catatan internal untuk order ini"
                  />
                </div>
              </div>
            </div>

            {/* Products Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingCartIcon className="w-5 h-5 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-700 uppercase">
                    Produk
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={addItem}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-1 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  Tambah Item
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-3 text-xs font-medium text-gray-500 uppercase pb-2 border-b">
                  <div className="col-span-5">Produk</div>
                  <div className="col-span-2">Qty</div>
                  <div className="col-span-2">Harga</div>
                  <div className="col-span-2">Subtotal</div>
                  <div className="col-span-1 text-center">Aksi</div>
                </div>

                {items.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-3 items-center"
                  >
                    {/* Product Select */}
                    <div className="col-span-5">
                      <select
                        value={item.product_id}
                        onChange={(e) =>
                          updateItem(index, "product_id", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        required
                      >
                        <option value="">Pilih Produk... ({products.length} produk tersedia)</option>
                        {products.length === 0 ? (
                          <option disabled>Loading produk...</option>
                        ) : (
                          products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name} - {formatCurrency(product.selling_price)} (Stock: {product.total_stock})
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "quantity",
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        min="1"
                        required
                      />
                    </div>

                    {/* Price (read-only) */}
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={formatCurrency(item.price)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm"
                        readOnly
                      />
                    </div>

                    {/* Subtotal (read-only) */}
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={formatCurrency(item.subtotal)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm font-medium text-green-600"
                        readOnly
                      />
                    </div>

                    {/* Delete Button */}
                    <div className="col-span-1 flex justify-center">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Hapus item"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <BanknotesIcon className="w-5 h-5 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-700 uppercase">
                  Ringkasan Harga
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal Produk:</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Biaya Pengiriman:</span>
                  <span className="font-medium">
                    {formatCurrency(parseFloat(deliveryFee || 0))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Diskon:</span>
                  <span className="font-medium text-red-600">
                    - {formatCurrency(parseFloat(discountAmount || 0))}
                  </span>
                </div>
                <div className="border-t-2 border-gray-300 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900 text-lg">
                      TOTAL:
                    </span>
                    <span className="font-bold text-2xl text-green-600">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors shadow-sm"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  💾 Buat Order
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOfflineOrderModal;

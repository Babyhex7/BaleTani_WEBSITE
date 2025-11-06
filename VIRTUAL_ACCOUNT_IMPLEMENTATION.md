# 💳 Implementasi Virtual Account Payment - BaleTani

## 🎯 Overview

Panduan implementasi pembayaran Virtual Account (VA) untuk Bank BRI, BCA, dan MANDIRI pada saat checkout.

---

## 📋 Flow Payment dengan VA

### 1. Customer Checkout

```
Customer Cart → Checkout Page → Choose Payment → Select Bank → Generate VA → Show VA Details
```

### 2. VA Generation Flow

```javascript
// When customer selects Bank Transfer
1. Customer memilih "Transfer Bank"
2. Customer memilih Bank (BRI/BCA/MANDIRI)
3. System generate Virtual Account number
4. VA saved to payment_details table
5. VA displayed to customer
6. Customer transfer ke VA
7. Admin confirm payment (manual/auto webhook)
8. Order status updated
```

---

## 🔧 Backend Implementation

### Update `customerOrder.controller.js`

```javascript
const PaymentDetail = require("../models/paymentDetail.model");

/**
 * Create Order dengan VA Payment
 */
exports.createOrder = async (req, res) => {
  try {
    const {
      items,
      delivery_method,
      delivery_address,
      notes,
      payment_method,
      bank_name, // NEW: Bank untuk VA
    } = req.body;

    // ... existing order creation logic ...

    // Create order
    const order = await Order.create({
      order_number: generateOrderNumber(),
      customer_id: req.user.id,
      // ... other fields
      payment_method: payment_method,
      payment_status: "pending",
      order_status: "pending_payment",
    });

    // Generate Virtual Account if bank transfer
    if (payment_method === "transfer" && bank_name) {
      const vaNumber = PaymentDetail.generateVA(bank_name);
      const expiryTime = PaymentDetail.getExpiryTime();

      await PaymentDetail.create({
        order_id: order.id,
        payment_method: "bank_transfer",
        bank_name: bank_name,
        virtual_account: vaNumber,
        payment_status: "pending",
        amount: order.total_amount,
        expired_at: expiryTime,
      });
    }

    // Fetch order with payment details
    const orderWithPayment = await Order.findByPk(order.id, {
      include: [{ model: PaymentDetail, as: "payment" }],
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        order: orderWithPayment,
        virtual_account: orderWithPayment.payment?.virtual_account,
        bank: orderWithPayment.payment?.bank_name,
        expired_at: orderWithPayment.payment?.expired_at,
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  }
};

/**
 * Helper: Generate Order Number
 */
function generateOrderNumber() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `BLT-${timestamp}-${random}`;
}
```

---

## 💻 Frontend Implementation

### 1. Update `CheckoutPage.jsx`

```jsx
import { useState } from "react";

const CheckoutPage = () => {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [showBankSelection, setShowBankSelection] = useState(false);

  const banks = [
    { code: "BRI", name: "Bank BRI", logo: "/images/banks/bri.png" },
    { code: "BCA", name: "Bank BCA", logo: "/images/banks/bca.png" },
    {
      code: "MANDIRI",
      name: "Bank Mandiri",
      logo: "/images/banks/mandiri.png",
    },
  ];

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setShowBankSelection(method === "transfer");
    if (method !== "transfer") {
      setSelectedBank("");
    }
  };

  const handleCheckout = async () => {
    try {
      const orderData = {
        items: cartItems,
        delivery_method: deliveryMethod,
        delivery_address: address,
        notes: notes,
        payment_method: paymentMethod,
        bank_name: selectedBank, // Include bank for VA
      };

      const response = await createOrder(orderData);

      if (response.success) {
        // Redirect ke order success dengan VA info
        navigate("/order-success", {
          state: {
            order: response.data.order,
            virtual_account: response.data.virtual_account,
            bank: response.data.bank,
            expired_at: response.data.expired_at,
          },
        });
      }
    } catch (error) {
      console.error("Checkout error:", error);
    }
  };

  return (
    <div className="checkout-page">
      {/* Payment Method Selection */}
      <div className="payment-section">
        <h3>Metode Pembayaran</h3>

        {/* Transfer Bank Option */}
        <label className="payment-option">
          <input
            type="radio"
            name="payment"
            value="transfer"
            checked={paymentMethod === "transfer"}
            onChange={(e) => handlePaymentMethodChange(e.target.value)}
          />
          <span>Transfer Bank (Virtual Account)</span>
        </label>

        {/* Bank Selection (shown when transfer selected) */}
        {showBankSelection && (
          <div className="bank-selection">
            <h4>Pilih Bank</h4>
            <div className="banks-grid">
              {banks.map((bank) => (
                <button
                  key={bank.code}
                  className={`bank-card ${
                    selectedBank === bank.code ? "selected" : ""
                  }`}
                  onClick={() => setSelectedBank(bank.code)}
                >
                  <img src={bank.logo} alt={bank.name} />
                  <span>{bank.name}</span>
                  {selectedBank === bank.code && (
                    <span className="check">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* COD Option */}
        <label className="payment-option">
          <input
            type="radio"
            name="payment"
            value="cod"
            checked={paymentMethod === "cod"}
            onChange={(e) => handlePaymentMethodChange(e.target.value)}
          />
          <span>Bayar di Tempat (COD)</span>
        </label>

        {/* QRIS Option */}
        <label className="payment-option">
          <input
            type="radio"
            name="payment"
            value="qris"
            checked={paymentMethod === "qris"}
            onChange={(e) => handlePaymentMethodChange(e.target.value)}
          />
          <span>QRIS</span>
        </label>
      </div>

      {/* Checkout Button */}
      <button
        onClick={handleCheckout}
        disabled={
          !paymentMethod || (paymentMethod === "transfer" && !selectedBank)
        }
        className="checkout-btn"
      >
        Buat Pesanan
      </button>
    </div>
  );
};
```

---

### 2. Update `OrderSuccessPage.jsx`

```jsx
import { useLocation } from "react-router-dom";
import { CheckCircle, Copy, Clock } from "lucide-react";

const OrderSuccessPage = () => {
  const location = useLocation();
  const { order, virtual_account, bank, expired_at } = location.state || {};

  const copyVA = () => {
    navigator.clipboard.writeText(virtual_account);
    alert("Nomor Virtual Account disalin!");
  };

  const formatExpiry = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="order-success-page">
      {/* Success Header */}
      <div className="success-header">
        <CheckCircle className="w-16 h-16 text-green-500" />
        <h1>Pesanan Berhasil Dibuat!</h1>
        <p>
          Order Number: <strong>{order?.order_number}</strong>
        </p>
      </div>

      {/* Virtual Account Details */}
      {virtual_account && (
        <div className="va-card">
          <h2>Informasi Pembayaran</h2>

          <div className="va-info">
            <div className="bank-logo">
              <img src={`/images/banks/${bank.toLowerCase()}.png`} alt={bank} />
              <span>Bank {bank}</span>
            </div>

            <div className="va-number">
              <label>Nomor Virtual Account</label>
              <div className="va-display">
                <span className="number">{virtual_account}</span>
                <button onClick={copyVA} className="copy-btn">
                  <Copy className="w-4 h-4" />
                  Salin
                </button>
              </div>
            </div>

            <div className="va-amount">
              <label>Total Pembayaran</label>
              <span className="amount">
                Rp {order?.total_amount?.toLocaleString("id-ID")}
              </span>
            </div>

            <div className="va-expiry">
              <Clock className="w-4 h-4" />
              <span>Berlaku hingga: {formatExpiry(expired_at)}</span>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="payment-instructions">
            <h3>Cara Pembayaran:</h3>
            <ol>
              <li>Buka aplikasi {bank} Mobile/Internet Banking</li>
              <li>Pilih menu Transfer atau Bayar</li>
              <li>Masukkan nomor Virtual Account di atas</li>
              <li>Periksa detail pembayaran</li>
              <li>Konfirmasi dan selesaikan pembayaran</li>
              <li>Simpan bukti transfer</li>
            </ol>
          </div>

          {/* Warning */}
          <div className="warning-box">
            <p>⚠️ Pastikan nominal transfer sesuai dengan total pembayaran</p>
            <p>⚠️ Virtual Account berlaku selama 24 jam</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="actions">
        <button
          onClick={() => navigate("/purchase-history")}
          className="btn-primary"
        >
          Lihat Pesanan Saya
        </button>
        <button onClick={() => navigate("/")} className="btn-secondary">
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
};
```

---

## 🎨 CSS Styling

```css
/* Bank Selection */
.bank-selection {
  margin-top: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.banks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.bank-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.bank-card:hover {
  border-color: #10b981;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.bank-card.selected {
  border-color: #10b981;
  background: #ecfdf5;
}

.bank-card img {
  width: 60px;
  height: 60px;
  object-fit: contain;
}

.bank-card .check {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: #10b981;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-center;
  font-size: 14px;
}

/* VA Card */
.va-card {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.va-number {
  margin: 1.5rem 0;
}

.va-display {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border: 2px solid #10b981;
  border-radius: 8px;
  margin-top: 0.5rem;
}

.va-display .number {
  flex: 1;
  font-family: 'Courier New', monospace;
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.2s;
}

.copy-btn:hover {
  background: #059669;
}

.va-amount {
  text-align: center;
  padding: 1rem;
  background: #ecfdf5;
  border-radius: 8px;
  margin: 1rem 0;
}

.va-amount .amount {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #10b981;
  margin-top: 0.5rem;
}

.va-expiry {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 6px;
  color: #92400e;
  font-size: 0.875rem;
}

.payment-instructions {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f3f4f6;
  border-radius: 8px;
}

.payment-instructions ol {
  margin-top: 1rem;
  padding-left: 1.5rem;
}

.payment-instructions li {
  margin-bottom: 0.5rem;
  color: #4b5563;
}

.warning-box {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
}

.warning-box p {
  margin: 0.25rem 0;
  color: #991b1b;
  font-size: 0.875rem;
}
```

---

## 🔐 Security Considerations

### 1. VA Validation

```javascript
// Validate VA format
const validateVA = (vaNumber) => {
  // Check length (typically 16-20 digits)
  if (vaNumber.length < 16 || vaNumber.length > 20) {
    return false;
  }

  // Check if numeric
  if (!/^\d+$/.test(vaNumber)) {
    return false;
  }

  return true;
};
```

### 2. Prevent Duplicate VA

```javascript
// Check if VA already exists
const checkVAExists = async (vaNumber) => {
  const existing = await PaymentDetail.findOne({
    where: { virtual_account: vaNumber },
  });
  return !!existing;
};

// Generate unique VA
const generateUniqueVA = async (bankName) => {
  let vaNumber;
  let exists;

  do {
    vaNumber = PaymentDetail.generateVA(bankName);
    exists = await checkVAExists(vaNumber);
  } while (exists);

  return vaNumber;
};
```

### 3. VA Expiry Check

```javascript
// Check if VA expired
const isVAExpired = (expiredAt) => {
  return new Date() > new Date(expiredAt);
};

// Auto-cancel expired orders (Cron job)
const cancelExpiredOrders = async () => {
  const expiredOrders = await Order.findAll({
    include: [
      {
        model: PaymentDetail,
        as: "payment",
        where: {
          payment_status: "pending",
          expired_at: { [Op.lt]: new Date() },
        },
      },
    ],
  });

  for (const order of expiredOrders) {
    await order.update({
      order_status: "cancelled",
      cancelled_reason: "Payment expired",
    });

    await order.payment.update({
      payment_status: "expired",
    });
  }
};
```

---

## 📱 Payment Confirmation Flow

### Admin Manual Confirmation

```javascript
/**
 * Admin confirms payment
 * POST /api/admin/orders/:id/confirm-payment
 */
exports.confirmPayment = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { proof_url } = req.body;

    const order = await Order.findByPk(orderId, {
      include: [{ model: PaymentDetail, as: "payment" }],
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update payment status
    await order.payment.update({
      payment_status: "paid",
      paid_at: new Date(),
      payment_proof: proof_url,
    });

    // Update order status
    await order.update({
      payment_status: "paid",
      order_status: "processing",
    });

    // Add status history
    await OrderStatusHistory.create({
      order_id: orderId,
      old_status: "pending_payment",
      new_status: "processing",
      notes: "Payment confirmed by admin",
    });

    return res.json({
      success: true,
      message: "Payment confirmed successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
```

---

## 🎯 Best Practices

1. **Always validate VA format**
2. **Set expiry time (24 hours recommended)**
3. **Log all VA generations**
4. **Implement retry mechanism for failed VA generation**
5. **Send confirmation email/SMS with VA details**
6. **Auto-cancel expired orders**
7. **Store payment proof for audit**
8. **Implement webhook for auto-confirmation** (future)

---

## 📝 Testing Checklist

- [ ] VA generation works for all banks
- [ ] VA format is correct
- [ ] VA is unique (no duplicates)
- [ ] Expiry time is set correctly
- [ ] Order created with VA details
- [ ] Customer can see VA in success page
- [ ] Customer can copy VA
- [ ] Payment instructions displayed
- [ ] Expiry warning shown
- [ ] Manual payment confirmation works
- [ ] Order status updated after payment
- [ ] Email/notification sent (if implemented)

---

Selamat! Payment dengan Virtual Account sudah siap digunakan! 🎉

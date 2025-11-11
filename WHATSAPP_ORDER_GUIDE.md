# 📱 WHATSAPP ORDER NOTIFICATION GUIDE

> **Fitur auto-send order summary ke WhatsApp setelah checkout**  
> Nomor WhatsApp: **085885725027**

---

## 🎯 FITUR OVERVIEW

Setelah customer berhasil checkout, sistem otomatis:

1. ✅ Generate ringkasan order (nomor order, produk, total, bank)
2. ✅ Buka WhatsApp dengan message yang sudah diformat
3. ✅ Customer tinggal klik "Send" di WhatsApp

---

## 🔄 FLOW DIAGRAM

```
Customer                    Backend                     WhatsApp
   |                           |                            |
   |---(1) Checkout----------->|                            |
   |                           |                            |
   |                           |---(2) Create Order         |
   |                           |     Save to DB             |
   |                           |     Generate WA Message    |
   |                           |                            |
   |<--(3) Response------------|                            |
   |     (orderData + whatsapp)|                            |
   |                           |                            |
   |---(4) Auto redirect---------------------------------->|
   |                                                        |
   |<--(5) WhatsApp opened with pre-filled message---------|
   |                                                        |
   |---(6) Customer clicks "Send"------------------------->|
   |                                                        |
   |                                           Admin receives message
```

---

## 📊 DATABASE SCHEMA

### Table: `orders`

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID NOT NULL,
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20),
  transaction_type ENUM('online', 'offline'),
  payment_method ENUM('cash', 'transfer', 'qris'),
  delivery_method ENUM('self_pickup', 'delivery'),
  delivery_address TEXT,
  delivery_notes TEXT,
  item_subtotal DECIMAL(15,2),
  delivery_fee DECIMAL(10,2),
  total_amount DECIMAL(15,2),
  order_status ENUM('pending_payment', 'paid', 'processing', ...),
  payment_status ENUM('pending', 'paid', 'failed', 'refunded'),
  created_at DATETIME,
  updated_at DATETIME
);
```

### Table: `payment_details`

```sql
CREATE TABLE payment_details (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id UUID NOT NULL,
  payment_method ENUM('bank_transfer', 'cod', 'e_wallet'),
  bank_name ENUM('BRI', 'BCA', 'MANDIRI'),
  virtual_account VARCHAR(50),
  account_name VARCHAR(100) DEFAULT 'BaleTani Fresh Market',
  payment_status ENUM('pending', 'paid', 'failed', 'expired'),
  amount DECIMAL(12,2),
  expired_at DATETIME,
  paid_at DATETIME,
  created_at DATETIME,
  updated_at DATETIME,

  FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

### Table: `order_items`

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL,
  product_id UUID NOT NULL,
  product_name VARCHAR(255),
  quantity DECIMAL(10,2),
  original_price DECIMAL(10,2),
  discount_price DECIMAL(10,2),
  final_price DECIMAL(10,2),
  subtotal DECIMAL(12,2),
  created_at DATETIME,

  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

---

## 💻 BACKEND IMPLEMENTATION

### File: `backend/src/controllers/customerOrder.controller.js`

```javascript
// CREATE ORDER ENDPOINT
exports.createOrder = async (req, res) => {
  const {
    customer_name,
    customer_phone,
    delivery_method,
    payment_method,
    bank_name, // ✅ BRI, BCA, atau MANDIRI
    items,
  } = req.body;

  // ... create order logic ...

  // ========================================
  // GENERATE WHATSAPP MESSAGE
  // ========================================
  let waMessage = `🛒 *KONFIRMASI PESANAN BALETANI*\n\n`;
  waMessage += `📋 *Detail Pesanan*\n`;
  waMessage += `No. Order: ${order_number}\n`;
  waMessage += `Tanggal: ${formatDate(created_at)}\n\n`;

  // List products
  waMessage += `📦 *Produk yang Dipesan:*\n`;
  items.forEach((item, index) => {
    waMessage += `${index + 1}. ${item.product_name}\n`;
    waMessage += `   Qty: ${item.quantity} × Rp${item.price}\n`;
  });

  // Payment details
  waMessage += `\n💰 *Rincian Pembayaran:*\n`;
  waMessage += `Subtotal: Rp${item_subtotal}\n`;
  waMessage += `Ongkir: Rp${delivery_fee}\n`;
  waMessage += `*TOTAL: Rp${total_amount}*\n\n`;

  // Bank transfer info (if applicable)
  if (payment_method === "transfer" && paymentDetail) {
    waMessage += `💳 *SILAKAN TRANSFER KE:*\n`;
    waMessage += `Bank: ${paymentDetail.bank_name}\n`;
    waMessage += `No. Rek: ${paymentDetail.virtual_account}\n`;
    waMessage += `a/n: ${paymentDetail.account_name}\n`;
    waMessage += `Jumlah: Rp${total_amount}\n`;
    waMessage += `Batas: ${formatDate(paymentDetail.expired_at)}\n\n`;
  }

  // Generate WhatsApp URL
  const whatsappUrl = `https://wa.me/6285885725027?text=${encodeURIComponent(
    waMessage
  )}`;

  // Return response dengan whatsapp object
  return res.status(201).json({
    success: true,
    data: {
      order_number,
      total_amount,
      payment: paymentDetail,
      whatsapp: {
        phone: "6285885725027",
        message: waMessage,
        url: whatsappUrl,
      },
    },
  });
};
```

---

## 🎨 FRONTEND IMPLEMENTATION

### File: `frontend/src/pages/customer/CheckoutPage.jsx`

```jsx
const handleCreateOrder = async () => {
  // ... validation ...

  const orderData = {
    customer_name: user.full_name,
    customer_phone: user.phone_number,
    delivery_method: pickupMethod,
    payment_method: paymentMethod,
    bank_name: selectedBank, // ✅ BRI, BCA, MANDIRI
    items: items.map((item) => ({
      product_id: item.id,
      quantity: item.quantity,
    })),
  };

  const response = await customerOrderService.createOrder(orderData);

  if (response.success) {
    // ✅ AUTO REDIRECT TO WHATSAPP
    if (response.data.whatsapp?.url) {
      setTimeout(() => {
        // Buka WhatsApp di tab baru
        window.open(response.data.whatsapp.url, "_blank");

        // Redirect ke success page
        navigate("/order-success", {
          state: { orderData: response.data },
        });
      }, 1000);
    }
  }
};
```

### File: `frontend/src/pages/customer/OrderSuccessPage.jsx`

```jsx
const sendWhatsApp = () => {
  // ✅ Gunakan WA message dari backend
  if (orderData.whatsapp?.url) {
    window.open(orderData.whatsapp.url, "_blank");
  }
};

return (
  <button onClick={sendWhatsApp}>
    <MessageCircle /> Kirim ke WhatsApp
  </button>
);
```

---

## 📝 WHATSAPP MESSAGE FORMAT

### Contoh Message untuk Transfer Bank:

```
🛒 *KONFIRMASI PESANAN BALETANI*

📋 *Detail Pesanan*
No. Order: ORD-20251111-001
Tanggal: 11 November 2025, 14:30
Nama: John Doe
No. HP: 081234567890

📦 *Produk yang Dipesan:*
1. Tomat Segar
   Qty: 2 × Rp 15.000 = Rp 30.000
2. Bayam Hijau
   Qty: 1 × Rp 10.000 = Rp 10.000

💰 *Rincian Pembayaran:*
Subtotal: Rp 40.000
Ongkir: Rp 10.000
─────────────────
*TOTAL: Rp 50.000*

🚚 *Metode Pengiriman:*
🏠 Delivery/Antar
Alamat: Jl. Contoh No. 123, Jakarta

💳 *Metode Pembayaran:*
🏦 Transfer Bank BRI

*SILAKAN TRANSFER KE:*
Bank: BRI
No. Rek: 0021-01-123456-50-9
a/n: BaleTani Fresh Market
Jumlah: Rp 50.000

⏰ Batas Waktu: 12 November 2025, 14:30

📸 *Setelah transfer, mohon kirim bukti transfer ke nomor ini*

Terima kasih sudah berbelanja di *BaleTani Fresh Market*! 🌿✨

_Pesan otomatis dari sistem BaleTani_
```

### Contoh Message untuk Cash (COD):

```
🛒 *KONFIRMASI PESANAN BALETANI*

📋 *Detail Pesanan*
No. Order: ORD-20251111-002
Tanggal: 11 November 2025, 15:00
Nama: Jane Smith
No. HP: 085885725027

📦 *Produk yang Dipesan:*
1. Wortel Organik
   Qty: 3 × Rp 12.000 = Rp 36.000

💰 *Rincian Pembayaran:*
Subtotal: Rp 36.000
Ongkir: Rp 0
─────────────────
*TOTAL: Rp 36.000*

🚚 *Metode Pengiriman:*
🏪 Ambil Sendiri (Self Pickup)

💳 *Metode Pembayaran:*
💵 Cash (Bayar di Tempat)
Pembayaran dilakukan saat pengambilan/pengiriman barang

Terima kasih sudah berbelanja di *BaleTani Fresh Market*! 🌿✨

_Pesan otomatis dari sistem BaleTani_
```

---

## 🧪 TESTING GUIDE

### 1. Test Case: Transfer Bank BRI

**Input:**

```json
{
  "customer_name": "Test User",
  "customer_phone": "081234567890",
  "delivery_method": "delivery",
  "delivery_address": "Jl. Test No. 123",
  "payment_method": "transfer",
  "bank_name": "BRI",
  "items": [{ "product_id": "xxx-xxx", "quantity": 2 }]
}
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "order_number": "ORD-20251111-001",
    "total_amount": 50000,
    "payment": {
      "bank": "BRI",
      "virtual_account": "0021-01-123456-50-9",
      "account_name": "BaleTani Fresh Market",
      "expired_at": "2025-11-12T14:30:00.000Z"
    },
    "whatsapp": {
      "phone": "6285885725027",
      "url": "https://wa.me/6285885725027?text=..."
    }
  }
}
```

**Expected Behavior:**

1. ✅ Order tersimpan di database
2. ✅ PaymentDetail dengan bank BRI dibuat
3. ✅ WhatsApp message tergenerate
4. ✅ Frontend auto-redirect ke WA
5. ✅ WA message mencantumkan rekening BRI

### 2. Test Case: Cash (COD)

**Input:**

```json
{
  "customer_name": "Test User",
  "customer_phone": "081234567890",
  "delivery_method": "self_pickup",
  "payment_method": "cash",
  "items": [{ "product_id": "xxx-xxx", "quantity": 1 }]
}
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "order_number": "ORD-20251111-002",
    "total_amount": 36000,
    "payment": null,
    "whatsapp": {
      "phone": "6285885725027",
      "url": "https://wa.me/6285885725027?text=..."
    }
  }
}
```

**Expected Behavior:**

1. ✅ Order tersimpan dengan status "paid" (cash)
2. ✅ PaymentDetail **TIDAK** dibuat (cash tidak perlu VA)
3. ✅ WhatsApp message tergenerate tanpa info bank
4. ✅ Frontend auto-redirect ke WA

### 3. Test Case: Transfer BCA

**Input:**

```json
{
  "payment_method": "transfer",
  "bank_name": "BCA",
  ...
}
```

**Expected:**

- ✅ Virtual Account BCA: `1234567890`
- ✅ WA message mencantumkan rekening BCA

### 4. Test Case: Transfer MANDIRI

**Input:**

```json
{
  "payment_method": "transfer",
  "bank_name": "MANDIRI",
  ...
}
```

**Expected:**

- ✅ Virtual Account MANDIRI: `1370012345678`
- ✅ WA message mencantumkan rekening MANDIRI

---

## 🔍 VALIDATION CHECKLIST

### Backend Validation:

- [x] `bank_name` required jika `payment_method === 'transfer'`
- [x] `bank_name` hanya boleh: `BRI`, `BCA`, atau `MANDIRI`
- [x] `customer_name` dan `customer_phone` required
- [x] `items` array tidak boleh kosong
- [x] `delivery_address` required jika `delivery_method === 'delivery'`

### Frontend Validation:

- [x] Pilih bank wajib diisi untuk transfer
- [x] Alamat wajib diisi untuk delivery
- [x] Cart tidak boleh kosong
- [x] User must be logged in

### Database Validation:

- [x] `orders` table memiliki kolom lengkap
- [x] `payment_details` table memiliki kolom `bank_name`
- [x] `order_items` table terrelasi dengan `orders`
- [x] Foreign key constraints aktif

---

## 📊 BANK ACCOUNT CONFIGURATION

### Dummy Virtual Accounts:

```javascript
const bankAccounts = {
  BRI: "0021-01-123456-50-9",
  BCA: "1234567890",
  MANDIRI: "1370012345678",
};
```

**⚠️ IMPORTANT:**

- Ini adalah nomor rekening dummy untuk testing
- Ganti dengan nomor rekening real sebelum production
- Update di `backend/src/controllers/customerOrder.controller.js` line ~230

---

## 🚨 TROUBLESHOOTING

### Issue: WhatsApp tidak terbuka

**Solusi:**

1. Cek `response.data.whatsapp.url` ada di response
2. Cek browser tidak block popup
3. Cek format nomor WA: `6285885725027` (tanpa +, dengan 62)

### Issue: Bank tidak muncul di WA message

**Solusi:**

1. Pastikan `bank_name` terkirim dari frontend
2. Cek `payment_method === 'transfer'`
3. Cek `PaymentDetail` berhasil dibuat di DB

### Issue: Order tersimpan tapi WA message kosong

**Solusi:**

1. Cek `formatRupiah()` function di backend
2. Cek `formatDate()` function di backend
3. Cek `orderData.items` tidak kosong

---

## 🔗 API ENDPOINT

### POST `/api/customer/orders/create`

**Request:**

```json
{
  "customer_name": "string",
  "customer_phone": "string",
  "delivery_method": "self_pickup" | "delivery",
  "delivery_address": "string (optional)",
  "delivery_notes": "string (optional)",
  "payment_method": "cash" | "transfer" | "qris",
  "bank_name": "BRI" | "BCA" | "MANDIRI" (required if transfer),
  "items": [
    {
      "product_id": "uuid",
      "quantity": number
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Order berhasil dibuat",
  "data": {
    "id": "uuid",
    "order_number": "ORD-20251111-001",
    "total_amount": 50000,
    "payment": {
      "bank": "BRI",
      "virtual_account": "0021-01-123456-50-9",
      "account_name": "BaleTani Fresh Market",
      "expired_at": "2025-11-12T14:30:00.000Z"
    },
    "whatsapp": {
      "phone": "6285885725027",
      "message": "full formatted message",
      "url": "https://wa.me/6285885725027?text=..."
    }
  }
}
```

---

## 📱 WHATSAPP CONFIGURATION

### Environment Variables:

```env
# .env (Backend)
WHATSAPP_ADMIN_PHONE=6285885725027

# .env (Frontend)
VITE_WHATSAPP_NUMBER=6285885725027
```

### Update WhatsApp Number:

**Backend:** `backend/src/controllers/customerOrder.controller.js`

```javascript
// Line ~310
responseData.whatsapp = {
  phone: "6285885725027", // ← Update ini
  message: waMessage,
  url: `https://wa.me/6285885725027?text=...`, // ← Dan ini
};
```

**Frontend:** `frontend/src/pages/customer/OrderSuccessPage.jsx`

```javascript
// Line ~118
const adminPhone = "6285885725027"; // ← Update ini
```

---

## ✅ COMPLETION CHECKLIST

- [x] Backend generate WA message dengan bank info
- [x] Frontend auto-redirect ke WA setelah checkout
- [x] Database schema mendukung payment details
- [x] Validation untuk bank selection
- [x] Format message rapi dengan emoji
- [x] Support 3 bank: BRI, BCA, MANDIRI
- [x] Support 2 payment methods: Transfer & Cash
- [x] Support 2 delivery methods: Pickup & Delivery
- [x] Error handling complete
- [x] Documentation complete

---

**Status:** ✅ **READY FOR TESTING**  
**Last Updated:** November 11, 2025  
**Version:** 1.0.0

# 💳 Checkout & Payment Testing Documentation

## 📋 Overview

**File:** `04-checkout.cy.js`  
**Total Tests:** 22  
**Status:** ✅ 22/22 Passing (100%)  
**Duration:** ~4 min 10 sec

## 🎯 Test Coverage

### Test Suites

1. Checkout Page Access (4 tests)
2. Pickup Method Selection (5 tests)
3. Payment Method Selection (5 tests)
4. Order Creation (5 tests)
5. Order Success Page (3 tests)

---

## 1. Checkout Page Access Tests

### ✅ Test 1.1: Redirect to login if not authenticated

**Purpose:** Protect checkout from unauthenticated access

```javascript
it("should redirect to login if not authenticated", () => {
  // Logout first
  cy.customerLogout();

  // Try to access checkout
  cy.visit("/checkout");

  // Should redirect to login with returnUrl
  cy.url().should("include", "/login");
  cy.url().should("include", "returnUrl=/checkout");
});
```

---

### ✅ Test 1.2: Redirect to cart if cart is empty

**Purpose:** Prevent checkout without items

```javascript
it("should redirect to cart if cart is empty", () => {
  // Clear cart
  cy.clearCart();

  // Try to access checkout
  cy.visit("/checkout");

  // Should redirect to cart
  cy.url().should("include", "/cart");
  cy.contains("Keranjang Anda kosong").should("be.visible");
});
```

---

### ✅ Test 1.3: Display checkout page correctly

**Purpose:** Verify checkout UI elements

```javascript
it("should display checkout page correctly", () => {
  cy.visit("/checkout");

  // Verify page title
  cy.contains("Checkout Pesanan").should("be.visible");

  // Verify back to cart button
  cy.contains("Kembali ke Keranjang").should("be.visible");

  // Verify sections
  cy.contains("Produk yang Dibeli").should("be.visible");
  cy.contains("Metode Pengambilan").should("be.visible");
  cy.contains("Metode Pembayaran").should("be.visible");

  // Verify order button
  cy.contains("button", "Buat Pesanan").should("be.visible");
});
```

---

### ✅ Test 1.4: Display cart items in checkout

**Purpose:** Show order summary

```javascript
it("should display cart items in checkout", () => {
  cy.visit("/checkout");

  // Should show product names
  cy.contains("Beras Premium").should("be.visible");
  cy.contains("Telur").should("be.visible");

  // Should show quantities
  cy.contains("x 2").should("be.visible");
  cy.contains("x 1").should("be.visible");

  // Should show prices
  cy.get('[data-cy="item-price"]').should("have.length.at.least", 2);

  // Should show subtotal
  cy.get('[data-cy="order-subtotal"]').should("be.visible");
});
```

---

## 2. Pickup Method Selection Tests

### ✅ Test 2.1: Select self pickup method

**Purpose:** Test pickup at store option

```javascript
it("should select self pickup method", () => {
  cy.visit("/checkout");

  // Self pickup should be selected by default
  cy.get('input[value="self_pickup"]').should("be.checked");

  // Delivery address field should not be visible
  cy.get('textarea[placeholder*="alamat"]').should("not.be.visible");

  // Verify no delivery fee
  cy.get('[data-cy="delivery-fee"]').should("contain", "Rp 0");
});
```

**Self Pickup Details:**

- No delivery fee
- No address required
- Pickup location displayed
- Operating hours shown

---

### ✅ Test 2.2: Select delivery method

**Purpose:** Test home delivery option

```javascript
it("should select delivery method", () => {
  cy.visit("/checkout");

  // Click delivery option
  cy.contains("label", "Delivery").click();
  cy.wait(500);

  // Verify delivery selected
  cy.get('input[value="delivery"]').should("be.checked");

  // Delivery address field should be visible
  cy.get('textarea[placeholder*="alamat"]').should("be.visible");

  // Verify delivery fee added
  cy.get('[data-cy="delivery-fee"]').should("not.contain", "Rp 0");
  cy.get('[data-cy="delivery-fee"]').should("contain", "Rp 10.000");
});
```

---

### ✅ Test 2.3: Show delivery address field when delivery selected

**Purpose:** Conditional field display

```javascript
it("should show delivery address field when delivery selected", () => {
  cy.visit("/checkout");

  // Initially hidden
  cy.get('[data-cy="delivery-address-field"]').should("not.be.visible");

  // Select delivery
  cy.contains("label", "Delivery").click();
  cy.wait(500);

  // Now visible
  cy.get('[data-cy="delivery-address-field"]').should("be.visible");
  cy.get('textarea[name="deliveryAddress"]').should("be.visible");
  cy.get('textarea[name="deliveryAddress"]')
    .should("have.attr", "placeholder")
    .and("include", "alamat");
});
```

---

### ✅ Test 2.4: Validate delivery address required

**Purpose:** Ensure address for delivery

```javascript
it("should validate delivery address required", () => {
  cy.visit("/checkout");

  // Select delivery
  cy.contains("label", "Delivery").click();
  cy.wait(500);

  // Try to create order without address
  cy.contains("button", "Buat Pesanan").click();

  // Verify validation error
  cy.contains("Alamat pengiriman harus diisi").should("be.visible");

  // Order should not be created
  cy.url().should("include", "/checkout");
});
```

---

### ✅ Test 2.5: Calculate delivery fee correctly

**Purpose:** Dynamic delivery fee calculation

```javascript
it("should calculate delivery fee correctly", () => {
  cy.visit("/checkout");

  // Get initial total (self pickup)
  cy.get('[data-cy="order-total"]')
    .invoke("text")
    .then((selfPickupTotal) => {
      // Select delivery
      cy.contains("label", "Delivery").click();
      cy.wait(500);

      // Verify delivery fee added
      cy.get('[data-cy="delivery-fee"]').should("contain", "Rp 10.000");

      // Verify total increased by delivery fee
      cy.get('[data-cy="order-total"]')
        .invoke("text")
        .then((deliveryTotal) => {
          const selfPickupAmount = parseInt(selfPickupTotal.replace(/\D/g, ""));
          const deliveryAmount = parseInt(deliveryTotal.replace(/\D/g, ""));

          expect(deliveryAmount).to.equal(selfPickupAmount + 10000);
        });
    });
});
```

**Delivery Fee Logic:**

```javascript
const DELIVERY_FEE = 10000; // Rp 10.000
const FREE_DELIVERY_THRESHOLD = 100000; // Rp 100.000

function calculateDeliveryFee(subtotal) {
  if (subtotal >= FREE_DELIVERY_THRESHOLD) {
    return 0; // Free delivery
  }
  return DELIVERY_FEE;
}
```

---

## 3. Payment Method Selection Tests

### ✅ Test 3.1: Select QRIS payment

**Purpose:** Test QRIS digital payment

```javascript
it("should select QRIS payment", () => {
  cy.visit("/checkout");

  // QRIS should be selected by default
  cy.get('input[value="qris"]').should("be.checked");

  // Bank selection should not be visible
  cy.get('[data-cy="bank-selection"]').should("not.be.visible");

  // QRIS info displayed
  cy.contains("Scan QR code untuk pembayaran").should("be.visible");
});
```

---

### ✅ Test 3.2: Select Bank Transfer payment

**Purpose:** Test bank transfer option

```javascript
it("should select Bank Transfer payment", () => {
  cy.visit("/checkout");

  // Click transfer option
  cy.contains("label", "Transfer Bank").click();
  cy.wait(500);

  // Verify transfer selected
  cy.get('input[value="transfer"]').should("be.checked");

  // Bank selection should be visible
  cy.get('[data-cy="bank-selection"]').should("be.visible");

  // Verify bank options available
  cy.contains("label", "BRI").should("be.visible");
  cy.contains("label", "BCA").should("be.visible");
  cy.contains("label", "MANDIRI").should("be.visible");
});
```

---

### ✅ Test 3.3: Select Cash payment

**Purpose:** Test cash on delivery/pickup

```javascript
it("should select Cash payment", () => {
  cy.visit("/checkout");

  // Cash only available for self pickup
  cy.get('input[value="self_pickup"]').check();
  cy.wait(500);

  // Click cash option
  cy.contains("label", "Tunai").click();
  cy.wait(500);

  // Verify cash selected
  cy.get('input[value="cash"]').should("be.checked");

  // Cash info displayed
  cy.contains("Bayar saat pengambilan").should("be.visible");
});
```

**Payment Methods by Pickup Type:**

```javascript
// Self Pickup
- QRIS ✅
- Transfer Bank ✅
- Tunai ✅

// Delivery
- QRIS ✅
- Transfer Bank ✅
- Tunai ❌ (not available)
```

---

### ✅ Test 3.4: Show bank selection for transfer

**Purpose:** Additional bank detail input

```javascript
it("should show bank selection for transfer", () => {
  cy.visit("/checkout");

  // Select transfer
  cy.contains("label", "Transfer Bank").click();
  cy.wait(500);

  // Bank selection visible
  cy.get('[data-cy="bank-selection"]').should("be.visible");

  // Select BRI
  cy.contains("label", "BRI").click();
  cy.wait(500);
  cy.get('input[value="BRI"]').should("be.checked");

  // BRI account info displayed
  cy.contains("BRI").should("be.visible");
  cy.contains(/\d{10,}/).should("be.visible"); // Account number
});
```

---

### ✅ Test 3.5: Validate bank selection required

**Purpose:** Ensure bank chosen for transfer

```javascript
it("should validate bank selection required", () => {
  cy.visit("/checkout");

  // Select transfer but no bank
  cy.contains("label", "Transfer Bank").click();
  cy.wait(500);

  // Try to create order
  cy.contains("button", "Buat Pesanan").click();

  // Verify validation error
  cy.contains("Pilih bank tujuan transfer").should("be.visible");
});
```

---

## 4. Order Creation Tests

### ✅ Test 4.1: Create order with QRIS payment

**Purpose:** Complete QRIS order flow

```javascript
it("should create order with QRIS payment", () => {
  cy.visit("/checkout");

  // QRIS already selected by default
  // Self pickup already selected by default

  // Intercept order creation
  cy.intercept("POST", "**/api/customer/orders/create").as("createOrder");

  // Create order
  cy.contains("button", "Buat Pesanan").click();

  // Wait for response
  cy.wait("@createOrder", { timeout: 15000 }).then((interception) => {
    expect(interception.response.statusCode).to.equal(201);
    expect(interception.response.body.data).to.have.property("id");
    expect(interception.response.body.data.payment_method).to.equal("qris");
    expect(interception.response.body.data.pickup_method).to.equal(
      "self_pickup"
    );
  });

  // Verify redirect to success page
  cy.url({ timeout: 10000 }).should("include", "/order-success");
});
```

**API Request:**

```javascript
POST /api/customer/orders/create
{
  "pickup_method": "self_pickup",
  "payment_method": "qris",
  "delivery_address": null,
  "items": [
    { "product_id": "prod-001", "quantity": 2, "price": 15000 },
    { "product_id": "prod-002", "quantity": 1, "price": 20000 }
  ]
}
```

**API Response:**

```javascript
{
  "success": true,
  "data": {
    "id": "ORD-20251221-001",
    "order_number": "ORD-20251221-001",
    "total": 50000,
    "payment_method": "qris",
    "payment_status": "pending",
    "order_status": "pending_payment",
    "qr_code": "data:image/png;base64,..."
  }
}
```

---

### ✅ Test 4.2: Create order with Bank Transfer

**Purpose:** Complete bank transfer order flow

```javascript
it("should create order with Bank Transfer", () => {
  cy.visit("/checkout");

  // Select transfer payment
  cy.contains("label", "Transfer Bank").click();
  cy.wait(500);
  cy.contains("label", "BCA").click();
  cy.wait(500);

  // Create order
  cy.intercept("POST", "**/api/customer/orders/create").as("createOrder");
  cy.contains("button", "Buat Pesanan").click();

  cy.wait("@createOrder", { timeout: 15000 }).then((interception) => {
    expect(interception.response.body.data.payment_method).to.equal("transfer");
    expect(interception.response.body.data.bank_name).to.equal("BCA");
  });

  cy.url({ timeout: 10000 }).should("include", "/order-success");

  // Verify bank account info displayed
  cy.contains("BCA").should("be.visible");
  cy.contains("Nomor Rekening").should("be.visible");
});
```

---

### ✅ Test 4.3: Create order with Cash payment

**Purpose:** Complete cash order flow

```javascript
it("should create order with Cash payment", () => {
  cy.visit("/checkout");

  // Select self pickup (required for cash)
  cy.get('input[value="self_pickup"]').check();
  cy.wait(500);

  // Select cash
  cy.contains("label", "Tunai").click();
  cy.wait(500);

  // Create order
  cy.intercept("POST", "**/api/customer/orders/create").as("createOrder");
  cy.contains("button", "Buat Pesanan").click();

  cy.wait("@createOrder").then((interception) => {
    expect(interception.response.body.data.payment_method).to.equal("cash");
    expect(interception.response.body.data.payment_status).to.equal("pending");
  });

  cy.url().should("include", "/order-success");
});
```

---

### ✅ Test 4.4: Create order with delivery

**Purpose:** Complete delivery order flow

```javascript
it("should create order with delivery", () => {
  cy.visit("/checkout");

  // Select delivery
  cy.contains("label", "Delivery").click();
  cy.wait(500);

  // Fill delivery address
  cy.get('textarea[name="deliveryAddress"]').type(
    "Jl. Test No. 123, Jakarta Selatan, 12345"
  );

  // Create order
  cy.intercept("POST", "**/api/customer/orders/create").as("createOrder");
  cy.contains("button", "Buat Pesanan").click();

  cy.wait("@createOrder").then((interception) => {
    expect(interception.response.body.data.pickup_method).to.equal("delivery");
    expect(interception.response.body.data.delivery_address).to.exist;
    expect(interception.response.body.data.delivery_address).to.include(
      "Jakarta"
    );
  });

  cy.url().should("include", "/order-success");
});
```

---

### ✅ Test 4.5: Generate WhatsApp confirmation link

**Purpose:** Test WhatsApp integration

```javascript
it("should generate WhatsApp confirmation link", () => {
  cy.visit("/checkout");

  cy.intercept("POST", "**/api/customer/orders/create").as("createOrder");
  cy.contains("button", "Buat Pesanan").click();

  cy.wait("@createOrder");
  cy.url().should("include", "/order-success");

  // Verify WhatsApp button
  cy.get('[data-cy="whatsapp-confirm-btn"]').should("be.visible");

  // Verify link format
  cy.get('[data-cy="whatsapp-confirm-btn"]')
    .should("have.attr", "href")
    .and("include", "https://wa.me/")
    .and("include", "text=");
});
```

**WhatsApp Message Format:**

```
Halo BaleTani,

Saya telah membuat pesanan:
- Nomor Pesanan: ORD-20251221-001
- Total: Rp 50.000
- Metode Pembayaran: QRIS
- Metode Pengambilan: Self Pickup

Mohon konfirmasi pesanan saya.
Terima kasih.
```

---

## 5. Order Success Page Tests

### ✅ Test 5.1: Display order number

**Purpose:** Show order reference

```javascript
it("should display order number", () => {
  // Create order first
  cy.visit("/checkout");
  cy.intercept("POST", "**/api/customer/orders/create").as("createOrder");
  cy.contains("button", "Buat Pesanan").click();

  cy.wait("@createOrder").then((interception) => {
    const orderNumber = interception.response.body.data.order_number;

    // Verify order number displayed
    cy.contains("Nomor Pesanan").should("be.visible");
    cy.contains(orderNumber).should("be.visible");
  });
});
```

---

### ✅ Test 5.2: Display order summary

**Purpose:** Show complete order details

```javascript
it("should display order summary", () => {
  cy.visit("/checkout");
  cy.intercept("POST", "**/api/customer/orders/create").as("createOrder");
  cy.contains("button", "Buat Pesanan").click();
  cy.wait("@createOrder");

  // Verify order success message
  cy.contains("Pesanan Berhasil Dibuat").should("be.visible");

  // Verify order details
  cy.contains("Total Pembayaran").should("be.visible");
  cy.contains("Metode Pembayaran").should("be.visible");
  cy.contains("Metode Pengambilan").should("be.visible");

  // Verify items list
  cy.get('[data-cy="order-item"]').should("have.length.at.least", 1);
});
```

---

### ✅ Test 5.3: Display payment expiry countdown (for transfer)

**Purpose:** Show 10-minute payment window

```javascript
it("should display payment expiry countdown for transfer", () => {
  cy.visit("/checkout");

  // Select transfer payment
  cy.contains("label", "Transfer Bank").click();
  cy.wait(500);
  cy.contains("label", "BRI").click();
  cy.wait(500);

  cy.intercept("POST", "**/api/customer/orders/create").as("createOrder");
  cy.contains("button", "Buat Pesanan").click();
  cy.wait("@createOrder");

  // Verify countdown displayed
  cy.get('[data-cy="payment-countdown"]').should("be.visible");
  cy.contains(/Bayar dalam/i).should("be.visible");

  // Verify countdown format (MM:SS)
  cy.get('[data-cy="countdown-timer"]')
    .invoke("text")
    .should("match", /\d{2}:\d{2}/);

  // Wait 2 seconds and verify countdown decreases
  cy.wait(2000);
  cy.get('[data-cy="countdown-timer"]')
    .invoke("text")
    .should("match", /09:5[0-8]/); // Should be around 09:58
});
```

**Payment Expiry Rules:**

```javascript
// Transfer: 10 minutes
// QRIS: 30 minutes
// Cash: No expiry
```

---

## 🔧 Setup & Configuration

### Before Each Test

```javascript
beforeEach(() => {
  // Reset database
  cy.resetDatabase();

  // Seed products
  cy.seedDatabase("products");

  // Login as customer
  cy.customerLogin("081234567890", "password123");

  // Add products to cart
  cy.addToCart("prod-001", 2); // Beras Premium
  cy.addToCart("prod-002", 1); // Telur
});
```

---

## 🎯 Custom Commands

### Checkout Commands

```javascript
Cypress.Commands.add("fillCheckoutForm", (options) => {
  if (options.pickupMethod === "delivery") {
    cy.contains("label", "Delivery").click();
    cy.wait(500);
    cy.get('textarea[name="deliveryAddress"]').type(options.address);
  }

  if (options.paymentMethod === "transfer") {
    cy.contains("label", "Transfer Bank").click();
    cy.wait(500);
    cy.contains("label", options.bank).click();
  } else if (options.paymentMethod === "cash") {
    cy.contains("label", "Tunai").click();
  }
});
```

**Usage:**

```javascript
cy.fillCheckoutForm({
  pickupMethod: "delivery",
  address: "Jl. Test No. 123",
  paymentMethod: "transfer",
  bank: "BCA",
});
```

---

## 🚀 How to Run

```bash
npm run cy:run:checkout
```

---

## 📊 Test Results

```
✅ ALL TESTS PASSING: 22/22
Total Duration: 4 minutes 10 seconds
Success Rate: 100% 🎉
```

---

**Last Updated:** December 21, 2025  
**File:** `04-checkout.cy.js`  
**Version:** 1.0.0

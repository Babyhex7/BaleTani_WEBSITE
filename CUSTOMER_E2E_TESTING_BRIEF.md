# 📋 CUSTOMER E2E TESTING BRIEF - BaleTani Web

> **Created:** November 29, 2025  
> **Target:** Customer Area (Frontend + Backend + Database)  
> **Tool:** Cypress v13.6+  
> **Approach:** Modular, Best Practice, Separate Folder Structure

---

## 📊 Executive Summary

Dokumen ini berisi analisis lengkap dan rencana implementasi E2E testing untuk **Customer Area** aplikasi BaleTani Web, meliputi authentication, shopping, cart, checkout, order management, dan profile management.

**Key Metrics:**

- **15 Customer Pages** yang akan ditest
- **22 API Endpoints** yang terlibat
- **5 Database Tables** (customers, carts, products, orders, order_items)
- **8 Critical User Flows** yang harus berfungsi sempurna
- **Estimasi: 45+ Test Cases** untuk coverage menyeluruh

---

## 🗂️ Struktur Folder E2E Tests (Terpisah dari Project Utama)

```
BaleTani_WEBSITE/
├── frontend/                     # Existing
├── backend/                      # Existing
├── testing/                      # Existing (API tests dengan .http files)
└── e2e-tests/                    # 🆕 NEW - Folder terpisah untuk E2E
    ├── cypress/
    │   ├── e2e/
    │   │   └── customer/         # Customer flow tests
    │   │       ├── 01-auth.cy.js
    │   │       ├── 02-browsing.cy.js
    │   │       ├── 03-cart.cy.js
    │   │       ├── 04-checkout.cy.js
    │   │       ├── 05-order-history.cy.js
    │   │       ├── 06-profile.cy.js
    │   │       ├── 07-contact.cy.js
    │   │       └── 08-categories.cy.js
    │   ├── fixtures/              # Test data JSON
    │   │   ├── customers.json
    │   │   ├── products.json
    │   │   ├── categories.json
    │   │   └── images/
    │   │       └── sample-product.jpg
    │   ├── support/               # Custom commands & helpers
    │   │   ├── commands.js
    │   │   ├── e2e.js
    │   │   └── helpers/
    │   │       ├── authHelper.js
    │   │       ├── cartHelper.js
    │   │       ├── databaseHelper.js
    │   │       └── localStorageHelper.js
    │   └── downloads/             # Downloaded files (invoices, etc)
    ├── cypress.config.js
    ├── package.json
    ├── .env.test
    ├── .gitignore
    └── README.md
```

---

## 🔍 ANALISIS BACKEND (API & Database)

### 1️⃣ Customer Authentication API

**Base URL:** `http://localhost:5000/api/customer/auth`

#### **Endpoints:**

| Method | Endpoint    | Description           | Auth Required |
| ------ | ----------- | --------------------- | ------------- |
| POST   | `/register` | Register new customer | ❌ No         |
| POST   | `/login`    | Login customer        | ❌ No         |
| GET    | `/profile`  | Get customer profile  | ✅ Yes (JWT)  |
| POST   | `/logout`   | Logout customer       | ✅ Yes (JWT)  |

#### **Register Payload:**

```json
{
  "phone_number": "081234567890",
  "full_name": "Test Customer",
  "password": "password123"
}
```

#### **Login Payload:**

```json
{
  "phone_number": "081234567890",
  "password": "password123"
}
```

#### **Response (Success):**

```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "customer": {
      "id": "uuid-string",
      "phone_number": "6281234567890",
      "full_name": "Test Customer",
      "address": null,
      "is_active": true
    },
    "token": "jwt-token-string"
  }
}
```

#### **Validations:**

- Phone number: 10-15 digits
- Full name: 2-100 characters
- Password: minimum 6 characters
- Phone normalization: `08xxx` → `628xxx`

---

### 2️⃣ Shopping Cart API

**Base URL:** `http://localhost:5000/api/customer/cart`  
**Auth:** Required (JWT Bearer Token)

#### **Endpoints:**

| Method | Endpoint | Description     | Request Body               |
| ------ | -------- | --------------- | -------------------------- |
| GET    | `/`      | Get cart items  | -                          |
| POST   | `/`      | Add to cart     | `{ product_id, quantity }` |
| PUT    | `/:id`   | Update quantity | `{ quantity }`             |
| DELETE | `/:id`   | Remove item     | -                          |
| DELETE | `/`      | Clear cart      | -                          |

#### **Add to Cart Payload:**

```json
{
  "product_id": "uuid-string",
  "quantity": 2
}
```

#### **Cart Response Example:**

```json
{
  "success": true,
  "data": {
    "cart": [
      {
        "id": "cart-item-uuid",
        "customer_id": "customer-uuid",
        "product_id": "product-uuid",
        "quantity": 2,
        "product": {
          "id": "product-uuid",
          "name": "Beras Premium",
          "price": 50000,
          "stock": 100,
          "image_url": "url-string",
          "discount": {
            "percentage": 10,
            "discounted_price": 45000
          }
        },
        "subtotal": 90000
      }
    ],
    "summary": {
      "total_items": 2,
      "subtotal": 90000,
      "delivery_fee": 15000,
      "total": 105000
    }
  }
}
```

---

### 3️⃣ Order Management API

**Base URL:** `http://localhost:5000/api/customer/orders`  
**Auth:** Required (JWT Bearer Token)

#### **Endpoints:**

| Method | Endpoint                  | Description                 | Request Body                            |
| ------ | ------------------------- | --------------------------- | --------------------------------------- |
| POST   | `/create`                 | Create new order            | Order details (see below)               |
| GET    | `/history`                | Get order history           | Query params: `status`, `page`, `limit` |
| GET    | `/history/:id`            | Get order detail + timeline | -                                       |
| POST   | `/:id/reorder`            | Re-add order items to cart  | -                                       |
| PUT    | `/:id/cancel`             | Cancel pending order        | `{ reason }`                            |
| POST   | `/:orderId/manual-cancel` | Manual cancel expired order | -                                       |

#### **Create Order Payload:**

```json
{
  "payment_method": "transfer",
  "delivery_method": "delivery",
  "delivery_address": "Jl. Test No. 123, Jakarta",
  "customer_notes": "Kirim pagi",
  "cart_items": [
    {
      "product_id": "uuid",
      "quantity": 2,
      "price": 50000
    }
  ]
}
```

#### **Order Status Flow:**

```
pending_payment → paid → processing → ready_for_pickup/out_for_delivery → completed
                      ↘ cancelled
```

#### **Payment Methods:**

- `cash` - Cash on Delivery
- `transfer` - Bank Transfer
- `qris` - QRIS

#### **Delivery Methods:**

- `self_pickup` - Ambil di toko (gratis)
- `delivery` - Diantar (Rp 15.000)

#### **Payment Expiry:**

- Orders expire after **10 minutes** if not paid (`payment_expired_at`)
- Auto-cancel via cron job: `orderAutoCancelCron.js`

---

### 4️⃣ Profile Management API

**Base URL:** `http://localhost:5000/api/customer/profile`  
**Auth:** Required (JWT Bearer Token)

#### **Endpoints:**

| Method | Endpoint    | Description         | Request Body                         |
| ------ | ----------- | ------------------- | ------------------------------------ |
| GET    | `/`         | Get profile + stats | -                                    |
| PUT    | `/`         | Update profile      | `{ full_name, address }`             |
| PUT    | `/password` | Change password     | `{ current_password, new_password }` |

#### **Profile Response:**

```json
{
  "success": true,
  "data": {
    "customer": {
      "id": "uuid",
      "phone_number": "6281234567890",
      "full_name": "Test Customer",
      "address": "Jl. Test",
      "created_at": "2024-01-01"
    },
    "stats": {
      "total_orders": 5,
      "completed_orders": 3,
      "pending_orders": 2,
      "total_spent": 500000
    }
  }
}
```

---

### 5️⃣ Public APIs (No Auth Required)

**Base URL:** `http://localhost:5000/api/public`

#### **Products:**

- `GET /products` - Browse products (with filters, search, pagination)
- `GET /products/:id` - Product detail

#### **Categories:**

- `GET /categories` - List categories
- `GET /categories/:id` - Category detail + products

#### **Discounts:**

- `GET /discounts` - Active discounts/promos

#### **FAQs:**

- `GET /faqs` - Frequently Asked Questions

---

### 6️⃣ Contact API

**Base URL:** `http://localhost:5000/api/customer/contact`  
**Auth:** Optional (dapat dilakukan guest atau logged in user)

#### **Endpoints:**

| Method | Endpoint | Description         | Request Body               |
| ------ | -------- | ------------------- | -------------------------- |
| POST   | `/`      | Submit contact form | `{ name, email, message }` |

---

## 🎨 ANALISIS FRONTEND (Pages & Routes)

### Customer Pages (15 Pages)

| No  | Page                   | Route               | Auth Required | Description           |
| --- | ---------------------- | ------------------- | ------------- | --------------------- |
| 1   | **LandingPage**        | `/landing`          | ❌            | Public landing page   |
| 2   | **Login**              | `/login`            | ❌            | Customer login        |
| 3   | **Register**           | `/register`         | ❌            | Customer registration |
| 4   | **Home**               | `/home`             | ✅            | Customer dashboard    |
| 5   | **ProductPage**        | `/products`         | ❌            | Browse all products   |
| 6   | **ProductDetailPage**  | `/products/:id`     | ❌            | View product detail   |
| 7   | **CategoryPage**       | `/categories`       | ❌            | Browse categories     |
| 8   | **CategoryDetailPage** | `/categories/:id`   | ❌            | Products in category  |
| 9   | **PromoPage**          | `/promo`            | ❌            | Active promotions     |
| 10  | **CartPage**           | `/cart`             | ✅            | Shopping cart         |
| 11  | **CheckoutPage**       | `/checkout`         | ✅            | Checkout process      |
| 12  | **OrderSuccessPage**   | `/order-success`    | ✅            | Order confirmation    |
| 13  | **PurchaseHistory**    | `/purchase-history` | ✅            | Order history         |
| 14  | **ProfilePage**        | `/profile`          | ✅            | Customer profile      |
| 15  | **ContactPage**        | `/contact`          | ❌            | Contact form          |

---

## 🗄️ ANALISIS DATABASE

### Tables Terkait Customer Flow

#### **1. customers**

```sql
id                UUID PRIMARY KEY
phone_number      VARCHAR(20) UNIQUE
full_name         VARCHAR(100)
password_hash     VARCHAR(255)
address           TEXT
is_active         BOOLEAN DEFAULT TRUE
created_at        TIMESTAMP
updated_at        TIMESTAMP
```

#### **2. carts**

```sql
id                UUID PRIMARY KEY
customer_id       UUID FK -> customers(id)
product_id        UUID FK -> products(id)
quantity          DECIMAL(10,2)
created_at        TIMESTAMP
updated_at        TIMESTAMP
UNIQUE(customer_id, product_id)
```

#### **3. orders**

```sql
id                UUID PRIMARY KEY
order_number      VARCHAR(50) UNIQUE
order_type        ENUM('online', 'offline')
customer_id       UUID FK -> customers(id)
payment_method    ENUM('cash', 'transfer', 'qris')
delivery_method   ENUM('self_pickup', 'delivery')
delivery_address  TEXT
item_subtotal     DECIMAL(15,2)
delivery_fee      DECIMAL(10,2)
total_amount      DECIMAL(15,2)
payment_status    ENUM('pending', 'paid', 'failed', 'refunded')
order_status      ENUM('pending_payment', 'paid', 'processing', ...)
payment_expired_at TIMESTAMP
created_at        TIMESTAMP
...
```

#### **4. order_items**

```sql
id                UUID PRIMARY KEY
order_id          UUID FK -> orders(id)
product_id        UUID FK -> products(id)
product_name      VARCHAR(255)
quantity          DECIMAL(10,2)
unit_price        DECIMAL(15,2)
discount_amount   DECIMAL(10,2)
subtotal          DECIMAL(15,2)
```

#### **5. order_status_history**

```sql
id                UUID PRIMARY KEY
order_id          UUID FK -> orders(id)
old_status        VARCHAR(50)
new_status        VARCHAR(50)
notes             TEXT
created_by        UUID
created_at        TIMESTAMP
```

---

## 🎯 CRITICAL USER FLOWS (8 Flows)

### Flow 1: Registration & Login ⭐⭐⭐

```
User Journey:
1. Visit /register
2. Fill form (full_name, phone_number, password)
3. Submit registration
4. Redirect to /login with pre-filled phone
5. Enter password
6. Login successful
7. Token stored in localStorage (Zustand persist)
8. Redirect to /home

Test Cases:
✅ Register with valid data
✅ Register with invalid phone (too short, non-numeric)
✅ Register with duplicate phone
✅ Register with weak password
✅ Login with valid credentials
✅ Login with invalid credentials
✅ Token persistence after page refresh
✅ Auto-logout when token expires
```

---

### Flow 2: Browse & Search Products ⭐⭐⭐

```
User Journey:
1. Visit /products (public - no login)
2. See product grid with images, prices, discounts
3. Use search bar to find products
4. Filter by category
5. Sort by (name, price, newest)
6. Paginate through results
7. Click product to view detail (/products/:id)
8. See full product info, images, stock, discount
9. Can add to cart (requires login)

Test Cases:
✅ Load products page successfully
✅ Search products by name
✅ Filter by category
✅ Sort products (ascending/descending)
✅ Pagination works
✅ Product detail page loads
✅ Product images display
✅ Discount badge shows correctly
✅ Out of stock products marked
✅ Add to cart redirects to login (if not logged in)
```

---

### Flow 3: Shopping Cart Management ⭐⭐⭐

```
User Journey:
1. Login as customer
2. Browse products
3. Add product to cart (quantity = 2)
4. Toast notification "Produk berhasil ditambahkan"
5. Cart icon shows count (2 items)
6. Navigate to /cart
7. See cart items with product info, prices
8. Update quantity of item
9. Remove item from cart
10. Cart recalculates subtotal automatically
11. See delivery fee (Rp 15.000)
12. See total amount

Test Cases:
✅ Add product to cart
✅ Cart persists in Zustand localStorage
✅ Cart syncs with backend
✅ Update quantity (increase/decrease)
✅ Remove item from cart
✅ Clear entire cart
✅ Cart shows correct subtotal
✅ Delivery fee calculated correctly
✅ Discount applied correctly
✅ Empty cart shows empty state
✅ Cannot add out-of-stock products
✅ Cannot add quantity > stock
```

---

### Flow 4: Checkout Process ⭐⭐⭐

```
User Journey:
1. Customer has items in cart
2. Navigate to /cart
3. Click "Checkout" button
4. Redirect to /checkout
5. Verify cart items summary
6. Select delivery method (self_pickup / delivery)
7. If delivery: enter/verify address
8. Select payment method (cash/transfer/qris)
9. Add customer notes (optional)
10. Review order summary
11. Click "Buat Pesanan"
12. Order created (status: pending_payment)
13. Cart cleared
14. Redirect to /order-success
15. Show order ID, payment instructions
16. Show WhatsApp link to admin

Test Cases:
✅ Complete checkout with self_pickup + cash
✅ Complete checkout with delivery + transfer
✅ Complete checkout with delivery + qris
✅ Checkout calculates delivery fee correctly
✅ Cannot checkout with empty cart
✅ Delivery address required if delivery method
✅ Order created with correct status
✅ Cart cleared after successful checkout
✅ Order success page shows order ID
✅ WhatsApp link generated correctly
✅ Payment expiry timer starts (10 minutes)
```

---

### Flow 5: Order History & Tracking ⭐⭐⭐

```
User Journey:
1. Login as customer
2. Navigate to /purchase-history
3. See list of all orders
4. Filter by status (pending, paid, completed, cancelled)
5. Search by order number
6. Click order to view detail
7. See order items, total, status
8. See payment status
9. See order timeline (status history)
10. Can cancel order (if status = pending_payment)
11. Can reorder (add all items to cart)

Test Cases:
✅ View order history
✅ Filter orders by status
✅ Search order by number
✅ Order detail page loads
✅ Order timeline shows correctly
✅ Cancel pending order
✅ Cannot cancel completed order
✅ Reorder adds items to cart
✅ Order status updates reflected
✅ Payment expiry countdown visible
✅ Auto-cancel expired orders
```

---

### Flow 6: Profile Management ⭐⭐

```
User Journey:
1. Login as customer
2. Navigate to /profile
3. See profile info (name, phone, address)
4. See order statistics
5. Click "Edit Profile"
6. Update full_name
7. Update address
8. Save changes
9. Toast "Profile berhasil diperbarui"
10. Click "Ganti Password"
11. Enter current password
12. Enter new password
13. Confirm new password
14. Save password change
15. Re-login required

Test Cases:
✅ View profile page
✅ Profile shows correct data
✅ Order stats display correctly
✅ Edit profile (name, address)
✅ Profile updates saved
✅ Change password successfully
✅ Cannot change password with wrong current password
✅ New password must meet validation
✅ Logout after password change
```

---

### Flow 7: Contact Form ⭐

```
User Journey:
1. Visit /contact (public - no login)
2. Fill contact form (name, email, message)
3. Submit form
4. Toast "Pesan berhasil dikirim"
5. Admin receives contact message

Test Cases:
✅ Submit contact form as guest
✅ Submit contact form as logged in user
✅ Validate required fields
✅ Email format validation
✅ Message min/max length validation
✅ Success message displayed
```

---

### Flow 8: Browse Categories ⭐⭐

```
User Journey:
1. Visit /categories (public)
2. See all product categories
3. See product count per category
4. Click category to /categories/:id
5. See products in that category
6. Can filter, search within category
7. Can add to cart (requires login)

Test Cases:
✅ Load categories page
✅ Categories display with images
✅ Product count accurate
✅ Category detail page loads
✅ Products filtered by category
✅ Can navigate back to all categories
```

---

## 🧪 TEST SUITE STRUCTURE

### Cypress Test Files (Modular Approach)

```
cypress/e2e/customer/
├── 01-auth.cy.js                 # Registration & Login (8 tests)
├── 02-browsing.cy.js              # Browse & Search Products (10 tests)
├── 03-cart.cy.js                  # Shopping Cart (12 tests)
├── 04-checkout.cy.js              # Checkout Process (8 tests)
├── 05-order-history.cy.js         # Order History & Tracking (10 tests)
├── 06-profile.cy.js               # Profile Management (7 tests)
├── 07-contact.cy.js               # Contact Form (5 tests)
└── 08-categories.cy.js            # Browse Categories (6 tests)

Total: 66 Test Cases
```

---

## 🛠️ TECHNICAL IMPLEMENTATION

### 1. Custom Cypress Commands (`cypress/support/commands.js`)

```javascript
/**
 * ===========================
 * AUTHENTICATION COMMANDS
 * ===========================
 */

/**
 * Login via API and set localStorage (Zustand persist)
 */
Cypress.Commands.add(
  "customerLogin",
  (phone = "081234567890", password = "password123") => {
    cy.request({
      method: "POST",
      url: `${Cypress.env("API_URL")}/customer/auth/login`,
      body: {
        phone_number: phone,
        password: password,
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(200);

      const { customer, token } = response.body.data;

      // Zustand persist format
      const zustandStorage = {
        state: {
          user: customer,
          token: token,
          isAuthenticated: true,
          tokenExpiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        },
        version: 0,
      };

      cy.window().then((win) => {
        win.localStorage.setItem(
          "baletani-customer-storage",
          JSON.stringify(zustandStorage)
        );
      });
    });
  }
);

/**
 * Register new customer via API
 */
Cypress.Commands.add("customerRegister", (customerData) => {
  const defaultData = {
    phone_number: `0812${Date.now().toString().slice(-8)}`,
    full_name: "Test Customer",
    password: "password123",
  };

  const data = { ...defaultData, ...customerData };

  return cy.request({
    method: "POST",
    url: `${Cypress.env("API_URL")}/customer/auth/register`,
    body: data,
    failOnStatusCode: false,
  });
});

/**
 * Logout (clear localStorage)
 */
Cypress.Commands.add("customerLogout", () => {
  cy.window().then((win) => {
    win.localStorage.removeItem("baletani-customer-storage");
  });
});

/**
 * ===========================
 * CART COMMANDS
 * ===========================
 */

/**
 * Add product to cart via API
 */
Cypress.Commands.add("addToCart", (productId, quantity = 1) => {
  // Get token from localStorage
  cy.window().then((win) => {
    const storage = JSON.parse(
      win.localStorage.getItem("baletani-customer-storage") || "{}"
    );
    const token = storage.state?.token;

    return cy.request({
      method: "POST",
      url: `${Cypress.env("API_URL")}/customer/cart`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        product_id: productId,
        quantity: quantity,
      },
    });
  });
});

/**
 * Clear cart via API
 */
Cypress.Commands.add("clearCart", () => {
  cy.window().then((win) => {
    const storage = JSON.parse(
      win.localStorage.getItem("baletani-customer-storage") || "{}"
    );
    const token = storage.state?.token;

    return cy.request({
      method: "DELETE",
      url: `${Cypress.env("API_URL")}/customer/cart`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      failOnStatusCode: false,
    });
  });
});

/**
 * ===========================
 * DATABASE COMMANDS
 * ===========================
 */

/**
 * Reset test database
 */
Cypress.Commands.add("resetDatabase", () => {
  return cy.task("db:reset");
});

/**
 * Seed test data
 */
Cypress.Commands.add("seedDatabase", (fixture) => {
  return cy.task("db:seed", fixture);
});

/**
 * ===========================
 * NAVIGATION COMMANDS
 * ===========================
 */

/**
 * Visit page as authenticated customer
 */
Cypress.Commands.add("visitAsCustomer", (path, credentials) => {
  const { phone = "081234567890", password = "password123" } =
    credentials || {};

  cy.customerLogin(phone, password);
  cy.visit(path);
});

/**
 * ===========================
 * ASSERTION COMMANDS
 * ===========================
 */

/**
 * Check if customer is authenticated
 */
Cypress.Commands.add("shouldBeAuthenticated", () => {
  cy.window().then((win) => {
    const storage = JSON.parse(
      win.localStorage.getItem("baletani-customer-storage") || "{}"
    );
    expect(storage.state?.isAuthenticated).to.be.true;
    expect(storage.state?.token).to.exist;
  });
});

/**
 * Check if customer is NOT authenticated
 */
Cypress.Commands.add("shouldNotBeAuthenticated", () => {
  cy.window().then((win) => {
    const storage = win.localStorage.getItem("baletani-customer-storage");
    if (storage) {
      const parsed = JSON.parse(storage);
      expect(parsed.state?.isAuthenticated).to.not.be.true;
    }
  });
});
```

---

### 2. Test Fixtures (`cypress/fixtures/`)

#### **customers.json**

```json
{
  "validCustomer": {
    "phone_number": "081234567890",
    "full_name": "Test Customer",
    "password": "password123",
    "address": "Jl. Test No. 123, Jakarta"
  },
  "invalidCustomers": [
    {
      "phone_number": "08123",
      "full_name": "Short Phone",
      "password": "password123",
      "expectedError": "Nomor telepon harus 10-15 digit"
    },
    {
      "phone_number": "081234567890",
      "full_name": "A",
      "password": "password123",
      "expectedError": "Nama lengkap harus 2-100 karakter"
    },
    {
      "phone_number": "081234567890",
      "full_name": "Weak Password",
      "password": "12345",
      "expectedError": "Password minimal 6 karakter"
    }
  ]
}
```

#### **products.json**

```json
{
  "validProducts": [
    {
      "id": "product-uuid-1",
      "name": "Beras Premium",
      "description": "Beras berkualitas tinggi",
      "price": 50000,
      "stock": 100,
      "category_id": "category-uuid-1",
      "image_url": "/uploads/products/beras.jpg",
      "is_active": true
    },
    {
      "id": "product-uuid-2",
      "name": "Telur Ayam Kampung",
      "description": "Telur segar dari ayam kampung",
      "price": 30000,
      "stock": 50,
      "category_id": "category-uuid-2",
      "image_url": "/uploads/products/telur.jpg",
      "is_active": true,
      "discount": {
        "percentage": 10,
        "discounted_price": 27000
      }
    }
  ],
  "outOfStockProduct": {
    "id": "product-uuid-3",
    "name": "Sayuran Organik",
    "price": 20000,
    "stock": 0,
    "is_active": true
  }
}
```

---

### 3. Cypress Configuration (`cypress.config.js`)

```javascript
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",

    env: {
      API_URL: "http://localhost:5000/api",
      BACKEND_URL: "http://localhost:5000",
    },

    setupNodeEvents(on, config) {
      // Database tasks
      require("./cypress/support/helpers/databaseHelper")(on, config);

      return config;
    },

    viewportWidth: 1280,
    viewportHeight: 720,

    video: true,
    screenshotOnRunFailure: true,

    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,

    retries: {
      runMode: 2,
      openMode: 0,
    },

    // Exclude example specs
    excludeSpecPattern: [
      "**/examples/*",
      "**/1-getting-started/*",
      "**/2-advanced-examples/*",
    ],
  },
});
```

---

### 4. Environment Variables (`.env.test`)

```env
# Test Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=baletani_db_test
DB_PORT=3306

# Test Backend
NODE_ENV=test
PORT=5000

# Frontend
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME="BaleTani Fresh Market"

# Test Accounts
TEST_CUSTOMER_PHONE=081234567890
TEST_CUSTOMER_PASSWORD=password123

# WhatsApp
VITE_WHATSAPP_NUMBER=085885725027
```

---

## 📝 EXAMPLE TEST SPEC

### `cypress/e2e/customer/03-cart.cy.js`

```javascript
describe("Customer Shopping Cart Flow", () => {
  let testProduct;

  beforeEach(() => {
    // Reset database & seed products
    cy.resetDatabase();
    cy.seedDatabase("products");

    // Load product fixture
    cy.fixture("products").then((products) => {
      testProduct = products.validProducts[0];
    });

    // Login as customer
    cy.customerLogin();

    // Clear cart before each test
    cy.clearCart();
  });

  describe("Add to Cart", () => {
    it("should add product to cart successfully", () => {
      // Visit products page
      cy.visit("/products");

      // Find and click first product
      cy.get("[data-cy=product-card]")
        .first()
        .within(() => {
          cy.get("[data-cy=product-name]").should("be.visible");
          cy.get("[data-cy=add-to-cart-btn]").click();
        });

      // Verify toast notification
      cy.contains("Produk berhasil ditambahkan").should("be.visible");

      // Verify cart count updated
      cy.get("[data-cy=cart-count]").should("contain", "1");

      // Verify cart in localStorage
      cy.window().then((win) => {
        const cartStorage = win.localStorage.getItem("baletani-cart-storage");
        expect(cartStorage).to.exist;
      });
    });

    it("should update cart count when adding multiple items", () => {
      cy.visit("/products");

      // Add first product
      cy.get("[data-cy=product-card]")
        .eq(0)
        .find("[data-cy=add-to-cart-btn]")
        .click();
      cy.wait(500);

      // Add second product
      cy.get("[data-cy=product-card]")
        .eq(1)
        .find("[data-cy=add-to-cart-btn]")
        .click();
      cy.wait(500);

      // Cart count should be 2
      cy.get("[data-cy=cart-count]").should("contain", "2");
    });

    it("should not add out-of-stock product to cart", () => {
      cy.visit("/products");

      // Find out-of-stock product
      cy.get("[data-cy=product-card]")
        .contains("Habis")
        .parents("[data-cy=product-card]")
        .within(() => {
          // Add to cart button should be disabled
          cy.get("[data-cy=add-to-cart-btn]").should("be.disabled");
        });
    });
  });

  describe("Cart Page", () => {
    beforeEach(() => {
      // Add product to cart before each test
      cy.addToCart(testProduct.id, 2);
      cy.visit("/cart");
    });

    it("should display cart items correctly", () => {
      // Verify cart item displayed
      cy.get("[data-cy=cart-item]").should("have.length", 1);

      // Verify product info
      cy.get("[data-cy=cart-item]")
        .first()
        .within(() => {
          cy.get("[data-cy=product-name]").should("contain", testProduct.name);
          cy.get("[data-cy=product-price]").should(
            "contain",
            testProduct.price
          );
          cy.get("[data-cy=quantity-input]").should("have.value", "2");
        });
    });

    it("should update item quantity", () => {
      // Increase quantity
      cy.get("[data-cy=cart-item]")
        .first()
        .within(() => {
          cy.get("[data-cy=quantity-increase]").click();
          cy.get("[data-cy=quantity-input]").should("have.value", "3");
        });

      // Verify subtotal updated
      cy.get("[data-cy=cart-subtotal]").should(
        "contain",
        (testProduct.price * 3).toLocaleString()
      );
    });

    it("should remove item from cart", () => {
      // Click remove button
      cy.get("[data-cy=cart-item]")
        .first()
        .within(() => {
          cy.get("[data-cy=remove-item-btn]").click();
        });

      // Confirm removal
      cy.get("[data-cy=confirm-remove-btn]").click();

      // Verify cart empty
      cy.contains("Keranjang Anda kosong").should("be.visible");
    });

    it("should calculate delivery fee correctly", () => {
      // Delivery fee should be Rp 15.000
      cy.get("[data-cy=delivery-fee]").should("contain", "15.000");

      // Total should include delivery fee
      const expectedTotal = testProduct.price * 2 + 15000;
      cy.get("[data-cy=cart-total]").should(
        "contain",
        expectedTotal.toLocaleString()
      );
    });

    it("should proceed to checkout", () => {
      cy.get("[data-cy=checkout-btn]").click();

      // Should redirect to checkout page
      cy.url().should("include", "/checkout");
    });
  });

  describe("Cart Persistence", () => {
    it("should persist cart after page refresh", () => {
      // Add product to cart
      cy.addToCart(testProduct.id, 2);
      cy.visit("/cart");

      // Verify cart has 1 item
      cy.get("[data-cy=cart-item]").should("have.length", 1);

      // Refresh page
      cy.reload();

      // Cart should still have 1 item
      cy.get("[data-cy=cart-item]").should("have.length", 1);
    });

    it("should sync cart with backend", () => {
      // Add product via API
      cy.addToCart(testProduct.id, 3);

      // Visit cart page
      cy.visit("/cart");

      // Verify quantity matches
      cy.get("[data-cy=quantity-input]").should("have.value", "3");
    });
  });
});
```

---

## 🚀 RUNNING TESTS

### NPM Scripts (`package.json`)

```json
{
  "name": "baletani-e2e-tests",
  "version": "1.0.0",
  "scripts": {
    "cy:open": "cypress open",
    "cy:run": "cypress run",
    "cy:run:customer": "cypress run --spec 'cypress/e2e/customer/**/*.cy.js'",
    "cy:run:auth": "cypress run --spec 'cypress/e2e/customer/01-auth.cy.js'",
    "cy:run:cart": "cypress run --spec 'cypress/e2e/customer/03-cart.cy.js'",
    "cy:run:checkout": "cypress run --spec 'cypress/e2e/customer/04-checkout.cy.js'",
    "test:customer": "start-server-and-test 'cd ../backend && npm run dev' http://localhost:5000 'cd ../frontend && npm run dev' http://localhost:5173 'npm run cy:run:customer'",
    "test:setup": "node scripts/setup-test-db.js"
  },
  "devDependencies": {
    "cypress": "^13.6.0",
    "@faker-js/faker": "^8.3.1",
    "mysql2": "^3.6.5",
    "dotenv": "^16.3.1",
    "start-server-and-test": "^2.0.3"
  }
}
```

---

## 📊 TEST COVERAGE MATRIX

| Feature Area         | Test Cases   | Priority | Status     |
| -------------------- | ------------ | -------- | ---------- |
| **Authentication**   | 8            | ⭐⭐⭐   | 🟡 Pending |
| **Product Browsing** | 10           | ⭐⭐⭐   | 🟡 Pending |
| **Shopping Cart**    | 12           | ⭐⭐⭐   | 🟡 Pending |
| **Checkout**         | 8            | ⭐⭐⭐   | 🟡 Pending |
| **Order History**    | 10           | ⭐⭐⭐   | 🟡 Pending |
| **Profile**          | 7            | ⭐⭐     | 🟡 Pending |
| **Contact**          | 5            | ⭐       | 🟡 Pending |
| **Categories**       | 6            | ⭐⭐     | 🟡 Pending |
| **TOTAL**            | **66 Tests** |          |            |

---

## ✅ NEXT STEPS (Implementation Plan)

### Phase 1: Setup (Day 1)

- [x] Create `e2e-tests/` folder structure
- [ ] Install Cypress & dependencies
- [ ] Configure `cypress.config.js`
- [ ] Create `.env.test`
- [ ] Setup database helper & tasks

### Phase 2: Custom Commands (Day 2)

- [ ] Implement authentication commands
- [ ] Implement cart commands
- [ ] Implement database commands
- [ ] Implement navigation commands
- [ ] Create test fixtures

### Phase 3: Critical Tests (Day 3-5)

- [ ] 01-auth.cy.js (Authentication)
- [ ] 02-browsing.cy.js (Product Browsing)
- [ ] 03-cart.cy.js (Shopping Cart)
- [ ] 04-checkout.cy.js (Checkout)

### Phase 4: Additional Tests (Day 6-7)

- [ ] 05-order-history.cy.js (Order History)
- [ ] 06-profile.cy.js (Profile)
- [ ] 07-contact.cy.js (Contact)
- [ ] 08-categories.cy.js (Categories)

### Phase 5: Documentation & CI/CD (Day 8)

- [ ] Write README.md for e2e-tests
- [ ] Setup GitHub Actions workflow
- [ ] Configure test reporting
- [ ] Add badges to main README

---

## 🎯 SUCCESS CRITERIA

✅ All 66 test cases passing  
✅ Test execution time < 10 minutes  
✅ 95%+ reliability (no flaky tests)  
✅ Database reset working between tests  
✅ Cart persistence tested  
✅ Token expiry tested  
✅ Payment expiry tested  
✅ All critical flows covered  
✅ CI/CD pipeline working

---

## 📞 CONTACT & SUPPORT

**Project:** BaleTani Web  
**Branch:** bagas_E2E  
**Owner:** Babyhex7  
**Created:** November 29, 2025

---

**STATUS:** ✅ **READY TO IMPLEMENT**

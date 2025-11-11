# 📚 API DOCUMENTATION - BaleTani Web

> **Dokumentasi lengkap REST API untuk Backend BaleTani**  
> Base URL: `http://localhost:5000/api`

---

## 📋 TABLE OF CONTENTS

- [Authentication](#authentication)
- [Public Endpoints (Customer)](#public-endpoints-customer)
- [Customer Endpoints (Auth Required)](#customer-endpoints-auth-required)
- [Admin Endpoints (Auth Required)](#admin-endpoints-auth-required)
- [Cache Strategy](#cache-strategy)

---

## 🔐 AUTHENTICATION

### Admin Login

```http
POST /api/admin/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}

Response 200:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "admin": { "id": 1, "username": "admin", "full_name": "Admin" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Customer Register

```http
POST /api/customer/auth/register
Content-Type: application/json

{
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone_number": "08123456789",
  "password": "password123",
  "address": "Jl. Contoh No. 123"
}

Response 201:
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "customer": { "id": 1, "full_name": "John Doe", "email": "john@example.com" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Customer Login

```http
POST /api/customer/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response 200:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "customer": { "id": 1, "full_name": "John Doe", "email": "john@example.com" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 🌐 PUBLIC ENDPOINTS (Customer)

> **No authentication required** - Untuk display produk ke customer/visitor

### 1. Get All Products

```http
GET /api/public/products?page=1&limit=12&search=tomat&category=1&sortBy=price_asc

Query Parameters:
- page: number (default: 1)
- limit: number (default: 12)
- search: string (search by product name)
- category: string (category ID)
- minPrice: number
- maxPrice: number
- sortBy: newest | name_asc | name_desc | price_asc | price_desc

Response 200:
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Tomat Segar",
        "description": "Tomat segar pilihan",
        "price": 15000,
        "stock": 100,
        "category": "Sayuran",
        "image": "/uploads/products/tomat.jpg",
        "discount": {
          "id": 1,
          "name": "Flash Sale 20%",
          "type": "percentage",
          "value": 20,
          "finalPrice": 12000
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 50,
      "items_per_page": 12,
      "has_next_page": true,
      "has_prev_page": false
    }
  },
  "cached": true
}

Cache: 10 menit (600 detik)
Cache Key: customer:products:page:1:limit:12:search::category::minPrice::maxPrice::sortBy:newest
```

### 2. Get Product Detail

```http
GET /api/public/products/:id

Response 200:
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "id": 1,
    "name": "Tomat Segar",
    "description": "Tomat segar pilihan dari petani lokal",
    "price": 15000,
    "stock": 100,
    "category": {
      "id": 1,
      "name": "Sayuran"
    },
    "images": [
      { "id": 1, "url": "/uploads/products/tomat-1.jpg", "order": 1 },
      { "id": 2, "url": "/uploads/products/tomat-2.jpg", "order": 2 }
    ],
    "discount": {
      "id": 1,
      "name": "Flash Sale 20%",
      "type": "percentage",
      "value": 20,
      "finalPrice": 12000,
      "validUntil": "2025-12-31T23:59:59.000Z"
    }
  },
  "cached": false
}

Cache: 15 menit (900 detik)
Cache Key: customer:product:{id}
```

### 3. Get All Categories

```http
GET /api/public/categories

Response 200:
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Sayuran",
      "description": "Sayuran segar pilihan",
      "productsCount": 25
    },
    {
      "id": 2,
      "name": "Buah-buahan",
      "description": "Buah segar berkualitas",
      "productsCount": 18
    }
  ],
  "cached": true
}

Cache: 1 jam (3600 detik)
Cache Key: customer:categories:list
```

### 4. Get Category Detail

```http
GET /api/public/categories/:id

Response 200:
{
  "success": true,
  "message": "Category retrieved successfully",
  "data": {
    "id": 1,
    "name": "Sayuran",
    "description": "Sayuran segar pilihan",
    "productsCount": 25,
    "products": [
      {
        "id": 1,
        "name": "Tomat Segar",
        "price": 15000,
        "image": "/uploads/products/tomat.jpg"
      }
    ]
  },
  "cached": true
}

Cache: 1 jam (3600 detik)
Cache Key: customer:category:{id}
```

### 5. Get All Discounts (Promo)

```http
GET /api/public/discounts

Response 200:
{
  "success": true,
  "message": "Discounts retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Flash Sale 20%",
      "type": "percentage",
      "value": 20,
      "maxDiscount": null,
      "startDate": "2025-11-01T00:00:00.000Z",
      "endDate": "2025-12-31T23:59:59.000Z",
      "productsCount": 15,
      "products": [
        {
          "id": 1,
          "name": "Tomat Segar",
          "description": "Tomat segar pilihan",
          "price": 15000,
          "discountedPrice": 12000,
          "stock": 100,
          "category": "Sayuran",
          "image": "/uploads/products/tomat.jpg"
        }
      ]
    }
  ],
  "cached": true
}

Cache: 30 menit (1800 detik)
Cache Key: customer:discounts:list
```

### 6. Get Discount Detail

```http
GET /api/public/discounts/:id

Response 200:
{
  "success": true,
  "message": "Discount retrieved successfully",
  "data": {
    "id": 1,
    "name": "Flash Sale 20%",
    "type": "percentage",
    "value": 20,
    "description": "Diskon 20% untuk produk pilihan",
    "startDate": "2025-11-01T00:00:00.000Z",
    "endDate": "2025-12-31T23:59:59.000Z",
    "products": [...]
  },
  "cached": false
}

Cache: 30 menit (1800 detik)
Cache Key: customer:discount:{id}
```

---

## 🛒 CUSTOMER ENDPOINTS (Auth Required)

> **Authentication required** - Header: `Authorization: Bearer <token>`

### 1. Get Cart

```http
GET /api/customer/cart
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "product": {
          "id": 1,
          "name": "Tomat Segar",
          "price": 15000,
          "image": "/uploads/products/tomat.jpg"
        },
        "quantity": 2,
        "subtotal": 30000
      }
    ],
    "summary": {
      "totalItems": 2,
      "totalPrice": 30000
    }
  }
}
```

### 2. Add to Cart

```http
POST /api/customer/cart
Authorization: Bearer <token>
Content-Type: application/json

{
  "product_id": 1,
  "quantity": 2
}

Response 201:
{
  "success": true,
  "message": "Product added to cart",
  "data": { ... }
}
```

### 3. Update Cart Item

```http
PUT /api/customer/cart/:itemId
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 3
}

Response 200:
{
  "success": true,
  "message": "Cart updated successfully"
}
```

### 4. Remove from Cart

```http
DELETE /api/customer/cart/:itemId
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "message": "Item removed from cart"
}
```

### 5. Create Order

```http
POST /api/customer/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    { "product_id": 1, "quantity": 2, "price": 15000 }
  ],
  "shipping_address": "Jl. Contoh No. 123",
  "payment_method": "cod",
  "notes": "Kirim pagi"
}

Response 201:
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order_id": "ORD-20251111-001",
    "total": 30000,
    "status": "pending"
  }
}
```

### 6. Get Order History

```http
GET /api/customer/orders?page=1&limit=10&status=completed

Response 200:
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "ORD-20251111-001",
        "date": "2025-11-11T10:00:00.000Z",
        "total": 30000,
        "status": "completed",
        "items": [...]
      }
    ],
    "pagination": { ... }
  }
}
```

### 7. Get Profile

```http
GET /api/customer/profile
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "id": 1,
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone_number": "08123456789",
    "address": "Jl. Contoh No. 123"
  }
}
```

### 8. Update Profile

```http
PUT /api/customer/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "John Updated",
  "phone_number": "08123456789",
  "address": "Jl. Baru No. 456"
}

Response 200:
{
  "success": true,
  "message": "Profile updated successfully"
}
```

---

## 🔧 ADMIN ENDPOINTS (Auth Required)

> **Authentication required** - Header: `Authorization: Bearer <admin-token>`  
> **RBAC enabled** - Requires specific permissions

### PRODUCTS

#### Get All Products (Admin)

```http
GET /api/admin/products?page=1&limit=10&search=tomat
Authorization: Bearer <admin-token>

Response 200:
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Tomat Segar",
        "sku": "TOM-001",
        "price": 15000,
        "stock": 100,
        "is_active": true,
        "category": "Sayuran"
      }
    ],
    "pagination": { ... }
  }
}

Permission Required: view_products
```

#### Create Product

```http
POST /api/admin/products
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data

name: Tomat Segar
description: Tomat pilihan
category_id: 1
selling_price: 15000
total_stock: 100
is_active: true
images: [file1.jpg, file2.jpg]

Response 201:
{
  "success": true,
  "message": "Product created successfully",
  "data": { ... }
}

Permission Required: create_product
Cache Invalidation: customer:products*, customer:featured*
```

#### Update Product

```http
PUT /api/admin/products/:id
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data

Response 200:
{
  "success": true,
  "message": "Product updated successfully"
}

Permission Required: edit_product
Cache Invalidation: customer:products*, customer:featured*, customer:product:{id}
```

#### Delete Product

```http
DELETE /api/admin/products/:id
Authorization: Bearer <admin-token>

Response 200:
{
  "success": true,
  "message": "Product deleted successfully"
}

Permission Required: delete_product
Cache Invalidation: customer:products*, customer:featured*, customer:product:{id}
```

### CATEGORIES

#### Get All Categories (Admin)

```http
GET /api/admin/categories
Authorization: Bearer <admin-token>

Permission Required: view_categories
```

#### Create Category

```http
POST /api/admin/categories
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "category_name": "Sayuran",
  "description": "Sayuran segar"
}

Permission Required: create_category
Cache Invalidation: customer:categories*
```

#### Update Category

```http
PUT /api/admin/categories/:id
Authorization: Bearer <admin-token>

Permission Required: edit_category
Cache Invalidation: customer:categories*, customer:category:{id}, customer:products*
```

#### Delete Category

```http
DELETE /api/admin/categories/:id
Authorization: Bearer <admin-token>

Permission Required: delete_category
Cache Invalidation: customer:categories*, customer:category:{id}, customer:products*
```

### DISCOUNTS

#### Get All Discounts (Admin)

```http
GET /api/admin/discounts?page=1&limit=10
Authorization: Bearer <admin-token>

Permission Required: view_discounts
```

#### Create Discount

```http
POST /api/admin/discounts
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "discount_name": "Flash Sale 20%",
  "discount_type": "percentage",
  "value": 20,
  "start_date": "2025-11-01",
  "end_date": "2025-12-31",
  "product_ids": [1, 2, 3]
}

Permission Required: create_discount
Cache Invalidation: customer:discounts*, customer:featured*, customer:products*
```

#### Update Discount

```http
PUT /api/admin/discounts/:id
Authorization: Bearer <admin-token>

Permission Required: edit_discount
Cache Invalidation: customer:discounts*, customer:discount:{id}, customer:featured*, customer:products*
```

#### Delete Discount

```http
DELETE /api/admin/discounts/:id
Authorization: Bearer <admin-token>

Permission Required: delete_discount
Cache Invalidation: customer:discounts*, customer:featured*, customer:products*
```

#### Toggle Discount Status

```http
PATCH /api/admin/discounts/:id/toggle-status
Authorization: Bearer <admin-token>

Response 200:
{
  "success": true,
  "message": "Discount status updated",
  "data": { "is_active": false }
}

Permission Required: edit_discount
Cache Invalidation: customer:discounts*, customer:featured*, customer:products*
```

### ORDERS

#### Get All Orders (Admin)

```http
GET /api/admin/orders?page=1&status=pending
Authorization: Bearer <admin-token>

Permission Required: view_orders
```

#### Get Order Detail

```http
GET /api/admin/orders/:id
Authorization: Bearer <admin-token>

Permission Required: view_orders
```

#### Update Order Status

```http
PATCH /api/admin/orders/:id/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "processing",
  "notes": "Sedang diproses"
}

Permission Required: edit_order
```

### CUSTOMERS

#### Get All Customers

```http
GET /api/admin/customers?page=1&search=john
Authorization: Bearer <admin-token>

Permission Required: view_customers
```

#### Get Customer Detail

```http
GET /api/admin/customers/:id
Authorization: Bearer <admin-token>

Permission Required: view_customers
```

### USERS (Admin Management)

#### Get All Admins

```http
GET /api/admin/users
Authorization: Bearer <admin-token>

Permission Required: view_users
```

#### Create Admin

```http
POST /api/admin/users
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "username": "admin2",
  "full_name": "Admin Two",
  "email": "admin2@example.com",
  "password": "password123",
  "role_id": 1
}

Permission Required: create_user
```

#### Update Admin

```http
PUT /api/admin/users/:id
Authorization: Bearer <admin-token>

Permission Required: edit_user
```

#### Delete Admin

```http
DELETE /api/admin/users/:id
Authorization: Bearer <admin-token>

Permission Required: delete_user
```

### DASHBOARD

#### Get Dashboard Stats

```http
GET /api/admin/dashboard
Authorization: Bearer <admin-token>

Response 200:
{
  "success": true,
  "data": {
    "totalRevenue": 5000000,
    "totalOrders": 150,
    "totalCustomers": 45,
    "totalProducts": 80,
    "recentOrders": [...],
    "topProducts": [...]
  }
}

Permission Required: view_dashboard
```

---

## ⚡ CACHE STRATEGY

### Cache Keys Pattern

```javascript
// Products
customer:products:page:{page}:limit:{limit}:search:{search}:category:{category}:minPrice:{min}:maxPrice:{max}:sortBy:{sort}
customer:product:{id}
customer:featured:products

// Categories
customer:categories:list
customer:category:{id}

// Discounts
customer:discounts:list
customer:discount:{id}
customer:discount:{id}:products:page:{page}
```

### Cache TTL (Time To Live)

| Endpoint          | TTL              | Invalidation                 |
| ----------------- | ---------------- | ---------------------------- |
| Products List     | 10 menit (600s)  | Admin CRUD product           |
| Product Detail    | 15 menit (900s)  | Admin update/delete product  |
| Featured Products | 15 menit (900s)  | Admin CRUD product/discount  |
| Categories List   | 1 jam (3600s)    | Admin CRUD category          |
| Category Detail   | 1 jam (3600s)    | Admin update/delete category |
| Discounts List    | 30 menit (1800s) | Admin CRUD discount          |
| Discount Detail   | 30 menit (1800s) | Admin update/delete discount |

### Cache Invalidation Patterns

```javascript
// Admin create/update/delete product
PATTERNS.CUSTOMER_PRODUCTS = "customer:product";
PATTERNS.CUSTOMER_FEATURED = "customer:featured";

// Admin create/update/delete category
PATTERNS.CUSTOMER_CATEGORIES = "customer:categor";
PATTERNS.CUSTOMER_PRODUCTS = "customer:product";

// Admin create/update/delete discount
PATTERNS.CUSTOMER_DISCOUNTS = "customer:discount";
PATTERNS.CUSTOMER_FEATURED = "customer:featured";
PATTERNS.CUSTOMER_PRODUCTS = "customer:product";
```

### Cache Monitoring

```http
GET /api/cache/stats

Response 200:
{
  "success": true,
  "data": {
    "keys": 45,
    "hits": 1250,
    "misses": 320,
    "hitRate": "79.62%",
    "ksize": 2048,
    "vsize": 524288
  }
}
```

---

## 🔒 RBAC (Role-Based Access Control)

### Default Roles

1. **Super Admin** - Full access to all features
2. **Admin** - Manage products, orders, customers
3. **Staff** - View-only access to orders and customers

### Permissions List

```javascript
// Products
view_products, create_product, edit_product, delete_product;

// Categories
view_categories, create_category, edit_category, delete_category;

// Discounts
view_discounts, create_discount, edit_discount, delete_discount;

// Orders
view_orders, edit_order;

// Customers
view_customers, edit_customer;

// Users
view_users, create_user, edit_user, delete_user;

// Dashboard
view_dashboard;
```

---

## 📌 Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Invalid input data",
  "errors": {
    "email": "Email is required",
    "password": "Password must be at least 6 characters"
  }
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "You do not have permission to access this resource"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details..."
}
```

---

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- All prices are in Indonesian Rupiah (IDR)
- File uploads max size: 5MB per file
- Supported image formats: JPG, JPEG, PNG, WebP
- Rate limiting: 100 requests per minute per IP
- CORS enabled for frontend domain

---

**Last Updated:** November 11, 2025  
**Version:** 1.0.0  
**Maintained by:** BaleTani Development Team

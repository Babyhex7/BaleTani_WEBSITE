# 📁 Routes Structure Documentation

## Overview

Struktur routes BaleTani API telah direorganisasi untuk pemisahan yang jelas antara Admin, Customer, dan Public routes.

---

## 🗂️ Struktur Folder

```
src/routes/
├── index.js                      ← Main router (semua routes terdaftar di sini)
│
├── admin/                        ← ADMIN ROUTES
│   ├── index.js                  ← Admin main router
│   ├── adminProducts.js          ← Product CRUD
│   ├── categories.js             ← Category CRUD
│   ├── discounts.js              ← Discount CRUD
│   ├── dashboard.js              ← Dashboard & stats
│   └── users.js                  ← Admin user management
│
├── customer/                     ← CUSTOMER ROUTES
│   └── index.js                  ← Customer main router
│
├── public/                       ← PUBLIC ROUTES
│   └── index.js                  ← Public main router
│
├── adminAuth.routes.js           ← Admin authentication
├── customerAuth.routes.js        ← Customer authentication
├── products.js                   ← Public product viewing
└── categories.js                 ← Public category viewing
```

---

## 🌐 Endpoint Structure

### **1. ADMIN Endpoints** (`/api/admin/*`)

**Require:** Admin authentication

#### Authentication

```
POST   /api/admin/auth/login          ← Admin login
GET    /api/admin/auth/profile        ← Get admin profile
POST   /api/admin/auth/logout         ← Admin logout
```

#### Dashboard

```
GET    /api/admin/dashboard/stats            ← Dashboard statistics
GET    /api/admin/dashboard/low-stock        ← Low stock products
GET    /api/admin/dashboard/recent-orders    ← Recent orders
```

#### Products Management

```
GET    /api/admin/products                   ← Get all products (with filters & pagination)
GET    /api/admin/products/:id               ← Get product detail
POST   /api/admin/products                   ← Create new product
PUT    /api/admin/products/:id               ← Update product
DELETE /api/admin/products/:id               ← Soft delete product (super_admin only)
POST   /api/admin/products/:id/restore       ← Restore deleted product (super_admin only)

GET    /api/admin/products/:id/images        ← Get product images
POST   /api/admin/products/:id/images        ← Upload product images (max 5)
PUT    /api/admin/products/:id/images/reorder ← Reorder images
DELETE /api/admin/products/images/:imageId   ← Delete image
```

#### Categories Management

```
GET    /api/admin/categories                 ← Get all categories
GET    /api/admin/categories/:id             ← Get category detail
POST   /api/admin/categories                 ← Create category
PUT    /api/admin/categories/:id             ← Update category
DELETE /api/admin/categories/:id             ← Soft delete category (super_admin only)
POST   /api/admin/categories/:id/restore     ← Restore category (super_admin only)
PATCH  /api/admin/categories/:id/toggle-status ← Toggle active status
```

#### Discounts Management

```
GET    /api/admin/discounts                  ← Get all discounts
GET    /api/admin/discounts/:id              ← Get discount detail
POST   /api/admin/discounts                  ← Create discount
PUT    /api/admin/discounts/:id              ← Update discount
DELETE /api/admin/discounts/:id              ← Soft delete discount (super_admin only)
POST   /api/admin/discounts/:id/restore      ← Restore discount (super_admin only)
PATCH  /api/admin/discounts/:id/toggle-status ← Toggle active status

POST   /api/admin/discounts/:id/products     ← Add products to discount
DELETE /api/admin/discounts/:id/products/:productId ← Remove product from discount
```

#### Users Management

```
GET    /api/admin/users                      ← Get all admin users
GET    /api/admin/users/:id                  ← Get admin user detail
POST   /api/admin/users                      ← Create admin user
PUT    /api/admin/users/:id                  ← Update admin user
DELETE /api/admin/users/:id                  ← Delete admin user
```

---

### **2. CUSTOMER Endpoints** (`/api/customer/*`)

**Require:** Customer authentication (except auth routes)

#### Authentication

```
POST   /api/customer/auth/register           ← Customer registration
POST   /api/customer/auth/login              ← Customer login
GET    /api/customer/auth/profile            ← Get customer profile
POST   /api/customer/auth/logout             ← Customer logout
```

#### Profile Management (TODO)

```
GET    /api/customer/profile                 ← Get profile
PUT    /api/customer/profile                 ← Update profile
```

#### Orders Management (TODO)

```
GET    /api/customer/orders                  ← Get order history
GET    /api/customer/orders/:id              ← Get order detail
POST   /api/customer/orders                  ← Create new order
```

#### Cart Management (TODO)

```
GET    /api/customer/cart                    ← Get cart items
POST   /api/customer/cart                    ← Add to cart
PUT    /api/customer/cart/:id                ← Update cart item
DELETE /api/customer/cart/:id                ← Remove from cart
```

---

### **3. PUBLIC Endpoints** (`/api/public/*`)

**No authentication required**

#### Products (Public View)

```
GET    /api/public/products                  ← Browse all products
GET    /api/public/products/:id              ← View product detail
GET    /api/public/products/featured         ← Get featured products
GET    /api/public/products/search?q=keyword ← Search products
```

#### Categories (Public View)

```
GET    /api/public/categories                ← Get all categories
GET    /api/public/categories/:id            ← Get category detail
GET    /api/public/categories/:id/products   ← Get products by category
```

---

## 🔐 Authentication Flow

### Admin Authentication

1. Admin login via `POST /api/admin/auth/login`
2. Receive JWT token with `type: "admin"`
3. Include token in headers: `Authorization: Bearer <token>`
4. Access admin routes

### Customer Authentication

1. Customer register via `POST /api/customer/auth/register`
2. Customer login via `POST /api/customer/auth/login`
3. Receive JWT token with `type: "customer"`
4. Include token in headers: `Authorization: Bearer <token>`
5. Access customer routes

### Public Routes

- No authentication required
- Anyone can access

---

## 📊 Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Pagination Response

```json
{
  "success": true,
  "message": "Data retrieved",
  "data": {
    "items": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 100,
      "itemsPerPage": 10
    }
  }
}
```

---

## 🎯 Best Practices

1. **Always use the correct base path:**

   - Admin: `/api/admin/*`
   - Customer: `/api/customer/*`
   - Public: `/api/public/*`

2. **Include authentication token for protected routes**

3. **Use proper HTTP methods:**

   - GET: Retrieve data
   - POST: Create new resource
   - PUT: Update entire resource
   - PATCH: Partial update
   - DELETE: Remove resource

4. **Filter and pagination on GET requests:**

   ```
   GET /api/admin/products?page=1&limit=10&search=tomato&category_id=uuid
   ```

5. **Proper error handling:**
   - 400: Bad Request
   - 401: Unauthorized
   - 403: Forbidden
   - 404: Not Found
   - 500: Internal Server Error

---

## 🚀 Testing

### Health Check

```bash
GET /api/health
```

### API Info

```bash
GET /api/
```

---

## 📝 Notes

- All routes are now properly organized by role
- No more confusion between admin and customer routes
- Public routes clearly separated
- Easy to add new endpoints in the correct location
- Scalable structure for future features

---

**Last Updated:** October 24, 2025
**Version:** 1.0.0

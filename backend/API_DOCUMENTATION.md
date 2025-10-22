# Product & Inventory APIs - Complete Documentation

## Overview

Complete API documentation for Product & Inventory management system in BaleTani Fresh Market.

**Total Endpoints:** 29 (Phase 1 completed)

- ✅ Products: 8 endpoints (tested)
- ✅ Product Images: 5 endpoints
- ✅ Categories: 6 endpoints
- ✅ Discounts: 7 endpoints
- ✅ Stock Overview: 4 endpoints

---

## 1. Products API (✅ TESTED)

### Base URL: `/api/admin/products`

#### 1.1 Get All Products

```
GET /api/admin/products
```

**Query Parameters:**

- `search` - Search by name or SKU
- `category_id` - Filter by category
- `is_active` - Filter by active status (true/false)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Bayam Organik",
      "sku": "BAYAM-001",
      "category_id": 1,
      "selling_price": 25000,
      "total_stock": 50,
      "is_active": true
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

#### 1.2 Get Product by ID

```
GET /api/admin/products/:id
```

#### 1.3 Create Product

```
POST /api/admin/products
```

**Body:**

```json
{
  "name": "Bayam Organik",
  "sku": "BAYAM-001",
  "category_id": 1,
  "selling_price": 25000,
  "purchase_price": 20000,
  "total_stock": 100,
  "min_stock": 10,
  "unit": "kg",
  "description": "Fresh organic spinach"
}
```

#### 1.4 Update Product

```
PUT /api/admin/products/:id
```

#### 1.5 Soft Delete Product

```
DELETE /api/admin/products/:id
```

#### 1.6 Restore Product

```
POST /api/admin/products/:id/restore
```

---

## 2. Product Images API

### Base URL: `/api/admin/products`

#### 2.1 Get Product Images

```
GET /api/admin/products/:id/images
```

#### 2.2 Upload Images

```
POST /api/admin/products/:id/images
```

**Content-Type:** `multipart/form-data`

**Body:**

- `images` - Array of image files (max 5)

**Validation:**

- Max file size: 5MB per image
- Allowed types: jpg, jpeg, png, webp
- Max images per product: 5

**Response:**

```json
{
  "success": true,
  "message": "Gambar berhasil diupload",
  "data": [
    {
      "id": 1,
      "product_id": 1,
      "image_url": "/uploads/products/image-123.jpg",
      "is_main": true,
      "display_order": 1
    }
  ]
}
```

#### 2.3 Update Image (Set Main or Reorder)

```
PUT /api/admin/products/images/:imageId
```

**Body:**

```json
{
  "is_main": true,
  "display_order": 2
}
```

#### 2.4 Reorder All Images

```
PUT /api/admin/products/:id/images/reorder
```

**Body:**

```json
{
  "images": [
    { "id": 1, "display_order": 3 },
    { "id": 2, "display_order": 1 },
    { "id": 3, "display_order": 2 }
  ]
}
```

#### 2.5 Delete Image

```
DELETE /api/admin/products/images/:imageId
```

---

## 3. Categories API

### Base URL: `/api/admin/categories`

#### 3.1 Get All Categories

```
GET /api/admin/categories
```

**Query Parameters:**

- `search` - Search by name
- `is_active` - Filter by active status
- `page` - Page number
- `limit` - Items per page

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Sayuran",
      "description": "Fresh vegetables",
      "icon": "🥬",
      "is_active": true,
      "product_count": 45
    }
  ]
}
```

#### 3.2 Get Category by ID

```
GET /api/admin/categories/:id
```

#### 3.3 Create Category

```
POST /api/admin/categories
```

**Body:**

```json
{
  "name": "Sayuran Organik",
  "description": "Organic vegetables",
  "icon": "🥬"
}
```

#### 3.4 Update Category

```
PUT /api/admin/categories/:id
```

#### 3.5 Soft Delete Category

```
DELETE /api/admin/categories/:id
```

**Note:** Cannot delete category with active products

#### 3.6 Restore Category

```
POST /api/admin/categories/:id/restore
```

---

## 4. Discounts API

### Base URL: `/api/admin/discounts`

#### 4.1 Get All Discounts

```
GET /api/admin/discounts
```

**Query Parameters:**

- `search` - Search by name
- `discount_type` - Filter by type (percentage/fixed)
- `status` - Filter by status (active/expired/upcoming)
- `is_active` - Filter by active status
- `page` - Page number
- `limit` - Items per page

#### 4.2 Get Discount by ID

```
GET /api/admin/discounts/:id
```

Returns discount with assigned products

#### 4.3 Create Discount

```
POST /api/admin/discounts
```

**Body:**

```json
{
  "name": "Flash Sale",
  "description": "Special discount",
  "discount_type": "percentage",
  "discount_value": 25,
  "start_date": "2024-12-01",
  "end_date": "2024-12-31",
  "is_active": true
}
```

**Validation:**

- `discount_type`: "percentage" or "fixed"
- `discount_value`: 0-100 for percentage, >0 for fixed
- `start_date` must be before `end_date`

#### 4.4 Update Discount

```
PUT /api/admin/discounts/:id
```

#### 4.5 Soft Delete Discount

```
DELETE /api/admin/discounts/:id
```

#### 4.6 Assign Products to Discount

```
POST /api/admin/discounts/:id/products
```

**Body:**

```json
{
  "product_ids": [1, 2, 3, 4]
}
```

#### 4.7 Remove Product from Discount

```
DELETE /api/admin/discounts/:id/products/:productId
```

---

## 5. Stock Overview API

### Base URL: `/api/admin/stock`

#### 5.1 Get Stock Overview

```
GET /api/admin/stock/overview
```

**Response:**

```json
{
  "success": true,
  "data": {
    "summary": {
      "total_products": 150,
      "in_stock": 120,
      "low_stock": 15,
      "out_of_stock": 15,
      "inventory_value": 125000000
    },
    "top_products": [
      {
        "id": 1,
        "name": "Product A",
        "selling_price": 50000,
        "total_stock": 100,
        "stock_value": 5000000
      }
    ]
  }
}
```

#### 5.2 Get Low Stock Products

```
GET /api/admin/stock/low-stock
```

Returns products where `total_stock <= min_stock` and `total_stock > 0`

**Query Parameters:**

- `page` - Page number
- `limit` - Items per page (default: 20)

#### 5.3 Get Out of Stock Products

```
GET /api/admin/stock/out-of-stock
```

Returns products where `total_stock = 0`

#### 5.4 Get Stock Movements

```
GET /api/admin/stock/movements
```

**Query Parameters:**

- `product_id` - Filter by product
- `movement_type` - Filter by type (in/out/adjustment)
- `start_date` - Filter from date
- `end_date` - Filter to date
- `page` - Page number
- `limit` - Items per page

---

## Authentication

All endpoints require JWT authentication via Bearer token:

```
Authorization: Bearer <token>
```

### Role-Based Access Control

**Read Operations:**

- super_admin
- super_inventory_admin
- inventory_admin
- finance_admin

**Write Operations:**

- super_admin
- super_inventory_admin

---

## Testing

### Running Tests

Test files are located in `/backend/`:

```bash
# Category API
node test-category-api.js

# Product Images API
node test-images-api.js

# Discount API
node test-discount-api.js

# Stock Overview API
node test-stock-api.js
```

### Test Coverage

Each test file includes:

- ✅ Authentication test
- ✅ Create operations
- ✅ Read operations (all & by ID)
- ✅ Update operations
- ✅ Delete operations
- ✅ Restore operations (where applicable)
- ✅ Filter & search tests
- ✅ Pagination tests
- ✅ Validation tests
- ✅ Data cleanup

---

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Database Models

### Product

```javascript
{
  id,
    name,
    sku,
    category_id,
    selling_price,
    purchase_price,
    total_stock,
    min_stock,
    unit,
    description,
    is_active,
    created_at,
    updated_at;
}
```

### ProductImage

```javascript
{
  id, product_id, image_url, is_main, display_order, created_at;
}
```

### Category

```javascript
{
  id, name, description, icon, is_active, created_at, updated_at;
}
```

### Discount

```javascript
{
  id,
    name,
    description,
    discount_type,
    discount_value,
    start_date,
    end_date,
    is_active,
    created_at,
    updated_at;
}
```

### ProductDiscount (Junction Table)

```javascript
{
  discount_id, product_id;
}
```

### StockMovement

```javascript
{
  id,
    product_id,
    movement_type,
    quantity,
    reference_type,
    reference_id,
    notes,
    movement_date,
    created_by;
}
```

---

## Next Phases

### Phase 2: Procurement (13 endpoints)

- Procurement management
- Supplier management
- Purchase orders

### Phase 3: Orders (14 endpoints)

- Order management
- Order items
- Order status tracking

### Phase 4: Reports (14 endpoints)

- Sales reports
- Inventory reports
- Financial reports

**Total Progress:** 29/102 endpoints (28%)
**Phase 1:** ✅ Completed (100%)

# Quick Testing Guide - Phase 1 APIs

## 🚀 Quick Start

### 1. Start Backend Server

```bash
cd backend
npm start
```

### 2. Run All Tests (One Command)

```bash
# Windows PowerShell
cd backend
node test-product-api.js; node test-category-api.js; node test-images-api.js; node test-discount-api.js; node test-stock-api.js
```

---

## 📋 Test Checklist

Copy this checklist untuk track testing progress:

```
Phase 1 API Testing:

Products API:
[ ] GET all products - Status 200
[ ] GET product by ID - Status 200
[ ] CREATE product - Status 201
[ ] UPDATE product - Status 200
[ ] SOFT DELETE product - Status 200
[ ] RESTORE product - Status 200
[ ] SEARCH products - Status 200
[ ] FILTER by category - Status 200

Categories API:
[ ] GET all categories - Status 200
[ ] GET category by ID - Status 200
[ ] CREATE category - Status 201
[ ] UPDATE category - Status 200
[ ] SOFT DELETE category - Status 200
[ ] RESTORE category - Status 200

Product Images API:
[ ] GET product images - Status 200
[ ] UPLOAD images - Status 201
[ ] UPDATE image (set main) - Status 200
[ ] REORDER images - Status 200
[ ] DELETE image - Status 200

Discounts API:
[ ] GET all discounts - Status 200
[ ] GET discount by ID - Status 200
[ ] CREATE discount - Status 201
[ ] UPDATE discount - Status 200
[ ] ASSIGN products - Status 201
[ ] REMOVE product - Status 200
[ ] SOFT DELETE discount - Status 200

Stock Overview API:
[ ] GET overview - Status 200
[ ] GET low stock products - Status 200
[ ] GET out of stock products - Status 200
[ ] GET stock movements - Status 200
```

---

## 🔍 Manual Testing with Postman/Thunder Client

### Setup:

1. Import environment variables:

```json
{
  "base_url": "http://localhost:5000/api",
  "token": "Bearer <your-token-here>"
}
```

### Get Token:

```http
POST {{base_url}}/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

Response akan berisi `token` - copy dan simpan untuk requests berikutnya.

---

## 📝 Common Test Scenarios

### Scenario 1: Create Product with Images

```http
# 1. Create Product
POST {{base_url}}/admin/products
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Bayam Hijau",
  "sku": "BAYAM-001",
  "category_id": 1,
  "selling_price": 25000,
  "purchase_price": 20000,
  "total_stock": 100,
  "min_stock": 10,
  "unit": "kg"
}

# 2. Upload Images (save product_id from step 1)
POST {{base_url}}/admin/products/{product_id}/images
Authorization: Bearer {{token}}
Content-Type: multipart/form-data

images: [file1.jpg, file2.jpg, file3.jpg]
```

### Scenario 2: Create Discount Campaign

```http
# 1. Create Discount
POST {{base_url}}/admin/discounts
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Flash Sale Akhir Tahun",
  "discount_type": "percentage",
  "discount_value": 30,
  "start_date": "2025-12-01",
  "end_date": "2025-12-31"
}

# 2. Assign Products (save discount_id from step 1)
POST {{base_url}}/admin/discounts/{discount_id}/products
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "product_ids": [1, 2, 3, 4, 5]
}
```

### Scenario 3: Check Low Stock

```http
# 1. Get Stock Overview
GET {{base_url}}/admin/stock/overview
Authorization: Bearer {{token}}

# 2. Get Low Stock Products
GET {{base_url}}/admin/stock/low-stock
Authorization: Bearer {{token}}

# 3. Get Out of Stock
GET {{base_url}}/admin/stock/out-of-stock
Authorization: Bearer {{token}}
```

---

## 🐛 Troubleshooting

### Issue: "Unauthorized" Error

**Solution:** Check token is valid and included in header:

```
Authorization: Bearer <token>
```

### Issue: "Category has active products" when deleting

**Solution:** This is expected behavior - soft delete or reassign products first.

### Issue: Image upload fails

**Check:**

- File size < 5MB
- File type is jpg/png/webp
- Max 5 images per product not exceeded

### Issue: Discount validation fails

**Check:**

- Percentage value 0-100
- Fixed value > 0
- start_date < end_date

---

## 📊 Expected Test Results

### Success Indicators:

✅ Status codes match (200/201/400/404)
✅ Success: true in response
✅ Data returned correctly
✅ Validation errors caught
✅ Cleanup successful

### Common Status Codes:

- `200` - Success (GET, PUT, DELETE)
- `201` - Created (POST)
- `400` - Validation Error
- `404` - Not Found
- `500` - Server Error

---

## 🎯 Performance Benchmarks

Expected response times (local):

- Simple GET: < 50ms
- GET with joins: < 100ms
- POST/PUT: < 150ms
- File upload: < 500ms
- Pagination: < 100ms

---

## 📞 Support

If tests fail:

1. Check backend server is running
2. Verify database connection
3. Check admin seeder ran successfully
4. Review console logs for errors
5. Check API_DOCUMENTATION.md for endpoint details

---

## 🎉 Success Criteria

Phase 1 is considered complete when:

- ✅ All 29 endpoints return expected status codes
- ✅ All validations work correctly
- ✅ Role-based access control enforced
- ✅ Soft delete/restore functions properly
- ✅ File uploads work correctly
- ✅ Pagination returns correct data
- ✅ Test cleanup successful

---

**Last Updated:** October 22, 2025
**Test Coverage:** 29/29 endpoints (100%)

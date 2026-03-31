# Quick Testing Guide - BaleTani Stock Movement System

## Test 1: Verify Offline Products Are Hidden

### Using API:
```bash
# Customer view (should NOT show offline products)
curl http://localhost:3000/api/public/products

# Expected: Only products with product_type: "online" shown

# Admin view (should show ALL products)
# First login as admin, then:
curl -H "Authorization: Bearer {admin_token}" \
  http://localhost:3000/api/admin/products

# Expected: Both online and offline products visible
```

### Using Frontend:
1. Go to homepage as guest/customer
2. Browse products - should only see "online" products
3. Log in as admin
4. Go to admin dashboard → Products
5. Should see all products including offline ones

---

## Test 2: Create Order with Decimal Quantity

### Step 1: Get Product ID
```bash
curl http://localhost:3000/api/public/products
# Note the product_id of tomato or another product
```

### Step 2: Create Order with Decimal Quantity

**Request**:
```bash
curl -X POST http://localhost:3000/api/customer/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {customer_token}" \
  -d '{
    "items": [
      {
        "product_id": "prod-uuid-here",
        "quantity": 0.5
      }
    ],
    "payment_method": "transfer",
    "payment_bank": "BRI"
  }'
```

**Success Response**:
```json
{
  "success": true,
  "data": {
    "order_id": "order-uuid",
    "order_number": "ORD-20240101-0001",
    "order_items": [
      {
        "quantity": 0.5,
        "product_name": "Tomato",
        "subtotal": 5000
      }
    ],
    "total_amount": 5000,
    "status": "pending"
  }
}
```

---

## Test 3: Verify Stock Movement Was Logged

### Check Stock History Endpoint:

**Request**:
```bash
curl -H "Authorization: Bearer {admin_token}" \
  'http://localhost:3000/api/admin/products/{product-id}/stock-history'
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "prod-uuid",
      "name": "Tomato",
      "total_stock": 9.5
    },
    "movements": [
      {
        "id": "movement-uuid",
        "product_id": "prod-uuid",
        "movement_type": "sale_out",
        "quantity_change": -0.5,
        "stock_before": 10,
        "stock_after": 9.5,
        "reference_type": "order",
        "reference_id": "order-uuid",
        "created_by": "customer-uuid",
        "created_at": "2024-01-01T12:00:00Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 20
    }
  }
}
```

### Check Stock Summary:

**Request**:
```bash
curl -H "Authorization: Bearer {admin_token}" \
  'http://localhost:3000/api/admin/products/{product-id}/stock-summary'
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "product_id": "prod-uuid",
    "product_name": "Tomato",
    "current_stock": 9.5,
    "summary": {
      "procurement_in": {
        "total_quantity": 1000,
        "count": 5
      },
      "sale_out": {
        "total_quantity": 0.5,
        "count": 1
      },
      "adjustment": {
        "total_quantity": 0,
        "count": 0
      },
      "expired": {
        "total_quantity": 0,
        "count": 0
      }
    }
  }
}
```

---

## Test 4: Procurement Stock Movement (Verify Auto-Logging)

### Create Procurement with Decimal Quantity:

**Request**:
```bash
curl -X POST http://localhost:3000/api/admin/procurements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {admin_token}" \
  -d '{
    "procurement_date": "2024-01-01",
    "procurement_type": "online",
    "supplier_name": "Fresh Supplier",
    "items": [
      {
        "product_id": "prod-uuid",
        "quantity": 0.75,
        "unit_price": 5000,
        "expiry_date": "2024-02-01"
      }
    ]
  }'
```

### Verify Stock Movement Was Created:

Check stock-history again - now should show both procurement_in and sale_out:
```bash
curl -H "Authorization: Bearer {admin_token}" \
  'http://localhost:3000/api/admin/products/{product-id}/stock-history'

# Expected: movements array should have 2 entries
# 1. procurement_in: +0.75
# 2. sale_out: -0.5
```

---

## Test 5: Public Stock Status (Customer View)

**Request** (No authentication required):
```bash
curl 'http://localhost:3000/api/public/products/{product-id}/stock-status'
```

**Expected Response** (Non-sensitive data only):
```json
{
  "success": true,
  "data": {
    "product_id": "prod-uuid",
    "product_name": "Tomato",
    "current_stock": 9.5,
    "is_in_stock": true,
    "recent_sales_count": 1,
    "last_sale_date": "2024-01-01T12:00:00Z"
  }
}
```

⚠️ **Important**: Notice no sensitive fields like purchase prices, supplier info, etc.

---

## Test 6: Advanced Stock Movement Reporting

**Request** (Inventory/Finance admin only):
```bash
curl -H "Authorization: Bearer {admin_token}" \
  'http://localhost:3000/api/admin/reports/stock-movements' \
  '?movement_type=sale_out' \
  '&date_from=2024-01-01' \
  '&date_to=2024-12-31' \
  '&limit=20'
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "movements": [
      {
        "id": "movement-uuid",
        "product_id": "prod-uuid",
        "product_name": "Tomato",
        "movement_type": "sale_out",
        "quantity_change": -0.5,
        "stock_before": 10,
        "stock_after": 9.5,
        "reference_type": "order",
        "reference_id": "order-uuid",
        "order_number": "ORD-20240101-0001",
        "created_by": "customer-uuid",
        "created_at": "2024-01-01T12:00:00Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 20
    }
  }
}
```

---

## Troubleshooting

### If stock movement isn't logged:
1. Check if stockMovementService was imported correctly
2. Check backend console for any errors in try-catch
3. Verify StockMovement model exists in database
4. Check if migration was applied

### If decimal quantity not working:
1. Verify parseFloat(item.quantity) is converting correctly
2. Check if database storing DECIMAL correctly (use phpMyAdmin)
3. Verify product.total_stock calculation: `currentStock - quantity`

### If endpoints return 404:
1. Verify routes imported in admin/index.js, public/index.js, reports.js
2. Check if stockMovement.controller is imported
3. Verify middleware authenticate/authorize are correct

### If roles not working:
1. Admin must have role_name: "super_admin", "super_inventory_admin", or "inventory_admin"
2. Check Auth token is valid and includes user.id
3. Verify role middleware is applied

---

## Test Data Prep

If you need test data, use existing seeds:
```bash
# Reset database and seed
cd backend
npm run db:seed

# Or just add one offline product manually
cd backend
node -e "
const { Product, Category } = require('./src/models');
(async () => {
  const cat = await Category.findOne();
  await Product.create({
    name: 'Offline Test Product',
    product_type: 'offline',
    is_active: true,
    category_id: cat.id,
    total_stock: 100,
    selling_price: 5000
  });
  console.log('✅ Offline product created');
})();
"
```

---

## Success Checklist

- [ ] Offline products not visible in /api/public/products
- [ ] Offline products visible in /api/admin/products
- [ ] Order with 0.5 quantity creates successfully
- [ ] Order subtotal calculated correctly (price * 0.5)
- [ ] Stock reduced by 0.5 (9.5 remaining)
- [ ] Stock movement appears in /stock-history
- [ ] Movement shows quantity_change: -0.5
- [ ] Stock summary shows sale_out total
- [ ] Procurement logging works (auto-creates procurement_in)
- [ ] Public stock status returns limited data
- [ ] Advanced reporting shows all movements

---

## Example cURL Commands (Copy-Paste Compatible)

### 1. Get Products (Customer View)
```bash
curl http://localhost:3000/api/public/products
```

### 2. Login as Admin
```bash
curl -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone_number":"62812345678","password":"admin12345"}'
```

### 3. Create Order (Requires customer token)
```bash
# First get customer token by logging in customer account
curl -X POST http://localhost:3000/api/customer/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone_number":"08123456789","password":"password123"}'

# Then use returned token in order creation
curl -X POST http://localhost:3000/api/customer/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "items": [{"product_id":"prod-id","quantity":0.5}],
    "payment_method":"transfer",
    "payment_bank":"BRI"
  }'
```

### 4. Check Stock History (Admin)
```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  'http://localhost:3000/api/admin/products/PRODUCT_ID/stock-history'
```

---

## Notes

1. **Decimal Precision**: All quantities are stored with 2 decimal places
2. **Stock Movements**: Are created async after transaction commit (non-blocking)
3. **Permissions**: Admin must have correct role to view stock history
4. **Database**: Make sure StockMovement table exists (run migrations)
5. **Token Expiry**: Tokens might expire; refresh if you get 401 Unauthorized

---

## Support

If tests fail:
1. Check backend logs: `npm run dev` console output
2. Verify routes are registered: Check routes files for imports
3. Verify service is imported: Check customerOrder.controller.js top
4. Check database: StockMovement table exists and can INSERT

# 📦 Customer Purchase History - BaleTani Fresh Market

## 🎯 Overview

Fitur **Purchase History (Riwayat Pembelian)** yang lengkap untuk customer dengan integrasi Frontend, Backend, dan Database. Dilengkapi dengan filter canggih, detail order, timeline status, dan fitur reorder.

---

## 📋 Features

### ✅ Implemented Features

1. **Statistics Dashboard**

   - Total Orders
   - Total Spending
   - Completed Orders
   - Pending/Processing Orders

2. **Advanced Filters**

   - Search by order number or product name
   - Filter by status (Pending, Processing, Completed, Cancelled)
   - Filter by date range (7 days, 30 days, 90 days)
   - Sort by (Newest, Oldest, Highest Price, Lowest Price)

3. **Order List View**

   - Card-based design
   - Product thumbnails
   - Order summary
   - Quick actions (View Detail, Reorder)

4. **Order Detail Modal**

   - Full order information
   - Status timeline with history
   - Shipping information
   - Product list with images
   - Payment breakdown
   - Virtual Account details (for bank transfer)
   - Action buttons (Contact Seller, Reorder, Cancel)

5. **Payment Integration**

   - Virtual Account generation (BRI, BCA, MANDIRI)
   - Payment status tracking
   - VA expiry time (24 hours)

6. **Quick Actions**
   - **Beli Lagi**: Re-add all items to cart
   - **Batalkan Pesanan**: Cancel order (if pending/paid)
   - **Hubungi Penjual**: WhatsApp integration

---

## 🗂️ File Structure

### Backend

```
backend/
├── scripts/
│   └── createOrderPaymentTables.js       # Migration script
├── src/
│   ├── models/
│   │   ├── paymentDetail.model.js        # Payment model
│   │   └── index.js                      # Model associations
│   ├── controllers/
│   │   └── customerOrderHistory.controller.js  # Order history controller
│   └── routes/
│       └── customer/
│           └── order.routes.js           # Order routes
```

### Frontend

```
frontend/src/
├── components/ui_customer/
│   ├── OrderStats.jsx                    # Statistics cards
│   ├── OrderFilters.jsx                  # Filter component
│   ├── OrderCard.jsx                     # Single order card
│   └── OrderDetailModal.jsx              # Detail modal
├── pages/customer/
│   ├── PurchaseHistory.jsx               # Main page
│   └── ProfilePage.jsx                   # Updated with navigation
├── services/services_customer/
│   └── orderHistoryService.js            # API client
└── App.jsx                               # Route configuration
```

---

## 🚀 Installation & Setup

### 1. Run Database Migration

```bash
cd backend
node scripts/createOrderPaymentTables.js
```

This will:

- Create `payment_details` table
- Update `orders` table with new fields
- Create/update `order_status_history` table
- Update `order_items` table
- Add performance indexes

### 2. Backend Setup

Make sure your `.env` has:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=baletani_db
DB_PORT=3306
```

### 3. Start Backend Server

```bash
cd backend
npm install
npm run dev
```

### 4. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 📡 API Endpoints

### Get Order History

```http
GET /api/customer/orders/history
Query Parameters:
  - search: string (order number or product name)
  - status: string (pending_payment, paid, processing, completed, cancelled)
  - date_range: string (7, 30, 90)
  - sort: string (newest, oldest, highest, lowest)
  - page: number
  - limit: number
```

### Get Order Detail

```http
GET /api/customer/orders/history/:id
```

### Reorder Items

```http
POST /api/customer/orders/:id/reorder
```

### Cancel Order

```http
PUT /api/customer/orders/:id/cancel
Body: { "reason": "string" }
```

---

## 🎨 UI Components

### OrderStats

Displays 4 statistics cards:

- Total Orders (blue)
- Total Spending (green)
- Completed Orders (emerald)
- Pending Orders (orange)

### OrderFilters

Filter bar with:

- Search input
- Status dropdown
- Date range selector
- Sort options
- Active filter tags
- Reset button

### OrderCard

Order card showing:

- Order number & date
- Status badge
- Product list (max 3 items)
- Payment method
- Total amount
- Action buttons

### OrderDetailModal

Full-screen modal with:

- Order header
- Status timeline
- Shipping information
- Product list
- Payment details & VA
- Status history
- Action buttons

---

## 🔐 Virtual Account

### VA Generation

Format: `[BANK_CODE][TIMESTAMP][RANDOM]`

- BRI: 002
- BCA: 014
- MANDIRI: 008

Example: `002202511061234567890123`

### VA Expiry

- Default: 24 hours from order creation
- Displayed in modal
- Red text warning

---

## 🎯 Usage Flow

### Customer Journey

1. **Access Page**: Navigate to Profile → "Pesanan Saya"
2. **View Orders**: See order list with filters
3. **Search/Filter**: Use filters to find specific orders
4. **View Detail**: Click "Lihat Detail" for full information
5. **Reorder**: Click "Beli Lagi" to add items to cart
6. **Contact**: Click "Hubungi Penjual" for WhatsApp
7. **Cancel**: Cancel order if status allows

### Order Status Flow

```
pending_payment → paid → processing → out_for_delivery → completed
                                ↘ cancelled
```

---

## 💾 Database Schema

### payment_details

```sql
- id (PK)
- order_id (FK → orders)
- payment_method (enum)
- bank_name (enum)
- virtual_account (string)
- account_name (string)
- payment_status (enum)
- amount (decimal)
- paid_at (datetime)
- expired_at (datetime)
- created_at, updated_at
```

### orders (updated fields)

```sql
- order_type (enum)
- shipping_method (enum)
- shipping_address (text)
- shipping_cost (decimal)
- discount_amount (decimal)
- service_fee (decimal)
- customer_notes (text)
- admin_notes (text)
- cancelled_reason (text)
- cancelled_at (datetime)
- completed_at (datetime)
```

---

## 🧪 Testing Checklist

### Backend

- [ ] Migration runs successfully
- [ ] All endpoints return correct data
- [ ] Pagination works
- [ ] Filters work correctly
- [ ] Reorder adds items to cart
- [ ] Cancel order updates status

### Frontend

- [ ] Page loads without errors
- [ ] Stats display correctly
- [ ] Filters update results
- [ ] Search works
- [ ] Pagination works
- [ ] Modal opens with correct data
- [ ] Reorder confirmation works
- [ ] Cancel order confirmation works
- [ ] Toast notifications appear
- [ ] Responsive on mobile

---

## 🎨 Design Guidelines

### Colors

- Primary: Green (#10b981)
- Success: Emerald (#059669)
- Warning: Orange (#f59e0b)
- Error: Red (#ef4444)
- Info: Blue (#3b82f6)

### Typography

- Font: Inter
- Heading: Bold 24px
- Subheading: Semibold 18px
- Body: Regular 14px
- Caption: Regular 12px

### Spacing

- Page padding: 32px
- Card padding: 20px
- Section gap: 24px
- Element gap: 12px

---

## 📱 Responsive Breakpoints

- Mobile: < 640px (1 column)
- Tablet: 640px - 1024px (2 columns)
- Desktop: > 1024px (2 columns, wider cards)

---

## 🔧 Troubleshooting

### Backend Issues

**Error: Table already exists**

- Drop tables manually or modify migration script
- Check database connection

**Error: Column not found**

- Ensure migration ran successfully
- Check model definitions

### Frontend Issues

**Orders not loading**

- Check API endpoint
- Verify authentication token
- Check browser console for errors

**Modal not showing detail**

- Check API response format
- Verify order ID is correct

---

## 🚀 Future Enhancements

- [ ] Download invoice/receipt (PDF)
- [ ] Order rating & review system
- [ ] Live order tracking with map
- [ ] In-app chat with seller
- [ ] Push notifications
- [ ] Export order history (Excel/CSV)
- [ ] Bulk reorder multiple orders
- [ ] Order templates/favorites
- [ ] Loyalty points display

---

## 📞 Support

For issues or questions, contact:

- Email: support@baletani.com
- WhatsApp: +62 812-3456-7890

---

## 📝 License

© 2025 BaleTani Fresh Market. All rights reserved.

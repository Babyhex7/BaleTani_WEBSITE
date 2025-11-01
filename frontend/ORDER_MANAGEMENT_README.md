# Order Management System

## 📋 Overview

Sistem manajemen order yang menggabungkan **Sales** dan **Transaction** menjadi satu menu **Orders** yang komprehensif untuk mengelola semua pesanan online dan offline.

## ✨ Fitur Utama

### 1. **Order List Management**

- ✅ Tampilan table dengan pagination
- ✅ Filter by order type (online/offline)
- ✅ Filter by order status (pending_payment, paid, processing, shipped, delivered, cancelled)
- ✅ Filter by payment status (unpaid, paid, refunded)
- ✅ Filter by payment method (cash, transfer, e-wallet)
- ✅ Filter by delivery method (pickup, delivery)
- ✅ Filter by date range
- ✅ Search by order number, customer name, phone

### 2. **Statistics Dashboard**

- 📊 Total Orders
- 💰 Total Revenue
- 🛒 Online Orders Count
- 📋 Offline Orders Count
- 📈 Statistics by Status
- 💳 Statistics by Payment
- 🏷️ Statistics by Type

### 3. **Order Detail View**

- 👤 Customer Information
- 📦 Order Items dengan pricing detail
- 🚚 Delivery Information
- 💳 Payment Information
- 📝 Admin Notes
- 🕐 Status History
- 🖼️ Payment Proof (jika ada)

### 4. **Order Status Management**

- ✏️ Update Order Status
- 💰 Update Payment Status
- 📝 Add Admin Notes
- ❌ Cancel Order dengan alasan

## 🗂️ Struktur File

### Pages

```
frontend/src/pages/admin/
└── OrderManagement.jsx         # Main page untuk order management
```

### Components

```
frontend/src/components/ui_admin/
├── OrderTable.jsx              # Reusable table component
├── OrderFilters.jsx            # Reusable filter panel
├── OrderDetailModal.jsx        # Modal detail order
├── UpdateStatusModal.jsx       # Modal update status
├── StatisticsCard.jsx          # Card untuk statistics
└── Pagination.jsx              # Pagination component (existing)
```

### Services

```
frontend/src/services/
└── orderService.js             # API service untuk orders
```

### Data

```
frontend/src/data/
└── dummyOrders.js             # Dummy data untuk testing
```

## 🎨 Component Details

### OrderManagement (Main Page)

**Props:** None (standalone page)

**Features:**

- Toggle antara dummy data dan real API
- Statistics cards di atas
- Search & filter panel
- Order table dengan pagination
- Export functionality (coming soon)
- Refresh data

**State Management:**

- orders, statistics, loading, error
- pagination (currentPage, totalPages, totalItems, limit)
- filters (order_status, payment_status, order_type, payment_method, delivery_method, date_from, date_to, search)
- modals (selectedOrder, showDetailModal, showStatusModal, showFilters)

### OrderTable

**Props:**

- `orders` (array): List of orders
- `loading` (boolean): Loading state
- `onViewDetail` (function): Callback untuk view detail
- `onUpdateStatus` (function): Callback untuk update status

**Features:**

- Status badges dengan warna
- Format currency IDR
- Format tanggal Indonesia
- Action buttons (View, Edit)

### OrderFilters

**Props:**

- `filters` (object): Current filter values
- `onFilterChange` (function): Callback untuk perubahan filter
- `onReset` (function): Callback untuk reset filters

**Features:**

- 8 filter options
- Date range picker
- Reset button

### OrderDetailModal

**Props:**

- `orderId` (string): ID order yang akan ditampilkan
- `useDummyData` (boolean): Toggle dummy/real data
- `onClose` (function): Callback untuk close modal
- `onUpdateStatus` (function): Callback untuk update status

**Features:**

- Customer info lengkap
- Delivery info (jika delivery)
- Payment info + proof
- Order items dengan pricing
- Order summary dengan total
- Admin notes
- Status history timeline

### UpdateStatusModal

**Props:**

- `order` (object): Order object
- `useDummyData` (boolean): Toggle dummy/real data
- `onClose` (function): Callback untuk close
- `onSuccess` (function): Callback setelah berhasil update

**Features:**

- Update order status
- Update payment status
- Add notes
- Cancel order dengan confirmation
- Validation

### StatisticsCard

**Props:**

- `title` (string): Title card
- `value` (string/number): Value to display
- `icon` (Component): Lucide icon component
- `color` (string): Color variant (blue, green, purple, orange, red)

**Features:**

- Responsive design
- Icon dengan background warna
- Clean typography

## 🔌 API Integration

### Endpoints Used

```javascript
GET    /api/admin/orders                    # Get all orders
GET    /api/admin/orders/statistics         # Get statistics
GET    /api/admin/orders/:id                # Get order detail
PUT    /api/admin/orders/:id/status         # Update status
PUT    /api/admin/orders/:id/notes          # Update notes
PUT    /api/admin/orders/:id/cancel         # Cancel order
```

### Query Parameters

```javascript
{
  page: 1,
  limit: 10,
  order_status: 'paid',
  payment_status: 'paid',
  order_type: 'online',
  payment_method: 'transfer',
  delivery_method: 'delivery',
  date_from: '2025-11-01',
  date_to: '2025-11-30',
  search: 'ORD-001',
  sort_by: 'created_at',
  sort_order: 'DESC'
}
```

## 🎯 Usage Example

### 1. Add Route

```jsx
// App.jsx atau routes
import OrderManagement from "./pages/admin/OrderManagement";

<Route path="/admin/orders" element={<OrderManagement />} />;
```

### 2. Update Navbar

```jsx
// Ganti menu "Sales" dan "Transaction" dengan 1 menu "Orders"
{
  label: "Orders",
  path: "/admin/orders",
  icon: Package
}
```

### 3. Toggle Dummy/Real Data

```jsx
// Di OrderManagement component
const [useDummyData, setUseDummyData] = useState(true);

// Checkbox untuk toggle
<input
  type="checkbox"
  checked={useDummyData}
  onChange={(e) => setUseDummyData(e.target.checked)}
/>;
```

## 🧪 Testing dengan Dummy Data

### Dummy Data Available

- **dummyOrders**: 6 sample orders (mix online/offline, berbagai status)
- **dummyOrderDetail**: 1 detailed order dengan items, customer, history
- **dummyStatistics**: Sample statistics data

### How to Test

1. Set `useDummyData = true`
2. Component akan menggunakan data dari `dummyOrders.js`
3. Semua fitur berfungsi kecuali tidak tersimpan ke database
4. Cocok untuk testing UI/UX

## 🔄 Migration dari Real API

### Step 1: Pastikan Database Running

```bash
# Start MySQL/MariaDB service
```

### Step 2: Set useDummyData = false

```javascript
const [useDummyData, setUseDummyData] = useState(false);
```

### Step 3: Pastikan Token Ada

```javascript
// Token admin harus tersimpan di localStorage/sessionStorage
// Check di api.js interceptor
```

## 🎨 Styling

### Color Scheme

- **Blue**: Primary actions, online orders
- **Green**: Success, delivered, paid
- **Yellow**: Warning, pending
- **Red**: Danger, cancelled, unpaid
- **Purple**: Processing
- **Orange**: Offline orders
- **Gray**: Neutral, refunded

### Icons (Lucide React)

- Package, ShoppingCart, TrendingUp, Calendar
- User, MapPin, CreditCard, Clock, FileText
- Eye, Edit, Search, Filter, Download, RefreshCw
- X, AlertCircle, ChevronLeft, ChevronRight

## 📱 Responsive Design

- Desktop: Full layout dengan semua kolom
- Tablet: Optimized table columns
- Mobile: Card view (consider implementing)

## ✅ Checklist

### Backend ✅

- [x] Database migrations
- [x] Models (Order, OrderItem, OrderStatusHistory)
- [x] Controller dengan 6 functions
- [x] Routes dengan authentication
- [x] API tests ready

### Frontend ✅

- [x] OrderManagement page
- [x] OrderTable component
- [x] OrderFilters component
- [x] OrderDetailModal component
- [x] UpdateStatusModal component
- [x] StatisticsCard component
- [x] orderService API integration
- [x] Dummy data untuk testing

### Integration ⏳

- [ ] Test dengan real backend API
- [ ] Fix bugs if any
- [ ] Add export feature
- [ ] Add print invoice feature

## 🚀 Next Steps

1. **Test Database Connection**

   - Pastikan MySQL/MariaDB running
   - Test backend endpoints

2. **Integrate dengan Navbar**

   - Replace Sales & Transaction dengan Orders
   - Update routing

3. **Testing**

   - Test semua fitur dengan dummy data
   - Test dengan real API
   - Test edge cases

4. **Enhancements**
   - Add export to Excel/PDF
   - Add print invoice
   - Add email notification
   - Add WhatsApp integration

## 📞 Support

Jika ada error atau pertanyaan:

1. Check console untuk error messages
2. Check network tab untuk API responses
3. Verify database connection
4. Check authentication token

---

**Created**: November 1, 2025  
**Version**: 1.0.0  
**Status**: Ready for Testing 🎉

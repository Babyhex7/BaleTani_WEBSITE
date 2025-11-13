# 📊 Reports & Analytics Feature - BaleTani Fresh Market

## 🎯 Overview

Fitur **Reports & Analytics** yang lengkap dengan 4 jenis laporan untuk analisis bisnis: Sales Report, Procurement Report, Stock Movement Report, dan Finance Report.

---

## ✨ Features

### ✅ Complete Reports

1. **Sales Report (Laporan Penjualan)**
   - Summary: Total Orders, Total Revenue, Average Order Value
   - Grafik penjualan (harian/bulanan)
   - Top selling products
   - Payment method breakdown
   - Detail order (max 100 terakhir)
   - Filter: Date range, Group by (daily/monthly), Top products limit

2. **Procurement Report (Laporan Pengadaan)**
   - Summary: Total Procurements, Total Amount
   - Tren pembelian bulanan
   - Breakdown per supplier
   - Top procured products
   - Recent procurements (max 50)
   - Filter: Date range, Supplier name, Status (all/approved/pending/rejected)

3. **Stock Movement Report (Laporan Pergerakan Stok)**
   - Summary per movement type (In, Out, Adjustment)
   - Product-wise summary (Top 20)
   - Detail stock movements (max 500)
   - Filter: Date range, Product, Movement type, Limit

4. **Finance Report (Laporan Keuangan)**
   - Summary: Total Revenue, Total Cost, Gross Profit, Profit Margin
   - Monthly comparison (Revenue vs Cost)
   - Visual comparison bars
   - Detailed monthly table with profit analysis
   - Filter: Date range (default: last 12 months)

---

## 🗂️ File Structure

### Backend

```
backend/
├── src/
│   ├── controllers/
│   │   └── adminReport.controller.js         # Complete report controller (4 endpoints)
│   └── routes/
│       └── admin/
│           ├── reports.js                    # Report routes
│           └── index.js                      # Updated with report routes
```

### Frontend

```
frontend/src/
├── components/ui_admin/
│   ├── SalesReport.jsx                       # Sales report with charts
│   ├── ProcurementReport.jsx                 # Procurement report
│   ├── StockMovementReport.jsx               # Stock movement report
│   └── FinanceReport.jsx                     # Finance report with profit analysis
├── pages/admin/
│   └── ReportsPage.jsx                       # Main reports page with tabs
├── components/layout_admin/
│   └── AdminSidebarNew.jsx                   # Updated with Reports menu
└── App.jsx                                   # Updated with /admin/reports route
```

---

## 🚀 API Endpoints

### 1. Sales Report
```
GET /api/admin/reports/sales
Query Params:
  - startDate (optional): Start date YYYY-MM-DD, default: 30 days ago
  - endDate (optional): End date YYYY-MM-DD, default: today
  - groupBy (optional): 'daily' or 'monthly', default: 'daily'
  - limit (optional): Number of top products, default: 10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "dateRange": { "start": "2025-10-13", "end": "2025-11-13" },
    "summary": {
      "totalOrders": 150,
      "totalRevenue": 75000000,
      "averageOrderValue": 500000
    },
    "chartData": [
      { "date": "2025-11-13", "orderCount": 12, "revenue": 6000000 }
    ],
    "topProducts": [...],
    "paymentMethodBreakdown": [...],
    "orderDetails": [...]
  }
}
```

### 2. Procurement Report
```
GET /api/admin/reports/procurement
Query Params:
  - startDate (optional): Start date YYYY-MM-DD, default: 90 days ago
  - endDate (optional): End date YYYY-MM-DD, default: today
  - supplier (optional): Supplier name filter
  - status (optional): 'all', 'approved', 'pending', 'rejected', default: 'approved'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "dateRange": { "start": "2025-08-13", "end": "2025-11-13" },
    "summary": {
      "totalProcurements": 45,
      "totalAmount": 120000000
    },
    "monthlyTrends": [...],
    "supplierBreakdown": [...],
    "topProducts": [...],
    "recentProcurements": [...]
  }
}
```

### 3. Stock Movement Report
```
GET /api/admin/reports/stock-movement
Query Params:
  - startDate (optional): Start date YYYY-MM-DD, default: 30 days ago
  - endDate (optional): End date YYYY-MM-DD, default: today
  - productId (optional): Filter by specific product UUID
  - movementType (optional): 'in', 'out', or 'adjustment'
  - limit (optional): Max records, default: 100
```

**Response:**
```json
{
  "success": true,
  "data": {
    "dateRange": { "start": "2025-10-13", "end": "2025-11-13" },
    "summary": [
      { "type": "in", "count": 50, "totalQuantity": 1200 },
      { "type": "out", "count": 120, "totalQuantity": 800 }
    ],
    "movements": [...],
    "productSummary": [...]  // Only if no productId filter
  }
}
```

### 4. Finance Report
```
GET /api/admin/reports/finance
Query Params:
  - startDate (optional): Start date YYYY-MM-DD, default: 12 months ago
  - endDate (optional): End date YYYY-MM-DD, default: today
```

**Response:**
```json
{
  "success": true,
  "data": {
    "dateRange": { "start": "2024-11-13", "end": "2025-11-13" },
    "summary": {
      "totalRevenue": 500000000,
      "totalCost": 350000000,
      "totalProfit": 150000000,
      "profitMargin": 30
    },
    "monthlyData": [
      {
        "month": "2025-11",
        "revenue": 45000000,
        "cost": 30000000,
        "grossProfit": 15000000,
        "profitMargin": "33.33",
        "orderCount": 150,
        "procurementCount": 12
      }
    ]
  }
}
```

---

## 🎨 UI Features

### Common Features (All Reports)

1. **Date Range Filters**
   - Start date and end date pickers
   - Quick apply button
   - Export button (placeholder for future implementation)

2. **Summary Cards**
   - Color-coded gradient backgrounds
   - Hero icons for visual appeal
   - Large, bold numbers for key metrics

3. **Responsive Design**
   - Mobile-friendly grid layouts
   - Horizontal scrolling tables
   - Consistent styling with procurement/order pages

4. **Visual Indicators**
   - Status badges with color coding
   - Progress bars for chart data
   - Trend icons (up/down arrows)

### Sales Report UI

- 3 summary cards (Orders, Revenue, AOV)
- Horizontal bar chart (revenue per date)
- Payment method breakdown cards
- Top products table with images
- Order details table with customer info

### Procurement Report UI

- 2 summary cards (Total Procurements, Total Amount)
- Monthly trends horizontal bar chart
- Supplier breakdown table
- Top procured products table
- Recent procurements table

### Stock Movement Report UI

- 3 summary cards (In, Out, Adjustment) with color coding
- Product-wise summary table (Top 20)
- Detailed movement table with:
  - Movement type badges (In: green, Out: red, Adjustment: blue)
  - Reference type badges (Procurement, Order, Adjustment)
  - Stock before/after columns
  - Notes column

### Finance Report UI

- 4 summary cards (Revenue, Cost, Profit, Margin)
- Monthly comparison with dual progress bars
- Profit summary per month with color-coded sections
- Detailed monthly table with footer totals
- Profit margin color coding (>20%: green, >10%: yellow, <10%: red)

---

## 📊 Data Sources

### Sales Report
- **Tables**: orders, order_items, products, customers
- **Filters**: payment_status = 'paid'
- **Grouping**: By date (daily/monthly)

### Procurement Report
- **Tables**: procurements, procurement_items, products
- **Filters**: status (approved/pending/rejected)
- **Grouping**: By month and supplier

### Stock Movement Report
- **Tables**: stock_movements_reporting, products
- **Filters**: movement_type, product_id
- **Grouping**: By product and movement type

### Finance Report
- **Tables**: orders (revenue), procurements (cost)
- **Calculation**: 
  - Revenue = SUM(orders.total_amount WHERE payment_status = 'paid')
  - Cost = SUM(procurements.total_amount WHERE status = 'approved')
  - Profit = Revenue - Cost
  - Margin = (Profit / Revenue) * 100
- **Grouping**: By month

---

## 🧪 Testing Guide

### 1. Access Reports Page

1. Login sebagai admin
2. Navigate ke sidebar menu "Reports & Analytics"
3. URL: `http://localhost:5173/admin/reports`

**Expected:**
- ✅ Page loads with 4 tabs
- ✅ Sales Report tab active by default
- ✅ No console errors

### 2. Test Sales Report

1. Select date range (last 30 days)
2. Choose groupBy: "Harian"
3. Click "Terapkan"

**Expected:**
- ✅ Summary cards show correct totals
- ✅ Chart displays revenue bars
- ✅ Top products table populated
- ✅ Payment breakdown shows
- ✅ Order details table shows max 100 orders

### 3. Test Procurement Report

1. Select date range (last 90 days)
2. Leave supplier empty
3. Select status: "Disetujui"
4. Click "Terapkan"

**Expected:**
- ✅ Summary shows total procurements and amount
- ✅ Monthly trends chart appears
- ✅ Supplier breakdown table populated
- ✅ Top products table shows
- ✅ Recent procurements table shows max 50

### 4. Test Stock Movement Report

1. Select date range (last 30 days)
2. Select "Semua Produk"
3. Select movement type: "Semua Tipe"
4. Click "Terapkan"

**Expected:**
- ✅ Summary cards show In/Out/Adjustment counts
- ✅ Product summary table shows Top 20 products
- ✅ Movement details table populated
- ✅ Color-coded movement type badges
- ✅ Stock before/after values correct

### 5. Test Finance Report

1. Select date range (last 12 months)
2. Click "Terapkan"

**Expected:**
- ✅ Summary cards show total revenue, cost, profit, margin
- ✅ Monthly comparison bars show revenue vs cost
- ✅ Profit sections color-coded (green if profit, red if loss)
- ✅ Monthly table shows all data
- ✅ Footer totals match summary cards

### 6. Test Filter Changes

1. Change date ranges on each report
2. Apply filters multiple times
3. Switch between tabs

**Expected:**
- ✅ Loading spinner shows during API calls
- ✅ Data refreshes correctly
- ✅ No data persists between tabs incorrectly
- ✅ Filters remain independent per tab

---

## 🔐 Permissions & Access

- **All Admin Roles**: Can access /admin/reports
- **Required Authentication**: Admin JWT token
- **Middleware**: `authenticateAdmin`

---

## 📝 Notes

1. **Performance Considerations**:
   - Default limits set to prevent slow queries
   - Indexes recommended on date columns
   - Consider caching for frequently accessed reports

2. **Export Feature**:
   - Currently shows toast "akan segera tersedia"
   - Can be implemented with Excel.js or CSV export
   - Consider backend endpoint for PDF generation

3. **Chart Library**:
   - Currently using simple CSS progress bars
   - Can be enhanced with Chart.js or Recharts for better visualization
   - Mobile-friendly and accessible

4. **Data Accuracy**:
   - Sales report only includes paid orders
   - Procurement report only approved by default
   - Stock movements include all types unless filtered
   - Finance report calculates gross profit (not net profit)

---

## 🚀 Future Enhancements

1. **Export to Excel/PDF**
2. **Advanced Charts** (line, pie, area charts)
3. **Email Report Scheduling**
4. **Custom Date Presets** (This Week, Last Quarter, etc.)
5. **Comparison Mode** (Compare two periods)
6. **Drill-down Details** (Click chart to see detail)
7. **Print-friendly Layout**
8. **Role-based Report Visibility**

---

## ✅ Implementation Checklist

- [x] Backend controller with 4 report endpoints
- [x] Route configuration
- [x] SalesReport component with charts
- [x] ProcurementReport component
- [x] StockMovementReport component
- [x] FinanceReport component
- [x] ReportsPage with tabs
- [x] Route added to App.jsx
- [x] Navigation link in sidebar
- [x] Responsive design
- [x] Error handling
- [x] Loading states
- [x] Filter functionality
- [ ] Export functionality (future)
- [ ] Advanced charts (future)

---

## 📞 Support

For issues or questions about the Reports feature:
1. Check console for API errors
2. Verify date ranges are valid
3. Ensure database has sample data
4. Test each report independently

---

**Last Updated**: November 13, 2025
**Version**: 1.0.0

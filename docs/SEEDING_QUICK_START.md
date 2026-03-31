# 🌾 Quick Start - Database Seeding

## ⚡ Fastest Way to Get Started

### Step 1: Run Migrations
```bash
cd backend
npm run migrate
```
Wait for "No pending migrations" message.

### Step 2: Seed All Data
```bash
npm run seed:comprehensive
```

### Step 3: Start Backend
```bash
npm run dev
```

### Step 4: Start Frontend (new terminal)
```bash
cd ../frontend
npm run dev
```

---

## 📊 What Gets Seeded

✅ **Admin & Roles** (8 each)
- Ready to login with these admin accounts
- See [DAFTAR_AKUN_ADMIN.md](./DAFTAR_AKUN_ADMIN.md) for credentials

✅ **Products** (60+)
- 9 Categories
- Realistic pricing
- Stock levels

✅ **Customers** (10)
- Sample customer accounts
- Can login and place orders
- Password: `customer12345`

✅ **Sample Orders** (5)
- Mixed statuses
- With payments
- Order tracking

✅ **Discounts** (5)
- Percentage & fixed amount
- Date ranges set
- Ready to apply

✅ **FAQs** (8)
- Multiple categories
- Customer-facing content

✅ **Contact Messages** (5)
- Sample customer inquiries
- Mix of resolved and pending

✅ **Procurements** (3)
- Stock replenishment data
- Cost tracking

---

## 🔐 Login Credentials

### Admin Login
- Phone: `6281234567890`
- Password: `admin12345`
- Role: Super Admin

[View all admin accounts →](./DAFTAR_AKUN_ADMIN.md)

### Customer Login
- Phone: `6281234567890`
- Password: `customer12345`

---

## 🧪 Quick Tests

### Test 1: Browse Products
1. Login as Admin
2. Go to Inventory
3. See 60 products across 9 categories

### Test 2: Create Order
1. Login as Customer
2. Browse products
3. Add to cart & order

### Test 3: Manage Discounts
1. Login as Cashier/Finance Admin
2. Apply "Diskon Ikan 20%" discount
3. Verify discount applied

### Test 4: View FAQs
1. Go to FAQ section
2. See 8 FAQs
3. Filter by category

### Test 5: Check Contact Messages
1. Login as Admin
2. Go to Contact Messages
3. See 5 sample messages
4. Reply to pending ones

---

## 📱 Access Points

- **Backend API**: `http://localhost:3000`
- **Frontend App**: `http://localhost:5173`
- **MySQL**: `localhost:3306` (user: root, password from .env)

---

## ⚠️ If Something Goes Wrong

### Errors During Seeding?
```bash
# Check if migrations ran first
npm run migrate

# If migrations show errors, the schema might be corrupted
# In that case, restore from backup or:
# 1. Drop database
# 2. Create new database
# 3. Run migrations again
# 4. Run seeds
```

### Port Already In Use?
```bash
# Change port in .env
# Backend: PORT=3001
# Frontend: VITE_PORT=5174
```

### Phone Number Format Issues?
All phone numbers are normalized to `628xxxxx` format.
Do NOT use `+628xxxxx` or `08xxxxx`.

---

## 📚 Full Documentation
See [DATABASE_SEEDING_GUIDE.md](./DATABASE_SEEDING_GUIDE.md) for detailed information.

---

✅ **Ready to start development!**

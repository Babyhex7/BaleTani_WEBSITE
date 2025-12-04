# 🚀 Quick Start Guide - E2E Testing Setup

## 📋 Prerequisites

Sebelum memulai, pastikan:

- ✅ **Backend** sudah running di `http://localhost:5000`
- ✅ **Frontend** sudah running di `http://localhost:5173`
- ✅ **Database MySQL** sudah terinstall
- ✅ **Node.js** v16+ terinstall

---

## 🔧 Step 1: Install Dependencies

```powershell
cd e2e-tests
npm install
```

Dependencies yang diinstall:

- `cypress@^13.6.0` - E2E testing framework
- `mysql2@^3.6.5` - Database connection
- `@faker-js/faker@^8.3.1` - Generate fake data
- `dotenv@^16.3.1` - Environment variables
- `start-server-and-test@^2.0.3` - Start servers before tests

---

## 🗄️ Step 2: Create Test Database

```sql
-- Login ke MySQL
mysql -u root -p

-- Create test database
CREATE DATABASE IF NOT EXISTS baletani_db_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant permissions
GRANT ALL PRIVILEGES ON baletani_db_test.* TO 'root'@'localhost';
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

---

## ⚙️ Step 3: Setup Environment Variables

File `.env.test` sudah tersedia. **Edit jika perlu**:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=           # Isi password MySQL Anda
DB_NAME=baletani_db_test
DB_PORT=3306

# Backend
NODE_ENV=test
PORT=5000

# Frontend
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🌱 Step 4: Migrate & Seed Test Database

### Option A: Manual Migration

```powershell
# Copy struktur dari database utama
mysqldump -u root -p --no-data baletani_db > schema.sql
mysql -u root -p baletani_db_test < schema.sql
```

### Option B: Run Migrations

```powershell
# Dari folder backend
cd ../backend
node scripts/migrate-test-db.js
```

---

## 🧪 Step 5: Run Your First Test

### Interactive Mode (Recommended)

```powershell
npm run cy:open
```

Ini akan:

1. Membuka Cypress UI
2. Pilih browser (Chrome, Firefox, Edge)
3. Pilih test file yang ingin dijalankan
4. Watch test execution secara visual

### Headless Mode (CI/CD)

```powershell
# Run all customer tests
npm run cy:run:customer

# Run specific test
npm run cy:run:auth
npm run cy:run:cart
```

---

## 📂 Folder Structure Overview

```
e2e-tests/
├── cypress/
│   ├── e2e/
│   │   └── customer/
│   │       ├── 01-auth.cy.js         ✅ Ready
│   │       ├── 02-browsing.cy.js     🚧 To-do
│   │       ├── 03-cart.cy.js         ✅ Ready
│   │       ├── 04-checkout.cy.js     🚧 To-do
│   │       ├── 05-order-history.cy.js 🚧 To-do
│   │       ├── 06-profile.cy.js      🚧 To-do
│   │       ├── 07-contact.cy.js      🚧 To-do
│   │       └── 08-categories.cy.js   🚧 To-do
│   ├── fixtures/              # Test data (JSON)
│   ├── support/               # Custom commands
│   └── downloads/             # Downloaded files
├── cypress.config.js          # Cypress configuration
├── package.json
└── README.md
```

---

## ✅ Verify Installation

### Test 1: Check Cypress Installed

```powershell
npx cypress --version
```

Expected output:

```
Cypress package version: 13.6.0
Cypress binary version: 13.6.0
```

### Test 2: Test Database Connection

```powershell
node -e "const mysql = require('mysql2/promise'); mysql.createConnection({host:'localhost',user:'root',password:'',database:'baletani_db_test'}).then(()=>console.log('✅ DB Connected')).catch(err=>console.error('❌',err.message))"
```

Expected output:

```
✅ DB Connected
```

### Test 3: Run Smoke Test

```powershell
# Run authentication tests only
npm run cy:run:auth
```

---

## 🎯 Next Steps

1. **Add data-cy attributes to frontend components**

   - Edit components di `frontend/src/`
   - Tambahkan `data-cy="element-name"` pada elements penting

2. **Complete remaining test specs**

   - Copy pattern dari `01-auth.cy.js` dan `03-cart.cy.js`
   - Implementasi `02-browsing.cy.js`, `04-checkout.cy.js`, dll.

3. **Run all tests**

   ```powershell
   npm run cy:run:customer
   ```

4. **Setup CI/CD** (Optional)
   - Tambahkan GitHub Actions workflow
   - Run tests on every push

---

## 🐛 Troubleshooting

### Error: "Cannot connect to database"

**Solution:**

- Check MySQL running: `Get-Service MySQL*`
- Verify credentials di `.env.test`
- Test connection manually

### Error: "cy.customerLogin is not a function"

**Solution:**

- Pastikan `cypress/support/commands.js` ter-import
- Check `cypress/support/e2e.js` ada `import './commands'`

### Error: "Cannot find module 'mysql2'"

**Solution:**

```powershell
npm install mysql2 --save-dev
```

### Error: "Database table doesn't exist"

**Solution:**

- Run migrations untuk test database
- Atau seed via `cy.resetDatabase()` dan `cy.seedDatabase()`

### Tests running too slow

**Solution:**

- Reduce `video: false` di `cypress.config.js`
- Use `--headed` mode hanya saat debugging
- Optimize database seeding (seed minimal data)

---

## 📚 Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [API Commands](https://docs.cypress.io/api/table-of-contents)
- [BaleTani API Docs](../API_DOCUMENTATION.md)
- [Customer E2E Brief](../CUSTOMER_E2E_TESTING_BRIEF.md)

---

## 💡 Tips

1. **Use `cy.log()` for debugging**

   ```javascript
   cy.log("Debug message:", someVariable);
   ```

2. **Take screenshots manually**

   ```javascript
   cy.screenshot("my-debug-screenshot");
   ```

3. **Use Cypress Studio** (experimental)

   - Record test interactions
   - Generate test code automatically

4. **Run specific test**

   ```powershell
   npx cypress run --spec "cypress/e2e/customer/01-auth.cy.js"
   ```

5. **Filter tests by name**
   ```powershell
   npx cypress run --spec "cypress/e2e/customer/*" --grep "login"
   ```

---

**Happy Testing! 🎉**
